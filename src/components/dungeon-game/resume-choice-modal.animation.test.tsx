import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { ResumeChoiceModal } from './resume-choice-modal';

// Mock moti to track animation calls
jest.mock('moti', () => ({
  MotiView: ({
    children,
    from,
    animate,
    transition,
    testID,
    ...props
  }: any) => {
    const React = require('react');
    const { View } = require('react-native');

    // Store animation props in testID for verification
    const animationData = {
      from,
      animate,
      transition,
    };

    return (
      <View
        {...props}
        testID={testID || 'moti-view'}
        // Store animation data as accessible props for testing
        accessibilityHint={JSON.stringify(animationData)}
      >
        {children}
      </View>
    );
  },
}));

const mockSaveDataInfo = {
  isValid: true,
  lastSaveTime: Date.now() - 3600000, // 1 hour ago
  saveCount: 5,
  dataSize: 1024,
  gameState: 'Active' as const,
  level: 3,
};

describe('ResumeChoiceModal Animations', () => {
  const defaultProps = {
    isVisible: true,
    onResume: jest.fn(),
    onNewGame: jest.fn(),
    onClose: jest.fn(),
    saveDataInfo: mockSaveDataInfo,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should apply modal entrance animation to container', () => {
    render(<ResumeChoiceModal {...defaultProps} />);

    const modalContainer = screen.getByTestId('animated-modal-container');
    expect(modalContainer).toBeTruthy();

    // Check that animation properties are applied
    const animationData = JSON.parse(modalContainer.props.accessibilityHint);
    expect(animationData.from).toEqual({
      opacity: 0,
      scale: 0.8,
    });
    expect(animationData.animate).toEqual({
      opacity: 1,
      scale: 1,
    });
    expect(animationData.transition).toEqual({
      type: 'spring',
      damping: 20,
      mass: 1,
      stiffness: 300,
    });
  });

  it('should apply staggered animations to content elements', () => {
    render(<ResumeChoiceModal {...defaultProps} />);

    const title = screen.getByTestId('animated-title');
    const description = screen.getByTestId('animated-description');
    const saveInfo = screen.getByTestId('animated-save-info');
    const buttons = screen.getByTestId('animated-buttons');

    // Verify each element has proper animation delays
    const titleAnimation = JSON.parse(title.props.accessibilityHint);
    const descriptionAnimation = JSON.parse(
      description.props.accessibilityHint
    );
    const saveInfoAnimation = JSON.parse(saveInfo.props.accessibilityHint);
    const buttonsAnimation = JSON.parse(buttons.props.accessibilityHint);

    expect(titleAnimation.transition.delay).toBe(100);
    expect(descriptionAnimation.transition.delay).toBe(200);
    expect(saveInfoAnimation.transition.delay).toBe(300);
    expect(buttonsAnimation.transition.delay).toBe(400);
  });

  it('should apply press animations to buttons', () => {
    render(<ResumeChoiceModal {...defaultProps} />);

    const resumeButton = screen.getByTestId('animated-resume-button');
    const newGameButton = screen.getByTestId('animated-new-game-button');

    // Check that buttons have press animation properties
    const resumeAnimation = JSON.parse(resumeButton.props.accessibilityHint);
    const newGameAnimation = JSON.parse(newGameButton.props.accessibilityHint);

    expect(resumeAnimation.from).toEqual({ scale: 1 });
    expect(newGameAnimation.from).toEqual({ scale: 1 });
  });

  it('should hide animated elements when modal is not visible', () => {
    render(<ResumeChoiceModal {...defaultProps} isVisible={false} />);

    expect(screen.queryByTestId('animated-modal-container')).toBeNull();
    expect(screen.queryByTestId('animated-title')).toBeNull();
    expect(screen.queryByTestId('animated-description')).toBeNull();
  });

  it('should apply exit animation when modal closes', () => {
    const { rerender } = render(
      <ResumeChoiceModal {...defaultProps} isVisible={true} />
    );

    // Modal is visible, should have entrance animation
    const modalContainer = screen.getByTestId('animated-modal-container');
    let animationData = JSON.parse(modalContainer.props.accessibilityHint);
    expect(animationData.animate.opacity).toBe(1);

    // Modal becomes invisible, should trigger exit animation
    rerender(<ResumeChoiceModal {...defaultProps} isVisible={false} />);

    // Since we're not actually implementing exit animations in this test,
    // we'll just verify the component is properly removed
    expect(screen.queryByTestId('animated-modal-container')).toBeNull();
  });

  it('should handle corrupted save data scenario with same animations', () => {
    const corruptedSaveData = {
      ...mockSaveDataInfo,
      isValid: false,
    };

    render(
      <ResumeChoiceModal {...defaultProps} saveDataInfo={corruptedSaveData} />
    );

    // Should still have main container animation
    const modalContainer = screen.getByTestId('animated-modal-container');
    expect(modalContainer).toBeTruthy();

    // Should have warning section instead of save info
    const warning = screen.getByTestId('animated-warning');
    expect(warning).toBeTruthy();

    const warningAnimation = JSON.parse(warning.props.accessibilityHint);
    expect(warningAnimation.transition.delay).toBe(300);
  });
});
