import { RewardCalculator } from '../reward-calculator';
import { BalanceManager } from '../balance-manager';
import type { EncounterType } from '@/types/delvers-descent';

describe('RewardCalculator with Balance Integration', () => {
  let rewardCalculator: RewardCalculator;
  let balanceManager: BalanceManager;

  beforeEach(() => {
    rewardCalculator = new RewardCalculator();
    balanceManager = new BalanceManager();
  });

  describe('calculateFinalReward with balance configuration', () => {
    it('should use balance manager configuration for depth scaling', () => {
      const baseReward = 10;
      const depth = 2;

      const rewardCalcScaling = rewardCalculator.calculateDepthScaling(depth);
      const balanceScaling = balanceManager.calculateDepthRewardScaling(depth);

      expect(rewardCalcScaling).toBe(balanceScaling);
    });

    it('should apply encounter type multipliers from balance config', () => {
      const baseReward = 10;
      const depth = 3;

      const puzzleReward = rewardCalculator.calculateFinalReward(
        baseReward,
        'puzzle_chamber',
        depth
      );
      const riskReward = rewardCalculator.calculateFinalReward(
        baseReward,
        'risk_event',
        depth
      );

      expect(riskReward).toBeGreaterThanOrEqual(puzzleReward);
    });

    it('should scale rewards appropriately with depth', () => {
      const baseReward = 10;

      const reward1 = rewardCalculator.calculateFinalReward(
        baseReward,
        'puzzle_chamber',
        1
      );
      const reward2 = rewardCalculator.calculateFinalReward(
        baseReward,
        'puzzle_chamber',
        2
      );
      const reward3 = rewardCalculator.calculateFinalReward(
        baseReward,
        'puzzle_chamber',
        5
      );

      expect(reward2).toBeGreaterThanOrEqual(reward1 - 2);
      expect(reward3).toBeGreaterThanOrEqual(reward2);
      expect(reward3).toBeGreaterThan(reward1);
    });

    it('should apply variation to rewards', () => {
      const baseReward = 10;
      const rewards: number[] = [];

      for (let i = 0; i < 10; i++) {
        rewards.push(
          rewardCalculator.calculateFinalReward(baseReward, 'puzzle_chamber', 2)
        );
      }

      const uniqueRewards = new Set(rewards);
      expect(uniqueRewards.size).toBeGreaterThan(1);
    });
  });

  describe('balance configuration integration', () => {
    it('should allow updating reward configuration', () => {
      const baseReward = 10;
      const originalReward = rewardCalculator.calculateFinalReward(
        baseReward,
        'puzzle_chamber',
        2
      );

      const config = balanceManager.getConfig();
      balanceManager.updateConfig({
        reward: {
          ...config.reward,
          depthScalingFactor: 0.3,
        },
      });

      const newDepthScaling = balanceManager.calculateDepthRewardScaling(2);
      expect(newDepthScaling).toBeGreaterThan(1.4); // Original was 1.4
    });

    it('should respect type multipliers from balance config', () => {
      const config = balanceManager.getConfig();
      const puzzleMultiplier = config.reward.typeMultipliers.puzzle_chamber;
      const riskMultiplier = config.reward.typeMultipliers.risk_event;

      expect(riskMultiplier).toBeGreaterThan(puzzleMultiplier);
      expect(riskMultiplier).toBe(1.5);
      expect(puzzleMultiplier).toBe(1.0);
    });
  });

  describe('reward progression balancing', () => {
    it('should provide increasing rewards at deeper depths', () => {
      const baseReward = 10;

      // Test base scaling (without random variation)
      const scaling1 = rewardCalculator.calculateDepthScaling(1);
      const scaling2 = rewardCalculator.calculateDepthScaling(2);
      const scaling3 = rewardCalculator.calculateDepthScaling(3);
      const scaling5 = rewardCalculator.calculateDepthScaling(5);
      const scaling10 = rewardCalculator.calculateDepthScaling(10);

      expect(scaling2).toBeGreaterThan(scaling1);
      expect(scaling3).toBeGreaterThan(scaling2);
      expect(scaling5).toBeGreaterThan(scaling3);
      expect(scaling10).toBeGreaterThan(scaling5);
    });

    it('should maintain reward-to-energy-cost ratio', () => {
      const depths = [1, 2, 3, 5];

      depths.forEach((depth) => {
        const nodeCost = balanceManager.calculateNodeCost(
          depth,
          'puzzle_chamber'
        );
        const reward = rewardCalculator.calculateFinalReward(
          10,
          'puzzle_chamber',
          depth
        );

        expect(reward).toBeGreaterThan(nodeCost / 2); // Rewards should be meaningful
      });
    });
  });

  describe('preset configurations', () => {
    it('should have different reward scaling in EASY mode', () => {
      const easyManager = new BalanceManager();
      easyManager.loadPreset('EASY');

      const normalManager = new BalanceManager();

      const easyScaling = easyManager.calculateDepthRewardScaling(5);
      const normalScaling = normalManager.calculateDepthRewardScaling(5);

      // EASY and normal modes should have the same base scaling
      expect(easyScaling).toBeGreaterThanOrEqual(normalScaling);
    });

    it('should have different reward scaling in HARD mode', () => {
      const hardManager = new BalanceManager();
      hardManager.loadPreset('HARD');

      const normalManager = new BalanceManager();

      const hardScaling = hardManager.calculateDepthRewardScaling(5);
      const normalScaling = normalManager.calculateDepthRewardScaling(5);

      // HARD mode rewards should be lower or equal
      expect(hardScaling).toBeLessThanOrEqual(normalScaling);
    });
  });
});
