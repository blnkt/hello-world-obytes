import React from 'react';
import { PuzzleChamberScreen } from './puzzle-chamber-screen';
import { TradeOpportunityScreen } from './trade-opportunity-screen';
import { DiscoverySiteScreen } from './discovery-site-screen';
import { useEncounterResolver } from '../hooks/use-encounter-resolver';
import type { DelvingRun, DungeonNode, EncounterType } from '@/types/delvers-descent';

interface EncounterScreenProps {
  run: DelvingRun;
  node: DungeonNode;
  onReturnToMap: () => void;
  onEncounterComplete: (result: 'success' | 'failure', rewards?: any[]) => void;
}

export const EncounterScreen: React.FC<EncounterScreenProps> = ({
  run,
  node,
  onReturnToMap,
  onEncounterComplete,
}) => {
  const {
    encounterResolver,
    isLoading,
    error,
    startEncounter,
      updateEncounterProgress: _updateEncounterProgress,
      completeEncounter,
      getEncounterState: _getEncounterState,
      clearEncounterState: _clearEncounterState,
  } = useEncounterResolver(run, node);

  if (isLoading) {
    return (
      <div data-testid="encounter-loading" className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading encounter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="encounter-error" className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Encounter Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onReturnToMap}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Return to Map
          </button>
        </div>
      </div>
    );
  }

  const handleStartEncounter = async () => {
    if (encounterResolver) {
      await startEncounter();
    }
  };

  const handleEncounterComplete = async (result: 'success' | 'failure', rewards?: any[]) => {
    if (encounterResolver) {
      await completeEncounter(result, rewards);
      onEncounterComplete(result, rewards);
    }
  };

  return (
    <div data-testid="encounter-screen" className="min-h-screen bg-gray-50">
      {encounterResolver && !encounterResolver.getEncounterState() ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Begin</h2>
            <p className="text-gray-600 mb-6">Start your encounter to begin!</p>
            <button
              data-testid="start-encounter"
              onClick={handleStartEncounter}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Start Encounter
            </button>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
          {node.type === 'puzzle_chamber' && (
            <PuzzleChamberScreen
              run={run}
              node={node}
              onReturnToMap={onReturnToMap}
              onEncounterComplete={handleEncounterComplete}
            />
          )}
          {node.type === 'trade_opportunity' && (
            <TradeOpportunityScreen
              run={run}
              node={node}
              onReturnToMap={onReturnToMap}
              onEncounterComplete={handleEncounterComplete}
            />
          )}
          {node.type === 'discovery_site' && (
            <DiscoverySiteScreen
              run={run}
              node={node}
              onReturnToMap={onReturnToMap}
              onEncounterComplete={handleEncounterComplete}
            />
          )}
          {!['puzzle_chamber', 'trade_opportunity', 'discovery_site'].includes(node.type) && (
            <div data-testid="encounter-error" className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="text-yellow-500 text-6xl mb-4">❓</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Unsupported Encounter</h2>
                <p className="text-gray-600 mb-4">
                  This encounter type ({node.type}) is not yet supported.
                </p>
                <button
                  onClick={onReturnToMap}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Return to Map
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
