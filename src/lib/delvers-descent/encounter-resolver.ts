import type {
  EncounterOutcome,
  EncounterState,
  EncounterType,
} from '@/types/delvers-descent';

export class EncounterResolver {
  private currentState: EncounterState | null = null;
  private encounterHistory: EncounterState[] = [];

  getCurrentState(): EncounterState | null {
    return this.currentState;
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

      // Clear current state
      this.currentState = null;
    }
  }

  getEncounterHistory(): EncounterState[] {
    return [...this.encounterHistory];
  }

  clearEncounterState(): void {
    this.currentState = null;
  }

  private generateEncounterId(): string {
    return `encounter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
