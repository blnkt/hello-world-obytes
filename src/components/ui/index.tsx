import { cssInterop } from 'nativewind';
import Svg from 'react-native-svg';

export * from './button';
export * from './checkbox';
export { default as colors } from './colors';
export * from './error-boundary';
export * from './focus-aware-status-bar';
export * from './form-input';
export * from './form-section';
export * from './history-item';
export * from './image';
export * from './info-card';
export * from './input';
export * from './list';
export * from './loading-overlay';
export * from './modal';
export * from './progress-bar';
export * from './select';
export * from './status-indicator';
export * from './text';
export * from './toggle-card';
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
