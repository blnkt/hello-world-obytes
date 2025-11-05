import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  type AdvancedEncounterOutcome,
  getCardDisplayValue,
  getSuitSymbol,
  type PlayingCard,
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
        <Text className="text-lg font-semibold text-gray-800">Health</Text>
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

const RoomProgress: React.FC<{
  roomsCompleted: number;
  roomsToSurvive: number;
}> = ({ roomsCompleted, roomsToSurvive }) => (
  <View className="mb-4 rounded-lg bg-white p-4 shadow">
    <Text className="text-lg font-semibold text-gray-800">Rooms Progress</Text>
    <Text className="text-gray-600">
      {roomsCompleted} / {roomsToSurvive} rooms completed
    </Text>
    <View className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
      <View
        className="h-full bg-blue-500 transition-all"
        style={{
          width: `${Math.min(100, (roomsCompleted / roomsToSurvive) * 100)}%`,
        }}
      />
    </View>
  </View>
);

const WeaponDisplay: React.FC<{
  weapon: PlayingCard | null;
  defeatedMonsters: number[];
}> = ({ weapon, defeatedMonsters }) => {
  if (!weapon) {
    return (
      <View className="mb-4 rounded-lg bg-white p-4 shadow">
        <Text className="text-lg font-semibold text-gray-800">Weapon</Text>
        <Text className="text-gray-600">No weapon equipped</Text>
      </View>
    );
  }

  const weaponStrength = weapon.value;
  const canAttackAny = defeatedMonsters.length === 0;
  const nextMonsterMustBeLessThan =
    defeatedMonsters.length > 0
      ? defeatedMonsters[defeatedMonsters.length - 1]
      : null;

  return (
    <View className="mb-4 rounded-lg bg-white p-4 shadow">
      <Text className="mb-2 text-lg font-semibold text-gray-800">
        Equipped Weapon
      </Text>
      <View className="mb-2 flex-row items-center gap-2">
        <Text className="text-xl font-bold text-blue-600">
          {getSuitSymbol(weapon.suit)} {getCardDisplayValue(weapon.value)}
        </Text>
        <Text className="text-gray-600">Strength: {weaponStrength}</Text>
      </View>
      {defeatedMonsters.length > 0 && (
        <View className="mt-2">
          <Text className="text-sm text-gray-600">
            Defeated: {defeatedMonsters.join(', ')}
          </Text>
          {nextMonsterMustBeLessThan && (
            <Text className="text-sm text-orange-600">
              Next monster must be &lt; {nextMonsterMustBeLessThan} (strictly
              descending)
            </Text>
          )}
        </View>
      )}
      {canAttackAny && (
        <Text className="mt-1 text-sm text-green-600">
          Can attack any monster
        </Text>
      )}
    </View>
  );
};

const RoomInfo: React.FC<{
  roomActionCount: number;
  roomPotionCount: number;
}> = ({ roomActionCount, roomPotionCount }) => (
  <View className="mb-4 rounded-lg bg-white p-4 shadow">
    <Text className="mb-2 text-lg font-semibold text-gray-800">
      Room Progress
    </Text>
    <Text className="text-gray-600">Cards played: {roomActionCount}/3</Text>
    {roomPotionCount > 0 && (
      <Text className="text-sm text-gray-500">
        {roomPotionCount} potion{roomPotionCount > 1 ? 's' : ''} consumed this
        room (only first heals)
      </Text>
    )}
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

// Helper functions for card type detection
const isMonster = (card: PlayingCard): boolean =>
  card.suit === 'clubs' || card.suit === 'spades';
const isWeapon = (card: PlayingCard): boolean =>
  card.suit === 'diamonds' && card.value >= 2 && card.value <= 10;
const isPotion = (card: PlayingCard): boolean => card.suit === 'hearts';

const getCardColor = (card: PlayingCard): string => {
  if (isMonster(card)) {
    return 'border-orange-300 bg-orange-50';
  }
  if (isWeapon(card)) {
    return 'border-blue-300 bg-blue-50';
  }
  if (isPotion(card)) {
    return 'border-green-300 bg-green-50';
  }
  return 'border-gray-300 bg-white';
};

const getCardType = (card: PlayingCard): string => {
  if (isMonster(card)) {
    return 'Monster';
  }
  if (isWeapon(card)) {
    return 'Weapon';
  }
  if (isPotion(card)) {
    return 'Potion';
  }
  return 'Unknown';
};

const canUseWeapon = (
  monster: PlayingCard,
  equippedWeapon: PlayingCard | null,
  defeatedByWeapon: number[]
): boolean => {
  if (!equippedWeapon) {
    return false;
  }
  if (defeatedByWeapon.length === 0) {
    return true; // Can attack any monster
  }
  const lastDefeated = defeatedByWeapon[defeatedByWeapon.length - 1];
  return monster.value < lastDefeated; // Strictly descending
};

const CardDetails: React.FC<{
  card: PlayingCard;
  equippedWeapon: PlayingCard | null;
  defeatedByWeapon: number[];
}> = ({ card, equippedWeapon, defeatedByWeapon }) => {
  if (
    isMonster(card) &&
    equippedWeapon &&
    canUseWeapon(card, equippedWeapon, defeatedByWeapon)
  ) {
    return (
      <Text className="mt-1 text-sm text-blue-600">
        With Weapon: {Math.max(card.value - equippedWeapon.value, 0)} damage
      </Text>
    );
  }
  if (
    isMonster(card) &&
    (!equippedWeapon || !canUseWeapon(card, equippedWeapon, defeatedByWeapon))
  ) {
    return (
      <Text className="mt-1 text-sm text-red-600">Damage: {card.value}</Text>
    );
  }
  if (isWeapon(card)) {
    return (
      <Text className="mt-1 text-sm text-blue-600">Strength: {card.value}</Text>
    );
  }
  if (isPotion(card)) {
    return (
      <Text className="mt-1 text-sm text-green-600">Heals: {card.value}</Text>
    );
  }
  if (
    isMonster(card) &&
    equippedWeapon &&
    !canUseWeapon(card, equippedWeapon, defeatedByWeapon)
  ) {
    return (
      <Text className="mt-1 text-xs text-orange-600">
        Weapon durability: must be &lt;{' '}
        {defeatedByWeapon[defeatedByWeapon.length - 1]} (or fight bare-handed)
      </Text>
    );
  }
  return null;
};

const CardItem: React.FC<{
  card: PlayingCard;
  index: number;
  equippedWeapon: PlayingCard | null;
  defeatedByWeapon: number[];
  onPlayCard: (index: number, useWeapon: boolean) => void;
  disabled: boolean;
}> = ({
  card,
  index,
  equippedWeapon,
  defeatedByWeapon,
  onPlayCard,
  disabled,
}) => {
  const showWeaponChoice =
    isMonster(card) &&
    equippedWeapon &&
    canUseWeapon(card, equippedWeapon, defeatedByWeapon);
  const defaultUseWeapon = Boolean(showWeaponChoice);

  return (
    <View className="gap-2">
      <Pressable
        testID={`card-${card.id}`}
        onPress={() => onPlayCard(index, defaultUseWeapon)}
        disabled={disabled}
        className={`w-full rounded-lg border-2 p-4 ${getCardColor(card)} ${
          disabled ? 'opacity-50' : ''
        }`}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-800">
            {getSuitSymbol(card.suit)} {getCardDisplayValue(card.value)}
          </Text>
          <Text className="text-sm font-semibold text-gray-600">
            {getCardType(card)}
          </Text>
        </View>
        <CardDetails
          card={card}
          equippedWeapon={equippedWeapon}
          defeatedByWeapon={defeatedByWeapon}
        />
      </Pressable>
      {showWeaponChoice && (
        <Pressable
          testID={`card-${card.id}-barehanded`}
          onPress={() => onPlayCard(index, false)}
          disabled={disabled}
          className={`w-full rounded-lg border-2 border-orange-500 bg-orange-100 p-3 ${
            disabled ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-center font-semibold text-orange-800">
            Fight Bare-Handed (Damage: {card.value})
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const CardSelection: React.FC<{
  cards: PlayingCard[];
  equippedWeapon: PlayingCard | null;
  defeatedByWeapon: number[];
  onPlayCard: (index: number, useWeapon: boolean) => void;
  disabled: boolean;
}> = ({ cards, equippedWeapon, defeatedByWeapon, onPlayCard, disabled }) => {
  if (cards.length === 0) {
    return (
      <View className="mb-4 rounded-lg bg-white p-4 shadow">
        <Text className="text-gray-600">No cards in current room.</Text>
      </View>
    );
  }

  return (
    <View className="mb-4">
      <Text className="mb-2 text-lg font-semibold text-gray-800">
        Current Room ({cards.length} cards - play 3)
      </Text>
      <View className="gap-2">
        {cards.map((card, index) => (
          <CardItem
            key={card.id}
            card={card}
            index={index}
            equippedWeapon={equippedWeapon}
            defeatedByWeapon={defeatedByWeapon}
            onPlayCard={onPlayCard}
            disabled={disabled}
          />
        ))}
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
          {outcome.type === 'success' ? 'Victory!' : 'Defeated!'}
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
  const handlePlayCard = (index: number, useWeapon: boolean) => {
    encounter.playCard(index, useWeapon);
    setState(encounter.getState());

    // Check if encounter is complete
    if (encounter.isEncounterComplete()) {
      const result = encounter.resolve(runInventory);
      setOutcome(result);
    }
  };

  const handleSkipRoom = () => {
    encounter.skipRoom();
    setState(encounter.getState());

    // Check if encounter is complete
    if (encounter.isEncounterComplete()) {
      const result = encounter.resolve(runInventory);
      setOutcome(result);
    }
  };

  const handleCompleteEncounter = () => {
    const result = encounter.resolve(runInventory);
    setOutcome(result);
    setState(encounter.getState());
  };

  return {
    handlePlayCard,
    handleSkipRoom,
    handleCompleteEncounter,
  };
};
/* eslint-enable max-params */

/* eslint-disable max-lines-per-function */
const ScoundrelGameplayContent: React.FC<{
  encounter: ScoundrelEncounter;
  state: ScoundrelState;
  score: number;
  onPlayCard: (index: number, useWeapon: boolean) => void;
  onSkipRoom: () => void;
  onCompleteEncounter: () => void;
  onReturn: () => void;
}> = ({
  encounter,
  state,
  score,
  onPlayCard,
  onSkipRoom,
  onCompleteEncounter,
  onReturn,
}) => {
  const isEncounterComplete = encounter.isEncounterComplete();
  const canPlayCards = !isEncounterComplete && state.roomActionCount < 3;
  const canSkip = encounter.canSkipRoom();

  return (
    <ScrollView
      testID="scoundrel-screen"
      className="min-h-screen bg-gray-50 p-6"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
    >
      <View className="mx-auto max-w-2xl">
        <Text className="mb-6 text-center text-3xl font-bold text-gray-800">
          Scoundrel
        </Text>

        <LifeDisplay
          currentLife={state.health}
          maxLife={encounter.getMaxLife()}
        />

        <RoomProgress
          roomsCompleted={state.roomsCompleted}
          roomsToSurvive={state.config.roomsToSurvive ?? 5 + state.config.depth}
        />

        <WeaponDisplay
          weapon={state.equippedWeapon}
          defeatedMonsters={state.defeatedByWeapon}
        />

        <RoomInfo
          roomActionCount={state.roomActionCount}
          roomPotionCount={state.roomPotionCount}
        />

        {score !== 0 && <ScoreDisplay score={score} />}

        {!isEncounterComplete && <RewardPreview score={score} />}

        {canPlayCards && (
          <CardSelection
            cards={state.currentRoom}
            equippedWeapon={state.equippedWeapon}
            defeatedByWeapon={state.defeatedByWeapon}
            onPlayCard={onPlayCard}
            disabled={false}
          />
        )}

        {canSkip && (
          <Pressable
            onPress={onSkipRoom}
            className="mb-4 w-full rounded-lg bg-purple-600 px-4 py-3"
          >
            <Text className="text-center text-lg font-semibold text-white">
              Skip Room
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
};
/* eslint-enable max-lines-per-function */

export const ScoundrelScreen: React.FC<ScoundrelScreenProps> = ({
  encounter,
  runInventory = [],
  onComplete,
  onReturn,
}) => {
  const [state, setState] = useState<ScoundrelState>(encounter.getState());
  const [outcome, setOutcome] = useState<AdvancedEncounterOutcome | null>(null);

  const score = encounter.calculateScore();
  const { handlePlayCard, handleSkipRoom, handleCompleteEncounter } =
    useScoundrelHandlers(encounter, runInventory, setState, setOutcome);

  if (outcome) {
    return <OutcomeDisplay outcome={outcome} onComplete={onComplete} />;
  }

  return (
    <ScoundrelGameplayContent
      encounter={encounter}
      state={state}
      score={score}
      onPlayCard={handlePlayCard}
      onSkipRoom={handleSkipRoom}
      onCompleteEncounter={handleCompleteEncounter}
      onReturn={onReturn}
    />
  );
};
