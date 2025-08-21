import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { GameState } from '@/types/dungeon-game';

import GameGrid from './game-grid';
import { useGameState } from './providers/game-state-provider';
import { ResumeChoiceModal } from './resume-choice-modal';

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
    <Text style={styles.turnsText}>Turns: {turnsUsed}</Text>
    <Text style={styles.currencyText}>Currency: {currency}</Text>
    <Text style={styles.availableTurnsText}>
      Available Turns: {availableTurns}
    </Text>
  </View>
);

// Helper component for game controls
const GameControls: React.FC<{
  gameState: GameState;
  onReset: () => void;
  onNextLevel: () => void;
}> = ({ gameState, onReset, onNextLevel }) => (
  <View style={styles.controls}>
    <Pressable style={[styles.button, styles.resetButton]} onPress={onReset}>
      <Text style={styles.buttonText}>Reset Game</Text>
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
  } = useGameState();

  const [showResumeModal, setShowResumeModal] = useState(false);

  // Show resume modal when component mounts if there's existing save data
  useEffect(() => {
    if (hasExistingSave) {
      setShowResumeModal(true);
    }
  }, [hasExistingSave]);

  const handleReset = () => {
    startNewGame();
  };

  const handleNextLevel = () => {
    // TODO: Implement level progression
    console.log('Next level not implemented yet');
  };

  const availableTurns = Math.floor(currency / 100);

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

      <GameGrid level={level} />

      <GameControls
        gameState={gameState}
        onReset={handleReset}
        onNextLevel={handleNextLevel}
      />

      <GameStateDisplay gameState={gameState} />

      {lastError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {lastError}</Text>
        </View>
      )}

      <ResumeChoiceModal
        isVisible={showResumeModal}
        onClose={() => setShowResumeModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  turnsText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
    color: '#888',
  },
  currencyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
    color: '#888',
  },
  availableTurnsText: {
    fontSize: 16,
    textAlign: 'center',
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
