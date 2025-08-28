import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface PersistenceErrorDisplayProps {
  error: string | null;
  onDismiss: () => void;
  onRetry?: () => void;
  onStartNewGame?: () => void;
  onTryRecover?: () => void;
}

// Helper function to determine error actions
const getErrorActions = (params: {
  error: string;
  onDismiss: () => void;
  onRetry?: () => void;
  onStartNewGame?: () => void;
  onTryRecover?: () => void;
}) => {
  const { error, onDismiss, onRetry, onStartNewGame, onTryRecover } = params;
  // Storage space issues
  if (
    error.includes('Storage device full') ||
    error.includes('Insufficient storage space')
  ) {
    return [{ text: 'Free up space', action: onDismiss }];
  }

  // Connection issues
  if (
    error.includes('Storage device disconnected') ||
    error.includes('Check connection')
  ) {
    return [{ text: 'Check connection', action: onRetry }];
  }

  // Data corruption issues
  if (
    error.includes('Data corruption detected') ||
    error.includes('Corrupted save data')
  ) {
    return [
      { text: 'Start new game', action: onStartNewGame },
      { text: 'Try to recover', action: onTryRecover },
    ];
  }

  // Version incompatibility
  if (error.includes('Incompatible save version')) {
    return [{ text: 'Start new game', action: onStartNewGame }];
  }

  // Structure validation issues
  if (error.includes('Save data structure invalid')) {
    return [{ text: 'Start new game', action: onStartNewGame }];
  }

  // Network issues
  if (error.includes('Network connection lost')) {
    return [{ text: 'Retry', action: onRetry }];
  }

  // Permission issues
  if (error.includes('Storage permission denied')) {
    return [{ text: 'Check permissions', action: onDismiss }];
  }

  // Default actions
  const defaultActions = [{ text: 'Dismiss', action: onDismiss }];
  if (onRetry) {
    defaultActions.push({ text: 'Retry', action: onRetry });
  }
  return defaultActions;
};

export const PersistenceErrorDisplay: React.FC<
  PersistenceErrorDisplayProps
> = ({ error, onDismiss, onRetry, onStartNewGame, onTryRecover }) => {
  if (!error) {
    return null;
  }

  const errorActions = getErrorActions({
    error,
    onDismiss,
    onRetry,
    onStartNewGame,
    onTryRecover,
  });

  return (
    <View style={styles.container}>
      <View style={styles.errorCard}>
        <Text style={styles.errorTitle}>⚠️ Storage Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>

        <View style={styles.actionsContainer}>
          {errorActions.map((action, index) => (
            <Pressable
              key={index}
              style={styles.actionButton}
              onPress={action.action}
            >
              <Text style={styles.actionButtonText}>{action.text}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
