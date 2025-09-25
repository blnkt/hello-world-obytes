import { useCallback, useEffect, useState } from 'react';
import { useMMKVString } from 'react-native-mmkv';

import { storage } from '../../../lib/storage';
import {
  getDungeonGameSaveDataInfo,
  hasDungeonGameSaveData,
} from '../../../lib/storage/dungeon-game-persistence';
import type {
  DungeonGameSaveData,
  PersistenceMetadata,
} from '../../../types/dungeon-game';
import { useDungeonGameAsyncOperations } from './use-dungeon-game-async-operations';

const DUNGEON_GAME_SAVE_KEY = 'DUNGEON_GAME_SAVE';

export const useDungeonGamePersistence = () => {
  const [saveDataString] = useMMKVString(DUNGEON_GAME_SAVE_KEY, storage);

  const [saveData, setSaveData] = useState<DungeonGameSaveData | null>(null);
  const [saveDataInfo, setSaveDataInfo] = useState<PersistenceMetadata | null>(
    null
  );

  const { isLoading, lastError, saveGameState, loadGameState, clearGameState } =
    useDungeonGameAsyncOperations();

  // Parse save data when the string changes
  useEffect(() => {
    if (saveDataString) {
      try {
        const parsed = JSON.parse(saveDataString);
        setSaveData(parsed);
      } catch {
        setSaveData(null);
      }
    } else {
      setSaveData(null);
    }
  }, [saveDataString]);

  // Update save data info when save data changes
  useEffect(() => {
    const info = getDungeonGameSaveDataInfo();
    setSaveDataInfo(info);
  }, [saveData]);

  const hasExistingSaveData = useCallback((): boolean => {
    return hasDungeonGameSaveData();
  }, []);

  const refreshSaveDataInfo = useCallback((): void => {
    const info = getDungeonGameSaveDataInfo();
    setSaveDataInfo(info);
  }, []);

  return {
    // State
    saveData,
    saveDataInfo,
    isLoading,
    lastError,
    hasExistingSaveData,

    // Actions
    saveGameState,
    loadGameState,
    clearGameState,
    refreshSaveDataInfo,

    // Computed
    canResume: saveData !== null && saveData.gameState === 'Active',
    lastSaveTime: saveData?.timestamp || null,
    gameLevel: saveData?.level || null,
    gameState: saveData?.gameState || null,
  };
};
