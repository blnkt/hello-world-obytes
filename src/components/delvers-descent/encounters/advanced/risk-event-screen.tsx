import React, { useState } from 'react';

import {
  type AdvancedEncounterOutcome,
  type RiskEventChoice,
  type RiskEventEncounter,
  type RiskEventState,
} from '@/lib/delvers-descent/risk-event-encounter';

export interface RiskEventScreenProps {
  /** The risk event encounter state */
  encounter: RiskEventEncounter;
  /** Callback when encounter completes */
  onComplete: (outcome: AdvancedEncounterOutcome) => void;
  /** Callback to return to map */
  onReturn: () => void;
}

const RiskLevelBadge: React.FC<{ level: string }> = ({ level }) => {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    extreme: 'bg-red-100 text-red-800',
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {level.toUpperCase()} RISK
    </span>
  );
};

/**
 * RiskEventScreen - Gambling mechanics with legendary rewards
 *
 * Displays risk event choices and allows player to make gambling decisions.
 */
const OutcomeDisplay: React.FC<{
  outcome: AdvancedEncounterOutcome;
  onComplete: (outcome: AdvancedEncounterOutcome) => void;
}> = ({ outcome, onComplete }) => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">
          {outcome.type === 'success' ? 'Success!' : 'Failure!'}
        </h2>
        <p className="mb-6 text-gray-700">{outcome.message}</p>
        {outcome.reward && (
          <div className="mb-6 rounded bg-green-50 p-4">
            <h3 className="mb-2 font-semibold text-green-800">Rewards</h3>
            <p className="text-green-700">Energy: +{outcome.reward.energy}</p>
            <p className="text-green-700">XP: +{outcome.reward.xp}</p>
          </div>
        )}
        <button
          onClick={() => onComplete(outcome)}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </div>
  </div>
);

const RiskEventHeader: React.FC<{ riskLevel: string }> = ({ riskLevel }) => (
  <div className="mb-6 text-center">
    <RiskLevelBadge level={riskLevel} />
    <h1 className="mt-4 text-3xl font-bold text-gray-800">Risk Event</h1>
    <p className="mt-2 text-gray-600">
      High stakes, high rewards. Choose your risk level.
    </p>
  </div>
);

const RiskEventChoices: React.FC<{
  choices: RiskEventState['availableChoices'];
  selectedChoice?: RiskEventChoice;
  onSelect: (choiceId: string) => void;
}> = ({ choices, selectedChoice, onSelect }) => (
  <div className="space-y-4">
    {choices.map((choice) => (
      <button
        key={choice.id}
        data-testid={`choice-${choice.id}`}
        onClick={() => onSelect(choice.id)}
        disabled={selectedChoice?.id === choice.id}
        className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
          selectedChoice?.id === choice.id
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Choice {choice.id}</h3>
            <p className="text-sm text-gray-600">{choice.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              Success Modifier: {(choice.successRateModifier * 100).toFixed(0)}%
            </div>
            <div className="text-sm font-semibold text-blue-600">
              Multiplier: {choice.rewardModifier}x
            </div>
          </div>
        </div>
      </button>
    ))}
  </div>
);

const RiskEventActions: React.FC<{
  hasSelectedChoice: boolean;
  onResolve: () => void;
  onReturn: () => void;
}> = ({ hasSelectedChoice, onResolve, onReturn }) => (
  <>
    {hasSelectedChoice && (
      <div className="mt-6">
        <button
          data-testid="resolve-button"
          onClick={onResolve}
          className="w-full rounded-lg bg-green-600 px-6 py-3 text-lg font-semibold text-white hover:bg-green-700"
        >
          Take the Risk!
        </button>
      </div>
    )}
    <div className="mt-6 text-center">
      <button
        onClick={onReturn}
        className="rounded-lg border-2 border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50"
      >
        Return to Map
      </button>
    </div>
  </>
);

export const RiskEventScreen: React.FC<RiskEventScreenProps> = ({
  encounter,
  onComplete,
  onReturn,
}) => {
  const [state, setState] = useState<RiskEventState>(encounter.getState());
  const [outcome, setOutcome] = useState<AdvancedEncounterOutcome | null>(null);

  const handleSelectChoice = (choiceId: string) => {
    encounter.selectChoice(choiceId);
    setState(encounter.getState());
  };

  const handleResolve = () => {
    const result = encounter.resolve();
    setOutcome(result);
    setState(encounter.getState());
  };

  if (outcome) {
    return <OutcomeDisplay outcome={outcome} onComplete={onComplete} />;
  }

  return (
    <div
      data-testid="risk-event-screen"
      className="min-h-screen bg-gray-50 p-6"
    >
      <div className="mx-auto max-w-2xl">
        <RiskEventHeader riskLevel={state.config.riskLevel} />
        <RiskEventChoices
          choices={state.availableChoices}
          selectedChoice={state.selectedChoice}
          onSelect={handleSelectChoice}
        />
        <RiskEventActions
          hasSelectedChoice={!!state.selectedChoice}
          onResolve={handleResolve}
          onReturn={onReturn}
        />
      </div>
    </div>
  );
};
