import React from 'react';
import { View } from 'react-native';

interface ScreenTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'bounce';
}

/**
 * Screen Transition Component
 * Provides smooth transitions between different screens
 */
export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  children,
  type = 'fade',
}) => {
  const getAnimationClass = () => {
    switch (type) {
      case 'slide':
        return 'animate-slide-up';
      case 'bounce':
        return 'animate-bounce-in';
      default:
        return 'animate-fade-in';
    }
  };

  return <View className={`${getAnimationClass()}`}>{children}</View>;
};

export default ScreenTransition;
