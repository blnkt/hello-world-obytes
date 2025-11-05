import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  type AdvancedEncounterOutcome,
  type EnergyNexusEncounter,
  type EnergyNexusState,
} from '@/lib/delvers-descent/energy-nexus-encounter';
import type { RunState } from '@/types/delvers-descent';

export interface EnergyNexusScreenProps {
  /** The energy nexus encounter state */
  encounter: EnergyNexusEncounter;
  /** Current run state to check energy and inventory */
  runState?: RunState | null;
  /** Callback when encounter completes */
  onComplete: (outcome: AdvancedEncounterOutcome) => void;
  /** Callback to return to map */
  onReturn: () => void;
}

const EnergyNexusHeader: React.FC = () => (
  <View className="mb-6">
    <View className="mx-auto mb-4 size-20 items-center justify-center rounded-full bg-blue-500">
      <Text className="text-5xl text-white">⚡</Text>
    </View>
    <Text className="text-center text-3xl font-bold text-gray-800">
      Energy Nexus
    </Text>
    <Text className="mt-2 text-center text-gray-600">
      A mystical nexus that allows you to convert between items and energy.
    </Text>
  </View>
);

const ConversionRateDisplay: React.FC<{ rate: number }> = ({ rate }) => (
  <View className="mb-6 rounded-lg bg-blue-50 p-6">
    <Text className="mb-4 text-lg font-semibold text-blue-800">
      Conversion Rate
    </Text>
    <View className="rounded bg-white p-4">
      <Text className="text-center text-xl font-bold text-blue-600">
        1 Item Value = {rate} Energy
      </Text>
      <Text className="mt-2 text-center text-sm text-gray-600">
        (or {rate} Energy = 1 Item Value)
      </Text>
    </View>
  </View>
);

const ResourceDisplay: React.FC<{
  energy: number;
  inventoryValue: number;
  itemCount: number;
}> = ({ energy, inventoryValue, itemCount }) => (
  <View className="mb-6 rounded-lg bg-gray-50 p-6">
    <Text className="mb-4 text-lg font-semibold text-gray-800">
      Your Resources
    </Text>
    <View className="gap-3">
      <View className="flex-row items-center justify-between rounded bg-white p-4">
        <Text className="text-gray-700">Current Energy:</Text>
        <Text className="text-xl font-bold text-blue-600">{energy}</Text>
      </View>
      <View className="flex-row items-center justify-between rounded bg-white p-4">
        <Text className="text-gray-700">Inventory Value:</Text>
        <Text className="text-xl font-bold text-gray-800">
          {inventoryValue} ({itemCount} item{itemCount !== 1 ? 's' : ''})
        </Text>
      </View>
    </View>
  </View>
);

const ConversionPreviews: React.FC<{
  encounter: EnergyNexusEncounter;
  inventory: { value: number }[];
  currentEnergy: number;
  canConvertItems: boolean;
  canConvertEnergy: boolean;
}> = ({
  encounter,
  inventory,
  currentEnergy,
  canConvertItems,
  canConvertEnergy,
}) => {
  const totalItemValue = inventory.reduce((sum, item) => sum + item.value, 0);
  const energyFromItems =
    totalItemValue * encounter.getState().config.conversionRate;
  const energyToConvert = Math.floor(currentEnergy / 10) * 10;
  const itemValueFromEnergy = encounter.convertEnergyToItems(energyToConvert);

  return (
    <View className="mb-6 gap-4">
      {canConvertItems && (
        <View className="rounded-lg bg-green-50 p-4">
          <Text className="font-semibold text-green-800">
            Items → Energy Preview:
          </Text>
          <Text className="mt-1 text-green-700">
            {totalItemValue} item value → {energyFromItems} energy
          </Text>
        </View>
      )}
      {canConvertEnergy && (
        <View className="rounded-lg bg-green-50 p-4">
          <Text className="font-semibold text-green-800">
            Energy → Items Preview:
          </Text>
          <Text className="mt-1 text-green-700">
            {energyToConvert} energy → {itemValueFromEnergy} item value
          </Text>
        </View>
      )}
    </View>
  );
};

const ConversionButtons: React.FC<{
  onConvertItems: () => void;
  onConvertEnergy: () => void;
  canConvertItems: boolean;
  canConvertEnergy: boolean;
  isResolved: boolean;
}> = ({
  onConvertItems,
  onConvertEnergy,
  canConvertItems,
  canConvertEnergy,
  isResolved,
}) => (
  <View className="gap-4">
    <Pressable
      testID="convert-items-button"
      onPress={onConvertItems}
      disabled={!canConvertItems || isResolved}
      className={`w-full rounded-lg px-6 py-3 ${
        canConvertItems && !isResolved
          ? 'bg-blue-600'
          : 'bg-gray-400 opacity-50'
      }`}
    >
      <Text className="text-center text-lg font-semibold text-white">
        Convert Items → Energy
      </Text>
      <Text className="mt-1 text-center text-sm text-blue-100">
        {!canConvertItems
          ? 'Insufficient items'
          : 'Convert all items to energy'}
      </Text>
    </Pressable>
    <Pressable
      testID="convert-energy-button"
      onPress={onConvertEnergy}
      disabled={!canConvertEnergy || isResolved}
      className={`w-full rounded-lg px-6 py-3 ${
        canConvertEnergy && !isResolved
          ? 'bg-blue-600'
          : 'bg-gray-400 opacity-50'
      }`}
    >
      <Text className="text-center text-lg font-semibold text-white">
        Convert Energy → Items
      </Text>
      <Text className="mt-1 text-center text-sm text-blue-100">
        {!canConvertEnergy
          ? 'Insufficient energy (need at least 10)'
          : 'Convert energy to items'}
      </Text>
    </Pressable>
  </View>
);

const OutcomeDisplay: React.FC<{
  outcome: AdvancedEncounterOutcome;
  onComplete: (outcome: AdvancedEncounterOutcome) => void;
}> = ({ outcome, onComplete }) => (
  <ScrollView className="min-h-screen bg-gray-50 p-6">
    <View className="mx-auto max-w-2xl">
      <View className="rounded-lg bg-white p-6 shadow-lg">
        <Text className="mb-4 text-2xl font-bold text-gray-800">
          {outcome.type === 'success' ? 'Conversion Complete!' : 'Failure!'}
        </Text>
        <Text className="mb-6 text-gray-700">{outcome.message}</Text>
        <Pressable
          onPress={() => onComplete(outcome)}
          className="w-full rounded-lg bg-blue-600 px-4 py-3"
        >
          <Text className="text-center text-white">Continue</Text>
        </Pressable>
      </View>
    </View>
  </ScrollView>
);

const useConversionHandlers = (params: {
  encounter: EnergyNexusEncounter;
  inventory: { value: number }[];
  currentEnergy: number;
  setState: (state: EnergyNexusState) => void;
  canConvertItems: boolean;
  canConvertEnergy: boolean;
}) => {
  const handleConvertItems = () => {
    if (!params.canConvertItems) return;

    params.encounter.selectConversionDirection('items_to_energy');
    params.setState(params.encounter.getState());

    const result = params.encounter.executeConversion(
      params.inventory as any,
      params.currentEnergy
    );
    return result;
  };

  const handleConvertEnergy = () => {
    if (!params.canConvertEnergy) return;

    params.encounter.selectConversionDirection('energy_to_items');
    params.setState(params.encounter.getState());

    const result = params.encounter.executeConversion(
      params.inventory as any,
      params.currentEnergy
    );
    return result;
  };

  return { handleConvertItems, handleConvertEnergy };
};

const useEnergyNexusState = (
  encounter: EnergyNexusEncounter,
  runState?: RunState | null
) => {
  const [state, setState] = useState<EnergyNexusState>(encounter.getState());
  const [outcome, setOutcome] = useState<AdvancedEncounterOutcome | null>(null);

  const currentEnergy = runState?.energyRemaining || 0;
  const inventory = runState?.inventory || [];
  const inventoryValue = inventory.reduce((sum, item) => sum + item.value, 0);
  const itemCount = inventory.length;

  const canConvertItems = !state.isResolved && itemCount > 0;
  const canConvertEnergy = !state.isResolved && currentEnergy >= 10;

  return {
    state,
    setState,
    outcome,
    setOutcome,
    currentEnergy,
    inventory,
    inventoryValue,
    itemCount,
    canConvertItems,
    canConvertEnergy,
  };
};

const EnergyNexusContent: React.FC<{
  encounter: EnergyNexusEncounter;
  state: EnergyNexusState;
  currentEnergy: number;
  inventory: { value: number }[];
  inventoryValue: number;
  itemCount: number;
  canConvertItems: boolean;
  canConvertEnergy: boolean;
  onConvertItems: () => void;
  onConvertEnergy: () => void;
}> = ({
  encounter,
  state,
  currentEnergy,
  inventory,
  inventoryValue,
  itemCount,
  canConvertItems,
  canConvertEnergy,
  onConvertItems,
  onConvertEnergy,
}) => (
  <ScrollView
    testID="energy-nexus-screen"
    className="min-h-screen bg-blue-50 p-6"
    contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
  >
    <View className="mx-auto max-w-2xl">
      <EnergyNexusHeader />
      <ConversionRateDisplay rate={state.config.conversionRate} />
      <ResourceDisplay
        energy={currentEnergy}
        inventoryValue={inventoryValue}
        itemCount={itemCount}
      />
      <ConversionPreviews
        encounter={encounter}
        inventory={inventory}
        currentEnergy={currentEnergy}
        canConvertItems={canConvertItems}
        canConvertEnergy={canConvertEnergy}
      />
      <ConversionButtons
        onConvertItems={onConvertItems}
        onConvertEnergy={onConvertEnergy}
        canConvertItems={canConvertItems}
        canConvertEnergy={canConvertEnergy}
        isResolved={state.isResolved}
      />
    </View>
  </ScrollView>
);

export const EnergyNexusScreen: React.FC<EnergyNexusScreenProps> = ({
  encounter,
  runState,
  onComplete,
}) => {
  const {
    state,
    setState,
    outcome,
    setOutcome,
    currentEnergy,
    inventory,
    inventoryValue,
    itemCount,
    canConvertItems,
    canConvertEnergy,
  } = useEnergyNexusState(encounter, runState);

  const { handleConvertItems, handleConvertEnergy } = useConversionHandlers({
    encounter,
    inventory,
    currentEnergy,
    setState,
    canConvertItems,
    canConvertEnergy,
  });

  const onConvertItems = () => {
    const result = handleConvertItems();
    if (result) {
      setOutcome(result);
      setState(encounter.getState());
    }
  };

  const onConvertEnergy = () => {
    const result = handleConvertEnergy();
    if (result) {
      setOutcome(result);
      setState(encounter.getState());
    }
  };

  if (outcome) {
    return <OutcomeDisplay outcome={outcome} onComplete={onComplete} />;
  }

  return (
    <EnergyNexusContent
      encounter={encounter}
      state={state}
      currentEnergy={currentEnergy}
      inventory={inventory}
      inventoryValue={inventoryValue}
      itemCount={itemCount}
      canConvertItems={canConvertItems}
      canConvertEnergy={canConvertEnergy}
      onConvertItems={onConvertItems}
      onConvertEnergy={onConvertEnergy}
    />
  );
};
