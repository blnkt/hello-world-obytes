import type { CollectedItem } from '@/types/delvers-descent';

import { EnergyNexusEncounter } from './energy-nexus-encounter';
import { getRunStateManager } from './run-state-manager';

describe('EnergyNexusEncounter', () => {
  let runStateManager: ReturnType<typeof getRunStateManager>;

  beforeEach(async () => {
    runStateManager = getRunStateManager();
    await runStateManager.initializeRun('test-run-1', 100);
  });

  afterEach(async () => {
    await runStateManager.clearActiveRun();
  });

  describe('constructor', () => {
    it('should create an energy nexus encounter with valid config', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);

      const state = encounter.getState();
      expect(state.encounterId).toBe('encounter-1');
      expect(state.encounterType).toBe('energy_nexus');
      expect(state.config.conversionRate).toBe(10); // 1 item value = 10 energy
      expect(state.isResolved).toBe(false);
    });
  });

  describe('getState', () => {
    it('should return a copy of the current state', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 5);
      const state1 = encounter.getState();
      const state2 = encounter.getState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Should be different objects
    });
  });

  describe('selectConversionDirection', () => {
    it('should select items to energy direction', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);
      encounter.selectConversionDirection('items_to_energy');

      const state = encounter.getState();
      expect(state.conversionDirection).toBe('items_to_energy');
    });

    it('should select energy to items direction', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);
      encounter.selectConversionDirection('energy_to_items');

      const state = encounter.getState();
      expect(state.conversionDirection).toBe('energy_to_items');
    });

    it('should throw error if already resolved', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);
      const runState = runStateManager.getCurrentState();
      if (runState) {
        runState.inventory = [
          {
            id: 'item-1',
            name: 'Test Item',
            value: 10,
            type: 'trade_good',
            setId: 'test-set',
            description: 'Test item',
          },
        ];
      }

      encounter.selectConversionDirection('items_to_energy');
      encounter.executeConversion(
        runState!.inventory,
        runState!.energyRemaining
      );

      expect(() => {
        encounter.selectConversionDirection('items_to_energy');
      }).toThrow('Encounter already resolved');
    });
  });

  describe('validateConversion', () => {
    it('should validate items to energy conversion with sufficient items', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);
      encounter.selectConversionDirection('items_to_energy');

      const runState = runStateManager.getCurrentState();
      if (runState) {
        runState.inventory = [
          {
            id: 'item-1',
            name: 'Test Item',
            value: 10,
            type: 'trade_good',
            setId: 'test-set',
            description: 'Test item',
          },
        ];
      }

      const isValid = encounter.validateConversion(
        runState!.inventory,
        runState!.energyRemaining
      );
      expect(isValid).toBe(true);
    });

    it('should invalidate items to energy conversion with no items', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);
      encounter.selectConversionDirection('items_to_energy');

      const runState = runStateManager.getCurrentState();
      if (runState) {
        runState.inventory = [];
      }

      const isValid = encounter.validateConversion(
        runState!.inventory,
        runState!.energyRemaining
      );
      expect(isValid).toBe(false);
    });

    it('should validate energy to items conversion with sufficient energy', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);
      encounter.selectConversionDirection('energy_to_items');

      const runState = runStateManager.getCurrentState();
      if (runState) {
        runState.energyRemaining = 50; // Enough for conversion
      }

      const isValid = encounter.validateConversion(
        runState!.inventory,
        runState!.energyRemaining
      );
      expect(isValid).toBe(true);
    });

    it('should invalidate energy to items conversion with insufficient energy', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);
      encounter.selectConversionDirection('energy_to_items');

      const runState = runStateManager.getCurrentState();
      if (runState) {
        runState.energyRemaining = 5; // Not enough for minimum conversion
      }

      const isValid = encounter.validateConversion(
        runState!.inventory,
        runState!.energyRemaining
      );
      expect(isValid).toBe(false);
    });

    it('should throw error if no conversion direction selected', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);
      const runState = runStateManager.getCurrentState();

      expect(() => {
        encounter.validateConversion(
          runState!.inventory,
          runState!.energyRemaining
        );
      }).toThrow('No conversion direction selected');
    });
  });

  describe('convertItemsToEnergy', () => {
    it('should calculate energy from item values', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);
      const items: CollectedItem[] = [
        {
          id: 'item-1',
          name: 'Item 1',
          value: 10,
          type: 'trade_good',
          setId: 'test-set',
          description: 'Item 1',
        },
        {
          id: 'item-2',
          name: 'Item 2',
          value: 20,
          type: 'trade_good',
          setId: 'test-set',
          description: 'Item 2',
        },
      ];

      const energy = encounter.convertItemsToEnergy(items);
      expect(energy).toBe(300); // (10 + 20) * 10 = 300
    });

    it('should return 0 for empty inventory', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);
      const energy = encounter.convertItemsToEnergy([]);
      expect(energy).toBe(0);
    });
  });

  describe('convertEnergyToItems', () => {
    it('should calculate item value from energy', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);
      const energy = 50;

      const itemValue = encounter.convertEnergyToItems(energy);
      expect(itemValue).toBe(5); // 50 / 10 = 5
    });

    it('should return 0 for zero energy', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);
      const itemValue = encounter.convertEnergyToItems(0);
      expect(itemValue).toBe(0);
    });

    it('should round down for non-divisible energy', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);
      const energy = 55;

      const itemValue = encounter.convertEnergyToItems(energy);
      expect(itemValue).toBe(5); // 55 / 10 = 5.5, rounded down to 5
    });
  });

  describe('executeConversion', () => {
    it('should execute items to energy conversion and return outcome', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);
      encounter.selectConversionDirection('items_to_energy');

      const runState = runStateManager.getCurrentState();
      if (runState) {
        runState.inventory = [
          {
            id: 'item-1',
            name: 'Test Item',
            value: 10,
            type: 'trade_good',
            setId: 'test-set',
            description: 'Test item',
          },
        ];
      }

      const outcome = encounter.executeConversion(
        runState!.inventory,
        runState!.energyRemaining
      );

      expect(outcome.type).toBe('success');
      expect(outcome.message.toLowerCase()).toContain('converted');
      expect(encounter.getState().isResolved).toBe(true);
      expect(encounter.getState().outcome).toBeDefined();
    });

    it('should execute energy to items conversion and return outcome', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);
      encounter.selectConversionDirection('energy_to_items');

      const runState = runStateManager.getCurrentState();
      if (runState) {
        runState.energyRemaining = 50;
      }

      const outcome = encounter.executeConversion(
        runState!.inventory,
        runState!.energyRemaining
      );

      expect(outcome.type).toBe('success');
      expect(outcome.message.toLowerCase()).toContain('converted');
      expect(encounter.getState().isResolved).toBe(true);
    });

    it('should throw error if no conversion direction selected', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);
      const runState = runStateManager.getCurrentState();

      expect(() => {
        encounter.executeConversion(
          runState!.inventory,
          runState!.energyRemaining
        );
      }).toThrow('No conversion direction selected');
    });

    it('should throw error if validation fails', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);
      encounter.selectConversionDirection('items_to_energy');

      const runState = runStateManager.getCurrentState();
      if (runState) {
        runState.inventory = []; // No items
      }

      expect(() => {
        encounter.executeConversion(
          runState!.inventory,
          runState!.energyRemaining
        );
      }).toThrow('Insufficient resources for conversion');
    });

    it('should throw error if already resolved', () => {
      const encounter = new EnergyNexusEncounter('encounter-1', 3);
      encounter.selectConversionDirection('items_to_energy');

      const runState = runStateManager.getCurrentState();
      if (runState) {
        runState.inventory = [
          {
            id: 'item-1',
            name: 'Test Item',
            value: 10,
            type: 'trade_good',
            setId: 'test-set',
            description: 'Test item',
          },
        ];
      }

      encounter.executeConversion(
        runState!.inventory,
        runState!.energyRemaining
      );

      expect(() => {
        encounter.executeConversion(
          runState!.inventory,
          runState!.energyRemaining
        );
      }).toThrow('Encounter already resolved');
    });
  });

  describe('getEnergyCost', () => {
    it('should calculate energy cost based on depth and type modifier', () => {
      const encounter1 = new EnergyNexusEncounter('encounter-1', 1);
      const encounter2 = new EnergyNexusEncounter('encounter-2', 5);
      const encounter3 = new EnergyNexusEncounter('encounter-3', 10);

      const cost1 = encounter1.getEnergyCost();
      const cost2 = encounter2.getEnergyCost();
      const cost3 = encounter3.getEnergyCost();

      // Cost should increase with depth
      expect(cost1).toBeLessThan(cost2);
      expect(cost2).toBeLessThan(cost3);
      expect(cost1).toBeGreaterThanOrEqual(3); // Min cost
      expect(cost3).toBeLessThanOrEqual(30); // Max cost
    });

    it('should return consistent cost for same depth', () => {
      const encounter1 = new EnergyNexusEncounter('encounter-1', 3);
      const encounter2 = new EnergyNexusEncounter('encounter-2', 3);

      expect(encounter1.getEnergyCost()).toBe(encounter2.getEnergyCost());
    });
  });
});
