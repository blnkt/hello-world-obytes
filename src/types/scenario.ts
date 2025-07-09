export type EncounterType = 'merchant' | 'monster';

export type Scenario = {
  id: string;
  type: EncounterType;
  title: string;
  description: string;
  reward: string;
};
