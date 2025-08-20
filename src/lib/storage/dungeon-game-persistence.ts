import type {
  DungeonGameSaveData,
  LoadOperationResult,
  PersistenceMetadata,
  SaveOperationResult,
} from '../../types/dungeon-game';
import { storage } from '../storage';

const DUNGEON_GAME_SAVE_KEY = 'DUNGEON_GAME_SAVE';
const DUNGEON_GAME_SAVE_VERSION = '1.0.0';

export class DungeonGamePersistenceService {
  private static instance: DungeonGamePersistenceService;
  private saveCount = 0;

  static getInstance(): DungeonGamePersistenceService {
    if (!DungeonGamePersistenceService.instance) {
      DungeonGamePersistenceService.instance =
        new DungeonGamePersistenceService();
    }
    return DungeonGamePersistenceService.instance;
  }

  async saveGameState(
    saveData: Omit<DungeonGameSaveData, 'version' | 'timestamp'>
  ): Promise<SaveOperationResult> {
    try {
      const completeSaveData: DungeonGameSaveData = {
        ...saveData,
        version: DUNGEON_GAME_SAVE_VERSION,
        timestamp: Date.now(),
      };

      const jsonString = JSON.stringify(completeSaveData);
      const dataSize = new Blob([jsonString]).size;

      storage.set(DUNGEON_GAME_SAVE_KEY, jsonString);
      this.saveCount++;

      const metadata: PersistenceMetadata = {
        lastSaveTime: completeSaveData.timestamp,
        saveCount: this.saveCount,
        dataSize,
        isValid: true,
      };

      return {
        success: true,
        metadata,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error during save',
      };
    }
  }

  async loadGameState(): Promise<LoadOperationResult> {
    try {
      const saveDataString = storage.getString(DUNGEON_GAME_SAVE_KEY);

      if (!saveDataString) {
        return {
          success: false,
          error: 'No save data found',
        };
      }

      const saveData: DungeonGameSaveData = JSON.parse(saveDataString);

      // Validate save data structure
      if (!this.validateSaveData(saveData)) {
        return {
          success: false,
          error: 'Invalid save data structure',
        };
      }

      // Check version compatibility
      if (saveData.version !== DUNGEON_GAME_SAVE_VERSION) {
        return {
          success: false,
          error: `Incompatible save version: ${saveData.version}`,
        };
      }

      const dataSize = new Blob([saveDataString]).size;
      const metadata: PersistenceMetadata = {
        lastSaveTime: saveData.timestamp,
        saveCount: this.saveCount,
        dataSize,
        isValid: true,
      };

      return {
        success: true,
        data: saveData,
        metadata,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error during load',
      };
    }
  }

  hasSaveData(): boolean {
    return storage.contains(DUNGEON_GAME_SAVE_KEY);
  }

  async clearSaveData(): Promise<boolean> {
    try {
      storage.delete(DUNGEON_GAME_SAVE_KEY);
      this.saveCount = 0;
      return true;
    } catch (error) {
      return false;
    }
  }

  getSaveDataInfo(): PersistenceMetadata | null {
    try {
      const saveDataString = storage.getString(DUNGEON_GAME_SAVE_KEY);
      if (!saveDataString) {
        return null;
      }

      const saveData: DungeonGameSaveData = JSON.parse(saveDataString);
      const dataSize = new Blob([saveDataString]).size;

      return {
        lastSaveTime: saveData.timestamp,
        saveCount: this.saveCount,
        dataSize,
        isValid: this.validateSaveData(saveData),
      };
    } catch {
      return null;
    }
  }

  private validateSaveData(saveData: any): saveData is DungeonGameSaveData {
    return (
      saveData &&
      typeof saveData === 'object' &&
      typeof saveData.version === 'string' &&
      typeof saveData.timestamp === 'number' &&
      typeof saveData.gameState === 'string' &&
      ['Active', 'Win', 'Game Over'].includes(saveData.gameState) &&
      typeof saveData.level === 'number' &&
      Array.isArray(saveData.gridState) &&
      typeof saveData.turnsUsed === 'number' &&
      saveData.achievements &&
      typeof saveData.achievements === 'object' &&
      saveData.statistics &&
      typeof saveData.statistics === 'object' &&
      Array.isArray(saveData.itemEffects)
    );
  }
}

// Export singleton instance
export const dungeonGamePersistence =
  DungeonGamePersistenceService.getInstance();

// Convenience functions for direct usage
export async function saveDungeonGameState(
  saveData: Omit<DungeonGameSaveData, 'version' | 'timestamp'>
): Promise<SaveOperationResult> {
  return dungeonGamePersistence.saveGameState(saveData);
}

export async function loadDungeonGameState(): Promise<LoadOperationResult> {
  return dungeonGamePersistence.loadGameState();
}

export function hasDungeonGameSaveData(): boolean {
  return dungeonGamePersistence.hasSaveData();
}

export async function clearDungeonGameSaveData(): Promise<boolean> {
  return dungeonGamePersistence.clearSaveData();
}

export function getDungeonGameSaveDataInfo(): PersistenceMetadata | null {
  return dungeonGamePersistence.getSaveDataInfo();
}
