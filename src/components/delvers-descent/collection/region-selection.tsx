import React, { useEffect, useState } from 'react';

import type { RegionManager } from '@/lib/delvers-descent/region-manager';
import type { Region } from '@/types/delvers-descent';

export interface RegionSelectionProps {
  regionManager: RegionManager;
  onRegionSelect: (regionId: string) => void;
  initialRegionId?: string;
}

const RegionCard: React.FC<{
  region: Region;
  isUnlocked: boolean;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ region, isUnlocked, isSelected, onSelect }) => (
  <button
    onClick={onSelect}
    disabled={!isUnlocked}
    data-testid={`region-card-${region.id}`}
    className={`rounded-lg border-2 p-6 text-left transition-all ${
      isSelected
        ? 'border-blue-500 bg-blue-50'
        : isUnlocked
          ? 'border-gray-300 bg-white hover:border-blue-400'
          : 'border-gray-200 bg-gray-100 opacity-50'
    }`}
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-gray-800">{region.name}</h3>
        <p className="mt-1 text-sm text-gray-600">{region.description}</p>
        <div className="mt-2 flex items-center space-x-4 text-xs">
          <span className="text-gray-500">
            Energy Bonus: +{region.startingBonus.energyBonus}
          </span>
          <span className="text-gray-500">
            Items Bonus: +{region.startingBonus.itemsBonus}
          </span>
        </div>
      </div>
      <div>
        {!isUnlocked && (
          <span className="rounded bg-gray-300 px-2 py-1 text-xs text-gray-600">
            Locked
          </span>
        )}
        {isSelected && (
          <span className="rounded bg-blue-500 px-2 py-1 text-xs text-white">
            Selected
          </span>
        )}
      </div>
    </div>
  </button>
);

const RegionLoadingView: React.FC = () => (
  <div
    data-testid="region-selection-loading"
    className="flex h-screen items-center justify-center"
  >
    <div className="text-xl text-gray-600">Loading regions...</div>
  </div>
);

const RegionList: React.FC<{
  regions: Region[];
  unlockedRegions: string[];
  selectedRegionId: string | null;
  onSelect: (regionId: string) => void;
}> = ({ regions, unlockedRegions, selectedRegionId, onSelect }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    {regions.map((region) => {
      const isUnlocked = unlockedRegions.includes(region.id);
      const isSelected = selectedRegionId === region.id;

      return (
        <RegionCard
          key={region.id}
          region={region}
          isUnlocked={isUnlocked}
          isSelected={isSelected}
          onSelect={() => onSelect(region.id)}
        />
      );
    })}
  </div>
);

export const RegionSelection: React.FC<RegionSelectionProps> = ({
  regionManager,
  onRegionSelect,
  initialRegionId,
}) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [unlockedRegions, setUnlockedRegions] = useState<string[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(
    initialRegionId || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const allRegions = regionManager.getAllRegions();
        const unlocked = await regionManager.getUnlockedRegions();
        const unlockedIds = unlocked.map((r) => r.id);

        setRegions(allRegions);
        setUnlockedRegions(unlockedIds);
      } catch (error) {
        console.error('Failed to load regions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [regionManager]);

  const handleRegionSelect = async (regionId: string) => {
    if (!unlockedRegions.includes(regionId)) {
      return; // Don't allow selection of locked regions
    }

    setSelectedRegionId(regionId);
    onRegionSelect(regionId);
  };

  if (loading) {
    return <RegionLoadingView />;
  }

  return (
    <div data-testid="region-selection" className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Select Region</h1>
          <p className="mt-2 text-gray-600">
            Choose your starting region. Each region offers unique encounters
            and bonuses.
          </p>
        </div>

        <RegionList
          regions={regions}
          unlockedRegions={unlockedRegions}
          selectedRegionId={selectedRegionId}
          onSelect={handleRegionSelect}
        />
      </div>
    </div>
  );
};
