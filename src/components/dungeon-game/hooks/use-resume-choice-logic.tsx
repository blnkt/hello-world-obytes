import { useCallback, useEffect, useState } from 'react';

import { type PersistenceMetadata } from '@/types/dungeon-game';

import { useDungeonGamePersistence } from './use-dungeon-game-persistence';

export interface ResumeChoiceLogicConfig {
  onResume: () => void;
  onNewGame: () => void;
}

export interface ResumeChoiceLogicReturn {
  isModalVisible: boolean;
  saveDataInfo: PersistenceMetadata | null;
  shouldShowResumeChoice: boolean;
  handleResume: () => void;
  handleNewGame: () => void;
  handleCloseModal: () => void;
}

export const useResumeChoiceLogic = ({
  onResume,
  onNewGame,
}: ResumeChoiceLogicConfig): ResumeChoiceLogicReturn => {
  const { hasExistingSaveData, saveDataInfo, isLoading, lastError } =
    useDungeonGamePersistence();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const shouldShowResumeChoice = useCallback(() => {
    return (
      hasExistingSaveData &&
      saveDataInfo?.isValid === true &&
      !isLoading &&
      !lastError
    );
  }, [hasExistingSaveData, saveDataInfo?.isValid, isLoading, lastError]);

  const handleResume = useCallback(() => {
    onResume();
    setIsModalVisible(false);
  }, [onResume]);

  const handleNewGame = useCallback(() => {
    onNewGame();
    setIsModalVisible(false);
  }, [onNewGame]);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  useEffect(() => {
    if (shouldShowResumeChoice()) {
      setIsModalVisible(true);
    }
  }, [shouldShowResumeChoice]);

  return {
    isModalVisible,
    saveDataInfo,
    shouldShowResumeChoice: shouldShowResumeChoice(),
    handleResume,
    handleNewGame,
    handleCloseModal,
  };
};
