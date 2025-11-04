import { useCallback, useEffect, useState } from 'react';

import { DiscoverySiteEncounter } from '@/lib/delvers-descent/discovery-site-encounter';
import { EncounterResolver } from '@/lib/delvers-descent/encounter-resolver';
import { FailureConsequenceManager } from '@/lib/delvers-descent/failure-consequence-manager';
import { PuzzleChamberEncounter } from '@/lib/delvers-descent/puzzle-chamber-encounter';
import { RewardCalculator } from '@/lib/delvers-descent/reward-calculator';
import type {
  DelvingRun,
  DungeonNode,
  EncounterOutcome,
  EncounterType,
} from '@/types/delvers-descent';

interface UseEncounterResolverReturn {
  encounterResolver: EncounterResolver | null;
  isLoading: boolean;
  error: string | null;
  startEncounter: () => Promise<void>;
  updateEncounterProgress: (progress: any) => Promise<void>;
  completeEncounter: (
    result: 'success' | 'failure',
    rewards?: any[],
    callback?: (result: 'success' | 'failure', rewards?: any[]) => void
  ) => Promise<void>;
  getEncounterState: () => any;
  clearEncounterState: () => void;
}

export const useEncounterResolver = (
  run: DelvingRun,
  node: DungeonNode
): UseEncounterResolverReturn => {
  const [encounterResolver, setEncounterResolver] =
    useState<EncounterResolver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { rewardCalculator, failureManager } = useEncounterUtilities();

  useEffect(() => {
    initializeEncounterResolver({
      node,
      setEncounterResolver,
      setIsLoading,
      setError,
    });
  }, [node]);

  const startEncounter = useStartEncounterCallback(encounterResolver, setError);

  const updateEncounterProgress = useUpdateEncounterProgressCallback(
    encounterResolver,
    setError
  );

  const completeEncounter = useCallback(
    async (
      result: 'success' | 'failure',
      rewards?: any[],
      callback?: (result: 'success' | 'failure', rewards?: any[]) => void
    ) =>
      buildCompleteEncounterHandler({
        encounterResolver,
        rewardCalculator,
        failureManager,
        node,
        setError,
      })(result, rewards, callback),
    [encounterResolver, rewardCalculator, failureManager, node, setError]
  );

  const getEncounterState = useCallback(
    () => safeGetState(encounterResolver, setError),
    [encounterResolver]
  );
  const clearEncounterState = useCallback(
    () => safeClearState(encounterResolver, setError),
    [encounterResolver]
  );

  return {
    encounterResolver,
    isLoading,
    error,
    startEncounter,
    updateEncounterProgress,
    completeEncounter,
    getEncounterState,
    clearEncounterState,
  };
};

function useStartEncounterCallback(
  resolver: EncounterResolver | null,
  setError: (v: string | null) => void
) {
  return useCallback(async () => {
    if (!resolver) return;
    setError(null);
  }, [resolver, setError]);
}

function useUpdateEncounterProgressCallback(
  resolver: EncounterResolver | null,
  setError: (v: string | null) => void
) {
  return useCallback(
    async (progress: any) => {
      if (!resolver) return;
      try {
        setError(null);
        await resolver.updateEncounterProgress(progress);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to update encounter progress'
        );
      }
    },
    [resolver, setError]
  );
}

function useEncounterUtilities() {
  const [rewardCalculator] = useState(() => new RewardCalculator());
  const [failureManager] = useState(() => new FailureConsequenceManager());
  return { rewardCalculator, failureManager } as const;
}

async function initializeEncounterResolver({
  node,
  setEncounterResolver,
  setIsLoading,
  setError,
}: {
  node: DungeonNode;
  setEncounterResolver: (r: EncounterResolver | null) => void;
  setIsLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
}) {
  try {
    setIsLoading(true);
    setError(null);
    const advancedTypes = ['hazard', 'risk_event', 'rest_site'];
    if (advancedTypes.includes(node.type)) {
      setEncounterResolver(null);
      setIsLoading(false);
      return;
    }
    const resolver = new EncounterResolver();
    switch (node.type) {
      case 'puzzle_chamber':
        new PuzzleChamberEncounter(undefined, node.depth);
        break;
      case 'discovery_site':
        new DiscoverySiteEncounter(node.depth);
        break;
      default:
        throw new Error(`Unsupported encounter type: ${node.type}`);
    }
    await resolver.startEncounter({
      type: node.type as EncounterType,
      nodeId: node.id,
      depth: node.depth,
      energyCost: node.energyCost,
    });
    setEncounterResolver(resolver);
  } catch (err) {
    setError(
      err instanceof Error ? err.message : 'Failed to initialize encounter'
    );
  } finally {
    setIsLoading(false);
  }
}

function buildCompleteEncounterHandler({
  encounterResolver,
  rewardCalculator,
  failureManager,
  node,
  setError,
}: {
  encounterResolver: EncounterResolver | null;
  rewardCalculator: RewardCalculator;
  failureManager: FailureConsequenceManager;
  node: DungeonNode;
  setError: (v: string | null) => void;
}) {
  return async (
    result: 'success' | 'failure',
    rewards?: any[],
    callback?: (result: 'success' | 'failure', rewards?: any[]) => void
  ) => {
    if (!encounterResolver) return;
    try {
      setError(null);
      const processedRewards =
        result === 'success' && rewards
          ? rewardCalculator.processEncounterRewards(
              rewards,
              node.type as EncounterType,
              node.depth
            )
          : rewards;
      if (result === 'failure') {
        failureManager.processFailureConsequences(
          'objective_failed',
          node.depth,
          node.id
        );
      }
      const encounterOutcome: EncounterOutcome = {
        success: result === 'success',
        rewards: processedRewards || [],
        energyUsed: node.energyCost,
        itemsGained: processedRewards || [],
        itemsLost: [],
        failureType: result === 'failure' ? 'objective_failed' : undefined,
        additionalEffects: {},
        totalRewardValue:
          processedRewards?.reduce((sum, reward) => sum + reward.value, 0) || 0,
        consequences:
          result === 'failure'
            ? {
                energyLoss: node.energyCost,
                itemLossRisk: 0.2,
                encounterLockout: false,
              }
            : undefined,
      };
      await encounterResolver.completeEncounter(result, encounterOutcome);
      if (callback) callback(result, processedRewards);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to complete encounter'
      );
    }
  };
}

function safeGetState(
  resolver: EncounterResolver | null,
  setError: (v: string | null) => void
) {
  if (!resolver) return null;
  try {
    return resolver.getEncounterState();
  } catch (err) {
    setError(
      err instanceof Error ? err.message : 'Failed to get encounter state'
    );
    return null;
  }
}

function safeClearState(
  resolver: EncounterResolver | null,
  setError: (v: string | null) => void
) {
  if (!resolver) return;
  try {
    resolver.clearEncounterState();
  } catch (err) {
    setError(
      err instanceof Error ? err.message : 'Failed to clear encounter state'
    );
  }
}
