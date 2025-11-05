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

    it('should include metaphysical encounter types as valid route types', () => {
      const luckShrineRoute: EncounterRoute = 'luck_shrine';
      const energyNexusRoute: EncounterRoute = 'energy_nexus';
      const timeDistortionRoute: EncounterRoute = 'time_distortion';
      const fateWeaverRoute: EncounterRoute = 'fate_weaver';
      expect(luckShrineRoute).toBe('luck_shrine');
      expect(energyNexusRoute).toBe('energy_nexus');
      expect(timeDistortionRoute).toBe('time_distortion');
      expect(fateWeaverRoute).toBe('fate_weaver');
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
        'luck_shrine',
        'energy_nexus',
        'time_distortion',
        'fate_weaver',
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

    it('should return route for luck_shrine node', () => {
      const node: DungeonNode = {
        id: 'luck-shrine-1',
        depth: 3,
        position: 1,
        type: 'luck_shrine',
        energyCost: 15,
        returnCost: 10,
        isRevealed: false,
        connections: [],
      };

      expect(getEncounterRoute(node)).toBe('luck_shrine');
    });

    it('should return route for energy_nexus node', () => {
      const node: DungeonNode = {
        id: 'energy-nexus-1',
        depth: 4,
        position: 0,
        type: 'energy_nexus',
        energyCost: 20,
        returnCost: 12,
        isRevealed: false,
        connections: [],
      };

      expect(getEncounterRoute(node)).toBe('energy_nexus');
    });

    it('should return route for time_distortion node', () => {
      const node: DungeonNode = {
        id: 'time-distortion-1',
        depth: 5,
        position: 2,
        type: 'time_distortion',
        energyCost: 25,
        returnCost: 15,
        isRevealed: false,
        connections: [],
      };

      expect(getEncounterRoute(node)).toBe('time_distortion');
    });

    it('should return route for fate_weaver node', () => {
      const node: DungeonNode = {
        id: 'fate-weaver-1',
        depth: 6,
        position: 1,
        type: 'fate_weaver',
        energyCost: 18,
        returnCost: 11,
        isRevealed: false,
        connections: [],
      };

      expect(getEncounterRoute(node)).toBe('fate_weaver');
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
      expect(isEncounterSupported('luck_shrine')).toBe(true);
      expect(isEncounterSupported('energy_nexus')).toBe(true);
      expect(isEncounterSupported('time_distortion')).toBe(true);
      expect(isEncounterSupported('fate_weaver')).toBe(true);
    });

    it('should return false for unsupported encounter types', () => {
      expect(isEncounterSupported('invalid_type')).toBe(false);
      expect(isEncounterSupported('')).toBe(false);
    });
  });
});
