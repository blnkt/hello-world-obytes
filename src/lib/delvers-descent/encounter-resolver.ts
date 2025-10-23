import { getItem, setItem } from '@/lib/storage';
import type {
  EncounterOutcome,
  EncounterState,
  EncounterStatistics,
  EncounterType,
  FailureConsequences,
} from '@/types/delvers-descent';

const ENCOUNTER_STATE_KEY = 'delvers_descent_active_encounter';

export class EncounterResolver {
  private currentState: EncounterState | null = null;
  private encounterHistory: EncounterState[] = [];
  private encounterStatistics: EncounterStatistics = {
    totalEncounters: 0,
    successfulEncounters: 0,
    failedEncounters: 0,
    averageRewardValue: 0,
    totalRewardValue: 0,
    averageEncounterDuration: 0,
  };
  private readonly supportedEncounterTypes: EncounterType[] = [
    'puzzle_chamber',
    'trade_opportunity',
    'discovery_site',
  ];
  private readonly encounterTypeMultipliers: Partial<
    Record<EncounterType, number>
  > = {
    puzzle_chamber: 1.0,
    trade_opportunity: 1.2,
    discovery_site: 1.1,
  };

  constructor() {
    // Load persisted state on initialization
    this.loadPersistedState();
  }

  getCurrentState(): EncounterState | null {
    return this.currentState;
  }

  getEncounterType(): EncounterType | null {
    return this.currentState?.type || null;
  }

  getEncounterHandler(): string | null {
    if (!this.currentState) {
      return null;
    }

    const handlerMap: Partial<Record<EncounterType, string>> = {
      puzzle_chamber: 'puzzle_chamber_handler',
      trade_opportunity: 'trade_opportunity_handler',
      discovery_site: 'discovery_site_handler',
    };

    return handlerMap[this.currentState.type] || null;
  }

  isValidEncounterType(type: string): boolean {
    return this.supportedEncounterTypes.includes(type as EncounterType);
  }

  isEncounterActive(): boolean {
    return this.currentState !== null && this.currentState.status === 'active';
  }

  startEncounter(encounterData: {
    type: EncounterType;
    nodeId: string;
    depth: number;
    energyCost: number;
  }): void {
    if (this.isEncounterActive()) {
      throw new Error('Encounter is already active');
    }

    // Validate encounter data
    this.validateEncounterData(encounterData);

    this.currentState = {
      id: this.generateEncounterId(),
      type: encounterData.type,
      nodeId: encounterData.nodeId,
      depth: encounterData.depth,
      energyCost: encounterData.energyCost,
      status: 'active',
      startTime: Date.now(),
    };
  }

  updateEncounterProgress(progressData: Record<string, any>): void {
    if (!this.isEncounterActive()) {
      throw new Error('No active encounter');
    }

    // Validate progress data
    if (!progressData || typeof progressData !== 'object') {
      throw new Error('Invalid progress data');
    }

    if (this.currentState) {
      this.currentState.progress = progressData;
      // Auto-save progress to persistence
      this.saveEncounterState();
    }
  }

  completeEncounter(
    result: 'success' | 'failure',
    outcome: EncounterOutcome
  ): void {
    if (!this.isEncounterActive()) {
      throw new Error('No active encounter');
    }

    // Validate outcome data
    if (!outcome || typeof outcome !== 'object') {
      throw new Error('Invalid outcome data');
    }

    if (this.currentState) {
      this.currentState.status = result === 'success' ? 'completed' : 'failed';
      this.currentState.outcome = outcome;
      this.currentState.endTime = Date.now();

      // Add to history
      this.encounterHistory.push({ ...this.currentState });

      // Clear current state and persisted state
      this.currentState = null;
      this.clearPersistedState();
    }
  }

  getEncounterHistory(): EncounterState[] {
    return [...this.encounterHistory];
  }

  clearEncounterState(): void {
    this.currentState = null;
  }

  getEncounterStartTime(): number | null {
    return this.currentState?.startTime || null;
  }

  getEncounterDuration(): number | null {
    if (!this.currentState) {
      return null;
    }

    const endTime = this.currentState.endTime || Date.now();
    return endTime - this.currentState.startTime;
  }

  loadEncounterState(state: EncounterState | null): void {
    if (!state) {
      this.currentState = null;
      return;
    }

    // Validate the state before loading
    if (this.isValidEncounterState(state)) {
      this.currentState = state;
    } else {
      this.currentState = null;
    }
  }

  saveEncounterState(): void {
    if (this.currentState) {
      setItem(ENCOUNTER_STATE_KEY, this.currentState);
    }
  }

  loadPersistedState(): EncounterState | null {
    try {
      const state = getItem<EncounterState>(ENCOUNTER_STATE_KEY);
      if (state && this.isValidEncounterState(state)) {
        this.currentState = state;
        return state;
      }
    } catch (error) {
      console.error('Error loading persisted encounter state:', error);
    }

    this.currentState = null;
    return null;
  }

  clearPersistedState(): void {
    try {
      setItem(ENCOUNTER_STATE_KEY, null);
    } catch (error) {
      console.error('Error clearing persisted encounter state:', error);
    }
  }

  processEncounterOutcome(outcome: EncounterOutcome): EncounterOutcome {
    if (!this.validateEncounterOutcome(outcome)) {
      throw new Error('Invalid encounter outcome');
    }

    const processedOutcome = { ...outcome };
    const currentDepth = this.currentState?.depth || 1;
    const encounterType = this.currentState?.type || 'puzzle_chamber';

    if (outcome.success) {
      // Process successful outcomes
      processedOutcome.rewards = outcome.rewards.map((reward) => ({
        ...reward,
        value: this.calculateFinalReward(
          reward.value,
          encounterType,
          currentDepth
        ),
      }));

      processedOutcome.totalRewardValue = processedOutcome.rewards.reduce(
        (sum, reward) => sum + reward.value,
        0
      );
    } else {
      // Process failed outcomes
      processedOutcome.consequences = this.calculateFailureConsequences(
        outcome.failureType || 'objective_failed',
        currentDepth
      );
    }

    // Update statistics
    this.updateEncounterStatistics(processedOutcome);

    return processedOutcome;
  }

  calculateRewardScaling(depth: number): number {
    return 1 + depth * 0.2;
  }

  scaleRewardByDepth(baseReward: number, depth: number): number {
    return Math.round(baseReward * this.calculateRewardScaling(depth));
  }

  getEncounterTypeMultiplier(type: EncounterType): number {
    return this.encounterTypeMultipliers[type] || 1.0;
  }

  calculateFinalReward(
    baseReward: number,
    type: EncounterType,
    depth: number
  ): number {
    const depthScaling = this.calculateRewardScaling(depth);
    const typeMultiplier = this.getEncounterTypeMultiplier(type);
    const scaledReward = baseReward * depthScaling * typeMultiplier;

    return Math.round(this.generateRandomRewardVariation(scaledReward, depth));
  }

  calculateFailureConsequences(
    failureType: string,
    depth: number
  ): FailureConsequences {
    const baseEnergyLoss = 5 + depth * 2;
    const baseItemLossRisk = 0.1 + depth * 0.05;

    switch (failureType) {
      case 'energy_exhausted':
        return {
          energyLoss: baseEnergyLoss,
          itemLossRisk: baseItemLossRisk,
          encounterLockout: false,
        };
      case 'objective_failed':
        return {
          energyLoss: baseEnergyLoss * 1.5,
          itemLossRisk: baseItemLossRisk * 1.5,
          encounterLockout: false,
        };
      case 'forced_retreat':
        return {
          energyLoss: baseEnergyLoss * 2,
          itemLossRisk: baseItemLossRisk * 2,
          encounterLockout: false,
          forcedRetreat: true,
        };
      case 'encounter_lockout':
        return {
          energyLoss: baseEnergyLoss * 3,
          itemLossRisk: baseItemLossRisk * 3,
          encounterLockout: true,
        };
      default:
        return {
          energyLoss: baseEnergyLoss,
          itemLossRisk: baseItemLossRisk,
          encounterLockout: false,
        };
    }
  }

  generateRandomRewardVariation(baseReward: number, depth: number): number {
    const minVariation = 0.85; // Always at least 85% of base
    const maxVariation = 1.5 + depth * 0.1; // Up to 150-200% of base

    const randomFactor =
      minVariation + Math.random() * (maxVariation - minVariation);
    return Math.round(baseReward * randomFactor);
  }

  validateEncounterOutcome(outcome: any): outcome is EncounterOutcome {
    return (
      outcome &&
      typeof outcome === 'object' &&
      typeof outcome.success === 'boolean' &&
      Array.isArray(outcome.rewards) &&
      typeof outcome.energyUsed === 'number' &&
      Array.isArray(outcome.itemsGained) &&
      Array.isArray(outcome.itemsLost)
    );
  }

  getEncounterStatistics(): EncounterStatistics {
    return { ...this.encounterStatistics };
  }

  // State transition validation methods
  canStartEncounter(): boolean {
    return !this.isEncounterActive();
  }

  canUpdateProgress(): boolean {
    return this.isEncounterActive();
  }

  canCompleteEncounter(): boolean {
    return this.isEncounterActive();
  }

  private validateEncounterData(data: {
    type: EncounterType;
    nodeId: string;
    depth: number;
    energyCost: number;
  }): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid encounter data');
    }

    if (!this.isValidEncounterType(data.type)) {
      throw new Error('Invalid encounter type');
    }

    if (
      !data.nodeId ||
      typeof data.nodeId !== 'string' ||
      data.nodeId.trim() === ''
    ) {
      throw new Error('Invalid node ID');
    }

    if (typeof data.depth !== 'number' || data.depth < 1) {
      throw new Error('Invalid depth value');
    }

    if (typeof data.energyCost !== 'number' || data.energyCost < 1) {
      throw new Error('Invalid energy cost');
    }
  }

  private updateEncounterStatistics(outcome: EncounterOutcome): void {
    this.encounterStatistics.totalEncounters++;

    if (outcome.success) {
      this.encounterStatistics.successfulEncounters++;
      this.encounterStatistics.totalRewardValue +=
        outcome.totalRewardValue || 0;
    } else {
      this.encounterStatistics.failedEncounters++;
    }

    this.encounterStatistics.averageRewardValue =
      this.encounterStatistics.totalRewardValue /
      Math.max(this.encounterStatistics.successfulEncounters, 1);
  }

  private isValidEncounterState(state: any): state is EncounterState {
    return (
      state &&
      typeof state === 'object' &&
      typeof state.id === 'string' &&
      this.isValidEncounterType(state.type) &&
      typeof state.nodeId === 'string' &&
      typeof state.depth === 'number' &&
      typeof state.energyCost === 'number' &&
      ['active', 'completed', 'failed'].includes(state.status) &&
      typeof state.startTime === 'number'
    );
  }

  private generateEncounterId(): string {
    return `encounter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
