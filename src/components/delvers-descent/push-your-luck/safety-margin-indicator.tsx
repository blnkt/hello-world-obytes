import React from 'react';

export interface SafetyMarginIndicatorProps {
  /** Current energy available */
  currentEnergy: number;
  /** Return cost from current depth to surface */
  returnCost: number;
  /** Optional: Size variant */
  size?: 'small' | 'medium' | 'large';
}

interface SafetyZone {
  level: 'safe' | 'caution' | 'danger' | 'critical';
  percentage: number;
  color: string;
  label: string;
}

const getSafetyZone = (
  currentEnergy: number,
  returnCost: number
): SafetyZone => {
  const safetyMargin = currentEnergy - returnCost;
  const safetyPercentage =
    currentEnergy > 0 ? (safetyMargin / currentEnergy) * 100 : 0;

  if (safetyPercentage >= 50) {
    return {
      level: 'safe',
      percentage: safetyPercentage,
      color: 'green',
      label: 'Safe Zone',
    };
  }
  if (safetyPercentage >= 30) {
    return {
      level: 'caution',
      percentage: safetyPercentage,
      color: 'yellow',
      label: 'Caution Zone',
    };
  }
  if (safetyPercentage >= 10) {
    return {
      level: 'danger',
      percentage: safetyPercentage,
      color: 'orange',
      label: 'Danger Zone',
    };
  }
  return {
    level: 'critical',
    percentage: safetyPercentage,
    color: 'red',
    label: 'Critical Zone',
  };
};

const getSizeClasses = (size: 'small' | 'medium' | 'large'): string => {
  switch (size) {
    case 'small':
      return 'h-2';
    case 'large':
      return 'h-4';
    default:
      return 'h-3';
  }
};

const getLabelSizeClasses = (size: 'small' | 'medium' | 'large'): string => {
  switch (size) {
    case 'small':
      return 'text-xs';
    case 'large':
      return 'text-base';
    default:
      return 'text-sm';
  }
};

const SafetyIndicatorBar: React.FC<{
  safetyZone: SafetyZone;
  size: 'small' | 'medium' | 'large';
}> = ({ safetyZone, size }) => (
  <div className="flex items-center space-x-2">
    <span className={`text-gray-600 ${getLabelSizeClasses(size)}`}>
      Safety: {safetyZone.label}
    </span>
    <div
      className={`flex-1 overflow-hidden rounded-full bg-gray-200 ${getSizeClasses(size)}`}
    >
      <div
        data-testid="safety-indicator-bar"
        className={`bg- h-full transition-all duration-300${safetyZone.color}-500`}
        style={{ width: `${Math.max(0, safetyZone.percentage)}%` }}
      />
    </div>
  </div>
);

const SafetyInfoDisplay: React.FC<{
  safetyZone: SafetyZone;
  canAffordReturn: boolean;
  safetyMargin: number;
}> = ({ safetyZone, canAffordReturn, safetyMargin }) => (
  <div className="flex items-center space-x-3">
    <span
      className={`font-semibold ${getLabelSizeClasses('medium')} text-${safetyZone.color}-700`}
    >
      {canAffordReturn
        ? `+${safetyMargin.toLocaleString()}`
        : `${safetyMargin.toLocaleString()}`}
    </span>
  </div>
);

/**
 * SafetyMarginIndicator - Visual safety zone indicators (green/yellow/red)
 *
 * Displays a visual representation of the safety margin with color-coded zones.
 */
export const SafetyMarginIndicator: React.FC<SafetyMarginIndicatorProps> = ({
  currentEnergy,
  returnCost,
  size = 'medium',
}) => {
  const safetyZone = getSafetyZone(currentEnergy, returnCost);
  const safetyMargin = currentEnergy - returnCost;
  const canAffordReturn = currentEnergy >= returnCost;

  return (
    <div data-testid="safety-margin-indicator" className="space-y-2">
      <SafetyIndicatorBar safetyZone={safetyZone} size={size} />
      <SafetyInfoDisplay
        safetyZone={safetyZone}
        canAffordReturn={canAffordReturn}
        safetyMargin={safetyMargin}
      />
    </div>
  );
};
