import React from 'react';

export interface BustConsequence {
  itemsLost: number;
  energyLost: number;
  xpPreserved: boolean;
  xpAmount: number;
  message: string;
}

export interface BustScreenProps {
  /** Consequence details from bust */
  consequence: BustConsequence;
  /** Callback when user acknowledges */
  onAcknowledge: () => void;
}

const BustInfoSection: React.FC<{
  title: string;
  value: number | string;
  isLoss?: boolean;
}> = ({ title, value, isLoss = false }) => (
  <div className="mb-3 flex justify-between rounded bg-gray-50 p-3">
    <span className="text-gray-700">{title}:</span>
    <span
      className={`font-semibold ${isLoss ? 'text-red-600' : 'text-green-600'}`}
    >
      {isLoss ? '-' : '+'}
      {typeof value === 'number' ? value.toLocaleString() : value}
    </span>
  </div>
);

/**
 * BustScreen - Explains consequences and XP preservation after bust
 *
 * Displays what was lost during a bust, while emphasizing that XP is preserved.
 */
const BustHeader: React.FC = () => (
  <div className="mb-6 text-center">
    <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-red-500 text-5xl text-white">
      ⚠
    </div>
    <h2 className="text-3xl font-bold text-gray-800">You Busted!</h2>
    <p className="mt-2 text-gray-600">
      You pushed too deep and could not afford to return.
    </p>
  </div>
);

const BustMainContent: React.FC<{ consequence: BustConsequence }> = ({
  consequence,
}) => (
  <div className="mb-6 rounded-lg bg-white p-6 shadow-lg">
    <h3 className="mb-4 text-xl font-semibold text-gray-800">What Happened</h3>

    <div className="mb-4 space-y-2">
      <div className="rounded bg-red-50 p-4 text-red-800">
        <p className="font-medium">{consequence.message}</p>
      </div>
    </div>

    <div className="mb-4 border-b pb-4">
      <h4 className="mb-2 text-lg font-semibold text-gray-700">Losses</h4>
      <BustInfoSection
        title="Items Lost"
        value={consequence.itemsLost}
        isLoss={true}
      />
      <BustInfoSection
        title="Energy Lost"
        value={consequence.energyLost}
        isLoss={true}
      />
    </div>

    <div className="rounded-lg bg-green-50 p-4">
      <h4 className="mb-2 text-lg font-semibold text-green-700">
        Progress Preserved
      </h4>
      <BustInfoSection
        title="XP Gained (Preserved)"
        value={consequence.xpAmount}
        isLoss={false}
      />
      <p className="mt-2 text-sm text-green-700">
        All XP from your steps is preserved. You still progress towards next
        level!
      </p>
    </div>
  </div>
);

export const BustScreen: React.FC<BustScreenProps> = ({
  consequence,
  onAcknowledge,
}) => (
  <div
    data-testid="bust-screen"
    className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-6"
  >
    <div className="mx-auto max-w-2xl">
      <BustHeader />
      <BustMainContent consequence={consequence} />
      <div className="flex justify-center">
        <button
          data-testid="acknowledge-button"
          onClick={onAcknowledge}
          className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </div>
  </div>
);
