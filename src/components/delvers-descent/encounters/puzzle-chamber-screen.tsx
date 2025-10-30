import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { FailureConsequenceManager } from '@/lib/delvers-descent/failure-consequence-manager';
import { PuzzleChamberEncounter } from '@/lib/delvers-descent/puzzle-chamber-encounter';
import { RewardCalculator } from '@/lib/delvers-descent/reward-calculator';
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

const ResultScreen: React.FC<{
  result: 'success' | 'failure';
  rewards: any[];
  onReturn: () => void;
}> = ({ result, rewards, onReturn }) => (
  <ScrollView
    testID={result === 'success' ? 'encounter-success' : 'encounter-failure'}
    className="min-h-screen bg-gray-50"
    contentContainerStyle={{
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 100,
    }}
  >
    <View className="mx-auto max-w-md p-6">
      <Text className="mb-4 text-center text-6xl">
        {result === 'success' ? '🎉' : '😞'}
      </Text>
      <Text className="mb-4 text-center text-2xl font-bold text-gray-800">
        {result === 'success' ? 'Puzzle Solved!' : 'Puzzle Failed'}
      </Text>

      {result === 'success' && rewards.length > 0 && (
        <View className="mb-6">
          <Text className="mb-2 text-center text-lg font-semibold text-gray-700">
            Rewards:
          </Text>
          <View className="gap-2">
            {rewards.map((reward, index) => (
              <View key={index} className="rounded-lg bg-yellow-100 p-3">
                <Text className="font-medium">{reward.name}</Text>
                <Text className="text-sm text-gray-600">
                  Value: {reward.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Pressable
        onPress={onReturn}
        testID="return-to-map"
        className="rounded-lg bg-blue-500 px-6 py-3"
      >
        <Text className="text-center text-white">Return to Map</Text>
      </Pressable>
    </View>
  </ScrollView>
);

const getTileDisplay = (tile: TileState): string => {
  if (!tile.revealed) return '?';

  switch (tile.type) {
    case 'treasure':
      return '💰';
    case 'trap':
      return '💀';
    case 'exit':
      return '🚪';
    case 'bonus':
      return '⭐';
    case 'neutral':
      return '⬜';
    default:
      return '?';
  }
};

const TileComponent: React.FC<{
  tile: TileState;
  rowIndex: number;
  colIndex: number;
  disabled: boolean;
  onPress: () => void;
}> = ({
  tile,
  rowIndex: _rowIndex,
  colIndex: _colIndex,
  disabled,
  onPress,
}) => {
  const getTileStyle = () => {
    const base =
      'h-12 w-12 items-center justify-center rounded border text-lg font-bold';
    if (!tile.revealed) {
      return `${base} border-gray-300 bg-gray-200`;
    }
    const revealed = `${base} border-gray-300`;
    switch (tile.type) {
      case 'treasure':
        return `${revealed} bg-yellow-200`;
      case 'trap':
        return `${revealed} bg-red-200`;
      case 'exit':
        return `${revealed} bg-green-200`;
      case 'bonus':
        return `${revealed} bg-purple-200`;
      case 'neutral':
        return `${revealed} bg-gray-100`;
      default:
        return revealed;
    }
  };

  return (
    <Pressable
      testID={tile.type === 'exit' ? 'tile-exit' : undefined}
      onPress={onPress}
      disabled={disabled}
      className={getTileStyle()}
    >
      <Text>{getTileDisplay(tile)}</Text>
    </Pressable>
  );
};

const PuzzleContent: React.FC<{
  tiles: TileState[][];
  remainingReveals: number;
  node: DungeonNode;
  onTileClick: (row: number, col: number) => void;
  onReturn: () => void;
  onFail: () => void;
}> = ({ tiles, remainingReveals, node, onTileClick, onReturn, onFail }) => (
  <ScrollView
    testID="puzzle-chamber-screen"
    className="min-h-screen bg-gray-50 p-6"
    contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
  >
    <View className="mx-auto max-w-4xl">
      <View className="mb-8">
        <Text className="mb-2 text-center text-3xl font-bold text-gray-800">
          Puzzle Chamber
        </Text>
        <Text className="text-center text-gray-600">
          Find the exit tile to complete the puzzle!
        </Text>
      </View>

      <View className="mb-6 rounded-lg bg-white p-6 shadow-lg">
        <View className="mb-4 flex-row items-center justify-between">
          <Text testID="remaining-reveals" className="text-lg font-semibold">
            Reveals Remaining: {remainingReveals}
          </Text>
          <Text className="text-sm text-gray-600">
            Depth: {node.depth} | Energy Cost: {node.energyCost}
          </Text>
        </View>

        <View testID="tile-grid" className="gap-2">
          {tiles.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row justify-center gap-2">
              {row.map((tile, colIndex) => (
                <TileComponent
                  key={`${rowIndex}-${colIndex}`}
                  tile={tile}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  disabled={remainingReveals <= 0 || tile.revealed}
                  onPress={() => onTileClick(rowIndex, colIndex)}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      <View className="flex-row justify-center gap-4">
        <Pressable
          onPress={onReturn}
          className="rounded-lg bg-gray-500 px-6 py-3"
        >
          <Text className="text-center text-white">Return to Map</Text>
        </Pressable>
        <Pressable
          testID="fail-encounter"
          onPress={onFail}
          className="rounded-lg bg-red-500 px-6 py-3"
        >
          <Text className="text-center text-white">Give Up</Text>
        </Pressable>
      </View>
    </View>
  </ScrollView>
);

interface HandleTileLogicConfig {
  result: any;
  row: number;
  col: number;
  tiles: TileState[][];
  encounter: any;
  rewardCalculator: any;
  node: DungeonNode;
  failureManager: any;
  setters: {
    setTiles: (tiles: TileState[][]) => void;
    setRemainingReveals: (reveals: number) => void;
    setEncounterComplete: (complete: boolean) => void;
    setEncounterResult: (result: 'success' | 'failure' | null) => void;
    setRewards: (rewards: any[]) => void;
  };
}

const handleTileLogic = (config: HandleTileLogicConfig) => {
  const {
    result,
    row,
    col,
    tiles,
    encounter,
    rewardCalculator,
    node,
    failureManager,
    setters,
  } = config;
  if (result.success) {
    const newTiles = [...tiles];
    newTiles[row][col] = {
      revealed: true,
      type: result.tileType as TileState['type'],
      value: result.tileType === 'treasure' ? 10 : undefined,
    };
    setters.setTiles(newTiles);
    const newRemainingReveals = encounter.getTileRevealsRemaining();
    setters.setRemainingReveals(newRemainingReveals);

    if (result.tileType === 'exit') {
      setters.setEncounterComplete(true);
      setters.setEncounterResult('success');
      const encounterRewards = encounter.generateRewards();
      const processedRewards = rewardCalculator.processEncounterRewards(
        encounterRewards,
        'puzzle_chamber',
        node.depth
      );
      setters.setRewards(processedRewards);
      // Don't call onEncounterComplete yet - wait for user to click "Return to Map"
    } else if (result.tileType === 'trap') {
      setters.setEncounterComplete(true);
      setters.setEncounterResult('failure');
      failureManager.processFailureConsequences(
        'objective_failed',
        node.depth,
        node.id
      );
      // Don't call onEncounterComplete yet - wait for user to click "Return to Map"
    } else if (newRemainingReveals <= 0) {
      // Auto-fail when out of reveals
      setters.setEncounterComplete(true);
      setters.setEncounterResult('failure');
      failureManager.processFailureConsequences(
        'objective_failed',
        node.depth,
        node.id
      );
      // Don't call onEncounterComplete yet - wait for user to click "Return to Map"
    }
  } else {
    setters.setEncounterComplete(true);
    setters.setEncounterResult('failure');
    failureManager.processFailureConsequences(
      'objective_failed',
      node.depth,
      node.id
    );
    // Don't call onEncounterComplete yet - wait for user to click "Return to Map"
  }
};

interface InitializeConfig {
  nodeDepth: number;
  setEncounter: (enc: PuzzleChamberEncounter) => void;
  setRemainingReveals: (reveals: number) => void;
  setTiles: (tiles: TileState[][]) => void;
}

const initializeEncounter = (config: InitializeConfig) => {
  const { nodeDepth, setEncounter, setRemainingReveals, setTiles } = config;
  const puzzleEncounter = new PuzzleChamberEncounter(undefined, nodeDepth);
  setEncounter(puzzleEncounter);
  setRemainingReveals(puzzleEncounter.getTileRevealsRemaining());

  const initialTiles: TileState[][] = Array(5)
    .fill(null)
    .map(() =>
      Array(5)
        .fill(null)
        .map(() => ({ revealed: false, type: 'neutral' }))
    );
  setTiles(initialTiles);
};

const usePuzzleChamberState = (nodeDepth: number) => {
  const [encounter, setEncounter] = useState<PuzzleChamberEncounter | null>(
    null
  );
  const [tiles, setTiles] = useState<TileState[][]>([]);
  const [remainingReveals, setRemainingReveals] = useState(0);
  const [encounterComplete, setEncounterComplete] = useState(false);
  const [encounterResult, setEncounterResult] = useState<
    'success' | 'failure' | null
  >(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const rewardCalculator = useState(() => new RewardCalculator())[0];
  const failureManager = useState(() => new FailureConsequenceManager())[0];

  useEffect(() => {
    initializeEncounter({
      nodeDepth,
      setEncounter,
      setRemainingReveals,
      setTiles,
    });
  }, [nodeDepth]);

  return {
    encounter,
    tiles,
    remainingReveals,
    encounterComplete,
    encounterResult,
    rewards,
    rewardCalculator,
    failureManager,
    setEncounter,
    setTiles,
    setRemainingReveals,
    setEncounterComplete,
    setEncounterResult,
    setRewards,
  };
};

const buildTileClickHandler = (
  state: ReturnType<typeof usePuzzleChamberState>,
  node: DungeonNode
) => {
  return (row: number, col: number) => {
    if (
      !state.encounter ||
      state.encounterComplete ||
      state.remainingReveals <= 0
    )
      return;
    const result = state.encounter.revealTile(row, col);
    handleTileLogic({
      result,
      row,
      col,
      tiles: state.tiles,
      encounter: state.encounter,
      rewardCalculator: state.rewardCalculator,
      node,
      failureManager: state.failureManager,
      setters: {
        setTiles: state.setTiles,
        setRemainingReveals: state.setRemainingReveals,
        setEncounterComplete: state.setEncounterComplete,
        setEncounterResult: state.setEncounterResult,
        setRewards: state.setRewards,
      },
    });
  };
};

export const PuzzleChamberScreen: React.FC<PuzzleChamberScreenProps> = ({
  run: _run,
  node,
  onReturnToMap,
  onEncounterComplete,
}) => {
  const state = usePuzzleChamberState(node.depth);

  const handleTileClick = buildTileClickHandler(state, node);

  const handleFailEncounter = () => {
    state.setEncounterComplete(true);
    state.setEncounterResult('failure');
  };

  const handleReturnFromResult = () => {
    if (state.encounterResult === 'success') {
      onEncounterComplete('success', state.rewards);
    } else if (state.encounterResult === 'failure') {
      onEncounterComplete('failure');
    }
    onReturnToMap();
  };

  if (state.encounterComplete && state.encounterResult) {
    return (
      <ResultScreen
        result={state.encounterResult}
        rewards={state.rewards}
        onReturn={handleReturnFromResult}
      />
    );
  }

  return (
    <PuzzleContent
      tiles={state.tiles}
      remainingReveals={state.remainingReveals}
      node={node}
      onTileClick={handleTileClick}
      onReturn={onReturnToMap}
      onFail={handleFailEncounter}
    />
  );
};
