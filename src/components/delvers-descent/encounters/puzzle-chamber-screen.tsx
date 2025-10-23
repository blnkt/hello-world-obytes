import React, { useState, useEffect } from 'react';
import { PuzzleChamberEncounter } from '@/lib/delvers-descent/puzzle-chamber-encounter';
import { RewardCalculator } from '@/lib/delvers-descent/reward-calculator';
import { FailureConsequenceManager } from '@/lib/delvers-descent/failure-consequence-manager';
import type { DelvingRun, DungeonNode } from '@/types/delvers-descent';

interface PuzzleChamberScreenProps {
  run: DelvingRun;
  node: DungeonNode;
  onReturnToMap: () => void;
  onEncounterComplete: (result: 'success' | 'failure', rewards?: any[]) => void;
}

interface TileState {
  revealed: boolean;
  type: 'treasure' | 'trap' | 'exit' | 'bonus' | 'neutral';
  value?: number;
}

export const PuzzleChamberScreen: React.FC<PuzzleChamberScreenProps> = ({
  run: _run,
  node,
  onReturnToMap,
  onEncounterComplete,
}) => {
  const [encounter, setEncounter] = useState<PuzzleChamberEncounter | null>(null);
  const [tiles, setTiles] = useState<TileState[][]>([]);
  const [remainingReveals, setRemainingReveals] = useState(0);
  const [encounterComplete, setEncounterComplete] = useState(false);
  const [encounterResult, setEncounterResult] = useState<'success' | 'failure' | null>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [rewardCalculator] = useState(() => new RewardCalculator());
  const [failureManager] = useState(() => new FailureConsequenceManager());

  useEffect(() => {
    const puzzleEncounter = new PuzzleChamberEncounter(node.depth);
    setEncounter(puzzleEncounter);
    setRemainingReveals(puzzleEncounter.getTileRevealsRemaining());
    
    // Initialize tile grid (5x5 for simplicity)
    const initialTiles: TileState[][] = Array(5).fill(null).map(() => 
      Array(5).fill(null).map(() => ({ revealed: false, type: 'neutral' }))
    );
    setTiles(initialTiles);
  }, [node.depth]);

  const handleTileClick = async (row: number, col: number) => {
    if (!encounter || encounterComplete || remainingReveals <= 0) return;

    const result = encounter.revealTile(row, col);
    
    if (result.success) {
          const newTiles = [...tiles];
          newTiles[row][col] = {
            revealed: true,
            type: result.tileType as TileState['type'],
            value: result.tileType === 'treasure' ? 10 : undefined,
          };
      setTiles(newTiles);
      setRemainingReveals(encounter.getTileRevealsRemaining());

      // Handle special tile effects
      if (result.tileType === 'exit') {
        setEncounterComplete(true);
        setEncounterResult('success');
        const encounterRewards = encounter.generateRewards();
        const processedRewards = rewardCalculator.processEncounterRewards(
          encounterRewards,
          'puzzle_chamber',
          node.depth
        );
        setRewards(processedRewards);
        onEncounterComplete('success', processedRewards);
      } else if (result.tileType === 'trap') {
        // Handle trap consequences
            const _consequences = failureManager.processFailureConsequences(
              'objective_failed',
              node.depth,
              node.id
            );
        // Apply trap effects (energy loss, etc.)
      }
    } else {
      // Handle failure case
      setEncounterComplete(true);
      setEncounterResult('failure');
            const _consequences = failureManager.processFailureConsequences(
              'objective_failed',
              node.depth,
              node.id
            );
      onEncounterComplete('failure');
    }
  };

  const handleFailEncounter = () => {
    setEncounterComplete(true);
    setEncounterResult('failure');
    onEncounterComplete('failure');
  };

  const getTileDisplay = (tile: TileState) => {
    if (!tile.revealed) return '?';
    
    switch (tile.type) {
      case 'treasure': return '💰';
      case 'trap': return '💀';
      case 'exit': return '🚪';
      case 'bonus': return '⭐';
      case 'neutral': return '⬜';
      default: return '?';
    }
  };

  const getTileClass = (tile: TileState, _row: number, _col: number) => {
    const baseClass = 'w-12 h-12 border border-gray-300 flex items-center justify-center text-lg font-bold cursor-pointer transition-all duration-200';
    
    if (!tile.revealed) {
      return `${baseClass} bg-gray-200 hover:bg-gray-300`;
    }
    
    const revealedClass = `${baseClass} revealed`;
    
    switch (tile.type) {
      case 'treasure': return `${revealedClass} bg-yellow-200 text-yellow-800`;
      case 'trap': return `${revealedClass} bg-red-200 text-red-800`;
      case 'exit': return `${revealedClass} bg-green-200 text-green-800`;
      case 'bonus': return `${revealedClass} bg-purple-200 text-purple-800`;
      case 'neutral': return `${revealedClass} bg-gray-100 text-gray-600`;
      default: return revealedClass;
    }
  };

  if (encounterComplete) {
    return (
      <div data-testid={encounterResult === 'success' ? 'encounter-success' : 'encounter-failure'} className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">
            {encounterResult === 'success' ? '🎉' : '😞'}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {encounterResult === 'success' ? 'Puzzle Solved!' : 'Puzzle Failed'}
          </h2>
          
          {encounterResult === 'success' && rewards.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Rewards:</h3>
              <div className="space-y-2">
                {rewards.map((reward, index) => (
                  <div key={index} className="bg-yellow-100 p-3 rounded-lg">
                    <p className="font-medium">{reward.name}</p>
                    <p className="text-sm text-gray-600">Value: {reward.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button
            onClick={onReturnToMap}
            data-testid="return-to-map"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Return to Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="puzzle-chamber-screen" className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Puzzle Chamber</h1>
          <p className="text-gray-600">Find the exit tile to complete the puzzle!</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div data-testid="remaining-reveals" className="text-lg font-semibold">
              Reveals Remaining: {remainingReveals}
            </div>
            <div className="text-sm text-gray-600">
              Depth: {node.depth} | Energy Cost: {node.energyCost}
            </div>
          </div>

          <div data-testid="tile-grid" className="grid grid-cols-5 gap-2 justify-center">
            {tiles.map((row, rowIndex) =>
              row.map((tile, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  data-testid={tile.type === 'exit' ? 'tile-exit' : `tile-${rowIndex}-${colIndex}`}
                  className={getTileClass(tile, rowIndex, colIndex)}
                  onClick={() => handleTileClick(rowIndex, colIndex)}
                  disabled={remainingReveals <= 0 || tile.revealed}
                >
                  {getTileDisplay(tile)}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={onReturnToMap}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Return to Map
          </button>
          <button
            data-testid="fail-encounter"
            onClick={handleFailEncounter}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Give Up
          </button>
        </div>
      </div>
    </div>
  );
};
