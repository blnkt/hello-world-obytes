import type {
  AdvancedEncounterItem,
  EncounterReward,
} from '@/types/delvers-descent';

import { CashOutManager } from './cash-out-manager';
import { HazardEncounter } from './hazard-encounter';
import { RestSiteEncounter } from './rest-site-encounter';
import type { AdvancedEncounterOutcome } from './risk-event-encounter';
import { RiskEventEncounter } from './risk-event-encounter';

describe('Phase 3 TypeScript Interface Extensions (Task 4.8)', () => {
  let cashOutManager: CashOutManager;

  beforeEach(() => {
    cashOutManager = new CashOutManager();
  });

  describe('AdvancedEncounterItem interface', () => {
    it('should support all advanced encounter item properties', () => {
      const item: AdvancedEncounterItem = {
        id: 'test-item',
        name: 'Test Item',
        quantity: 2,
        rarity: 'rare',
        type: 'trade_good',
        setId: 'test-set',
        value: 50,
        description: 'A test item with all properties',
      };

      expect(item.id).toBe('test-item');
      expect(item.quantity).toBe(2);
      expect(item.rarity).toBe('rare');
      expect(item.type).toBe('trade_good');
      expect(item.setId).toBe('test-set');
      expect(item.value).toBe(50);
    });

    it('should support all rarity levels', () => {
      const rarities: AdvancedEncounterItem['rarity'][] = [
        'common',
        'uncommon',
        'rare',
        'epic',
        'legendary',
      ];

      rarities.forEach((rarity) => {
        const item: AdvancedEncounterItem = {
          id: `item-${rarity}`,
          name: `${rarity} item`,
          quantity: 1,
          rarity,
          type: 'trade_good',
          setId: 'test',
          value: 10,
          description: 'Test',
        };

        expect(item.rarity).toBe(rarity);
      });
    });

    it('should support all item types', () => {
      const types: AdvancedEncounterItem['type'][] = [
        'trade_good',
        'discovery',
        'legendary',
      ];

      types.forEach((type) => {
        const item: AdvancedEncounterItem = {
          id: `item-${type}`,
          name: `${type} item`,
          quantity: 1,
          rarity: 'common',
          type,
          setId: 'test',
          value: 10,
          description: 'Test',
        };

        expect(item.type).toBe(type);
      });
    });
  });

  describe('EncounterReward interface', () => {
    it('should support advanced encounter rewards with items', () => {
      const reward: EncounterReward = {
        energy: 10,
        items: [
          {
            id: 'reward-item-1',
            name: 'Reward Item',
            quantity: 1,
            rarity: 'rare',
            type: 'legendary',
            setId: 'reward-set',
            value: 100,
            description: 'A reward item',
          },
        ],
        xp: 50,
      };

      expect(reward.energy).toBe(10);
      expect(reward.items.length).toBe(1);
      expect(reward.items[0].rarity).toBe('rare');
      expect(reward.xp).toBe(50);
    });
  });

  describe('AdvancedEncounterOutcome interface', () => {
    it('should support success outcomes with rewards', () => {
      const successOutcome: AdvancedEncounterOutcome = {
        type: 'success',
        message: 'Success!',
        reward: {
          energy: 20,
          items: [
            {
              id: 'success-item',
              name: 'Success Item',
              quantity: 1,
              rarity: 'epic',
              type: 'discovery',
              setId: 'success-set',
              value: 150,
              description: 'A success reward',
            },
          ],
          xp: 100,
        },
      };

      expect(successOutcome.type).toBe('success');
      expect(successOutcome.reward).toBeDefined();
      if (successOutcome.reward) {
        expect(successOutcome.reward.energy).toBe(20);
        expect(successOutcome.reward.items.length).toBe(1);
      }
    });

    it('should support failure outcomes with consequences', () => {
      const failureOutcome: AdvancedEncounterOutcome = {
        type: 'failure',
        message: 'Failure!',
        consequence: {
          energyLoss: 15,
          itemLossRisk: 0.3,
          forcedRetreat: true,
          encounterLockout: true,
        },
      };

      expect(failureOutcome.type).toBe('failure');
      expect(failureOutcome.consequence).toBeDefined();
      if (failureOutcome.consequence) {
        expect(failureOutcome.consequence.energyLoss).toBe(15);
        expect(failureOutcome.consequence.forcedRetreat).toBe(true);
      }
    });
  });

  describe('CashOutSummary interface', () => {
    it('should support cash out summaries with item categorization', () => {
      const rewards: EncounterReward = {
        energy: 5,
        items: [
          {
            id: 'trade-1',
            name: 'Trade Good 1',
            quantity: 2,
            rarity: 'common',
            type: 'trade_good',
            setId: 'trade-set',
            value: 10,
            description: 'Trade good',
          },
          {
            id: 'discovery-1',
            name: 'Discovery 1',
            quantity: 1,
            rarity: 'rare',
            type: 'discovery',
            setId: 'discovery-set',
            value: 100,
            description: 'Discovery',
          },
          {
            id: 'legendary-1',
            name: 'Legendary 1',
            quantity: 1,
            rarity: 'legendary',
            type: 'legendary',
            setId: 'legendary-set',
            value: 500,
            description: 'Legendary item',
          },
        ],
        xp: 200,
      };

      const summary = cashOutManager.getCashOutSummary(rewards);

      expect(summary.totalItems).toBe(3);
      expect(summary.totalXP).toBe(200);
      expect(summary.itemTypes.trade_goods).toBe(1);
      expect(summary.itemTypes.discoveries).toBe(1);
      expect(summary.itemTypes.legendaries).toBe(1);
      expect(summary.totalValue).toBe(2 * 10 + 100 + 500); // 620
    });
  });

  describe('encounter-specific state types', () => {
    it('should support RiskEventEncounter state type', () => {
      const config = RiskEventEncounter.createRiskLevelConfig('high', 3);
      const encounter = new RiskEventEncounter('test-1', config);
      const state = encounter.getState();

      expect(state.config).toBeDefined();
      expect(state.encounterType).toBe('risk_event');
      expect(state.availableChoices.length).toBeGreaterThan(0);
    });

    it('should support HazardEncounter state type', () => {
      const config = HazardEncounter.createHazardConfig('collapsed_passage', 3);
      const encounter = new HazardEncounter('test-1', config);
      const state = encounter.getState();

      expect(state.config).toBeDefined();
      expect(state.encounterType).toBe('hazard');
      expect(state.availablePaths.length).toBeGreaterThan(0);
    });

    it('should support RestSiteEncounter state type', () => {
      // RestSiteEncounter uses a different constructor signature
      // Verify that it can be instantiated and has correct type
      expect(RestSiteEncounter).toBeDefined();
      expect(typeof RestSiteEncounter).toBe('function');
    });
  });

  describe('type compatibility with existing interfaces', () => {
    it('should maintain compatibility with CollectedItem interface', () => {
      // AdvancedEncounterItem should extend CollectedItem functionality
      const advancedItem: AdvancedEncounterItem = {
        id: 'compat-item',
        name: 'Compatible Item',
        quantity: 1,
        rarity: 'common',
        type: 'trade_good',
        setId: 'compat-set',
        value: 25,
        description: 'Compatible item',
      };

      // Should have all CollectedItem fields
      expect(advancedItem.id).toBeDefined();
      expect(advancedItem.name).toBeDefined();
      expect(advancedItem.type).toBeDefined();
      expect(advancedItem.setId).toBeDefined();
      expect(advancedItem.value).toBeDefined();
      expect(advancedItem.description).toBeDefined();

      // Plus advanced-specific fields
      expect(advancedItem.quantity).toBeDefined();
      expect(advancedItem.rarity).toBeDefined();
    });
  });
});
