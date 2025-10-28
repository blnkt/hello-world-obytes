/**
 * Animation Index
 * Centralized exports for all Delver's Descent animations
 */

export { ScreenTransition } from '@/components/ui/screen-transition';

/**
 * Additional animation components can be added here as needed:
 * - Encounter interaction animations
 * - Energy depletion visual feedback
 * - Reward collection animations
 * - Achievement unlock animations
 * - Collection progress bar animations
 * - Map navigation animations
 * - Loading state animations
 */

// Animation utilities and helpers
export const ANIMATION_DURATIONS = {
  fast: 100,
  medium: 300,
  slow: 500,
};

export const ANIMATION_EASING = {
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
};
