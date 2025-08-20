import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { GameOverModal, WinModal } from './game-modals';

describe('WinModal', () => {
  const defaultProps = {
    visible: true,
    level: 3,
    onNextLevel: jest.fn(),
    onMainMenu: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when visible', () => {
    render(<WinModal {...defaultProps} />);

    expect(screen.getByText('Level 3 Complete!')).toBeTruthy();
    expect(screen.getByText('🎉')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    render(<WinModal {...defaultProps} visible={false} />);

    // When not visible, the modal content should not be rendered
    expect(screen.queryByText('Level 3 Complete!')).toBeNull();
  });

  it('should display correct level information', () => {
    render(<WinModal {...defaultProps} level={5} />);

    expect(screen.getByText('Level 5 Complete!')).toBeTruthy();
    expect(screen.getByText('Level 5 Mastered')).toBeTruthy();
  });

  it('should display congratulations message', () => {
    render(<WinModal {...defaultProps} />);

    expect(
      screen.getByText(
        'Congratulations! You found the exit and completed this level.'
      )
    ).toBeTruthy();
    expect(screen.getByText('Ready for the next challenge!')).toBeTruthy();
  });

  it('should call onNextLevel when Next Level button is pressed', () => {
    render(<WinModal {...defaultProps} />);

    const nextLevelButton = screen.getByText('Next Level');
    fireEvent.press(nextLevelButton);

    expect(defaultProps.onNextLevel).toHaveBeenCalledTimes(1);
  });

  it('should call onMainMenu when Main Menu button is pressed', () => {
    render(<WinModal {...defaultProps} />);

    const mainMenuButton = screen.getByText('Main Menu');
    fireEvent.press(mainMenuButton);

    expect(defaultProps.onMainMenu).toHaveBeenCalledTimes(1);
  });

  it('should render both action buttons', () => {
    render(<WinModal {...defaultProps} />);

    expect(screen.getByText('Next Level')).toBeTruthy();
    expect(screen.getByText('Main Menu')).toBeTruthy();
  });
});

describe('GameOverModal', () => {
  const defaultProps = {
    visible: true,
    level: 2,
    turnsUsed: 15,
    onMainMenu: jest.fn(),
    onRetry: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when visible', () => {
    render(<GameOverModal {...defaultProps} />);

    expect(screen.getByText('Game Over')).toBeTruthy();
    expect(screen.getByText('💀')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    render(<GameOverModal {...defaultProps} visible={false} />);

    // When not visible, the modal content should not be rendered
    expect(screen.queryByText('Game Over')).toBeNull();
  });

  it('should display correct level information', () => {
    render(<GameOverModal {...defaultProps} level={4} />);

    expect(screen.getByText('You ran out of turns on Level 4.')).toBeTruthy();
    expect(screen.getByText('Level 4 Failed')).toBeTruthy();
  });

  it('should display correct turns used information', () => {
    render(<GameOverModal {...defaultProps} turnsUsed={25} />);

    expect(screen.getByText('Turns used: 25')).toBeTruthy();
  });

  it('should display game over message', () => {
    render(<GameOverModal {...defaultProps} />);

    expect(screen.getByText('You ran out of turns on Level 2.')).toBeTruthy();
    expect(screen.getByText('Level 2 Failed')).toBeTruthy();
  });

  it('should call onRetry when Try Again button is pressed', () => {
    render(<GameOverModal {...defaultProps} />);

    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.press(tryAgainButton);

    expect(defaultProps.onRetry).toHaveBeenCalledTimes(1);
  });

  it('should call onMainMenu when Main Menu button is pressed', () => {
    render(<GameOverModal {...defaultProps} />);

    const mainMenuButton = screen.getByText('Main Menu');
    fireEvent.press(mainMenuButton);

    expect(defaultProps.onMainMenu).toHaveBeenCalledTimes(1);
  });

  it('should render both action buttons', () => {
    render(<GameOverModal {...defaultProps} />);

    expect(screen.getByText('Try Again')).toBeTruthy();
    expect(screen.getByText('Main Menu')).toBeTruthy();
  });

  it('should handle different level values correctly', () => {
    const { rerender } = render(<GameOverModal {...defaultProps} level={1} />);

    expect(screen.getByText('You ran out of turns on Level 1.')).toBeTruthy();
    expect(screen.getByText('Level 1 Failed')).toBeTruthy();

    rerender(<GameOverModal {...defaultProps} level={10} />);
    expect(screen.getByText('You ran out of turns on Level 10.')).toBeTruthy();
    expect(screen.getByText('Level 10 Failed')).toBeTruthy();
  });

  it('should handle different turn counts correctly', () => {
    const { rerender } = render(
      <GameOverModal {...defaultProps} turnsUsed={0} />
    );

    expect(screen.getByText('Turns used: 0')).toBeTruthy();

    rerender(<GameOverModal {...defaultProps} turnsUsed={100} />);
    expect(screen.getByText('Turns used: 100')).toBeTruthy();
  });
});
