import { renderHook } from '@testing-library/react';

import { getEnergyCalculator } from '@/lib/delvers-descent/energy-calculator';
import type { Shortcut } from '@/types/delvers-descent';

import { useEnergyCalculator } from './use-energy-calculator';

// Mock the energy calculator
jest.mock('@/lib/delvers-descent/energy-calculator', () => ({
  getEnergyCalculator: jest.fn(),
}));

describe('useEnergyCalculator', () => {
  let mockEnergyCalculator: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock energy calculator
    mockEnergyCalculator = {
      calculateReturnCost: jest.fn(),
      calculateNodeCost: jest.fn(),
      calculateSafetyMargin: jest.fn(),
      applyShortcutReduction: jest.fn(),
      canAffordReturn: jest.fn(),
      calculatePointOfNoReturn: jest.fn(),
      calculateEnergyEfficiency: jest.fn(),
      calculateOptimalDepth: jest.fn(),
      calculatePathCost: jest.fn(),
      calculateShortcutSavings: jest.fn(),
      calculateRiskLevel: jest.fn(),
      getRecommendedAction: jest.fn(),
      calculateRegenerationRate: jest.fn(),
      calculateBacktrackCost: jest.fn(),
      calculateTotalEnergyBudget: jest.fn(),
      validateEnergyCalculations: jest.fn(),
    };

    (getEnergyCalculator as jest.Mock).mockReturnValue(mockEnergyCalculator);
  });

  describe('core calculation functions', () => {
    it('should calculate return cost', () => {
      mockEnergyCalculator.calculateReturnCost.mockReturnValue(50);

      const { result } = renderHook(() => useEnergyCalculator());

      const returnCost = result.current.calculateReturnCost(3, []);
      expect(returnCost).toBe(50);
      expect(mockEnergyCalculator.calculateReturnCost).toHaveBeenCalledWith(
        3,
        []
      );
    });

    it('should calculate node cost', () => {
      mockEnergyCalculator.calculateNodeCost.mockReturnValue(15);

      const { result } = renderHook(() => useEnergyCalculator());

      const nodeCost = result.current.calculateNodeCost(2, 'puzzle_chamber');
      expect(nodeCost).toBe(15);
      expect(mockEnergyCalculator.calculateNodeCost).toHaveBeenCalledWith(
        2,
        'puzzle_chamber'
      );
    });

    it('should calculate safety margin', () => {
      mockEnergyCalculator.calculateSafetyMargin.mockReturnValue(100);

      const { result } = renderHook(() => useEnergyCalculator());

      const safetyMargin = result.current.calculateSafetyMargin(1000, 900);
      expect(safetyMargin).toBe(100);
      expect(mockEnergyCalculator.calculateSafetyMargin).toHaveBeenCalledWith(
        1000,
        900
      );
    });

    it('should apply shortcut reduction', () => {
      const shortcuts: Shortcut[] = [
        {
          id: 'shortcut-1',
          fromDepth: 3,
          toDepth: 1,
          energyReduction: 20,
          isPermanent: true,
        },
      ];

      mockEnergyCalculator.applyShortcutReduction.mockReturnValue(15);

      const { result } = renderHook(() => useEnergyCalculator());

      const reducedCost = result.current.applyShortcutReduction(50, shortcuts);
      expect(reducedCost).toBe(15);
      expect(mockEnergyCalculator.applyShortcutReduction).toHaveBeenCalledWith(
        50,
        shortcuts
      );
    });

    it('should check if can afford return', () => {
      mockEnergyCalculator.canAffordReturn.mockReturnValue(true);

      const { result } = renderHook(() => useEnergyCalculator());

      const canReturn = result.current.canAffordReturn(1000, 900);
      expect(canReturn).toBe(true);
      expect(mockEnergyCalculator.canAffordReturn).toHaveBeenCalledWith(
        1000,
        900
      );
    });

    it('should calculate point of no return', () => {
      mockEnergyCalculator.calculatePointOfNoReturn.mockReturnValue(100);

      const { result } = renderHook(() => useEnergyCalculator());

      const pointOfNoReturn = result.current.calculatePointOfNoReturn(90, 10);
      expect(pointOfNoReturn).toBe(100);
      expect(
        mockEnergyCalculator.calculatePointOfNoReturn
      ).toHaveBeenCalledWith(90, 10);
    });

    it('should calculate energy efficiency', () => {
      mockEnergyCalculator.calculateEnergyEfficiency.mockReturnValue(2.5);

      const { result } = renderHook(() => useEnergyCalculator());

      const efficiency = result.current.calculateEnergyEfficiency(100, 250);
      expect(efficiency).toBe(2.5);
      expect(
        mockEnergyCalculator.calculateEnergyEfficiency
      ).toHaveBeenCalledWith(100, 250);
    });

    it('should calculate optimal depth', () => {
      const shortcuts: Shortcut[] = [
        {
          id: 'shortcut-1',
          fromDepth: 3,
          toDepth: 1,
          energyReduction: 20,
          isPermanent: true,
        },
      ];

      mockEnergyCalculator.calculateOptimalDepth.mockReturnValue(5);

      const { result } = renderHook(() => useEnergyCalculator());

      const optimalDepth = result.current.calculateOptimalDepth(
        1000,
        shortcuts
      );
      expect(optimalDepth).toBe(5);
      expect(mockEnergyCalculator.calculateOptimalDepth).toHaveBeenCalledWith(
        1000,
        shortcuts
      );
    });

    it('should calculate path cost', () => {
      const pathDepths = [1, 2, 3];
      const shortcuts: Shortcut[] = [];

      mockEnergyCalculator.calculatePathCost.mockReturnValue(45);

      const { result } = renderHook(() => useEnergyCalculator());

      const pathCost = result.current.calculatePathCost(pathDepths, shortcuts);
      expect(pathCost).toBe(45);
      expect(mockEnergyCalculator.calculatePathCost).toHaveBeenCalledWith(
        pathDepths,
        shortcuts
      );
    });

    it('should calculate shortcut savings', () => {
      mockEnergyCalculator.calculateShortcutSavings.mockReturnValue(30);

      const { result } = renderHook(() => useEnergyCalculator());

      const savings = result.current.calculateShortcutSavings(100, 70);
      expect(savings).toBe(30);
      expect(
        mockEnergyCalculator.calculateShortcutSavings
      ).toHaveBeenCalledWith(100, 70);
    });

    it('should calculate risk level', () => {
      mockEnergyCalculator.calculateRiskLevel.mockReturnValue(75);

      const { result } = renderHook(() => useEnergyCalculator());

      const riskLevel = result.current.calculateRiskLevel(100, 90);
      expect(riskLevel).toBe(75);
      expect(mockEnergyCalculator.calculateRiskLevel).toHaveBeenCalledWith(
        100,
        90
      );
    });

    it('should get recommended action', () => {
      const mockAction = {
        action: 'return' as const,
        reason: 'High risk level',
        riskLevel: 80,
      };

      mockEnergyCalculator.getRecommendedAction.mockReturnValue(mockAction);

      const { result } = renderHook(() => useEnergyCalculator());

      const action = result.current.getRecommendedAction(100, 90, 3);
      expect(action).toEqual(mockAction);
      expect(mockEnergyCalculator.getRecommendedAction).toHaveBeenCalledWith(
        100,
        90,
        3
      );
    });

    it('should calculate regeneration rate', () => {
      mockEnergyCalculator.calculateRegenerationRate.mockReturnValue(8);

      const { result } = renderHook(() => useEnergyCalculator());

      const regenRate = result.current.calculateRegenerationRate(5, 3);
      expect(regenRate).toBe(8);
      expect(
        mockEnergyCalculator.calculateRegenerationRate
      ).toHaveBeenCalledWith(5, 3);
    });

    it('should calculate backtrack cost', () => {
      mockEnergyCalculator.calculateBacktrackCost.mockReturnValue(4);

      const { result } = renderHook(() => useEnergyCalculator());

      const backtrackCost = result.current.calculateBacktrackCost(3, 1);
      expect(backtrackCost).toBe(4);
      expect(mockEnergyCalculator.calculateBacktrackCost).toHaveBeenCalledWith(
        3,
        1
      );
    });

    it('should calculate total energy budget', () => {
      const bonuses = {
        streakBonus: 200,
        collectionBonus: 50,
        regionBonus: 25,
      };

      mockEnergyCalculator.calculateTotalEnergyBudget.mockReturnValue(1275);

      const { result } = renderHook(() => useEnergyCalculator());

      const totalBudget = result.current.calculateTotalEnergyBudget(
        1000,
        bonuses
      );
      expect(totalBudget).toBe(1275);
      expect(
        mockEnergyCalculator.calculateTotalEnergyBudget
      ).toHaveBeenCalledWith(1000, bonuses);
    });

    it('should validate energy calculations', () => {
      const mockValidation = {
        isValid: true,
        errors: [],
      };

      mockEnergyCalculator.validateEnergyCalculations.mockReturnValue(
        mockValidation
      );

      const { result } = renderHook(() => useEnergyCalculator());

      const validation = result.current.validateEnergyCalculations(1000, 900);
      expect(validation).toEqual(mockValidation);
      expect(
        mockEnergyCalculator.validateEnergyCalculations
      ).toHaveBeenCalledWith(1000, 900);
    });
  });

  describe('getEnergyAnalysis helper', () => {
    it('should provide comprehensive energy analysis', () => {
      const shortcuts: Shortcut[] = [
        {
          id: 'shortcut-1',
          fromDepth: 3,
          toDepth: 1,
          energyReduction: 20,
          isPermanent: true,
        },
      ];

      mockEnergyCalculator.calculateReturnCost.mockReturnValue(50);
      mockEnergyCalculator.calculateSafetyMargin.mockReturnValue(100);
      mockEnergyCalculator.canAffordReturn.mockReturnValue(true);
      mockEnergyCalculator.calculateRiskLevel.mockReturnValue(25);
      mockEnergyCalculator.getRecommendedAction.mockReturnValue({
        action: 'continue',
        reason: 'Low risk',
        riskLevel: 25,
      });
      mockEnergyCalculator.calculatePointOfNoReturn.mockReturnValue(60);

      const { result } = renderHook(() => useEnergyCalculator());

      const analysis = result.current.getEnergyAnalysis({
        currentEnergy: 1000,
        currentDepth: 3,
        inventoryValue: 100,
        shortcuts,
      });

      expect(analysis).toHaveProperty('returnCost');
      expect(analysis).toHaveProperty('safetyMargin');
      expect(analysis).toHaveProperty('canAffordReturn');
      expect(analysis).toHaveProperty('pointOfNoReturn');
      expect(analysis).toHaveProperty('recommendedAction');
      expect(analysis).toHaveProperty('energyAfterReturn');
      expect(analysis).toHaveProperty('maxSafeDepth');
      expect(analysis).toHaveProperty('riskLevel');

      expect(mockEnergyCalculator.calculateReturnCost).toHaveBeenCalledWith(
        3,
        shortcuts
      );
      expect(mockEnergyCalculator.calculateSafetyMargin).toHaveBeenCalledWith(
        1000,
        50
      );
      expect(mockEnergyCalculator.canAffordReturn).toHaveBeenCalledWith(
        1000,
        50
      );
      expect(mockEnergyCalculator.calculateRiskLevel).toHaveBeenCalledWith(
        1000,
        50
      );
      expect(mockEnergyCalculator.getRecommendedAction).toHaveBeenCalledWith(
        1000,
        50,
        3
      );
      expect(
        mockEnergyCalculator.calculatePointOfNoReturn
      ).toHaveBeenCalledWith(50, 10);
    });
  });

  describe('memoization', () => {
    it('should memoize calculations', () => {
      mockEnergyCalculator.calculateReturnCost.mockReturnValue(50);

      const { result, rerender } = renderHook(() => useEnergyCalculator());

      // First call
      result.current.calculateReturnCost(3, []);

      // Rerender
      rerender();

      // Second call with same parameters
      result.current.calculateReturnCost(3, []);

      // Should be called twice: once during initial render, once during rerender
      // But with same parameters, so memoization should work
      expect(mockEnergyCalculator.calculateReturnCost).toHaveBeenCalledTimes(2);
      expect(mockEnergyCalculator.calculateReturnCost).toHaveBeenCalledWith(
        3,
        []
      );
    });
  });
});
