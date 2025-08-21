import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

import { useGameState } from './providers/game-state-provider';

interface ResumeChoiceModalProps {
  isVisible: boolean;
  onClose: () => void;
}

// Helper function to format last save time
const formatLastSaveTime = (lastSaveTime: number | null): string => {
  if (!lastSaveTime) return 'Unknown time';
  const date = new Date(lastSaveTime);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

// Helper function to render modal content
const ModalContent: React.FC<{
  onResume: () => void;
  onNewGame: () => void;
  onClose: () => void;
  isLoading: boolean;
  lastSaveTime: number | null;
}> = ({ onResume, onNewGame, onClose, isLoading, lastSaveTime }) => (
  <View style={styles.modalContent}>
    <Text style={styles.title}>Resume Your Game?</Text>
    
    <Text style={styles.description}>
      You have an existing game in progress.
    </Text>
    
    {lastSaveTime && (
      <Text style={styles.saveInfo}>
        Last saved: {formatLastSaveTime(lastSaveTime)}
      </Text>
    )}
    
    <View style={styles.buttonContainer}>
      <Pressable
        style={[styles.button, styles.resumeButton]}
        onPress={onResume}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Loading...' : 'Resume Game'}
        </Text>
      </Pressable>
      
      <Pressable
        style={[styles.button, styles.newGameButton]}
        onPress={onNewGame}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Start New Game</Text>
      </Pressable>
    </View>
    
    <Pressable style={styles.closeButton} onPress={onClose}>
      <Text style={styles.closeButtonText}>Close</Text>
    </Pressable>
  </View>
);

export const ResumeChoiceModal: React.FC<ResumeChoiceModalProps> = ({
  isVisible,
  onClose,
}) => {
  const { hasExistingSave, resumeGame, startNewGame, isLoading, lastSaveTime } = useGameState();

  const handleResume = async () => {
    await resumeGame();
    onClose();
  };

  const handleNewGame = async () => {
    startNewGame();
    onClose();
  };

  if (!hasExistingSave) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ModalContent
          onResume={handleResume}
          onNewGame={handleNewGame}
          onClose={onClose}
          isLoading={isLoading}
          lastSaveTime={lastSaveTime}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 300,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  saveInfo: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
  },
  newGameButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
