import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  type AdvancedEncounterOutcome,
  type Card,
  type ScoundrelEncounter,
  type ScoundrelState,
} from '@/lib/delvers-descent/scoundrel-encounter';
import type { CollectedItem } from '@/types/delvers-descent';

export interface ScoundrelScreenProps {
  /** The scoundrel encounter instance */
  encounter: ScoundrelEncounter;
  /** Current run inventory for failure consequences */
  runInventory?: CollectedItem[];
  /** Callback when encounter completes */
  onComplete: (outcome: AdvancedEncounterOutcome) => void;
  /** Callback to return to map */
  onReturn: () => void;
}

const LifeDisplay: React.FC<{
  currentLife: number;
  maxLife: number;
}> = ({ currentLife, maxLife }) => {
  const lifePercentage = (currentLife / maxLife) * 100;
  const isLowLife = currentLife <= 2;
  const isCritical = currentLife <= 1;

  return (
    <View className="mb-4 rounded-lg bg-white p-4 shadow">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-gray-800">Life</Text>
        <Text
          className={`text-lg font-bold ${
            isCritical
              ? 'text-red-600'
              : isLowLife
                ? 'text-orange-600'
                : 'text-green-600'
          }`}
        >
          {currentLife}/{maxLife}
        </Text>
      </View>
      <View className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
        <View
          className={`h-full ${
            isCritical
              ? 'bg-red-500'
              : isLowLife
                ? 'bg-orange-500'
                : 'bg-green-500'
          }`}
          style={{ width: `${lifePercentage}%` }}
        />
      </View>
      {isLowLife && (
        <Text className="mt-2 text-sm font-semibold text-red-600">
          ⚠️ Risk of Failure!
        </Text>
      )}
    </View>
  );
};

const DungeonProgress: React.FC<{
  currentRoom: number;
  totalRooms: number;
}> = ({ currentRoom, totalRooms }) => (
  <View className="mb-4 rounded-lg bg-white p-4 shadow">
    <Text className="mb-2 text-lg font-semibold text-gray-800">
      Dungeon Progress
    </Text>
    <Text className="text-gray-600">
      Room {currentRoom + 1} of {totalRooms}
    </Text>
  </View>
);

const ScoreDisplay: React.FC<{ score: number }> = ({ score }) => {
  const isNegative = score < 0;
  return (
    <View className="mb-4 rounded-lg bg-white p-4 shadow">
      <Text className="mb-2 text-lg font-semibold text-gray-800">
        Current Score
      </Text>
      <Text
        className={`text-2xl font-bold ${isNegative ? 'text-red-600' : 'text-green-600'}`}
      >
        {score > 0 ? '+' : ''}
        {score}
      </Text>
    </View>
  );
};

const RemainingMonsters: React.FC<{
  monsters: { name: string; value: number }[];
}> = ({ monsters }) => {
  if (monsters.length === 0) {
    return null;
  }

  return (
    <View className="mb-4 rounded-lg bg-white p-4 shadow">
      <Text className="mb-2 text-lg font-semibold text-gray-800">
        Remaining Monsters
      </Text>
      <View className="gap-2">
        {monsters.map((monster, index) => (
          <View key={index} className="flex-row justify-between">
            <Text className="text-gray-700">{monster.name}</Text>
            <Text className="font-semibold text-gray-700">
              Value: {monster.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const LastCardDisplay: React.FC<{ card: Card | undefined }> = ({ card }) => {
  if (!card) {
    return null;
  }

  const isHealthPotion = card.type === 'health_potion';

  return (
    <View className="mb-4 rounded-lg bg-white p-4 shadow">
      <Text className="mb-2 text-lg font-semibold text-gray-800">
        Last Card Played
      </Text>
      <View className="flex-row items-center gap-2">
        <Text className="text-gray-700">{card.name}</Text>
        {isHealthPotion && (
          <Text className="text-sm font-semibold text-green-600">
            (Health Potion)
          </Text>
        )}
      </View>
      {card.effect?.healAmount && (
        <Text className="mt-1 text-sm text-gray-600">
          Heals {card.effect.healAmount} life
        </Text>
      )}
    </View>
  );
};

const RewardPreview: React.FC<{ score: number }> = ({ score }) => {
  if (score < 0) {
    return null;
  }

  let tier = 1;
  let xp = 50;
  let itemCount = 1;

  if (score >= 21) {
    tier = 3;
    xp = 200;
    itemCount = 3;
  } else if (score >= 11) {
    tier = 2;
    xp = 100;
    itemCount = 2;
  }

  return (
    <View className="mb-4 rounded-lg bg-yellow-50 p-4 shadow">
      <Text className="mb-2 text-lg font-semibold text-yellow-800">
        Potential Reward (Tier {tier})
      </Text>
      <Text className="text-yellow-700">XP: {xp}</Text>
      <Text className="text-yellow-700">Items: {itemCount}</Text>
    </View>
  );
};

const CardSelection: React.FC<{
  cards: Card[];
  onSelectCard: (cardId: string) => void;
  disabled: boolean;
}> = ({ cards, onSelectCard, disabled }) => {
  if (cards.length === 0) {
    return (
      <View className="mb-4 rounded-lg bg-white p-4 shadow">
        <Text className="text-gray-600">No cards available in this room.</Text>
      </View>
    );
  }

  return (
    <View className="mb-4">
      <Text className="mb-2 text-lg font-semibold text-gray-800">
        Available Cards
      </Text>
      <View className="gap-2">
        {cards.map((card) => {
          const getCardColor = () => {
            switch (card.type) {
              case 'health_potion':
                return 'border-green-300 bg-green-50';
              case 'treasure':
                return 'border-yellow-300 bg-yellow-50';
              case 'trap':
                return 'border-red-300 bg-red-50';
              case 'monster':
                return 'border-orange-300 bg-orange-50';
              default:
                return 'border-gray-300 bg-white';
            }
          };

          return (
            <Pressable
              key={card.id}
              testID={`card-${card.id}`}
              onPress={() => onSelectCard(card.id)}
              disabled={disabled}
              className={`w-full rounded-lg border-2 p-4 ${getCardColor()} ${
                disabled ? 'opacity-50' : ''
              }`}
            >
              <Text className="font-semibold text-gray-800">{card.name}</Text>
              <Text className="text-sm text-gray-600">
                Type: {card.type.replace('_', ' ')}
              </Text>
              {card.effect?.healAmount && (
                <Text className="text-sm text-green-600">
                  Heals {card.effect.healAmount} life
                </Text>
              )}
              {card.effect?.damageAmount && (
                <Text className="text-sm text-red-600">
                  Deals {card.effect.damageAmount} damage
                </Text>
              )}
              {card.effect?.treasureValue && (
                <Text className="text-sm text-yellow-600">
                  Treasure value: {card.effect.treasureValue}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const OutcomeDisplay: React.FC<{
  outcome: AdvancedEncounterOutcome;
  onComplete: (outcome: AdvancedEncounterOutcome) => void;
}> = ({ outcome, onComplete }) => (
  <ScrollView className="min-h-screen bg-gray-50 p-6">
    <View className="mx-auto max-w-2xl">
      <View className="rounded-lg bg-white p-6 shadow-lg">
        <Text className="mb-4 text-2xl font-bold text-gray-800">
          {outcome.type === 'success' ? 'Success!' : 'Failure!'}
        </Text>
        <Text className="mb-6 text-gray-700">{outcome.message}</Text>
        {outcome.reward && (
          <View className="mb-6 rounded bg-green-50 p-4">
            <Text className="mb-2 font-semibold text-green-800">Rewards</Text>
            <Text className="text-green-700">XP: +{outcome.reward.xp}</Text>
            {outcome.reward.items.length > 0 && (
              <View className="mt-2">
                <Text className="mb-1 font-semibold text-green-800">
                  Items:
                </Text>
                {outcome.reward.items.map(
                  (item: { name: string; value: number }, index: number) => (
                    <Text key={index} className="text-green-700">
                      • {item.name} (Value: {item.value})
                    </Text>
                  )
                )}
              </View>
            )}
          </View>
        )}
        {outcome.consequence && (
          <View className="mb-6 rounded bg-red-50 p-4">
            <Text className="mb-2 font-semibold text-red-800">
              Consequences
            </Text>
            {outcome.consequence.energyLoss > 0 && (
              <Text className="text-red-700">
                Energy Lost: {outcome.consequence.energyLoss}
              </Text>
            )}
          </View>
        )}
        <Pressable
          onPress={() => onComplete(outcome)}
          className="w-full rounded-lg bg-blue-600 px-4 py-3"
        >
          <Text className="text-center text-lg font-semibold text-white">
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  </ScrollView>
);

/* eslint-disable max-params */
const useScoundrelHandlers = (
  encounter: ScoundrelEncounter,
  runInventory: CollectedItem[],
  setState: (state: ScoundrelState) => void,
  setOutcome: (outcome: AdvancedEncounterOutcome) => void
) => {
  const handleSelectCard = (cardId: string) => {
    encounter.selectCard(cardId);
    setState(encounter.getState());
  };

  const handleAdvanceRoom = () => {
    const currentRoom = encounter.getCurrentRoom();
    if (currentRoom && !currentRoom.isCompleted) {
      encounter.advanceRoom();
      setState(encounter.getState());
    }
  };

  const handleCompleteEncounter = () => {
    const result = encounter.resolve(runInventory);
    setOutcome(result);
    setState(encounter.getState());
  };

  return {
    handleSelectCard,
    handleAdvanceRoom,
    handleCompleteEncounter,
  };
};
/* eslint-enable max-params */

/* eslint-disable max-lines-per-function */
const ScoundrelGameplayContent: React.FC<{
  encounter: ScoundrelEncounter;
  state: ScoundrelState;
  progress: { current: number; total: number };
  score: number;
  remainingMonsters: { name: string; value: number }[];
  lastCard: Card | undefined;
  availableCards: Card[];
  isEncounterComplete: boolean;
  canAdvanceRoom: boolean;
  onSelectCard: (cardId: string) => void;
  onAdvanceRoom: () => void;
  onCompleteEncounter: () => void;
  onReturn: () => void;
}> = ({
  encounter,
  state,
  progress,
  score,
  remainingMonsters,
  lastCard,
  availableCards,
  isEncounterComplete,
  canAdvanceRoom,
  onSelectCard,
  onAdvanceRoom,
  onCompleteEncounter,
  onReturn,
}) => (
  <ScrollView
    testID="scoundrel-screen"
    className="min-h-screen bg-gray-50 p-6"
    contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
  >
    <View className="mx-auto max-w-2xl">
      <Text className="mb-6 text-center text-3xl font-bold text-gray-800">
        Scoundrel's Dungeon
      </Text>

      <LifeDisplay
        currentLife={state.currentLife}
        maxLife={encounter.getMaxLife()}
      />

      <DungeonProgress
        currentRoom={progress.current}
        totalRooms={progress.total}
      />

      {score !== 0 && <ScoreDisplay score={score} />}

      {remainingMonsters.length > 0 && (
        <RemainingMonsters monsters={remainingMonsters} />
      )}

      {lastCard && <LastCardDisplay card={lastCard} />}

      {!isEncounterComplete && <RewardPreview score={score} />}

      {!isEncounterComplete && (
        <CardSelection
          cards={availableCards}
          onSelectCard={onSelectCard}
          disabled={!!state.dungeon[state.currentRoom]?.isCompleted}
        />
      )}

      {canAdvanceRoom && (
        <Pressable
          onPress={onAdvanceRoom}
          className="mb-4 w-full rounded-lg bg-blue-600 px-4 py-3"
        >
          <Text className="text-center text-lg font-semibold text-white">
            Advance to Next Room
          </Text>
        </Pressable>
      )}

      {isEncounterComplete && (
        <Pressable
          onPress={onCompleteEncounter}
          className="mb-4 w-full rounded-lg bg-green-600 px-4 py-3"
        >
          <Text className="text-center text-lg font-semibold text-white">
            Complete Encounter
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={onReturn}
        className="rounded-lg border-2 border-gray-300 bg-white px-6 py-2"
      >
        <Text className="text-center text-gray-700">Return to Map</Text>
      </Pressable>
    </View>
  </ScrollView>
);

export const ScoundrelScreen: React.FC<ScoundrelScreenProps> = ({
  encounter,
  runInventory = [],
  onComplete,
  onReturn,
}) => {
  const [state, setState] = useState<ScoundrelState>(encounter.getState());
  const [outcome, setOutcome] = useState<AdvancedEncounterOutcome | null>(null);

  const progress = encounter.getDungeonProgress();
  const availableCards = encounter.getAvailableCards();
  const remainingMonsters = encounter.getRemainingMonsters();
  const score = encounter.calculateScore();
  const lastCard = encounter.getLastCard();
  const isEncounterComplete = encounter.isEncounterComplete();
  const currentRoom = encounter.getCurrentRoom();
  const canAdvanceRoom = !!(
    currentRoom &&
    currentRoom.isCompleted &&
    progress.current < progress.total
  );

  const { handleSelectCard, handleAdvanceRoom, handleCompleteEncounter } =
    useScoundrelHandlers(encounter, runInventory, setState, setOutcome);

  if (outcome) {
    return <OutcomeDisplay outcome={outcome} onComplete={onComplete} />;
  }

  return (
    <ScoundrelGameplayContent
      encounter={encounter}
      state={state}
      progress={progress}
      score={score}
      remainingMonsters={remainingMonsters}
      lastCard={lastCard}
      availableCards={availableCards}
      isEncounterComplete={isEncounterComplete}
      canAdvanceRoom={canAdvanceRoom}
      onSelectCard={handleSelectCard}
      onAdvanceRoom={handleAdvanceRoom}
      onCompleteEncounter={handleCompleteEncounter}
      onReturn={onReturn}
    />
  );
};
