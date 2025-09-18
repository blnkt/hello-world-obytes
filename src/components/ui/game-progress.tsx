import React from 'react';
import { View } from 'react-native';

import colors from './colors';
import { Text } from './text';

interface GameProgressProps {
  level: number;
  turns: number;
  gameState: 'Active' | 'Win' | 'Game Over';
  revealedTiles: number;
  totalTiles: number;
  className?: string;
}

const GameStateHeader = ({
  level,
  gameState,
  getGameStateColor,
  getGameStateIcon,
}: {
  level: number;
  gameState: string;
  getGameStateColor: () => string;
  getGameStateIcon: () => string;
}) => (
  <View className="mb-3 flex-row items-center justify-between">
    <View>
      <Text
        className={`text-[${colors.charcoal[600]}] text-lg font-bold`}
        accessibilityRole="header"
      >
        Level {level}
      </Text>
      <View
        className={`mt-1 rounded-full px-2 py-1 ${getGameStateColor()}`}
        accessible={true}
        accessibilityLabel={`Game state: ${gameState}`}
      >
        <Text className="text-sm font-medium">{gameState}</Text>
      </View>
    </View>
    <Text
      className="text-3xl"
      accessibilityLabel={`Game state icon: ${getGameStateIcon()}`}
    >
      {getGameStateIcon()}
    </Text>
  </View>
);

const GameProgressInfo = ({
  turns,
  revealedTiles,
  totalTiles,
}: {
  turns: number;
  revealedTiles: number;
  totalTiles: number;
}) => (
  <View
    className="mb-3 space-y-2"
    accessible={true}
    accessibilityLabel={`Game Progress - ${turns} turns used, ${revealedTiles} out of ${totalTiles} tiles revealed`}
  >
    <View className="flex-row items-center justify-between">
      <Text className={`text-[${colors.charcoal[500]}] text-sm`}>
        Turns Used:
      </Text>
      <Text
        className={`text-[${colors.charcoal[600]}] text-lg font-semibold`}
        accessibilityLabel={`${turns} turns used`}
      >
        {turns}
      </Text>
    </View>
    <View className="flex-row items-center justify-between">
      <Text className={`text-[${colors.charcoal[500]}] text-sm`}>
        Progress:
      </Text>
      <Text
        className={`text-[${colors.charcoal[600]}] text-lg font-semibold`}
        accessibilityLabel={`${revealedTiles} out of ${totalTiles} tiles revealed`}
      >
        {revealedTiles}/{totalTiles}
      </Text>
    </View>
  </View>
);

const GameProgressBar = ({
  revealedTiles,
  totalTiles,
}: {
  revealedTiles: number;
  totalTiles: number;
}) => {
  const progressPercentage = (revealedTiles / totalTiles) * 100;

  return (
    <View
      className={`bg-[${colors.neutral[200]}] h-3 rounded-full`}
      accessible={true}
      accessibilityLabel={`Progress bar showing ${Math.round(progressPercentage)}% completion`}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: totalTiles,
        now: revealedTiles,
      }}
    >
      <View
        className={`bg-[${colors.danger[500]}] h-3 rounded-full`}
        style={{ width: `${progressPercentage}%` }}
        testID="progress-bar"
      />
    </View>
  );
};

export function GameProgress({
  level,
  turns,
  gameState,
  revealedTiles,
  totalTiles,
  className = '',
}: GameProgressProps) {
  const getGameStateIcon = () => {
    switch (gameState) {
      case 'Win':
        return '🎉';
      case 'Game Over':
        return '💀';
      default:
        return '⚔️';
    }
  };

  const getGameStateColor = () => {
    switch (gameState) {
      case 'Win':
        return `bg-[${colors.warning[400]}] border-[${colors.warning[500]}] text-[${colors.charcoal[600]}]`;
      case 'Game Over':
        return `bg-[${colors.danger[500]}] border-[${colors.danger[600]}] text-[${colors.charcoal[600]}]`;
      default:
        return `bg-[${colors.neutral[200]}] border-[${colors.neutral[300]}] text-[${colors.charcoal[500]}]`;
    }
  };

  return (
    <View
      className={`rounded-lg border-2 p-4 ${getGameStateColor()} ${className}`}
      accessible={true}
      accessibilityLabel={`Game Status - Level ${level}, ${gameState} state`}
      accessibilityRole="summary"
    >
      <GameStateHeader
        level={level}
        gameState={gameState}
        getGameStateColor={getGameStateColor}
        getGameStateIcon={getGameStateIcon}
      />
      <GameProgressInfo
        turns={turns}
        revealedTiles={revealedTiles}
        totalTiles={totalTiles}
      />
      <GameProgressBar revealedTiles={revealedTiles} totalTiles={totalTiles} />
    </View>
  );
}
