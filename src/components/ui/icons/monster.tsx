import * as React from 'react';
import { StyleSheet } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, Path } from 'react-native-svg';

import colors from '@/components/ui/colors';

export const MonsterIcon = ({
  color = colors.danger[600],
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
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
      fill={color}
    />
    <Circle cx="8" cy="10" r="1.5" fill={colors.white} />
    <Circle cx="16" cy="10" r="1.5" fill={colors.white} />
    <Path
      d="M8 16C8 16 10 18 12 18C14 18 16 16 16 16"
      stroke={colors.white}
      strokeWidth="2"
      fill="none"
    />
    <Path
      d="M7 7L9 9M15 7L17 9"
      stroke={colors.white}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);
