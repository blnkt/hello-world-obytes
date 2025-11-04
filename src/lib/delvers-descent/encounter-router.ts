import type { DungeonNode } from '@/types/delvers-descent';

export type EncounterRoute =
  | 'puzzle_chamber'
  | 'discovery_site'
  | 'risk_event'
  | 'hazard'
  | 'rest_site'
  | 'safe_passage'
  | 'region_shortcut';

/**
 * Routes dungeon node types to the appropriate encounter screen
 */
export function getEncounterRoute(node: DungeonNode): EncounterRoute | null {
  const routeMap: Record<string, EncounterRoute> = {
    puzzle_chamber: 'puzzle_chamber',
    discovery_site: 'discovery_site',
    risk_event: 'risk_event',
    hazard: 'hazard',
    rest_site: 'rest_site',
    safe_passage: 'safe_passage',
    region_shortcut: 'region_shortcut',
  };

  return routeMap[node.type] || null;
}

/**
 * Check if an encounter type is supported
 */
export function isEncounterSupported(nodeType: string): boolean {
  const supportedTypes = [
    'puzzle_chamber',
    'discovery_site',
    'risk_event',
    'hazard',
    'rest_site',
    'safe_passage',
    'region_shortcut',
  ];
  return supportedTypes.includes(nodeType);
}
