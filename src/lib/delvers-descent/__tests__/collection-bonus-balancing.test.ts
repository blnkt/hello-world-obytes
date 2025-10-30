import { BalanceManager } from '../balance-manager';

describe('Collection Bonus Balancing', () => {
  let balanceManager: BalanceManager;

  beforeEach(() => {
    balanceManager = new BalanceManager();
  });

  describe('Collection Bonus Energy', () => {
    it('should calculate collection bonus energy correctly', () => {
      const bonus1 = balanceManager.calculateCollectionBonusEnergy(1);
      const bonus2 = balanceManager.calculateCollectionBonusEnergy(2);
      const bonus3 = balanceManager.calculateCollectionBonusEnergy(3);

      expect(bonus1).toBe(50); // Default: 50 energy per completed set
      expect(bonus2).toBe(100);
      expect(bonus3).toBe(150);
    });

    it('should allow configuration of bonus energy amount', () => {
      const config = balanceManager.getConfig();

      const originalBonus = balanceManager.calculateCollectionBonusEnergy(1);

      balanceManager.updateConfig({
        collection: {
          ...config.collection,
          setCompletionBonusEnergy: 75,
        },
      });

      const newBonus = balanceManager.calculateCollectionBonusEnergy(1);
      expect(newBonus).toBe(75);
      expect(newBonus).toBeGreaterThan(originalBonus);
    });

    it('should scale energy bonus linearly with set completion', () => {
      const bonuses = [1, 2, 3, 5, 10].map((count) =>
        balanceManager.calculateCollectionBonusEnergy(count)
      );

      // Bonuses should increase predictably
      for (let i = 1; i < bonuses.length; i++) {
        const increase = bonuses[i] - bonuses[i - 1];
        expect(increase).toBeGreaterThan(0); // Should always increase
      }

      // Verify linear scaling
      expect(bonuses[1] - bonuses[0]).toBe(bonuses[2] - bonuses[1]); // First two increases should be equal
    });
  });

  describe('Collection Bonus Items', () => {
    it('should calculate collection bonus items correctly', () => {
      const bonus1 = balanceManager.calculateCollectionBonusItems(1);
      const bonus2 = balanceManager.calculateCollectionBonusItems(2);
      const bonus3 = balanceManager.calculateCollectionBonusItems(3);

      expect(bonus1).toBe(2); // Default: 2 items per completed set
      expect(bonus2).toBe(4);
      expect(bonus3).toBe(6);
    });

    it('should allow configuration of bonus items amount', () => {
      const config = balanceManager.getConfig();

      const originalBonus = balanceManager.calculateCollectionBonusItems(1);

      balanceManager.updateConfig({
        collection: {
          ...config.collection,
          setCompletionBonusItems: 3,
        },
      });

      const newBonus = balanceManager.calculateCollectionBonusItems(1);
      expect(newBonus).toBe(3);
      expect(newBonus).toBeGreaterThan(originalBonus);
    });
  });

  describe('Legendary Bonus Multiplier', () => {
    it('should have legendary bonus multiplier configured', () => {
      const config = balanceManager.getConfig();

      expect(config.collection.legendaryBonusEnergyMultiplier).toBe(1.5);
    });

    it('should allow configuration of legendary multiplier', () => {
      const config = balanceManager.getConfig();

      balanceManager.updateConfig({
        collection: {
          ...config.collection,
          legendaryBonusEnergyMultiplier: 2.0,
        },
      });

      const newConfig = balanceManager.getConfig();
      expect(newConfig.collection.legendaryBonusEnergyMultiplier).toBe(2.0);
    });
  });

  describe('Collection Item Values', () => {
    it('should have appropriate base values for different item types', () => {
      const config = balanceManager.getConfig();

      expect(config.collection.tradeGoodBaseValue).toBe(10);
      expect(config.collection.discoveryBaseValue).toBe(15);
      expect(config.collection.legendaryBaseValue).toBe(25);
    });

    it('should ensure legendary items are most valuable', () => {
      const config = balanceManager.getConfig();

      expect(config.collection.legendaryBaseValue).toBeGreaterThan(
        config.collection.discoveryBaseValue
      );
      expect(config.collection.discoveryBaseValue).toBeGreaterThan(
        config.collection.tradeGoodBaseValue
      );
    });

    it('should allow configuration of item base values', () => {
      const config = balanceManager.getConfig();

      balanceManager.updateConfig({
        collection: {
          ...config.collection,
          tradeGoodBaseValue: 15,
          discoveryBaseValue: 20,
          legendaryBaseValue: 30,
        },
      });

      const newConfig = balanceManager.getConfig();
      expect(newConfig.collection.tradeGoodBaseValue).toBe(15);
      expect(newConfig.collection.discoveryBaseValue).toBe(20);
      expect(newConfig.collection.legendaryBaseValue).toBe(30);
    });
  });

  describe('Bonus Scaling and Balance', () => {
    it('should ensure collection bonuses are meaningful', () => {
      const energyBonus = balanceManager.calculateCollectionBonusEnergy(3);
      const itemsBonus = balanceManager.calculateCollectionBonusItems(3);

      expect(energyBonus).toBeGreaterThan(100);
      expect(itemsBonus).toBeGreaterThan(0);
    });

    it('should scale bonuses appropriately with multiple completions', () => {
      const config = balanceManager.getConfig();

      // Test with increasing set completions
      for (let count = 1; count <= 5; count++) {
        const energyBonus =
          balanceManager.calculateCollectionBonusEnergy(count);
        const itemsBonus = balanceManager.calculateCollectionBonusItems(count);

        expect(energyBonus).toBe(
          config.collection.setCompletionBonusEnergy * count
        );
        expect(itemsBonus).toBe(
          config.collection.setCompletionBonusItems * count
        );
      }
    });
  });
});
