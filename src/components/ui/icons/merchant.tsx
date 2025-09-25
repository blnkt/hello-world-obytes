import * as React from 'react';
import { StyleSheet } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, Path } from 'react-native-svg';

import colors from '../colors';

export const MerchantIcon = ({
  color = colors.primary[500],
  style,
  ...props
}: SvgProps) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
    style={StyleSheet.flatten([style])}
  >
    <Path
      d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
      fill={color}
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
    <Path
      d="M8 16C8 16 10 18 12 18C14 18 16 16 16 16"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
  </Svg>
);
