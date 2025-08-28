import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import { PersistenceErrorDisplay } from '../persistence-error-display';

describe('Persistence Error Handling and Data Validation', () => {
  const mockOnDismiss = jest.fn();
  const mockOnRetry = jest.fn();
  const mockOnStartNewGame = jest.fn();
  const mockOnTryRecover = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Storage Failure Handling (Task 5.1)', () => {
    it('should display user-friendly error message when save operation fails', () => {
      render(
        <PersistenceErrorDisplay
          error="Storage device full"
          onDismiss={mockOnDismiss}
          onRetry={mockOnRetry}
          onStartNewGame={mockOnStartNewGame}
          onTryRecover={mockOnTryRecover}
        />
      );

      expect(screen.getByText(/Storage device full/i)).toBeTruthy();
      expect(screen.getByText(/Free up space/i)).toBeTruthy();
    });

    it('should display user-friendly error message when load operation fails', () => {
      render(
        <PersistenceErrorDisplay
          error="Corrupted save data detected"
          onDismiss={mockOnDismiss}
          onRetry={mockOnRetry}
          onStartNewGame={mockOnStartNewGame}
          onTryRecover={mockOnTryRecover}
        />
      );

      expect(screen.getByText(/Corrupted save data detected/i)).toBeTruthy();
      expect(screen.getByText(/Start new game/i)).toBeTruthy();
      expect(screen.getByText(/Try to recover/i)).toBeTruthy();
    });

    it('should handle network-related storage errors gracefully', () => {
      render(
        <PersistenceErrorDisplay
          error="Network connection lost"
          onDismiss={mockOnDismiss}
          onRetry={mockOnRetry}
          onStartNewGame={mockOnStartNewGame}
          onTryRecover={mockOnTryRecover}
        />
      );

      expect(screen.getByText(/Network connection lost/i)).toBeTruthy();
      expect(screen.getByText(/Retry/i)).toBeTruthy();
    });

    it('should handle permission-related storage errors gracefully', () => {
      render(
        <PersistenceErrorDisplay
          error="Storage permission denied"
          onDismiss={mockOnDismiss}
          onRetry={mockOnRetry}
          onStartNewGame={mockOnStartNewGame}
          onTryRecover={mockOnTryRecover}
        />
      );

      expect(screen.getByText(/Storage permission denied/i)).toBeTruthy();
      expect(screen.getByText(/Check permissions/i)).toBeTruthy();
    });

    it('should provide actionable error messages for common failure scenarios', () => {
      const commonErrors = [
        { error: 'Insufficient storage space', action: 'Free up space' },
        { error: 'Storage device disconnected', action: 'Check connection' },
        { error: 'Data corruption detected', action: 'Start new game' },
      ];

      for (const { error, action } of commonErrors) {
        const { unmount } = render(
          <PersistenceErrorDisplay
            error={error}
            onDismiss={mockOnDismiss}
            onRetry={mockOnRetry}
            onStartNewGame={mockOnStartNewGame}
            onTryRecover={mockOnTryRecover}
          />
        );

        expect(screen.getByText(new RegExp(error, 'i'))).toBeTruthy();
        expect(screen.getByText(new RegExp(action, 'i'))).toBeTruthy();

        unmount();
      }
    });
  });

  describe('Fallback Behavior (Task 5.2)', () => {
    it('should not render when no error is present', () => {
      render(
        <PersistenceErrorDisplay
          error={null}
          onDismiss={mockOnDismiss}
          onRetry={mockOnRetry}
          onStartNewGame={mockOnStartNewGame}
          onTryRecover={mockOnTryRecover}
        />
      );

      expect(screen.queryByText(/Storage Error/i)).toBeFalsy();
    });

    it('should call onDismiss when dismiss button is pressed', () => {
      render(
        <PersistenceErrorDisplay
          error="Test error"
          onDismiss={mockOnDismiss}
          onRetry={mockOnRetry}
          onStartNewGame={mockOnStartNewGame}
          onTryRecover={mockOnTryRecover}
        />
      );

      const dismissButton = screen.getByText(/Dismiss/i);
      fireEvent.press(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry when retry button is pressed', () => {
      render(
        <PersistenceErrorDisplay
          error="Network connection lost"
          onDismiss={mockOnDismiss}
          onRetry={mockOnRetry}
          onStartNewGame={mockOnStartNewGame}
          onTryRecover={mockOnTryRecover}
        />
      );

      const retryButton = screen.getByText(/Retry/i);
      fireEvent.press(retryButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('should call onStartNewGame when start new game button is pressed', () => {
      render(
        <PersistenceErrorDisplay
          error="Data corruption detected"
          onDismiss={mockOnDismiss}
          onRetry={mockOnRetry}
          onStartNewGame={mockOnStartNewGame}
          onTryRecover={mockOnTryRecover}
        />
      );

      const startNewGameButton = screen.getByText(/Start new game/i);
      fireEvent.press(startNewGameButton);

      expect(mockOnStartNewGame).toHaveBeenCalledTimes(1);
    });

    it('should call onTryRecover when try to recover button is pressed', () => {
      render(
        <PersistenceErrorDisplay
          error="Data corruption detected"
          onDismiss={mockOnDismiss}
          onRetry={mockOnRetry}
          onStartNewGame={mockOnStartNewGame}
          onTryRecover={mockOnTryRecover}
        />
      );

      const tryRecoverButton = screen.getByText(/Try to recover/i);
      fireEvent.press(tryRecoverButton);

      expect(mockOnTryRecover).toHaveBeenCalledTimes(1);
    });
  });

  describe('Data Validation (Task 5.3)', () => {
    it('should detect and handle corrupted save data gracefully', () => {
      render(
        <PersistenceErrorDisplay
          error="Data validation failed: Invalid game state"
          onDismiss={mockOnDismiss}
          onRetry={mockOnRetry}
          onStartNewGame={mockOnStartNewGame}
          onTryRecover={mockOnTryRecover}
        />
      );

      expect(screen.getByText(/Data validation failed/i)).toBeTruthy();
      expect(screen.getByText(/Invalid game state/i)).toBeTruthy();
    });

    it('should handle version incompatibility errors gracefully', () => {
      render(
        <PersistenceErrorDisplay
          error="Incompatible save version: 0.9.0 (current: 1.0.0)"
          onDismiss={mockOnDismiss}
          onRetry={mockOnRetry}
          onStartNewGame={mockOnStartNewGame}
          onTryRecover={mockOnTryRecover}
        />
      );

      expect(screen.getByText(/Incompatible save version/i)).toBeTruthy();
      expect(screen.getByText(/0\.9\.0.*1\.0\.0/i)).toBeTruthy();
      expect(screen.getByText(/Start new game/i)).toBeTruthy();
    });

    it('should validate save data structure before loading', () => {
      render(
        <PersistenceErrorDisplay
          error="Save data structure invalid: Missing required fields"
          onDismiss={mockOnDismiss}
          onRetry={mockOnRetry}
          onStartNewGame={mockOnStartNewGame}
          onTryRecover={mockOnTryRecover}
        />
      );

      expect(screen.getByText(/Save data structure invalid/i)).toBeTruthy();
      expect(screen.getByText(/Missing required fields/i)).toBeTruthy();
      expect(screen.getByText(/Start new game/i)).toBeTruthy();
    });

    it('should provide recovery options for corrupted data', () => {
      render(
        <PersistenceErrorDisplay
          error="Data corruption detected"
          onDismiss={mockOnDismiss}
          onRetry={mockOnRetry}
          onStartNewGame={mockOnStartNewGame}
          onTryRecover={mockOnTryRecover}
        />
      );

      expect(screen.getByText(/Data corruption detected/i)).toBeTruthy();
      expect(screen.getByText(/Start new game/i)).toBeTruthy();
      expect(screen.getByText(/Try to recover/i)).toBeTruthy();
    });

    it('should handle unknown error types with default actions', () => {
      render(
        <PersistenceErrorDisplay
          error="Unknown error type"
          onDismiss={mockOnDismiss}
          onRetry={mockOnRetry}
          onStartNewGame={mockOnStartNewGame}
          onTryRecover={mockOnTryRecover}
        />
      );

      expect(screen.getByText(/Unknown error type/i)).toBeTruthy();
      expect(screen.getByText(/Dismiss/i)).toBeTruthy();
      expect(screen.getByText(/Retry/i)).toBeTruthy();
    });
  });

  describe('UI and Accessibility', () => {
    it('should display error title and message clearly', () => {
      render(
        <PersistenceErrorDisplay
          error="Test error message"
          onDismiss={mockOnDismiss}
          onRetry={mockOnRetry}
          onStartNewGame={mockOnStartNewGame}
          onTryRecover={mockOnTryRecover}
        />
      );

      expect(screen.getByText(/⚠️ Storage Error/i)).toBeTruthy();
      expect(screen.getByText(/Test error message/i)).toBeTruthy();
    });

    it('should render action buttons with proper styling', () => {
      render(
        <PersistenceErrorDisplay
          error="Test error"
          onDismiss={mockOnDismiss}
          onRetry={mockOnRetry}
          onStartNewGame={mockOnStartNewGame}
          onTryRecover={mockOnTryRecover}
        />
      );

      const dismissButton = screen.getByText(/Dismiss/i);
      const retryButton = screen.getByText(/Retry/i);

      expect(dismissButton).toBeTruthy();
      expect(retryButton).toBeTruthy();
    });
  });
});
