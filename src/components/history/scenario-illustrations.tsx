import React from 'react';
import { Path, Rect, Svg } from 'react-native-svg';

// Placeholder illustration components - replace these with actual SVG illustrations
export const MerchantIllustration: React.FC<{
  width: number;
  height: number;
}> = ({ width, height }) => (
  <Svg width={width} height={height} viewBox="0 0 100 100">
    {/* Background */}
    <Rect x="5" y="5" width="90" height="90" fill="#10B981" rx="8" />

    {/* Store building */}
    <Rect x="20" y="25" width="60" height="40" fill="white" rx="4" />
    <Rect x="25" y="35" width="8" height="20" fill="#10B981" />
    <Rect x="37" y="35" width="8" height="20" fill="#10B981" />
    <Rect x="49" y="35" width="8" height="20" fill="#10B981" />
    <Rect x="61" y="35" width="8" height="20" fill="#10B981" />

    {/* Roof */}
    <Path
      d="M 15 25 L 50 15 L 85 25"
      stroke="white"
      strokeWidth="3"
      fill="none"
    />
  </Svg>
);

export const MonsterIllustration: React.FC<{
  width: number;
  height: number;
}> = ({ width, height }) => (
  <Svg width={width} height={height} viewBox="0 0 100 100">
    {/* Background */}
    <Rect x="5" y="5" width="90" height="90" fill="#EF4444" rx="8" />

    {/* Monster body */}
    <Rect x="25" y="30" width="50" height="40" fill="#DC2626" rx="8" />

    {/* Eyes */}
    <Rect x="32" y="40" width="6" height="6" fill="white" rx="3" />
    <Rect x="48" y="40" width="6" height="6" fill="white" rx="3" />
    <Rect x="34" y="42" width="2" height="2" fill="#DC2626" rx="1" />
    <Rect x="50" y="42" width="2" height="2" fill="#DC2626" rx="1" />

    {/* Mouth */}
    <Path
      d="M 35 55 Q 40 60 45 55"
      stroke="white"
      strokeWidth="2"
      fill="none"
    />

    {/* Horns */}
    <Path
      d="M 30 25 L 35 20 L 40 25"
      stroke="#DC2626"
      strokeWidth="3"
      fill="none"
    />
    <Path
      d="M 50 25 L 55 20 L 60 25"
      stroke="#DC2626"
      strokeWidth="3"
      fill="none"
    />

    {/* Teeth */}
    <Rect x="38" y="52" width="2" height="3" fill="white" />
    <Rect x="42" y="52" width="2" height="3" fill="white" />
  </Svg>
);

// Alternative: Icon-based illustrations (uncomment to use)
// export const MerchantIllustration: React.FC<{ width: number; height: number }> = ({ width, height }) => (
//   <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
//     <Rect x="0" y="0" width="24" height="24" fill="#10B981" rx="4" />
//     {/* Feather Icons: shopping-bag */}
//     <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="white" strokeWidth="2" fill="none"/>
//     <Path d="M3 6h18" stroke="white" strokeWidth="2"/>
//     <Path d="M16 10a4 4 0 0 1-8 0" stroke="white" strokeWidth="2" fill="none"/>
//   </Svg>
// );
//
// export const MonsterIllustration: React.FC<{ width: number; height: number }> = ({ width, height }) => (
//   <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
//     <Rect x="0" y="0" width="24" height="24" fill="#EF4444" rx="4" />
//     {/* Tabler Icons: dragon */}
//     <Path d="M12 3c5 2 8 6.5 8 12s-6 8-8 8-8-5.5-8-12 3-10 8-12z" stroke="white" strokeWidth="2" fill="none"/>
//     <Path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2"/>
//   </Svg>
// );
