import { useCallback, useEffect, useState } from 'react';

import { DiscoverySiteEncounter } from '@/lib/delvers-descent/discovery-site-encounter';
import { EncounterResolver } from '@/lib/delvers-descent/encounter-resolver';
import { FailureConsequenceManager } from '@/lib/delvers-descent/failure-consequence-manager';
import { PuzzleChamberEncounter } from '@/lib/delvers-descent/puzzle-chamber-encounter';
import { RewardCalculator } from '@/lib/delvers-descent/reward-calculator';
import { TradeOpportunityEncounter } from '@/lib/delvers-descent/trade-opportunity-encounter';
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
  const [rewardCalculator] = useState(() => new RewardCalculator());
  const [failureManager] = useState(() => new FailureConsequenceManager());

  useEffect(() => {
    const initializeEncounter = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create encounter resolver
        const resolver = new EncounterResolver();

        // Create specific encounter based on node type
        let _encounter;
        switch (node.type) {
          case 'puzzle_chamber':
            _encounter = new PuzzleChamberEncounter(node.depth);
            break;
          case 'trade_opportunity':
            _encounter = new TradeOpportunityEncounter(node.depth);
            break;
          case 'discovery_site':
            _encounter = new DiscoverySiteEncounter(node.depth);
            break;
          default:
            throw new Error(`Unsupported encounter type: ${node.type}`);
        }

        // Start the encounter
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
    };

    initializeEncounter();
  }, [run.id, node.id, node.type, node.depth]);

  const startEncounter = useCallback(async () => {
    if (!encounterResolver) return;

    try {
      setError(null);
      // Encounter is already started in useEffect
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to start encounter'
      );
    }
  }, [encounterResolver]);

  const updateEncounterProgress = useCallback(
    async (progress: any) => {
      if (!encounterResolver) return;

      try {
        setError(null);
        await encounterResolver.updateEncounterProgress(progress);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to update encounter progress'
        );
      }
    },
    [encounterResolver]
  );

  const completeEncounter = useCallback(
    async (
      result: 'success' | 'failure',
      rewards?: any[],
      callback?: (result: 'success' | 'failure', rewards?: any[]) => void
    ) => {
      if (!encounterResolver) return;

      try {
        setError(null);

        // Process rewards if successful
        let processedRewards = rewards;
        if (result === 'success' && rewards) {
          processedRewards = rewardCalculator.processEncounterRewards(
            rewards,
            node.type as EncounterType,
            node.depth
          );
        }

        // Process failure consequences if failed
        if (result === 'failure') {
          const _consequences = failureManager.processFailureConsequences(
            'objective_failed',
            node.depth,
            node.id
          );
          // Apply consequences (energy loss, item loss, etc.)
        }

        // Complete the encounter
        const encounterOutcome: EncounterOutcome = {
          success: result === 'success',
          rewards: processedRewards || [],
          energyUsed: node.energyCost,
          itemsGained: processedRewards || [],
          itemsLost: [],
          failureType: result === 'failure' ? 'objective_failed' : undefined,
          additionalEffects: {},
          totalRewardValue:
            processedRewards?.reduce((sum, reward) => sum + reward.value, 0) ||
            0,
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

        // Call the callback if provided
        if (callback) {
          callback(result, processedRewards);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to complete encounter'
        );
      }
    },
    [
      encounterResolver,
      rewardCalculator,
      failureManager,
      node.type,
      node.depth,
      node.id,
    ]
  );

  const getEncounterState = useCallback(() => {
    if (!encounterResolver) return null;

    try {
      return encounterResolver.getEncounterState();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get encounter state'
      );
      return null;
    }
  }, [encounterResolver]);

  const clearEncounterState = useCallback(() => {
    if (!encounterResolver) return;

    try {
      encounterResolver.clearEncounterState();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to clear encounter state'
      );
    }
  }, [encounterResolver]);

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
