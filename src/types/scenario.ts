export type EncounterType = 'merchant' | 'monster';

export type Scenario = {
  id: string;
  type: EncounterType;
  title: string;
  description: string;
  reward: string;
};

export type ScenarioHistory = {
  id: string;
  scenarioId: string;
  type: EncounterType;
  title: string;
  description: string;
  reward: string;
  visitedAt: string; // ISO string
  milestone: number;
  outcome?: string; // Optional outcome description
};
