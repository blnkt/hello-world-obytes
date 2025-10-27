import React from 'react';

export interface ReturnCostDisplayProps {
  /** Current energy available */
  currentEnergy: number;
  /** Return cost from current depth to surface */
  returnCost: number;
  /** Current depth in the dungeon */
  currentDepth: number;
  /** Optional: Apply visual highlighting based on safety */
  highlightMode?: 'none' | 'prominent' | 'critical';
}

/**
 * ReturnCostDisplay - Clear, prominent display of return energy costs
 *
 * Displays the energy cost to return to the surface from the current depth,
 * with optional visual highlighting based on safety level.
 */
const getSafetyLevel = (
  safetyPercentage: number
): 'safe' | 'caution' | 'danger' | 'critical' => {
  if (safetyPercentage >= 50) return 'safe';
  if (safetyPercentage >= 30) return 'caution';
  if (safetyPercentage >= 10) return 'danger';
  return 'critical';
};

const getContainerClass = (
  highlightMode: 'none' | 'prominent' | 'critical',
  safetyLevel: 'safe' | 'caution' | 'danger' | 'critical'
): string => {
  const baseClasses =
    'rounded-lg p-4 border-2 transition-all duration-300 ease-in-out';

  if (highlightMode === 'critical') {
    return `${baseClasses} bg-red-50 border-red-500 animate-pulse`;
  }

  if (highlightMode === 'prominent') {
    switch (safetyLevel) {
      case 'safe':
        return `${baseClasses} bg-green-50 border-green-500`;
      case 'caution':
        return `${baseClasses} bg-yellow-50 border-yellow-500`;
      case 'danger':
        return `${baseClasses} bg-orange-50 border-orange-500`;
      case 'critical':
        return `${baseClasses} bg-red-50 border-red-500`;
      default:
        return `${baseClasses} bg-gray-50 border-gray-300`;
    }
  }

  return `${baseClasses} bg-white border-gray-300`;
};

const getColorForLevel = (
  level: 'safe' | 'caution' | 'danger' | 'critical',
  prefix: 'text-' | 'text-'
): string => {
  switch (level) {
    case 'safe':
      return `${prefix}green-${prefix === 'text-' ? '600' : '700'}`;
    case 'caution':
      return `${prefix}yellow-${prefix === 'text-' ? '600' : '700'}`;
    case 'danger':
      return `${prefix}orange-${prefix === 'text-' ? '600' : '700'}`;
    case 'critical':
      return `${prefix}red-${prefix === 'text-' ? '600' : '700'} font-bold`;
    default:
      return 'text-gray-600';
  }
};

const EnergyCostSection: React.FC<{
  returnCost: number;
  safetyLevel: 'safe' | 'caution' | 'danger' | 'critical';
}> = ({ returnCost, safetyLevel }) => (
  <div className="flex items-baseline space-x-3">
    <span className="text-sm text-gray-700">Energy Cost:</span>
    <span
      data-testid="return-cost-value"
      className={`text-2xl font-bold ${getColorForLevel(safetyLevel, 'text-')}`}
    >
      {returnCost.toLocaleString()}
    </span>
  </div>
);

const SafetyMarginSection: React.FC<{
  safetyMargin: number;
  canAffordReturn: boolean;
  safetyLevel: 'safe' | 'caution' | 'danger' | 'critical';
}> = ({ safetyMargin, canAffordReturn, safetyLevel }) => (
  <div className="flex items-baseline space-x-3">
    <span className="text-sm text-gray-700">Safety Margin:</span>
    <span
      data-testid="safety-margin-value"
      className={`text-xl font-semibold ${getColorForLevel(safetyLevel, 'text-')}`}
    >
      {canAffordReturn
        ? `+${safetyMargin.toLocaleString()}`
        : `${safetyMargin.toLocaleString()}`}
    </span>
  </div>
);

const CurrentEnergySection: React.FC<{ currentEnergy: number }> = ({
  currentEnergy,
}) => (
  <div className="flex items-baseline space-x-3">
    <span className="text-sm text-gray-700">Current Energy:</span>
    <span className="text-base font-medium text-gray-900">
      {currentEnergy.toLocaleString()}
    </span>
  </div>
);

const SafetyIndicatorBar: React.FC<{
  safetyPercentage: number;
  safetyLevel: 'safe' | 'caution' | 'danger' | 'critical';
}> = ({ safetyPercentage, safetyLevel }) => (
  <div className="mt-3">
    <div className="flex items-center space-x-2">
      <span className="text-xs text-gray-600">Safety Level:</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
        <div
          data-testid="safety-indicator-bar"
          className={`h-full transition-all duration-300 ease-in-out ${
            safetyLevel === 'safe'
              ? 'bg-green-500'
              : safetyLevel === 'caution'
                ? 'bg-yellow-500'
                : safetyLevel === 'danger'
                  ? 'bg-orange-500'
                  : 'bg-red-500'
          }`}
          style={{ width: `${Math.max(0, safetyPercentage)}%` }}
        />
      </div>
    </div>
  </div>
);

const CriticalWarning: React.FC = () => (
  <div
    data-testid="critical-warning"
    className="mt-3 text-sm font-medium text-red-700"
  >
    ⚠️ Point of No Return - Cannot afford to return!
  </div>
);

export const ReturnCostDisplay: React.FC<ReturnCostDisplayProps> = ({
  currentEnergy,
  returnCost,
  currentDepth,
  highlightMode = 'none',
}) => {
  const safetyMargin = currentEnergy - returnCost;
  const safetyPercentage =
    currentEnergy > 0 ? (safetyMargin / currentEnergy) * 100 : 0;

  const safetyLevel = getSafetyLevel(safetyPercentage);
  const canAffordReturn = currentEnergy >= returnCost;

  return (
    <div
      data-testid="return-cost-display"
      className={getContainerClass(highlightMode, safetyLevel)}
    >
      <div className="flex flex-col space-y-2">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Return to Surface
          </h3>
          <div className="text-sm text-gray-600">Depth: {currentDepth}</div>
        </div>

        <EnergyCostSection returnCost={returnCost} safetyLevel={safetyLevel} />
        <SafetyMarginSection
          safetyMargin={safetyMargin}
          canAffordReturn={canAffordReturn}
          safetyLevel={safetyLevel}
        />
        <CurrentEnergySection currentEnergy={currentEnergy} />

        {highlightMode !== 'none' && (
          <SafetyIndicatorBar
            safetyPercentage={safetyPercentage}
            safetyLevel={safetyLevel}
          />
        )}

        {safetyLevel === 'critical' && <CriticalWarning />}
      </div>
    </div>
  );
};
