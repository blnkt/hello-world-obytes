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
    <Text style={styles.turnsText}>Turns Used: {turnsUsed}</Text>
    <Text style={styles.turnsRemainingText}>
      Turns Remaining: {availableTurns}
    </Text>
    <Text style={styles.currencyText}>Currency: {currency}</Text>
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
const GameStateDisplay: React.FC<{ gameState: GameState }> = ({
  gameState,
}) => {
  if (gameState === 'Win') {
    return (
      <View style={styles.gameState}>
        <Text style={styles.winText}>🎉 Level Complete! 🎉</Text>
      </View>
    );
  }

  if (gameState === 'Game Over') {
    return (
      <View style={styles.gameState}>
        <Text style={styles.gameOverText}>💀 Game Over 💀</Text>
      </View>
    );
  }

  return null;
};

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
    // Check if player can start the next level
    if (!canStartGame()) {
      // Don't allow level progression if insufficient currency
      return;
    }

    // Progress to next level
    const nextLevel = level + 1;
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

      {/* Currency Error Display */}
      {!canStartGame() && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            ⚠️ Insufficient currency to play. Need at least 100 steps to start.
          </Text>
        </View>
      )}

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
  gameState: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  winText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  gameOverText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
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
