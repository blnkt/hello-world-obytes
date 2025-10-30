import { RiskEscalationManager } from '../risk-escalation-manager';
import { BalanceManager } from '../balance-manager';

describe('Difficulty Curve Optimization', () => {
  let riskManager: RiskEscalationManager;
  let balanceManager: BalanceManager;

  beforeEach(() => {
    riskManager = new RiskEscalationManager();
    balanceManager = new BalanceManager();
  });

  describe('Difficulty Scaling with Depth', () => {
    it('should scale difficulty appropriately with depth', () => {
      const baseDifficulty = 5;

      const depth1Difficulty = riskManager.scaleEncounterDifficulty(
        baseDifficulty,
        1
      );
      const depth2Difficulty = riskManager.scaleEncounterDifficulty(
        baseDifficulty,
        2
      );
      const depth3Difficulty = riskManager.scaleEncounterDifficulty(
        baseDifficulty,
        3
      );
      const depth5Difficulty = riskManager.scaleEncounterDifficulty(
        baseDifficulty,
        5
      );

      expect(depth2Difficulty).toBeGreaterThan(depth1Difficulty);
      expect(depth3Difficulty).toBeGreaterThan(depth2Difficulty);
      expect(depth5Difficulty).toBeGreaterThan(depth3Difficulty);
    });

    it('should use balance configuration for difficulty multipliers', () => {
      const baseDifficulty = 10;

      const scaling1 = balanceManager.calculateDifficultyMultiplier(1);
      const scaling2 = balanceManager.calculateDifficultyMultiplier(2);
      const scaling3 = balanceManager.calculateDifficultyMultiplier(3);

      expect(scaling2).toBeGreaterThan(scaling1);
      expect(scaling3).toBeGreaterThan(scaling2);
    });

    it('should maintain reasonable difficulty curve', () => {
      const baseDifficulty = 5;
      const depths = [1, 2, 3, 5, 10];
      const difficulties = depths.map((depth) =>
        riskManager.scaleEncounterDifficulty(baseDifficulty, depth)
      );

      // Difficulty should not grow too rapidly (cap at 5x base)
      difficulties.forEach((difficulty, index) => {
        expect(difficulty).toBeLessThanOrEqual(baseDifficulty * 5);
      });

      // Should still increase meaningfully with depth
      expect(difficulties[difficulties.length - 1]).toBeGreaterThan(
        difficulties[0]
      );
    });
  });

  describe('Risk Multiplier Calculation', () => {
    it('should calculate risk multipliers using exponential scaling', () => {
      const risk1 = riskManager.getRiskMultiplier(1);
      const risk2 = riskManager.getRiskMultiplier(2);
      const risk3 = riskManager.getRiskMultiplier(3);

      expect(risk2).toBeGreaterThan(risk1);
      expect(risk3).toBeGreaterThan(risk2);

      // Should follow exponential curve
      const ratio2to1 = risk2 / risk1;
      const ratio3to2 = risk3 / risk2;
      expect(ratio3to2).toBeCloseTo(ratio2to1, 1);
    });

    it('should handle depth 0 correctly', () => {
      const risk0 = riskManager.getRiskMultiplier(0);
      expect(risk0).toBe(1);
    });
  });

  describe('Difficulty vs Reward Balance', () => {
    it('should maintain appropriate difficulty-to-reward ratio', () => {
      const baseDifficulty = 10;
      const baseReward = 10;

      for (let depth = 1; depth <= 5; depth++) {
        const scaledDifficulty = riskManager.scaleEncounterDifficulty(
          baseDifficulty,
          depth
        );
        const scaledReward = riskManager.scaleReward(baseReward, depth);

        // Rewards should scale proportionally to difficulty
        expect(scaledReward).toBeGreaterThan(scaledDifficulty * 0.5);
      }
    });

    it('should ensure difficulty increase does not outpace rewards', () => {
      const baseDifficulty = 10;
      const baseReward = 10;

      const difficulties = [1, 2, 3, 5].map((depth) =>
        riskManager.scaleEncounterDifficulty(baseDifficulty, depth)
      );
      const rewards = [1, 2, 3, 5].map((depth) =>
        riskManager.scaleReward(baseReward, depth)
      );

      // Rewards should increase at least as fast as difficulty
      for (let i = 1; i < difficulties.length; i++) {
        const difficultyIncrease =
          (difficulties[i] - difficulties[i - 1]) / difficulties[i - 1];
        const rewardIncrease = (rewards[i] - rewards[i - 1]) / rewards[i - 1];

        expect(rewardIncrease).toBeGreaterThanOrEqual(difficultyIncrease * 0.5);
      }
    });
  });

  describe('Configuration Integration', () => {
    it('should allow updating difficulty scaling configuration', () => {
      const config = balanceManager.getConfig();

      const originalMultiplier =
        balanceManager.calculateDifficultyMultiplier(3);

      balanceManager.updateConfig({
        difficulty: {
          ...config.difficulty,
          difficultyDepthMultiplier: 0.3,
        },
      });

      const newMultiplier = balanceManager.calculateDifficultyMultiplier(3);
      expect(newMultiplier).toBeGreaterThan(originalMultiplier);
    });

    it('should allow custom risk escalation configuration', () => {
      const customManager = new RiskEscalationManager({
        riskScalingFactor: 0.5,
        difficultyScalingFactor: 1.5,
      });

      const baseDifficulty = 10;
      const difficulty1 = customManager.scaleEncounterDifficulty(
        baseDifficulty,
        1
      );
      const normalDifficulty1 = riskManager.scaleEncounterDifficulty(
        baseDifficulty,
        1
      );

      expect(difficulty1).not.toBe(normalDifficulty1);
    });
  });
});
