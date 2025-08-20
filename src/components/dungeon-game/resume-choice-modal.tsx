import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { type PersistenceMetadata } from '@/types/dungeon-game';

export interface ResumeChoiceModalProps {
  isVisible: boolean;
  onResume: () => void;
  onNewGame: () => void;
  onClose: () => void;
  saveDataInfo: PersistenceMetadata | null;
}

const formatSaveTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 30) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
};

const formatDataSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const SaveInfoSection: React.FC<{ saveDataInfo: PersistenceMetadata }> = ({
  saveDataInfo,
}) => (
  <View style={styles.saveInfo}>
    <Text style={styles.saveInfoText}>
      Last saved: {formatSaveTime(saveDataInfo.lastSaveTime)}
    </Text>
    <Text style={styles.saveInfoText}>
      {saveDataInfo.saveCount} save{saveDataInfo.saveCount !== 1 ? 's' : ''}
    </Text>
    <Text style={styles.saveInfoText}>
      Size: {formatDataSize(saveDataInfo.dataSize)}
    </Text>
  </View>
);

const WarningSection: React.FC = () => (
  <View style={styles.warningContainer}>
    <Text style={styles.warningText}>Warning: Save data may be corrupted</Text>
  </View>
);

const ActionButtons: React.FC<{
  onResume: () => void;
  onNewGame: () => void;
  showResume: boolean;
}> = ({ onResume, onNewGame, showResume }) => (
  <View style={styles.buttonContainer}>
    {showResume && (
      <TouchableOpacity
        style={[styles.button, styles.resumeButton]}
        onPress={onResume}
        accessibilityLabel="Resume your previous game"
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Resume Game</Text>
      </TouchableOpacity>
    )}

    <TouchableOpacity
      style={[styles.button, styles.newGameButton]}
      onPress={onNewGame}
      accessibilityLabel="Start a new game"
      accessibilityRole="button"
    >
      <Text style={styles.buttonText}>Start New Game</Text>
    </TouchableOpacity>
  </View>
);

export const ResumeChoiceModal: React.FC<ResumeChoiceModalProps> = ({
  isVisible,
  onResume,
  onNewGame,
  onClose,
  saveDataInfo,
}) => {
  if (!isVisible || !saveDataInfo) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        testID="modal-backdrop"
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Resume Your Game?</Text>

            <Text style={styles.description}>
              You have an existing game in progress.
            </Text>

            {saveDataInfo.isValid ? (
              <>
                <SaveInfoSection saveDataInfo={saveDataInfo} />
                <ActionButtons
                  onResume={onResume}
                  onNewGame={onNewGame}
                  showResume={true}
                />
              </>
            ) : (
              <>
                <WarningSection />
                <ActionButtons
                  onResume={onResume}
                  onNewGame={onNewGame}
                  showResume={false}
                />
              </>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Close modal"
              accessibilityRole="button"
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  saveInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  saveInfoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    textAlign: 'center',
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  resumeButton: {
    backgroundColor: '#007AFF',
  },
  newGameButton: {
    backgroundColor: '#34C759',
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
    fontSize: 14,
    fontWeight: '500',
  },
});
