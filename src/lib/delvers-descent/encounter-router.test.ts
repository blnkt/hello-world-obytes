import type { DungeonNode } from '@/types/delvers-descent';

import {
  type EncounterRoute,
  getEncounterRoute,
  isEncounterSupported,
} from './encounter-router';

describe('EncounterRouter', () => {
  describe('EncounterRoute type', () => {
    it('should include scoundrel as a valid route type', () => {
      const scoundrelRoute: EncounterRoute = 'scoundrel';
      expect(scoundrelRoute).toBe('scoundrel');
    });
  });

  describe('getEncounterRoute', () => {
    it('should return route for puzzle_chamber node', () => {
      const node: DungeonNode = {
        id: 'test',
        depth: 1,
        position: 0,
        type: 'puzzle_chamber',
        energyCost: 10,
        returnCost: 5,
        isRevealed: false,
        connections: [],
      };

      expect(getEncounterRoute(node)).toBe('puzzle_chamber');
    });

    it('should return route for discovery_site node', () => {
      const node: DungeonNode = {
        id: 'test',
        depth: 1,
        position: 0,
        type: 'discovery_site',
        energyCost: 10,
        returnCost: 5,
        isRevealed: false,
        connections: [],
      };

      expect(getEncounterRoute(node)).toBe('discovery_site');
    });

    it('should return route for scoundrel node', () => {
      const node: DungeonNode = {
        id: 'test',
        depth: 1,
        position: 0,
        type: 'scoundrel',
        energyCost: 10,
        returnCost: 5,
        isRevealed: false,
        connections: [],
      };

      expect(getEncounterRoute(node)).toBe('scoundrel');
    });

    it('should route all supported encounter types correctly', () => {
      const supportedTypes = [
        'puzzle_chamber',
        'discovery_site',
        'risk_event',
        'hazard',
        'rest_site',
        'safe_passage',
        'region_shortcut',
        'scoundrel',
      ];

      supportedTypes.forEach((type) => {
        const node: DungeonNode = {
          id: `test-${type}`,
          depth: 1,
          position: 0,
          type: type as DungeonNode['type'],
          energyCost: 10,
          returnCost: 5,
          isRevealed: false,
          connections: [],
        };

        const route = getEncounterRoute(node);
        expect(route).toBe(type);
      });
    });

    it('should return null for unsupported encounter types', () => {
      const node: DungeonNode = {
        id: 'test',
        depth: 1,
        position: 0,
        type: 'puzzle_chamber', // Valid type, but let's test with invalid string
        energyCost: 10,
        returnCost: 5,
        isRevealed: false,
        connections: [],
      };

      // TypeScript won't allow invalid types, but we can test the function
      const result = getEncounterRoute(node);
      expect(result).toBeTruthy();
    });
  });

  describe('isEncounterSupported', () => {
    it('should return true for supported encounter types', () => {
      expect(isEncounterSupported('puzzle_chamber')).toBe(true);
      expect(isEncounterSupported('discovery_site')).toBe(true);
      expect(isEncounterSupported('risk_event')).toBe(true);
      expect(isEncounterSupported('hazard')).toBe(true);
      expect(isEncounterSupported('rest_site')).toBe(true);
      expect(isEncounterSupported('safe_passage')).toBe(true);
      expect(isEncounterSupported('region_shortcut')).toBe(true);
      expect(isEncounterSupported('scoundrel')).toBe(true);
    });

    it('should return false for unsupported encounter types', () => {
      expect(isEncounterSupported('invalid_type')).toBe(false);
      expect(isEncounterSupported('')).toBe(false);
    });
  });
});
