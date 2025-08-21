import { MotiView } from 'moti';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

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
  <MotiView
    style={styles.saveInfo}
    testID="animated-save-info"
    from={{ opacity: 0, translateY: 20 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{
      type: 'timing',
      duration: 300,
      delay: 300,
    }}
  >
    <Text style={styles.saveInfoText}>
      Last saved: {formatSaveTime(saveDataInfo.lastSaveTime)}
    </Text>
    <Text style={styles.saveInfoText}>
      {saveDataInfo.saveCount} save{saveDataInfo.saveCount !== 1 ? 's' : ''}
    </Text>
    <Text style={styles.saveInfoText}>
      Size: {formatDataSize(saveDataInfo.dataSize)}
    </Text>
  </MotiView>
);

const WarningSection: React.FC = () => (
  <MotiView
    style={styles.warningContainer}
    testID="animated-warning"
    from={{ opacity: 0, translateY: 20 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{
      type: 'timing',
      duration: 300,
      delay: 300,
    }}
  >
    <Text style={styles.warningText}>Warning: Save data may be corrupted</Text>
  </MotiView>
);

const ActionButtons: React.FC<{
  onResume: () => void;
  onNewGame: () => void;
  showResume: boolean;
}> = ({ onResume, onNewGame, showResume }) => (
  <MotiView
    style={styles.buttonContainer}
    testID="animated-buttons"
    from={{ opacity: 0, translateY: 20 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{
      type: 'timing',
      duration: 300,
      delay: 400,
    }}
  >
    {showResume && (
      <Pressable
        onPress={onResume}
        accessibilityLabel="Resume your previous game"
        accessibilityRole="button"
      >
        <MotiView
          style={[styles.button, styles.resumeButton]}
          testID="animated-resume-button"
          from={{ scale: 1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'timing', duration: 150 }}
        >
          <Text style={styles.buttonText}>Resume Game</Text>
        </MotiView>
      </Pressable>
    )}

    <Pressable
      onPress={onNewGame}
      accessibilityLabel="Start a new game"
      accessibilityRole="button"
    >
      <MotiView
        style={[styles.button, styles.newGameButton]}
        testID="animated-new-game-button"
        from={{ scale: 1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'timing', duration: 150 }}
      >
        <Text style={styles.buttonText}>Start New Game</Text>
      </MotiView>
    </Pressable>
  </MotiView>
);

const AnimatedTitle: React.FC = () => (
  <MotiView
    testID="animated-title"
    from={{ opacity: 0, translateY: -10 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{
      type: 'timing',
      duration: 300,
      delay: 100,
    }}
  >
    <Text style={styles.title}>Resume Your Game?</Text>
  </MotiView>
);

const AnimatedDescription: React.FC = () => (
  <MotiView
    testID="animated-description"
    from={{ opacity: 0, translateY: 10 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{
      type: 'timing',
      duration: 300,
      delay: 200,
    }}
  >
    <Text style={styles.description}>
      You have an existing game in progress.
    </Text>
  </MotiView>
);

const CloseButton: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <Pressable
    style={styles.closeButton}
    onPress={onClose}
    accessibilityLabel="Close modal"
    accessibilityRole="button"
  >
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        type: 'timing',
        duration: 300,
        delay: 500,
      }}
    >
      <Text style={styles.closeButtonText}>Close</Text>
    </MotiView>
  </Pressable>
);

const AnimatedModalContent: React.FC<{
  saveDataInfo: PersistenceMetadata;
  onResume: () => void;
  onNewGame: () => void;
  onClose: () => void;
}> = ({ saveDataInfo, onResume, onNewGame, onClose }) => (
  <MotiView
    style={styles.modalContent}
    testID="animated-modal-container"
    from={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{
      type: 'spring',
      damping: 20,
      mass: 1,
      stiffness: 300,
    }}
  >
    <AnimatedTitle />
    <AnimatedDescription />

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

    <CloseButton onClose={onClose} />
  </MotiView>
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
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable
        testID="modal-backdrop"
        style={styles.backdrop}
        onPress={onClose}
      >
        <MotiView
          style={styles.backdrop}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <View style={styles.modalContainer}>
            <AnimatedModalContent
              saveDataInfo={saveDataInfo}
              onResume={onResume}
              onNewGame={onNewGame}
              onClose={onClose}
            />
          </View>
        </MotiView>
      </Pressable>
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
