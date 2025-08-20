import { cssInterop } from 'nativewind';
import Svg from 'react-native-svg';

export * from './attribute-list';
export * from './button';
export * from './card';
export * from './checkbox';
// Note: Individual card components are now consolidated into the Card component
// Use Card with variant prop instead: <Card variant="info" title="..." />
export { default as colors } from './colors';
export * from './error-boundary';
export * from './feature-list';
export * from './focus-aware-status-bar';
export * from './game-progress';
export * from './history-item';
export * from './image';
export * from './input';
export * from './list';
export * from './loading-overlay';
export * from './modal';
export * from './progress-bar';
export * from './select';
export * from './status-indicator';
export * from './text';
export * from './utils';

// export base components from react-native
export {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
export { SafeAreaView } from 'react-native-safe-area-context';

//Apply cssInterop to Svg to resolve className string into style
cssInterop(Svg, {
  className: {
    target: 'style',
  },
});
