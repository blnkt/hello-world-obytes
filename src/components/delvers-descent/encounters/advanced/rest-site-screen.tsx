import React, { useState } from 'react';

import {
  type AdvancedEncounterOutcome,
  type RestSiteEncounter,
  type RestSiteState,
} from '@/lib/delvers-descent/rest-site-encounter';

export interface RestSiteScreenProps {
  /** The rest site encounter state */
  encounter: RestSiteEncounter;
  /** Callback when encounter completes */
  onComplete: (outcome: AdvancedEncounterOutcome) => void;
  /** Callback to return to map */
  onReturn: () => void;
}

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

const RestSiteHeader: React.FC = () => (
  <div className="mb-6 text-center">
    <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-green-500 text-5xl text-white">
      🛌
    </div>
    <h1 className="text-3xl font-bold text-gray-800">Rest Site</h1>
    <p className="mt-2 text-gray-600">
      A safe haven where you can recover energy and gain strategic intel.
    </p>
  </div>
);

const RestSiteBenefits: React.FC<{
  energyReserve: RestSiteState['config']['energyReserve'];
  strategicIntel: RestSiteState['config']['strategicIntel'];
}> = ({ energyReserve, strategicIntel }) => (
  <div className="mb-6 rounded-lg bg-green-50 p-6">
    <h3 className="mb-4 text-lg font-semibold text-green-800">
      Available Benefits
    </h3>
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded bg-white p-3">
        <span className="text-gray-700">Energy Reserve:</span>
        <span className="font-bold text-green-600">
          {energyReserve.currentCapacity}/{energyReserve.maxCapacity}
        </span>
      </div>
      <div className="flex items-center justify-between rounded bg-white p-3">
        <span className="text-gray-700">Strategic Intel:</span>
        <span className="font-bold text-blue-600">
          Map: +{strategicIntel.mapReveals} | Shortcuts: +
          {strategicIntel.shortcutHints} | Warnings: +
          {strategicIntel.hazardWarnings}
        </span>
      </div>
    </div>
  </div>
);

const RestSiteActions: React.FC<{
  onRest: () => void;
  onReturn: () => void;
}> = ({ onRest, onReturn }) => (
  <div className="space-y-4">
    <button
      data-testid="rest-button"
      onClick={onRest}
      className="w-full rounded-lg bg-green-600 px-6 py-3 text-lg font-semibold text-white hover:bg-green-700"
    >
      Rest and Recover
    </button>
    <button
      onClick={onReturn}
      className="w-full rounded-lg border-2 border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50"
    >
      Skip Rest
    </button>
  </div>
);

/**
 * RestSiteScreen - Energy reserve and strategic intel display
 *
 * Provides a safe space for energy recovery and strategic planning.
 */
export const RestSiteScreen: React.FC<RestSiteScreenProps> = ({
  encounter,
  onComplete,
  onReturn,
}) => {
  const [state, setState] = useState<RestSiteState>(encounter.getState());
  const [outcome, setOutcome] = useState<AdvancedEncounterOutcome | null>(null);

  const handleRest = () => {
    const result = encounter.resolve();
    setOutcome(result);
    setState(encounter.getState());
  };

  if (outcome) {
    return <OutcomeDisplay outcome={outcome} onComplete={onComplete} />;
  }

  return (
    <div
      data-testid="rest-site-screen"
      className="min-h-screen bg-green-50 p-6"
    >
      <div className="mx-auto max-w-2xl">
        <RestSiteHeader />
        <RestSiteBenefits
          energyReserve={state.config.energyReserve}
          strategicIntel={state.config.strategicIntel}
        />
        <RestSiteActions onRest={handleRest} onReturn={onReturn} />
      </div>
    </div>
  );
};
