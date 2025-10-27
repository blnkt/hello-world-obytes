import React, { useEffect, useState } from 'react';

import { type CollectionManager } from '@/lib/delvers-descent/collection-manager';
import { ALL_COLLECTION_SETS } from '@/lib/delvers-descent/collection-sets';
import type {
  CollectionProgress,
  CollectionSet,
  CollectionStatistics,
} from '@/types/delvers-descent';

export interface CollectionOverviewProps {
  collectionManager: CollectionManager;
  onSetSelect?: (setId: string) => void;
}

const SetCard: React.FC<{
  set: CollectionSet;
  progress: number;
  isCompleted: boolean;
  onSelect?: () => void;
}> = ({ set, progress, isCompleted, onSelect }) => (
  <button
    onClick={onSelect}
    data-testid={`set-card-${set.id}`}
    className={`rounded-lg border-2 p-4 text-left transition-all ${
      isCompleted
        ? 'border-green-500 bg-green-50'
        : 'border-gray-300 bg-white hover:border-blue-400'
    }`}
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-gray-800">{set.name}</h3>
        <p className="text-sm text-gray-600">{set.description}</p>
        <div className="mt-2 flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            Progress: {progress}/{set.items.length}
          </span>
          {isCompleted && (
            <span className="text-xs font-semibold text-green-600">
              ✓ Complete
            </span>
          )}
        </div>
      </div>
      <div className="text-right">
        <div
          className={`text-sm font-semibold ${
            isCompleted ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          {Math.round((progress / set.items.length) * 100)}%
        </div>
        <div
          className={`mt-1 h-2 w-16 overflow-hidden rounded-full ${
            isCompleted ? 'bg-green-500' : 'bg-gray-200'
          }`}
        >
          <div
            className={`h-full ${isCompleted ? 'bg-green-600' : 'bg-blue-500'}`}
            style={{
              width: `${Math.min(100, (progress / set.items.length) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  </button>
);

const StatsSection: React.FC<{
  statistics: CollectionStatistics;
}> = ({ statistics }) => (
  <div className="mb-6 rounded-lg bg-gray-50 p-6">
    <h2 className="mb-4 text-xl font-semibold text-gray-800">
      Collection Statistics
    </h2>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">
          {statistics.totalItemsCollected}
        </div>
        <div className="text-sm text-gray-600">Items Collected</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          {statistics.setsCompleted}
        </div>
        <div className="text-sm text-gray-600">Sets Completed</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">
          {Math.round(statistics.collectionCompletionRate * 100)}%
        </div>
        <div className="text-sm text-gray-600">Completion Rate</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">
          {statistics.totalRunsCompleted}
        </div>
        <div className="text-sm text-gray-600">Runs Completed</div>
      </div>
    </div>
  </div>
);

const CategorySection: React.FC<{
  title: string;
  sets: CollectionSet[];
  progress: CollectionProgress;
  onSetSelect?: (setId: string) => void;
}> = ({ title, sets, progress, onSetSelect }) => {
  const categoryStats =
    progress.byCategory[
      title.toLowerCase().replace(' ', '_') as
        | 'trade_goods'
        | 'discoveries'
        | 'legendaries'
    ];

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <span className="text-sm text-gray-600">
          {categoryStats.collected} / {categoryStats.total} collected
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sets.map((set) => {
          const setProgress = progress.partialSets.find(
            (p: { setId: string }) => p.setId === set.id
          );
          const collected =
            setProgress?.collected ??
            (progress.completedSets.includes(set.id) ? set.items.length : 0);
          const isCompleted = progress.completedSets.includes(set.id);

          return (
            <SetCard
              key={set.id}
              set={set}
              progress={collected}
              isCompleted={isCompleted}
              onSelect={() => onSetSelect?.(set.id)}
            />
          );
        })}
      </div>
    </div>
  );
};

const LoadingView: React.FC = () => (
  <div
    data-testid="collection-overview-loading"
    className="flex h-screen items-center justify-center"
  >
    <div className="text-center">
      <div className="text-xl text-gray-600">Loading collection...</div>
    </div>
  </div>
);

const getSetsByCategory = (category: string) =>
  ALL_COLLECTION_SETS.filter((s) => s.category === category);

const CollectionContent: React.FC<{
  statistics: CollectionStatistics;
  progress: CollectionProgress;
  onSetSelect?: (setId: string) => void;
}> = ({ statistics, progress, onSetSelect }) => {
  const tradeGoodsSets = getSetsByCategory('trade_goods');
  const discoverySets = getSetsByCategory('discoveries');
  const legendarySets = getSetsByCategory('legendaries');

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">My Collection</h1>
        <p className="mt-2 text-gray-600">
          Track your progress across all collection sets and unlock bonuses
        </p>
      </div>

      <StatsSection statistics={statistics} />

      <CategorySection
        title="Trade Goods"
        sets={tradeGoodsSets}
        progress={progress}
        onSetSelect={onSetSelect}
      />

      <CategorySection
        title="Discoveries"
        sets={discoverySets}
        progress={progress}
        onSetSelect={onSetSelect}
      />

      <CategorySection
        title="Legendaries"
        sets={legendarySets}
        progress={progress}
        onSetSelect={onSetSelect}
      />
    </div>
  );
};

/**
 * CollectionOverview - Main collection management screen
 *
 * Displays all collection sets organized by category with progress tracking.
 */
export const CollectionOverview: React.FC<CollectionOverviewProps> = ({
  collectionManager,
  onSetSelect,
}) => {
  const [progress, setProgress] = useState<CollectionProgress | null>(null);
  const [statistics, setStatistics] = useState<CollectionStatistics | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const prog = await collectionManager.getCollectionProgress();
        const stats = await collectionManager.getCollectionStatistics();
        setProgress(prog);
        setStatistics(stats);
      } catch (error) {
        console.error('Failed to load collection data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [collectionManager]);

  if (loading || !progress || !statistics) {
    return <LoadingView />;
  }

  return (
    <div
      data-testid="collection-overview"
      className="min-h-screen bg-gray-50 p-6"
    >
      <CollectionContent
        statistics={statistics}
        progress={progress}
        onSetSelect={onSetSelect}
      />
    </div>
  );
};
