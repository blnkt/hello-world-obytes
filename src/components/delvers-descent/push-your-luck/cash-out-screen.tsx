import React from 'react';

import type { CashOutSummary } from '@/lib/delvers-descent/cash-out-manager';

export interface CashOutScreenProps {
  /** Summary of rewards to be banked */
  summary: CashOutSummary;
  /** Callback when user confirms cash out */
  onConfirm: () => void;
}

const RewardItemSection: React.FC<{
  title: string;
  items: { name: string; quantity: number; value: number }[];
}> = ({ title, items }) => {
  if (items.length === 0) return null;

  return (
    <div className="mb-4">
      <h4 className="mb-2 text-sm font-semibold text-gray-700">{title}</h4>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex animate-fade-in items-center justify-between rounded bg-gray-50 p-2"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-sm text-gray-800">{item.name}</span>
            <span className="text-sm font-medium text-gray-600">
              Qty: {item.quantity} × {item.value.toLocaleString()} ={' '}
              {(item.quantity * item.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * CashOutScreen - Comprehensive reward summary and cash out confirmation
 *
 * Displays all rewards that will be banked upon cash out, with item categorization and total values.
 */
const CashOutHeader: React.FC = () => (
  <div className="mb-6 text-center">
    <div className="mx-auto mb-4 flex size-20 animate-bounce-in items-center justify-center rounded-full bg-green-500 text-5xl text-white">
      ✓
    </div>
    <h2 className="text-3xl font-bold text-gray-800">Cash Out Successful</h2>
    <p className="mt-2 text-gray-600">Your rewards have been safely banked!</p>
  </div>
);

const CashOutRewardSummary: React.FC<{ summary: CashOutSummary }> = ({
  summary,
}) => (
  <div className="mb-6 animate-fade-in rounded-lg bg-white p-6 shadow-lg">
    <h3 className="mb-4 text-xl font-semibold text-gray-800">Reward Summary</h3>

    <div className="mb-4 border-b pb-4">
      <div className="mb-2 flex justify-between text-lg">
        <span className="text-gray-700">Total Items:</span>
        <span className="font-bold text-gray-900">{summary.totalItems}</span>
      </div>
      <div className="mb-2 flex justify-between text-lg">
        <span className="text-gray-700">Total XP:</span>
        <span className="font-bold text-gray-900">
          {summary.totalXP.toLocaleString()}
        </span>
      </div>
      <div className="flex justify-between text-2xl font-bold text-green-600">
        <span>Total Value:</span>
        <span>{summary.totalValue.toLocaleString()}</span>
      </div>
    </div>

    {summary.itemTypes.trade_goods > 0 && (
      <RewardItemSection
        title={`Trade Goods (${summary.itemTypes.trade_goods})`}
        items={[]}
      />
    )}
    {summary.itemTypes.discoveries > 0 && (
      <RewardItemSection
        title={`Discoveries (${summary.itemTypes.discoveries})`}
        items={[]}
      />
    )}
    {summary.itemTypes.legendaries > 0 && (
      <RewardItemSection
        title={`Legendary Items (${summary.itemTypes.legendaries})`}
        items={[]}
      />
    )}
  </div>
);

export const CashOutScreen: React.FC<CashOutScreenProps> = ({
  summary,
  onConfirm,
}) => {
  return (
    <div
      data-testid="cash-out-screen"
      className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6"
    >
      <div className="mx-auto max-w-2xl">
        <CashOutHeader />
        <CashOutRewardSummary summary={summary} />
        <div className="flex justify-center space-x-4">
          <button
            data-testid="close-button"
            onClick={onConfirm}
            className="rounded-lg bg-green-600 px-8 py-3 text-lg font-semibold text-white hover:bg-green-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
