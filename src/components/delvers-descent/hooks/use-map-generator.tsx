import { useMemo } from 'react';

import { getDungeonMapGenerator } from '@/lib/delvers-descent/map-generator';
import type { DungeonNode } from '@/types/delvers-descent';

// eslint-disable-next-line max-lines-per-function
export const useMapGenerator = () => {
  const mapGenerator = getDungeonMapGenerator();

  const generateDepthLevel = useMemo(() => {
    return (depth: number): DungeonNode[] => {
      return mapGenerator.generateDepthLevel(depth);
    };
  }, [mapGenerator]);

  const generateFullMap = useMemo(() => {
    return (maxDepth: number = 5): DungeonNode[] => {
      return mapGenerator.generateFullMap(maxDepth);
    };
  }, [mapGenerator]);

  const getNodesAtDepth = useMemo(() => {
    return (map: DungeonNode[], depth: number): DungeonNode[] => {
      return map.filter((node: DungeonNode) => node.depth === depth);
    };
  }, []);

  const getConnectedNodes = useMemo(() => {
    return (map: DungeonNode[], nodeId: string): DungeonNode[] => {
      const currentNode = map.find((node: DungeonNode) => node.id === nodeId);
      if (!currentNode) return [];

      return map.filter((node: DungeonNode) =>
        currentNode.connections.includes(node.id)
      );
    };
  }, []);

  const validateMap = useMemo(() => {
    return (map: DungeonNode[]): boolean => {
      const validation = mapGenerator.validateMap(map);
      return validation.isValid;
    };
  }, [mapGenerator]);

  const getMapStatistics = useMemo(() => {
    return (map: DungeonNode[]) => {
      const totalNodes = map.length;
      const maxDepth = Math.max(...map.map((node: DungeonNode) => node.depth));
      const encounterTypes = map.reduce(
        (acc: Record<string, number>, node: DungeonNode) => {
          const type = node.type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {}
      );
      const totalEnergyCost = map.reduce(
        (acc: number, node: DungeonNode) => acc + node.energyCost,
        0
      );
      const totalReturnCost = map.reduce(
        (acc: number, node: DungeonNode) => acc + node.returnCost,
        0
      );

      return {
        totalNodes,
        maxDepth,
        encounterTypes,
        totalEnergyCost,
        totalReturnCost,
        averageEnergyCost: totalEnergyCost / totalNodes,
        averageReturnCost: totalReturnCost / totalNodes,
      };
    };
  }, []);

  const getPathToNode = useMemo(() => {
    return (map: DungeonNode[], targetNodeId: string): DungeonNode[] => {
      const targetNode = map.find(
        (node: DungeonNode) => node.id === targetNodeId
      );
      if (!targetNode) return [];

      const path: DungeonNode[] = [];
      let currentNode: DungeonNode | undefined = targetNode;

      while (currentNode) {
        path.unshift(currentNode);
        const parentNode = map.find((node: DungeonNode) =>
          node.connections.includes(currentNode!.id)
        );
        currentNode = parentNode;
      }

      return path;
    };
  }, []);

  const getAvailableMoves = useMemo(() => {
    return (map: DungeonNode[], currentNodeId: string): DungeonNode[] => {
      const currentNode = map.find(
        (node: DungeonNode) => node.id === currentNodeId
      );
      if (!currentNode) return [];

      return map.filter((node: DungeonNode) =>
        currentNode.connections.includes(node.id)
      );
    };
  }, []);

  const calculatePathEnergyCost = useMemo(() => {
    return (path: DungeonNode[]): number => {
      if (path.length < 2) return 0;

      return path.reduce(
        (total: number, node: DungeonNode) => total + node.energyCost,
        0
      );
    };
  }, []);

  return {
    generateDepthLevel,
    generateFullMap,
    getNodesAtDepth,
    getConnectedNodes,
    validateMap,
    getMapStatistics,
    getPathToNode,
    getAvailableMoves,
    calculatePathEnergyCost,
  };
};
