import React, { useEffect, useState } from 'react';

import type { CollectionManager } from '@/lib/delvers-descent/collection-manager';
import { getCollectionSetById } from '@/lib/delvers-descent/collection-sets';
import type { CollectedItemTracking } from '@/types/delvers-descent';

export interface SetDetailViewProps {
  collectionManager: CollectionManager;
  setId: string;
  onBack: () => void;
}

const ItemCard: React.FC<{
  itemName: string;
  isCollected: boolean;
}> = ({ itemName, isCollected }) => (
  <div
    className={`rounded-lg border-2 p-3 ${
      isCollected ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'
    }`}
  >
    <div className="flex items-center justify-between">
      <span
        className={`font-medium ${
          isCollected ? 'text-green-800' : 'text-gray-600'
        }`}
      >
        {itemName}
      </span>
      {isCollected && <span className="text-green-600">✓</span>}
    </div>
  </div>
);

const SetNotFoundView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="p-6 text-center">
    <div className="text-xl text-red-600">Set not found</div>
    <button onClick={onBack} className="mt-4 rounded-lg bg-gray-200 px-4 py-2">
      Go Back
    </button>
  </div>
);

const SetDetailContent: React.FC<{
  set: ReturnType<typeof getCollectionSetById>;
  collectedItemIds: Set<string>;
  collectedCount: number;
  onBack: () => void;
}> = ({ set, collectedItemIds, collectedCount, onBack }) => (
  <div className="mx-auto max-w-4xl">
    <button onClick={onBack} className="mb-4 text-blue-600 hover:text-blue-800">
      ← Back to Collection
    </button>

    <div className="mb-6 rounded-lg bg-white p-6 shadow-lg">
      <h1 className="mb-2 text-3xl font-bold text-gray-800">{set!.name}</h1>
      <p className="text-gray-600">{set!.description}</p>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="font-semibold text-blue-600">
            {collectedCount} / {set!.items.length}
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{
              width: `${(collectedCount / set!.items.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>

    <div className="rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Items</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {set!.items.map((item) => {
          const isCollected = collectedItemIds.has(item.id);
          return (
            <ItemCard
              key={item.id}
              itemName={item.name}
              isCollected={isCollected}
            />
          );
        })}
      </div>
    </div>

    {set!.bonuses.length > 0 && (
      <div className="mt-6 rounded-lg bg-yellow-50 p-6">
        <h2 className="mb-4 text-xl font-semibold text-yellow-800">
          Completion Bonuses
        </h2>
        <ul className="space-y-2">
          {set!.bonuses.map((bonus, index) => (
            <li key={index} className="flex items-center text-yellow-700">
              <span className="mr-2">★</span>
              {bonus.description}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export const SetDetailView: React.FC<SetDetailViewProps> = ({
  collectionManager,
  setId,
  onBack,
}) => {
  const [collectedItems, setCollectedItems] = useState<CollectedItemTracking[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const items = await collectionManager.getCollectedItems();
        setCollectedItems(items.filter((item) => item.setId === setId));
      } catch (error) {
        console.error('Failed to load collected items:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [collectionManager, setId]);

  const set = getCollectionSetById(setId);
  if (!set) {
    return <SetNotFoundView onBack={onBack} />;
  }

  const collectedItemIds = new Set(collectedItems.map((item) => item.itemId));
  const collectedCount = collectedItemIds.size;

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div data-testid="set-detail-view" className="min-h-screen bg-gray-50 p-6">
      <SetDetailContent
        set={set}
        collectedItemIds={collectedItemIds}
        collectedCount={collectedCount}
        onBack={onBack}
      />
    </div>
  );
};
