import React, { useState } from 'react';

import {
  type AdvancedEncounterOutcome,
  type HazardEncounter,
  type HazardState,
  type SolutionPath,
} from '@/lib/delvers-descent/hazard-encounter';

export interface HazardScreenProps {
  /** The hazard encounter state */
  encounter: HazardEncounter;
  /** Callback when encounter completes */
  onComplete: (outcome: AdvancedEncounterOutcome) => void;
  /** Callback to return to map */
  onReturn: () => void;
}

const getObstacleName = (type: string): string => {
  const names: Record<string, string> = {
    collapsed_passage: 'Collapsed Passage',
    treacherous_bridge: 'Treacherous Bridge',
    ancient_guardian: 'Ancient Guardian',
    energy_drain: 'Energy Drain',
    maze_of_mirrors: 'Maze of Mirrors',
  };
  return names[type] || 'Unknown Hazard';
};

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

const HazardHeader: React.FC<{ obstacleType: string; difficulty: number }> = ({
  obstacleType,
  difficulty,
}) => (
  <div className="mb-6 text-center">
    <h1 className="text-3xl font-bold text-gray-800">
      {getObstacleName(obstacleType)}
    </h1>
    <p className="mt-2 text-gray-600">
      A dangerous obstacle blocks your path. Choose your solution carefully.
    </p>
    <div className="mt-3">
      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
        Difficulty: {difficulty}/10
      </span>
    </div>
  </div>
);

const HazardPaths: React.FC<{
  paths: HazardState['availablePaths'];
  selectedPath?: SolutionPath;
  onSelect: (pathId: string) => void;
}> = ({ paths, selectedPath, onSelect }) => (
  <div className="space-y-4">
    {paths.map((path) => (
      <button
        key={path.id}
        data-testid={`path-${path.id}`}
        onClick={() => onSelect(path.id)}
        disabled={selectedPath?.id === path.id}
        className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
          selectedPath?.id === path.id
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">{path.name}</h3>
            <p className="text-sm text-gray-600">{path.description}</p>
            {path.specialEffect && (
              <p className="mt-1 text-xs text-blue-600">{path.specialEffect}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-red-600">
              Energy: {path.energyCost}
            </div>
            <div className="text-sm text-gray-500">
              Success: {Math.round(path.successRate * 100)}%
            </div>
          </div>
        </div>
      </button>
    ))}
  </div>
);

const HazardActions: React.FC<{
  hasSelectedPath: boolean;
  onResolve: () => void;
  onReturn: () => void;
}> = ({ hasSelectedPath, onResolve, onReturn }) => (
  <>
    {hasSelectedPath && (
      <div className="mt-6">
        <button
          data-testid="resolve-button"
          onClick={onResolve}
          className="w-full rounded-lg bg-green-600 px-6 py-3 text-lg font-semibold text-white hover:bg-green-700"
        >
          Attempt Solution
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

/**
 * HazardScreen - Multiple solution options with energy costs
 *
 * Displays hazard obstacle and allows player to choose from multiple solution paths.
 */
export const HazardScreen: React.FC<HazardScreenProps> = ({
  encounter,
  onComplete,
  onReturn,
}) => {
  const [state, setState] = useState<HazardState>(encounter.getState());
  const [outcome, setOutcome] = useState<AdvancedEncounterOutcome | null>(null);

  const handleSelectPath = (pathId: string) => {
    encounter.selectPath(pathId);
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
    <div data-testid="hazard-screen" className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        <HazardHeader
          obstacleType={state.config.obstacleType}
          difficulty={state.config.difficulty}
        />
        <HazardPaths
          paths={state.availablePaths}
          selectedPath={state.selectedPath}
          onSelect={handleSelectPath}
        />
        <HazardActions
          hasSelectedPath={!!state.selectedPath}
          onResolve={handleResolve}
          onReturn={onReturn}
        />
      </div>
    </div>
  );
};
