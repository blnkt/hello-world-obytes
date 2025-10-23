export interface DelvingRun {
  id: string;
  date: string;
  steps: number;
  baseEnergy: number;
  bonusEnergy: number;
  totalEnergy: number;
  hasStreakBonus: boolean;
  status: 'queued' | 'active' | 'completed' | 'busted';
}

export interface DungeonNode {
  id: string;
  depth: number;
  position: number; // 0-2 for left/center/right
  type: EncounterType;
  energyCost: number;
  returnCost: number; // Cumulative cost to return to surface
  isRevealed: boolean;
  connections: string[]; // IDs of deeper nodes
  encounter?: EncounterData;
}

export interface RunState {
  runId: string;
  currentDepth: number;
  currentNode: string;
  energyRemaining: number;
  inventory: CollectedItem[];
  visitedNodes: string[];
  discoveredShortcuts: Shortcut[];
}

export interface CollectedItem {
  id: string;
  type: 'trade_good' | 'discovery' | 'legendary';
  setId: string;
  value: number;
  name: string;
  description: string;
}

export interface Shortcut {
  id: string;
  fromDepth: number;
  toDepth: number;
  energyReduction: number;
  isPermanent: boolean;
}

export interface EncounterData {
  id: string;
  type: EncounterType;
  title: string;
  description: string;
  energyCost: number;
  rewards?: CollectedItem[];
  risks?: RiskData[];
}

export interface RiskData {
  id: string;
  description: string;
  probability: number; // 0-1
  consequence: 'lose_energy' | 'lose_item' | 'force_retreat' | 'bust';
  value: number;
}

export type EncounterType =
  | 'puzzle_chamber'
  | 'trade_opportunity'
  | 'discovery_site'
  | 'risk_event'
  | 'hazard'
  | 'rest_site';

export interface CollectionSet {
  id: string;
  name: string;
  items: CollectedItem[];
  completionBonus: string;
  bonusType:
    | 'energy_efficiency'
    | 'starting_bonus'
    | 'unlock_region'
    | 'permanent_ability';
  bonusValue: number;
}

export interface Region {
  id: string;
  name: string;
  description: string;
  isUnlocked: boolean;
  encounterTable: EncounterType[];
  startingBonuses: string[];
}

export interface DelvingStats {
  totalRuns: number;
  queuedRuns: number;
  completedRuns: number;
  bustedRuns: number;
  activeRuns: number;
  totalSteps: number;
  averageSteps: number;
}

// Encounter System Types
export interface EncounterState {
  id: string;
  type: EncounterType;
  nodeId: string;
  depth: number;
  energyCost: number;
  status: 'active' | 'completed' | 'failed';
  progress?: Record<string, any>;
  outcome?: EncounterOutcome;
  startTime: number;
  endTime?: number;
}

export interface EncounterOutcome {
  success: boolean;
  rewards: CollectedItem[];
  energyUsed: number;
  itemsGained: CollectedItem[];
  itemsLost: CollectedItem[];
  failureType?:
    | 'energy_exhausted'
    | 'objective_failed'
    | 'forced_retreat'
    | 'encounter_lockout';
  additionalEffects?: Record<string, any>;
  // Extended fields for outcome processing
  totalRewardValue?: number;
  consequences?: FailureConsequences;
}

export interface FailureConsequences {
  energyLoss: number;
  itemLossRisk: number; // 0-1 probability
  encounterLockout: boolean;
  forcedRetreat?: boolean;
}

export interface EncounterStatistics {
  totalEncounters: number;
  successfulEncounters: number;
  failedEncounters: number;
  averageRewardValue: number;
  totalRewardValue: number;
  averageEncounterDuration: number;
}

export interface EncounterProgress {
  [key: string]: any;
}

// Type guards for runtime validation
export const isDelvingRun = (obj: any): obj is DelvingRun => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.date === 'string' &&
    typeof obj.steps === 'number' &&
    typeof obj.baseEnergy === 'number' &&
    typeof obj.bonusEnergy === 'number' &&
    typeof obj.totalEnergy === 'number' &&
    typeof obj.hasStreakBonus === 'boolean' &&
    ['queued', 'active', 'completed', 'busted'].includes(obj.status)
  );
};

export const isDungeonNode = (obj: any): obj is DungeonNode => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.depth === 'number' &&
    typeof obj.position === 'number' &&
    typeof obj.type === 'string' &&
    typeof obj.energyCost === 'number' &&
    typeof obj.returnCost === 'number' &&
    typeof obj.isRevealed === 'boolean' &&
    Array.isArray(obj.connections)
  );
};

export const isRunState = (obj: any): obj is RunState => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.runId === 'string' &&
    typeof obj.currentDepth === 'number' &&
    typeof obj.currentNode === 'string' &&
    typeof obj.energyRemaining === 'number' &&
    Array.isArray(obj.inventory) &&
    Array.isArray(obj.visitedNodes) &&
    Array.isArray(obj.discoveredShortcuts)
  );
};

export const isCollectedItem = (obj: any): obj is CollectedItem => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    ['trade_good', 'discovery', 'legendary'].includes(obj.type) &&
    typeof obj.setId === 'string' &&
    typeof obj.value === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.description === 'string'
  );
};

export const isValidEncounterType = (type: string): type is EncounterType => {
  return [
    'puzzle_chamber',
    'trade_opportunity',
    'discovery_site',
    'risk_event',
    'hazard',
    'rest_site',
  ].includes(type);
};

// Constants for encounter types
export const ENCOUNTER_TYPES: EncounterType[] = [
  'puzzle_chamber',
  'trade_opportunity',
  'discovery_site',
  'risk_event',
  'hazard',
  'rest_site',
];

// Constants for collection set types
export const COLLECTION_SET_TYPES = [
  'trade_good',
  'discovery',
  'legendary',
] as const;

export type CollectionSetType = (typeof COLLECTION_SET_TYPES)[number];

// Constants for bonus types
export const BONUS_TYPES = [
  'energy_efficiency',
  'starting_bonus',
  'unlock_region',
  'permanent_ability',
] as const;

export type BonusType = (typeof BONUS_TYPES)[number];
