import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { GameState } from '@/types/dungeon-game';

import GameGrid from './game-grid';
import { GameOverModal, WinModal } from './game-modals';
import { useGameState } from './providers/game-state-provider';

// Helper component for the game header
const GameHeader: React.FC<{
  level: number;
  turnsUsed: number;
  currency: number;
  availableTurns: number;
}> = ({ level, turnsUsed, currency, availableTurns }) => (
  <View style={styles.header}>
    <Text style={styles.title}>Dungeon Game</Text>
    <Text style={styles.levelText}>Level {level}</Text>

    {/* Enhanced currency and turns display */}
    <View style={styles.currencyTurnsContainer}>
      <Text style={styles.currencyTurnsText}>
        💰 {currency} steps = {availableTurns} turns
      </Text>
      <Text style={styles.turnCostText}>(100 steps per turn)</Text>
    </View>

    <Text style={styles.turnsText}>Turns Used: {turnsUsed}</Text>
    <Text style={styles.turnsRemainingText}>
      Turns Remaining: {availableTurns}
    </Text>
  </View>
);

// Helper component for game controls
const GameControls: React.FC<{
  gameState: GameState;
  canStartGame: boolean;
  onReset: () => void;
  onNextLevel: () => void;
}> = ({ gameState, canStartGame, onReset, onNextLevel }) => (
  <View style={styles.controls}>
    <Pressable
      style={[
        styles.button,
        styles.resetButton,
        !canStartGame && styles.disabledButton,
      ]}
      onPress={onReset}
      disabled={!canStartGame}
    >
      <Text
        style={[styles.buttonText, !canStartGame && styles.disabledButtonText]}
      >
        {canStartGame ? 'Reset Game' : 'Need 100+ Steps'}
      </Text>
    </Pressable>

    {gameState === 'Win' && (
      <Pressable
        style={[styles.button, styles.nextLevelButton]}
        onPress={onNextLevel}
      >
        <Text style={styles.buttonText}>Next Level</Text>
      </Pressable>
    )}
  </View>
);

// Helper component for game state display
// export const GameStateDisplay: React.FC<{ gameState: GameState }> = ({
//   gameState,
// }) => {
//   if (gameState === 'Win') {
//     return (
//       <View className="mx-4 mb-4 items-center rounded-xl bg-white p-4 shadow-lg">
//         <Text className="text-xl font-bold text-green-600">
//           🎉 Level Complete! 🎉
//         </Text>
//         <Text className="mt-1 text-center text-sm text-green-600">
//           Congratulations! You've completed this level!
//         </Text>
//       </View>
//     );
//   }

//   if (gameState === 'Game Over') {
//     return (
//       <View className="mx-4 mb-4 items-center rounded-xl bg-white p-4 shadow-lg">
//         <Text className="text-xl font-bold text-red-600">💀 Game Over 💀</Text>
//         <Text className="mt-1 text-center text-sm text-red-600">
//           Better luck next time!
//         </Text>
//       </View>
//     );
//   }

//   if (gameState === 'Active') {
//     return (
//       <View className="mx-4 mb-4 items-center rounded-xl bg-white p-4 shadow-lg">
//         <Text className="text-xl font-bold text-blue-600">🎮 Game Active</Text>
//         <Text className="mt-1 text-center text-sm text-blue-600">
//           Explore the dungeon and find the exit!
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <View className="mx-4 mb-4 items-center rounded-xl bg-white p-4 shadow-lg">
//       <Text className="text-xl font-bold text-purple-600">
//         🎲 Ready to Play
//       </Text>
//       <Text className="mt-1 text-center text-sm text-purple-600">
//         Start your adventure!
//       </Text>
//     </View>
//   );
// };

// eslint-disable-next-line max-lines-per-function
export default function DungeonGame() {
  const {
    level,
    gameState,
    turnsUsed,
    currency,
    hasExistingSave,
    isLoading,
    lastError,
    startNewGame,
    setLevel,
    canStartGame,
    getAvailableTurns,
    getTurnValidationMessage,
    canProgressToLevel,
    getLevelProgressionValidationMessage,
  } = useGameState();

  const [showResumeModal, setShowResumeModal] = useState(false);

  // Show resume modal when component mounts if there's existing save data
  useEffect(() => {
    if (hasExistingSave) {
      setShowResumeModal(true);
    }
  }, [hasExistingSave]);

  const handleReset = () => {
    if (!canStartGame()) {
      // Don't allow reset if insufficient currency
      return;
    }
    startNewGame();
  };

  const handleMainMenu = () => {
    // Navigate back to the main app screen
    // For now, we'll just reset the game to a clean state
    startNewGame();
    setLevel(1);
  };

  const handleNextLevel = () => {
    // Enhanced validation for level progression
    const nextLevel = level + 1;

    if (!canProgressToLevel(nextLevel)) {
      const validationMessage = getLevelProgressionValidationMessage(nextLevel);
      console.warn(
        `Cannot progress to level ${nextLevel}: ${validationMessage}`
      );
      return;
    }

    // Progress to next level
    setLevel(nextLevel);

    // Reset game state for the new level
    startNewGame();
  };

  const availableTurns = getAvailableTurns();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GameHeader
        level={level}
        turnsUsed={turnsUsed}
        currency={currency}
        availableTurns={availableTurns}
      />

      {/* Comprehensive Currency Display */}
      {/* <View style={styles.currencyDisplayContainer}>
        <CurrencyDisplay
          currency={currency}
          availableTurns={availableTurns}
          turnCost={100}
        />
      </View> */}

      {/* Turn Requirements Display */}
      {/* <View style={styles.turnRequirementsContainer}>
        <Text style={styles.turnRequirementsText}>
          📊 Level {level} requires minimum {getMinimumTurnsRequired()} turns
        </Text>
        <Text style={styles.turnRequirementsSubtext}>
          Current status:{' '}
          {availableTurns >= getMinimumTurnsRequired()
            ? '✅ Ready'
            : '❌ Insufficient'}{' '}
          turns
        </Text>
      </View> */}

      {/* Enhanced Turn Validation Display */}
      {/* {!canStartGame() && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {getTurnValidationMessage()}</Text>
        </View>
      )} */}

      {/* Game State Display */}
      {/* <GameStateDisplay gameState={gameState} /> */}

      {/* Game Grid */}
      <GameGrid level={level} disabled={gameState !== 'Active'} />

      {/* Game Controls */}
      <GameControls
        gameState={gameState}
        canStartGame={canStartGame()}
        onReset={handleReset}
        onNextLevel={handleNextLevel}
      />

      {/* Win Modal */}
      {gameState === 'Win' && (
        <WinModal
          visible={true}
          level={level}
          onNextLevel={handleNextLevel}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'Game Over' && (
        <GameOverModal
          visible={true}
          level={level}
          turnsUsed={turnsUsed}
          onMainMenu={handleMainMenu}
          onRetry={() => {
            if (canStartGame()) {
              startNewGame();
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  turnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  turnsText: {
    fontSize: 14,
    color: '#666666',
  },
  turnsRemainingText: {
    fontSize: 14,
    color: '#666666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  levelText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  currencyTurnsContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  currencyTurnsText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
    color: '#4CAF50',
  },
  turnCostText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
  },
  currencyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
    color: '#888',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#FF9800',
  },
  nextLevelButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  disabledButtonText: {
    color: '#666666',
  },

  turnRequirementsContainer: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  turnRequirementsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    textAlign: 'center',
  },
  turnRequirementsSubtext: {
    fontSize: 12,
    color: '#42A5F5',
    textAlign: 'center',
    marginTop: 4,
  },
  currencyDisplayContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    fontSize: 14,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginTop: 100,
  },
});
