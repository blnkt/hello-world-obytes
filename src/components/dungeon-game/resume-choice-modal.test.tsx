import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { ResumeChoiceModal } from './resume-choice-modal';

describe('ResumeChoiceModal', () => {
  const mockOnResume = jest.fn();
  const mockOnNewGame = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    isVisible: true,
    onResume: mockOnResume,
    onNewGame: mockOnNewGame,
    onClose: mockOnClose,
    saveDataInfo: {
      lastSaveTime: Date.now(),
      saveCount: 1,
      dataSize: 1024,
      isValid: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the modal when visible', () => {
      render(<ResumeChoiceModal {...defaultProps} />);

      expect(screen.getByText('Resume Your Game?')).toBeOnTheScreen();
      expect(
        screen.getByText('You have an existing game in progress.')
      ).toBeOnTheScreen();
    });

    it('should not render when not visible', () => {
      render(<ResumeChoiceModal {...defaultProps} isVisible={false} />);

      expect(screen.queryByText('Resume Your Game?')).not.toBeOnTheScreen();
    });

    it('should display save information', () => {
      const saveTime = new Date('2024-01-15T10:30:00Z');
      const props = {
        ...defaultProps,
        saveDataInfo: {
          lastSaveTime: saveTime.getTime(),
          saveCount: 3,
          dataSize: 2048,
          isValid: true,
        },
      };

      render(<ResumeChoiceModal {...props} />);

      expect(screen.getByText(/Last saved: Jan 15, 2024/)).toBeOnTheScreen();
      expect(screen.getByText(/3 saves/)).toBeOnTheScreen();
    });

    it('should show resume button', () => {
      render(<ResumeChoiceModal {...defaultProps} />);

      expect(screen.getByText('Resume Game')).toBeOnTheScreen();
    });

    it('should show new game button', () => {
      render(<ResumeChoiceModal {...defaultProps} />);

      expect(screen.getByText('Start New Game')).toBeOnTheScreen();
    });

    it('should show close button', () => {
      render(<ResumeChoiceModal {...defaultProps} />);

      expect(screen.getByText('Close')).toBeOnTheScreen();
    });
  });

  describe('interactions', () => {
    it('should call onResume when resume button is pressed', () => {
      render(<ResumeChoiceModal {...defaultProps} />);

      fireEvent.press(screen.getByText('Resume Game'));

      expect(mockOnResume).toHaveBeenCalledTimes(1);
    });

    it('should call onNewGame when new game button is pressed', () => {
      render(<ResumeChoiceModal {...defaultProps} />);

      fireEvent.press(screen.getByText('Start New Game'));

      expect(mockOnNewGame).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when close button is pressed', () => {
      render(<ResumeChoiceModal {...defaultProps} />);

      fireEvent.press(screen.getByText('Close'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is pressed', () => {
      render(<ResumeChoiceModal {...defaultProps} />);

      const backdrop = screen.getByTestId('modal-backdrop');
      fireEvent.press(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility labels', () => {
      render(<ResumeChoiceModal {...defaultProps} />);

      expect(
        screen.getByLabelText('Resume your previous game')
      ).toBeOnTheScreen();
      expect(screen.getByLabelText('Start a new game')).toBeOnTheScreen();
      expect(screen.getByLabelText('Close modal')).toBeOnTheScreen();
    });

    it('should support screen reader navigation', () => {
      render(<ResumeChoiceModal {...defaultProps} />);

      const resumeButton = screen.getByRole('button', { name: 'Resume Game' });
      const newGameButton = screen.getByRole('button', {
        name: 'Start New Game',
      });
      const closeButton = screen.getByRole('button', { name: 'Close' });

      expect(resumeButton).toBeOnTheScreen();
      expect(newGameButton).toBeOnTheScreen();
      expect(closeButton).toBeOnTheScreen();
    });
  });

  describe('error states', () => {
    it('should handle invalid save data gracefully', () => {
      const props = {
        ...defaultProps,
        saveDataInfo: {
          lastSaveTime: Date.now(),
          saveCount: 1,
          dataSize: 0,
          isValid: false,
        },
      };

      render(<ResumeChoiceModal {...props} />);

      expect(
        screen.getByText(/Warning: Save data may be corrupted/)
      ).toBeOnTheScreen();
      expect(screen.getByText('Start New Game')).toBeOnTheScreen();
      expect(screen.queryByText('Resume Game')).not.toBeOnTheScreen();
    });

    it('should show appropriate message for very old save data', () => {
      const oldSaveTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago
      const props = {
        ...defaultProps,
        saveDataInfo: {
          lastSaveTime: oldSaveTime,
          saveCount: 1,
          dataSize: 1024,
          isValid: true,
        },
      };

      render(<ResumeChoiceModal {...props} />);

      // Should show "X days ago" format for old save data
      expect(screen.getByText(/Last saved: \d+ days ago/)).toBeOnTheScreen();
    });
  });
});
