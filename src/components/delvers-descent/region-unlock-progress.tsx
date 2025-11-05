import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import type { CollectionManager } from '@/lib/delvers-descent/collection-manager';
import type { RegionManager } from '@/lib/delvers-descent/region-manager';
import {
  getAllRegionUnlockProgress,
  getRegionUnlockProgress,
  type RegionUnlockProgress as RegionUnlockProgressType,
} from '@/lib/delvers-descent/region-unlock-progress-helper';

interface RegionUnlockProgressProps {
  collectionSetId?: string;
  collectionManager: CollectionManager;
  regionManager?: RegionManager;
}

const ProgressBar: React.FC<{
  current: number;
  total: number;
  isComplete: boolean;
  isUnlocked: boolean;
}> = ({ current, total, isComplete, isUnlocked }) => {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  let bgColor = 'bg-blue-500';
  if (isUnlocked) {
    bgColor = 'bg-green-500';
  } else if (isComplete) {
    bgColor = 'bg-yellow-500';
  }

  return (
    <View className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
      <View
        className={`h-full ${bgColor}`}
        style={{ width: `${percentage}%` }}
        testID="progress-bar-fill"
      />
    </View>
  );
};

const RegionProgressItem: React.FC<{
  progress: RegionUnlockProgressType;
}> = ({ progress }) => {
  const statusText = progress.isUnlocked
    ? 'Unlocked'
    : progress.isComplete
      ? 'Ready to Unlock'
      : `${progress.itemsCollected}/${progress.itemsTotal} items`;

  return (
    <View
      className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      testID={`region-progress-${progress.regionId}`}
    >
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-gray-800">
          {progress.regionName}
        </Text>
        <View
          className={`rounded-full px-3 py-1 ${
            progress.isUnlocked
              ? 'bg-green-100'
              : progress.isComplete
                ? 'bg-yellow-100'
                : 'bg-gray-100'
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              progress.isUnlocked
                ? 'text-green-800'
                : progress.isComplete
                  ? 'text-yellow-800'
                  : 'text-gray-800'
            }`}
          >
            {statusText}
          </Text>
        </View>
      </View>
      <Text className="mb-2 text-sm text-gray-600">
        {progress.collectionSetName}
      </Text>
      {!progress.isUnlocked && (
        <View className="mt-2">
          <ProgressBar
            current={progress.itemsCollected}
            total={progress.itemsTotal}
            isComplete={progress.isComplete}
            isUnlocked={progress.isUnlocked}
          />
        </View>
      )}
    </View>
  );
};

export const RegionUnlockProgress: React.FC<RegionUnlockProgressProps> = ({
  collectionSetId,
  collectionManager,
  regionManager,
}) => {
  const [progressData, setProgressData] = useState<RegionUnlockProgressType[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      setIsLoading(true);
      try {
        if (collectionSetId) {
          // Show progress for a specific collection set
          const progress = await getRegionUnlockProgress(
            collectionSetId,
            collectionManager,
            regionManager
          );
          setProgressData(progress ? [progress] : []);
        } else {
          // Show progress for all region unlock sets
          const allProgress = await getAllRegionUnlockProgress(
            collectionManager,
            regionManager
          );
          setProgressData(allProgress);
        }
      } catch (error) {
        console.error('Failed to load region unlock progress:', error);
        setProgressData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [collectionSetId, collectionManager, regionManager]);

  if (isLoading) {
    return (
      <View className="rounded-lg bg-white p-4 shadow-sm">
        <Text className="text-gray-600">Loading progress...</Text>
      </View>
    );
  }

  if (!progressData || progressData.length === 0) {
    return null;
  }

  return (
    <View
      className="mb-6 rounded-lg bg-white p-6 shadow-lg"
      testID="region-unlock-progress"
    >
      <Text className="mb-4 text-xl font-semibold text-gray-800">
        Region Unlock Progress
      </Text>
      <View>
        {progressData.map((progress) => (
          <RegionProgressItem key={progress.regionId} progress={progress} />
        ))}
      </View>
    </View>
  );
};
