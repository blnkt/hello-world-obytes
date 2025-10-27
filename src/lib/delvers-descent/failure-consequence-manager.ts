export interface FailureConsequences {
  energyLoss: number;
  itemLossRisk: number;
  forcedRetreat: boolean;
  encounterLockout: boolean;
  description: string;
}

export interface FailureStatistics {
  totalFailures: number;
  totalSuccesses: number;
  failureRate: number;
  currentSeverityMultiplier: number;
}

export type FailureType =
  | 'energy_exhausted'
  | 'objective_failed'
  | 'forced_retreat'
  | 'encounter_lockout';

export class FailureConsequenceManager {
  private failureSeverityMultiplier: number;
  private failureCounts: Map<string, number> = new Map();
  private lockedOutEncounters: Set<string> = new Set();
  private totalFailures: number = 0;
  private totalSuccesses: number = 0;

  constructor(initialSeverityMultiplier: number = 1.0) {
    this.failureSeverityMultiplier = initialSeverityMultiplier;
  }

  getFailureSeverityMultiplier(): number {
    return this.failureSeverityMultiplier;
  }

  getFailureTypes(): FailureType[] {
    return [
      'energy_exhausted',
      'objective_failed',
      'forced_retreat',
      'encounter_lockout',
    ];
  }

  calculateEnergyLoss(failureType: FailureType, depth: number): number {
    const baseEnergyLoss = this.getBaseEnergyLoss(failureType);
    const depthMultiplier = 1 + depth * 0.1;
    const severityMultiplier = this.failureSeverityMultiplier;

    return Math.round(baseEnergyLoss * depthMultiplier * severityMultiplier);
  }

  calculateItemLossRisk(failureType: FailureType, depth: number): number {
    const baseRisk = this.getBaseItemLossRisk(failureType);
    const depthMultiplier = 1 + depth * 0.05;
    const severityMultiplier = this.failureSeverityMultiplier;

    return Math.min(1.0, baseRisk * depthMultiplier * severityMultiplier);
  }

  shouldForceRetreat(failureType: FailureType): boolean {
    return (
      failureType === 'forced_retreat' || failureType === 'encounter_lockout'
    );
  }

  shouldLockoutEncounter(failureType: FailureType): boolean {
    return failureType === 'encounter_lockout';
  }

  lockoutEncounter(encounterId: string): void {
    this.lockedOutEncounters.add(encounterId);
  }

  isEncounterLockedOut(encounterId: string): boolean {
    return this.lockedOutEncounters.has(encounterId);
  }

  getLockedOutEncounters(): string[] {
    return Array.from(this.lockedOutEncounters);
  }

  recordFailure(encounterId: string): void {
    const currentCount = this.failureCounts.get(encounterId) || 0;
    this.failureCounts.set(encounterId, currentCount + 1);
    this.totalFailures++;

    // Increase severity multiplier based on consecutive failures
    this.failureSeverityMultiplier = Math.min(
      3.0,
      1.0 + (currentCount + 1) * 0.2
    );
  }

  recordSuccess(encounterId: string): void {
    this.failureCounts.set(encounterId, 0);
    this.totalSuccesses++;

    // Decrease severity multiplier after success
    this.failureSeverityMultiplier = Math.max(
      1.0,
      this.failureSeverityMultiplier - 0.1
    );
  }

  processFailureConsequences(
    failureType: FailureType,
    depth: number,
    encounterId: string
  ): FailureConsequences {
    const energyLoss = this.calculateEnergyLoss(failureType, depth);
    const itemLossRisk = this.calculateItemLossRisk(failureType, depth);
    const forcedRetreat = this.shouldForceRetreat(failureType);
    const encounterLockout = this.shouldLockoutEncounter(failureType);

    if (encounterLockout) {
      this.lockoutEncounter(encounterId);
    }

    this.recordFailure(encounterId);

    return {
      energyLoss,
      itemLossRisk,
      forcedRetreat,
      encounterLockout,
      description: this.getFailureDescription(failureType, depth),
    };
  }

  getFailureStatistics(): FailureStatistics {
    const totalAttempts = this.totalFailures + this.totalSuccesses;
    const failureRate =
      totalAttempts > 0 ? this.totalFailures / totalAttempts : 0;

    return {
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
      failureRate,
      currentSeverityMultiplier: this.failureSeverityMultiplier,
    };
  }

  private getBaseEnergyLoss(failureType: FailureType): number {
    switch (failureType) {
      case 'energy_exhausted':
        return 5;
      case 'objective_failed':
        return 10;
      case 'forced_retreat':
        return 15;
      case 'encounter_lockout':
        return 20;
      default:
        return 10;
    }
  }

  private getBaseItemLossRisk(failureType: FailureType): number {
    switch (failureType) {
      case 'energy_exhausted':
        return 0.1;
      case 'objective_failed':
        return 0.2;
      case 'forced_retreat':
        return 0.3;
      case 'encounter_lockout':
        return 0.4;
      default:
        return 0.2;
    }
  }

  private getFailureDescription(
    failureType: FailureType,
    depth: number
  ): string {
    const descriptions = {
      energy_exhausted: `Ran out of energy at depth ${depth}. Must retreat carefully.`,
      objective_failed: `Failed to complete objective at depth ${depth}. Lost valuable time and resources.`,
      forced_retreat: `Forced to retreat from depth ${depth}. Encountered dangerous obstacles.`,
      encounter_lockout: `Encounter at depth ${depth} became inaccessible. Must find alternative route.`,
    };

    return descriptions[failureType] || `Unknown failure at depth ${depth}`;
  }
}
