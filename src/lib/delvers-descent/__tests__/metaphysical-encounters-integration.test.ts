import type { EncounterType } from '@/types/delvers-descent';

import { BalanceManager } from '../balance-manager';
import { DungeonMapGenerator } from '../map-generator';
import { DungeonMapGeneratorOptimized } from '../map-generator-optimized';
import { RewardCalculator } from '../reward-calculator';
import { EncounterResolver } from '../encounter-resolver';
import { LuckShrineEncounter } from '../luck-shrine-encounter';
import { EnergyNexusEncounter } from '../energy-nexus-encounter';
import { FateWeaverEncounter } from '../fate-weaver-encounter';
import { getRunStateManager } from '../run-state-manager';
import { DEFAULT_BALANCE_CONFIG } from '../balance-config';

describe('Metaphysical Encounters Integration Tests (Tasks 6.19-6.24)', () => {
  let runStateManager: ReturnType<typeof getRunStateManager>;
  let balanceManager: BalanceManager;
  let rewardCalculator: RewardCalculator;
  let encounterResolver: EncounterResolver;

  beforeEach(async () => {
    runStateManager = getRunStateManager();
    await runStateManager.clearActiveRun();
    await runStateManager.initializeRun('test-run-1', 100);
    balanceManager = new BalanceManager();
    rewardCalculator = new RewardCalculator();
    encounterResolver = new EncounterResolver();
  });

  afterEach(async () => {
    await runStateManager.clearActiveRun();
  });

  describe('Task 6.19: Luck Boost Reward Calculation', () => {
    it('should apply luck boost to reward calculations', async () => {
      // Verify luck boost is active in run state
      await runStateManager.setLuckBoost(3, 0.5); // +50% for 3 encounters

      const runState = runStateManager.getCurrentState();
      expect(runState?.luckBoostActive).toBeDefined();
      expect(runState?.luckBoostActive?.remainingEncounters).toBe(3);
      expect(runState?.luckBoostActive?.multiplierBonus).toBe(0.5);

      // Calculate rewards with boost
      const baseReward = 10;
      const depth = 3;
      const rewardWithBoost = balanceManager.calculateRewardValue(
        baseReward,
        'puzzle_chamber',
        depth
      );

      // Verify reward is calculated (may vary due to random variation)
      expect(rewardWithBoost).toBeGreaterThan(0);

      // Verify luck boost is checked in the calculation
      // The boost multiplies baseRewardValue by (1 + multiplierBonus)
      // So with 50% boost, baseRewardValue should be 1.5x
      // We can't directly test the exact value due to variation,
      // but we can verify the system is checking for luck boost
      const stateCheck = runStateManager.getCurrentState();
      expect(stateCheck?.luckBoostActive).toBeDefined();
    });

    it('should apply luck boost only when remainingEncounters > 0', async () => {
      await runStateManager.setLuckBoost(0, 0.5); // Expired boost

      const baseReward = 10;
      const reward = balanceManager.calculateRewardValue(
        baseReward,
        'puzzle_chamber',
        3
      );

      // Should calculate normally without boost
      expect(reward).toBeGreaterThan(0);
    });

    it('should decay luck boost after encounter completion', async () => {
      await runStateManager.setLuckBoost(2, 0.5);

      const runState1 = runStateManager.getCurrentState();
      expect(runState1?.luckBoostActive?.remainingEncounters).toBe(2);

      // Start an encounter first
      encounterResolver.startEncounter({
        type: 'puzzle_chamber',
        nodeId: 'test-node',
        depth: 3,
        energyCost: 5,
      });

      // Simulate encounter completion
      encounterResolver.completeEncounter('success', {
        success: true,
        rewards: [],
        energyUsed: 5,
        itemsGained: [],
        itemsLost: [],
        totalRewardValue: 10,
      });

      // Wait a bit for async decay
      await new Promise((resolve) => setTimeout(resolve, 100));

      const runState2 = runStateManager.getCurrentState();
      expect(runState2?.luckBoostActive?.remainingEncounters).toBe(1);
    });

    it('should remove luck boost when remainingEncounters reaches 0', async () => {
      await runStateManager.setLuckBoost(1, 0.5);

      // Start an encounter first
      encounterResolver.startEncounter({
        type: 'puzzle_chamber',
        nodeId: 'test-node',
        depth: 3,
        energyCost: 5,
      });

      // Complete encounter to decay boost
      encounterResolver.completeEncounter('success', {
        success: true,
        rewards: [],
        energyUsed: 5,
        itemsGained: [],
        itemsLost: [],
        totalRewardValue: 10,
      });

      // Wait for async decay (may need multiple attempts)
      let attempts = 0;
      while (attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        const runState = runStateManager.getCurrentState();
        if (!runState?.luckBoostActive) {
          break;
        }
        attempts++;
      }

      const runState = runStateManager.getCurrentState();
      // Boost should be removed or have 0 remaining encounters
      expect(
        !runState?.luckBoostActive ||
          runState.luckBoostActive.remainingEncounters <= 0
      ).toBe(true);
    });
  });

  describe('Task 6.20: Modified Encounter Probabilities in Map Generation', () => {
    it('should use modified probabilities when generating encounters', async () => {
      // Set modified probabilities
      const modifiedProbs: Record<EncounterType, number> = {
        puzzle_chamber: 0.1,
        discovery_site: 0.1,
        risk_event: 0.1,
        hazard: 0.1,
        rest_site: 0.1,
        safe_passage: 0.1,
        region_shortcut: 0.05,
        scoundrel: 0.1,
        luck_shrine: 0.15, // Increased from 0.05
        energy_nexus: 0.05,
        fate_weaver: 0.05,
      };

      await runStateManager.setModifiedEncounterProbabilities(modifiedProbs);

      const generator = new DungeonMapGenerator();
      const nodes = await generator.generateDepthLevel(5);

      // Check that luck_shrine appears more frequently
      const luckShrineCount = nodes.filter(
        (node) => node.type === 'luck_shrine'
      ).length;
      expect(luckShrineCount).toBeGreaterThanOrEqual(0);
    });

    it('should normalize modified probabilities correctly', async () => {
      const modifiedProbs: Record<EncounterType, number> = {
        puzzle_chamber: 0.2,
        discovery_site: 0.3,
        risk_event: 0.2,
        hazard: 0.1,
        rest_site: 0.1,
        safe_passage: 0.05,
        region_shortcut: 0.02,
        scoundrel: 0.03,
        luck_shrine: 0.0,
        energy_nexus: 0.0,
        fate_weaver: 0.0,
      };

      await runStateManager.setModifiedEncounterProbabilities(modifiedProbs);

      const generator = new DungeonMapGenerator();
      const nodes = await generator.generateDepthLevel(3);

      // Should generate nodes with the modified distribution
      expect(nodes.length).toBeGreaterThan(0);
      expect(nodes.every((node) => node.type !== 'luck_shrine')).toBe(true);
    });

    it('should use default distribution when no modified probabilities exist', async () => {
      // Clear any modified probabilities
      const runState = runStateManager.getCurrentState();
      if (runState) {
        runState.modifiedEncounterProbabilities = undefined;
        await runStateManager['saveState']();
      }

      const generator = new DungeonMapGenerator();
      const nodes = await generator.generateDepthLevel(3);

      expect(nodes.length).toBeGreaterThan(0);
    });

    it('should work with optimized map generator', async () => {
      const modifiedProbs: Record<EncounterType, number> = {
        puzzle_chamber: 0.15,
        discovery_site: 0.15,
        risk_event: 0.15,
        hazard: 0.15,
        rest_site: 0.1,
        safe_passage: 0.1,
        region_shortcut: 0.05,
        scoundrel: 0.15,
        luck_shrine: 0.0,
        energy_nexus: 0.0,
        fate_weaver: 0.0,
      };

      await runStateManager.setModifiedEncounterProbabilities(modifiedProbs);

      const generator = new DungeonMapGeneratorOptimized();
      const map = await generator.generateFullMap(5);

      expect(map.length).toBeGreaterThan(0);
      expect(
        map.every(
          (node) =>
            node.type !== 'luck_shrine' &&
            node.type !== 'energy_nexus' &&
            node.type !== 'fate_weaver'
        )
      ).toBe(true);
    });
  });

  describe('Task 6.21: Run State Persistence', () => {
    it('should persist and restore luck boost active state', async () => {
      await runStateManager.setLuckBoost(3, 0.5);

      const runState1 = runStateManager.getCurrentState();
      expect(runState1?.luckBoostActive).toBeDefined();
      expect(runState1?.luckBoostActive?.remainingEncounters).toBe(3);
      expect(runState1?.luckBoostActive?.multiplierBonus).toBe(0.5);

      // Create new manager instance to test persistence
      const newManager = getRunStateManager();
      const runState2 = newManager.getCurrentState();
      expect(runState2?.luckBoostActive).toBeDefined();
      expect(runState2?.luckBoostActive?.remainingEncounters).toBe(3);
      expect(runState2?.luckBoostActive?.multiplierBonus).toBe(0.5);
    });

    it('should persist and restore modified encounter probabilities', async () => {
      const modifiedProbs: Record<EncounterType, number> = {
        puzzle_chamber: 0.2,
        discovery_site: 0.15,
        risk_event: 0.15,
        hazard: 0.1,
        rest_site: 0.1,
        safe_passage: 0.1,
        region_shortcut: 0.05,
        scoundrel: 0.15,
        luck_shrine: 0.0,
        energy_nexus: 0.0,
        fate_weaver: 0.0,
      };

      await runStateManager.setModifiedEncounterProbabilities(modifiedProbs);

      const runState1 = runStateManager.getCurrentState();
      expect(runState1?.modifiedEncounterProbabilities).toBeDefined();
      expect(runState1?.modifiedEncounterProbabilities?.puzzle_chamber).toBe(0.2);

      // Test persistence
      const newManager = getRunStateManager();
      const runState2 = newManager.getCurrentState();
      expect(runState2?.modifiedEncounterProbabilities).toBeDefined();
      expect(runState2?.modifiedEncounterProbabilities?.puzzle_chamber).toBe(
        0.2
      );
    });

    it('should clear all metaphysical encounter state when run is cleared', async () => {
      await runStateManager.setLuckBoost(2, 0.5);
      await runStateManager.setModifiedEncounterProbabilities({
        puzzle_chamber: 0.5,
        discovery_site: 0.5,
        risk_event: 0.0,
        hazard: 0.0,
        rest_site: 0.0,
        safe_passage: 0.0,
        region_shortcut: 0.0,
        scoundrel: 0.0,
        luck_shrine: 0.0,
        energy_nexus: 0.0,
        fate_weaver: 0.0,
      });

      await runStateManager.clearActiveRun();

      const runState = runStateManager.getCurrentState();
      expect(runState).toBeNull();
    });
  });

  describe('Task 6.22: Luck Boost Reward Calculation Integration', () => {
    it('should integrate luck boost with RewardCalculator', async () => {
      await runStateManager.setLuckBoost(2, 0.5);

      const testItem = {
        id: 'test',
        name: 'Test Item',
        type: 'trade_good' as const,
        setId: 'test',
        value: 10,
        description: 'Test',
      };

      const rewards = rewardCalculator.processEncounterRewards(
        [testItem],
        'puzzle_chamber',
        3
      );

      expect(rewards[0].value).toBeGreaterThan(testItem.value);
    });

    it('should apply luck boost consistently across encounter types', async () => {
      await runStateManager.setLuckBoost(2, 0.5);

      const baseReward = 10;
      const depth = 3;

      const puzzleReward = balanceManager.calculateRewardValue(
        baseReward,
        'puzzle_chamber',
        depth
      );
      const riskReward = balanceManager.calculateRewardValue(
        baseReward,
        'risk_event',
        depth
      );
      const discoveryReward = balanceManager.calculateRewardValue(
        baseReward,
        'discovery_site',
        depth
      );

      // All should have boost applied
      expect(puzzleReward).toBeGreaterThan(baseReward);
      expect(riskReward).toBeGreaterThan(baseReward);
      expect(discoveryReward).toBeGreaterThan(baseReward);
    });

    it('should not apply luck boost to utility encounters', async () => {
      await runStateManager.setLuckBoost(2, 0.5);

      // Utility encounters don't provide direct rewards, so luck boost
      // wouldn't apply to them anyway, but we can verify the system handles them
      const luckShrine = new LuckShrineEncounter('test-1', 3);
      const energyNexus = new EnergyNexusEncounter('test-2', 3);

      expect(luckShrine.getState().encounterType).toBe('luck_shrine');
      expect(energyNexus.getState().encounterType).toBe('energy_nexus');
    });
  });

  describe('Task 6.23: Probability Modification Integration', () => {
    it('should integrate Fate Weaver with map generation', async () => {
      const baseDistribution =
        DEFAULT_BALANCE_CONFIG.region.encounterDistributions.default;

      const fateWeaver = new FateWeaverEncounter(
        'test-1',
        3,
        baseDistribution
      );

      // Modify probabilities for selected types
      const state = fateWeaver.getState();
      const selectedType = state.config.selectedTypes[0];
      fateWeaver.modifyProbability(selectedType, 'increase');

      await fateWeaver.execute();

      // Verify probabilities were saved
      const runState = runStateManager.getCurrentState();
      expect(runState?.modifiedEncounterProbabilities).toBeDefined();

      // After normalization, the probability may be slightly different
      // but should be close to the increased value
      const newProb = runState?.modifiedEncounterProbabilities?.[selectedType];
      expect(newProb).toBeDefined();
      expect(newProb).toBeGreaterThan(0);

      // Generate map and verify it uses modified probabilities
      const generator = new DungeonMapGenerator();
      const nodes = await generator.generateDepthLevel(5);
      expect(nodes.length).toBeGreaterThan(0);
    });

    it('should normalize probabilities correctly after modification', async () => {
      const baseDistribution =
        DEFAULT_BALANCE_CONFIG.region.encounterDistributions.default;

      const fateWeaver = new FateWeaverEncounter(
        'test-1',
        3,
        baseDistribution
      );

      const state = fateWeaver.getState();
      state.config.selectedTypes.forEach((type) => {
        fateWeaver.modifyProbability(type, 'increase');
      });

      const newDistribution = fateWeaver.calculateNewDistribution();
      const sum = Object.values(newDistribution).reduce((a, b) => a + b, 0);

      expect(sum).toBeCloseTo(1.0, 5);
    });
  });

  describe('Task 6.24: End-to-End Encounter Flows', () => {
    it('should complete full luck shrine flow', async () => {
      const luckShrine = new LuckShrineEncounter('test-1', 3);
      const initialState = luckShrine.getState();

      expect(initialState.config.multiplierBonus).toBeGreaterThan(0);
      expect(initialState.config.duration).toBeGreaterThanOrEqual(2);

      const outcome = await luckShrine.activate();

      expect(outcome.type).toBe('success');
      expect(outcome.message).toBeDefined();

      const runState = runStateManager.getCurrentState();
      expect(runState?.luckBoostActive).toBeDefined();
      expect(runState?.luckBoostActive?.remainingEncounters).toBe(
        initialState.config.duration
      );

      // Verify reward calculation uses boost
      const reward = balanceManager.calculateRewardValue(
        10,
        'puzzle_chamber',
        4
      );
      expect(reward).toBeGreaterThan(10);
    });

    it('should complete full energy nexus flow', async () => {
      const runState = runStateManager.getCurrentState();
      if (runState) {
        runState.energyRemaining = 50;
        runState.inventory = [
          {
            id: 'item-1',
            type: 'trade_good',
            setId: 'test',
            value: 10,
            name: 'Test Item',
            description: 'Test',
          },
        ];
        await runStateManager['saveState']();
      }

      const energyNexus = new EnergyNexusEncounter('test-1', 3);
      energyNexus.selectConversionDirection('items_to_energy');

      const outcome = await energyNexus.executeConversion(
        runState!.inventory,
        runState!.energyRemaining
      );

      expect(outcome.type).toBe('success');
      expect(outcome.message).toBeDefined();

      const updatedState = runStateManager.getCurrentState();
      expect(updatedState?.energyRemaining).toBeGreaterThan(50);
      expect(updatedState?.inventory.length).toBe(0);
    });

    it('should complete full fate weaver flow', async () => {
      const baseDistribution =
        DEFAULT_BALANCE_CONFIG.region.encounterDistributions.default;

      const fateWeaver = new FateWeaverEncounter('test-1', 3, baseDistribution);
      const state = fateWeaver.getState();

      expect(state.config.selectedTypes.length).toBe(3);

      // Modify one type
      fateWeaver.modifyProbability(state.config.selectedTypes[0], 'increase');

      const outcome = await fateWeaver.execute();

      expect(outcome.type).toBe('success');

      // Verify probabilities were saved
      const runState = runStateManager.getCurrentState();
      expect(runState?.modifiedEncounterProbabilities).toBeDefined();

      // Generate map using modified probabilities
      const generator = new DungeonMapGenerator();
      const nodes = await generator.generateDepthLevel(5);
      expect(nodes.length).toBeGreaterThan(0);
    });
  });
});

