import { getItem, setItem } from '@/lib/storage';
import type {
  EncounterOutcome,
  EncounterState,
  EncounterType,
} from '@/types/delvers-descent';

const ENCOUNTER_STATE_KEY = 'delvers_descent_active_encounter';

export class EncounterResolver {
  private currentState: EncounterState | null = null;
  private encounterHistory: EncounterState[] = [];
  private readonly supportedEncounterTypes: EncounterType[] = [
    'puzzle_chamber',
    'trade_opportunity',
    'discovery_site',
  ];

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
