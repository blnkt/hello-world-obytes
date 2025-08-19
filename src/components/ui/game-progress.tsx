import React from 'react';
import { View } from 'react-native';

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
        className="text-lg font-bold text-[#6B5F57]"
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
      <Text className="text-sm text-[#7A6F66]">Turns Used:</Text>
      <Text
        className="text-lg font-semibold text-[#6B5F57]"
        accessibilityLabel={`${turns} turns used`}
      >
        {turns}
      </Text>
    </View>
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-[#7A6F66]">Progress:</Text>
      <Text
        className="text-lg font-semibold text-[#6B5F57]"
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
      className="h-3 rounded-full bg-[#E0D9CE]"
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
        className="h-3 rounded-full bg-[#B06F5E]"
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
        return 'bg-[#F7D17B] border-[#E6C269] text-[#8B7355]';
      case 'Game Over':
        return 'bg-[#D96B5E] border-[#C55A4D] text-[#8B4A3F]';
      default:
        return 'bg-[#E0D9CE] border-[#D1CABF] text-[#7A6F66]';
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
