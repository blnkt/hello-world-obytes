import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingOverlay, Text } from '@/components/ui';
import { useCurrencySystem } from '@/lib/health';
import { applyItemEffects, useItemEffects } from '@/lib/item-effects';
import { usePurchasedItems } from '@/lib/storage';

import GameGrid from './game-grid';
import { GameOverModal, WinModal } from './game-modals';
import { PurchasedItemsGrid } from './purchased-items-grid';

interface DungeonGameLayoutProps {
  level: number;
  turns: number;
  gameState: 'Active' | 'Win' | 'Game Over';
  revealedTiles: number;
  totalTiles: number;
  currency: number;
  availableTurns: number;
  turnCost: number;
  isLoading: boolean;
  onTurnsUpdate: (turns: number) => void;
  onRevealedTilesUpdate: (count: number) => void;
  onWinGame: () => void;
  onGameOver: () => void;
  onResetGame: () => void;
  onHomePress: () => void;
  onExitFound: () => void;
  onGameOverFromTurns: () => void;
  onNextLevel: () => void;
  onSpendCurrency: (amount: number) => Promise<boolean>;
  activeEffects: any[];
}

interface HeaderSectionProps {
  level: number;
  turns: number;
  gameState: 'Active' | 'Win' | 'Game Over';
  revealedTiles: number;
  totalTiles: number;
  currency: number;
  availableTurns: number;
  turnCost: number;
  activeEffects?: any[];
}

function HeaderSection({
  level,
  turns,
  gameState,
  revealedTiles,
  totalTiles,
  currency,
  availableTurns,
  turnCost,
  activeEffects = [],
}: HeaderSectionProps) {
  let topInset = 0;
  try {
    const insets = useSafeAreaInsets();
    topInset = insets.top || 0;
  } catch {
    // Fallback for test environment
    topInset = 0;
  }

  return (
    <View className="px-4 py-2" style={{ paddingTop: topInset }}>
      {/* Condensed Header - All essential info in one compact bar */}
      <View className="rounded-lg bg-[#B06F5E] px-4 py-3">
        {/* Top row: Turns Left */}
        <View className="mb-2">
          <Text className="text-center text-lg font-bold uppercase text-white">
            TURNS LEFT: {availableTurns}
          </Text>
        </View>

        {/* Bottom row: Level, Currency, Turn Cost */}
        <View className="flex-row items-center justify-between">
          <View className="items-center">
            <Text className="text-xs font-medium uppercase text-white/80">
              Level
            </Text>
            <Text className="text-sm font-bold text-white">{level}</Text>
          </View>

          <View className="items-center">
            <Text className="text-xs font-medium uppercase text-white/80">
              Balance
            </Text>
            <Text className="text-sm font-bold text-white">{currency} 💰</Text>
          </View>

          <View className="items-center">
            <Text className="text-xs font-medium uppercase text-white/80">
              Turn Cost
            </Text>
            <Text className="text-sm font-bold text-white">
              {turnCost} 💰
              {activeEffects && activeEffects.length > 0 && (
                <Text className="text-xs text-green-300">*</Text>
              )}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

interface GameGridSectionProps {
  availableTurns: number;
  level: number;
  onTurnsUpdate: (turns: number) => void;
  onRevealedTilesUpdate: (count: number) => void;
  onExitFound: () => void;
  onGameOverFromTurns: () => void;
  onSpendCurrency: (amount: number) => Promise<boolean>;
}

function GameGridSection({
  availableTurns,
  level,
  onTurnsUpdate,
  onRevealedTilesUpdate,
  onExitFound,
  onGameOverFromTurns,
  onSpendCurrency,
}: GameGridSectionProps) {
  const [purchasedItems] = usePurchasedItems();
  const { activeEffects } = useItemEffects();

  // Calculate effective turn cost with item effects
  const baseTurnCost = 100;
  const effectiveTurnCost = applyItemEffects.getTurnCost(
    baseTurnCost,
    activeEffects
  );
  const bonusTurns = applyItemEffects.getBonusTurns(activeEffects);
  const effectiveAvailableTurns = availableTurns + bonusTurns;

  return (
    <View className="mb-3">
      {effectiveAvailableTurns < 1 ? (
        <View className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
          <Text className="text-center text-base text-gray-600 dark:text-gray-300">
            Cannot play with insufficient currency
          </Text>
        </View>
      ) : (
        <>
          <GameGrid
            level={level}
            disabled={false}
            onTurnsUpdate={onTurnsUpdate}
            onRevealedTilesUpdate={onRevealedTilesUpdate}
            onExitFound={onExitFound}
            onGameOver={onGameOverFromTurns}
            onSpendCurrency={onSpendCurrency}
          />

          {/* Message Bar */}
          <MessageBar
            message="Ready to play! Click tiles to reveal them."
            type="info"
          />

          {/* Purchased Items Grid with Active Effects */}
          <PurchasedItemsGrid
            purchasedItems={purchasedItems}
            showActiveEffects={true}
            onItemActivated={(itemId) => {
              console.log(`Item activated: ${itemId}`);
            }}
          />
        </>
      )}
    </View>
  );
}

interface FooterSectionProps {
  onResetGame: () => void;
  onHomePress: () => void;
  onWinGame: () => void;
  onGameOver: () => void;
}

interface NavigationButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
}

function NavigationButton({
  icon,
  label,
  onPress,
  accessibilityLabel,
}: NavigationButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View className="rounded-full bg-white/20 p-3">
        <Text className="text-lg text-white">{icon}</Text>
      </View>
      <Text className="mt-1 text-xs text-white">{label}</Text>
    </Pressable>
  );
}

function FooterSection({
  onResetGame,
  onHomePress,
  onWinGame,
  onGameOver,
}: FooterSectionProps) {
  let bottomInset = 0;
  try {
    const insets = useSafeAreaInsets();
    bottomInset = insets.bottom || 0;
  } catch {
    // Fallback for test environment
    bottomInset = 0;
  }

  return (
    <View className="px-4 pb-2" style={{ paddingBottom: bottomInset }}>
      {/* Main Navigation Bar - Terracotta background like mockup */}
      <View className="rounded-lg bg-[#7A6F66] px-6 py-3">
        <View className="flex-row items-center justify-between">
          <NavigationButton
            icon="🏠"
            label="Home"
            onPress={onHomePress}
            accessibilityLabel="Go to home"
          />
          <NavigationButton
            icon="🔄"
            label="Reset"
            onPress={onResetGame}
            accessibilityLabel="Reset game"
          />
          <NavigationButton
            icon="⚙️"
            label="Settings"
            onPress={() => {}} // Placeholder for settings
            accessibilityLabel="Settings"
          />
        </View>
      </View>
    </View>
  );
}

interface MessageBarProps {
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

function MessageBar({ message, type }: MessageBarProps) {
  const getMessageStyles = () => {
    switch (type) {
      case 'warning':
        return {
          container: 'bg-[#F5F0E8]',
          icon: 'bg-red-500',
          text: 'text-[#6B5F57]',
        };
      case 'error':
        return {
          container: 'bg-red-100',
          icon: 'bg-red-600',
          text: 'text-red-800',
        };
      case 'success':
        return {
          container: 'bg-green-100',
          icon: 'bg-green-600',
          text: 'text-green-800',
        };
      case 'info':
      default:
        return {
          container: 'bg-[#F5F0E8]',
          icon: 'bg-blue-500',
          text: 'text-[#6B5F57]',
        };
    }
  };

  const styles = getMessageStyles();

  return (
    <View className={`mx-4 mt-1 rounded-lg ${styles.container} px-4 py-2`}>
      <View className="flex-row items-center">
        <View className={`mr-3 rounded-full ${styles.icon} p-1`}>
          <Text className="text-xs font-bold text-white">!</Text>
        </View>
        <Text className={`flex-1 text-sm ${styles.text}`}>{message}</Text>
      </View>
    </View>
  );
}

// eslint-disable-next-line max-lines-per-function
function DungeonGameLayout({
  level,
  turns,
  gameState,
  revealedTiles,
  totalTiles,
  currency,
  availableTurns,
  turnCost,
  isLoading,
  onTurnsUpdate,
  onRevealedTilesUpdate,
  onWinGame,
  onGameOver,
  onResetGame,
  onHomePress,
  onExitFound,
  onGameOverFromTurns,
  onNextLevel,
  onSpendCurrency,
  activeEffects,
}: DungeonGameLayoutProps) {
  return (
    <View className="flex-1">
      <LoadingOverlay visible={isLoading} />
      <HeaderSection
        {...{
          level,
          turns,
          gameState,
          revealedTiles,
          totalTiles,
          currency,
          availableTurns,
          turnCost,
          activeEffects,
        }}
      />
      <GameGridSection
        {...{
          availableTurns,
          level,
          onTurnsUpdate,
          onRevealedTilesUpdate,
          onExitFound,
          onGameOverFromTurns,
          onSpendCurrency,
        }}
      />
      {/* Footer removed to keep only MessageBar below game grid */}
      {/* Game Modals */}
      <WinModal
        visible={gameState === 'Win'}
        level={level}
        onNextLevel={onNextLevel}
        onMainMenu={onHomePress}
      />
      <GameOverModal
        visible={gameState === 'Game Over'}
        level={level}
        turnsUsed={turns}
        onMainMenu={onHomePress}
        onRetry={onResetGame}
      />
    </View>
  );
}

interface DungeonGameProps {
  navigation?: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

// eslint-disable-next-line max-lines-per-function
export default function DungeonGame({ navigation }: DungeonGameProps) {
  // Currency system integration
  const { currency, spend } = useCurrencySystem();
  const { activeEffects } = useItemEffects();

  // Calculate available turns based on currency
  const availableTurns = Math.floor(currency / 100);
  const turnCost = 100;

  // Game state management
  const [level, setLevel] = useState(1);
  const [turns, setTurns] = useState(0);
  const [gameState, setGameState] = useState<'Active' | 'Win' | 'Game Over'>(
    'Active'
  );
  const [revealedTiles, setRevealedTiles] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const totalTiles = 30; // 6x5 grid

  // Callbacks to update parent state from GameGrid
  const handleTurnsUpdate = React.useCallback((newTurns: number) => {
    setTurns(newTurns);
  }, []);

  const handleRevealedTilesUpdate = React.useCallback(
    (newRevealedTiles: number) => {
      setRevealedTiles(newRevealedTiles);
    },
    []
  );

  const handleHomePress = React.useCallback(() => {
    if (navigation) {
      navigation.navigate('index');
    } else {
      router.replace('/');
    }
  }, [navigation]);

  const handleWinGame = React.useCallback(() => {
    setGameState('Win');
  }, []);

  const handleGameOver = React.useCallback(() => {
    setGameState('Game Over');
  }, []);

  const handleResetGame = React.useCallback(() => {
    setGameState('Active');
    setTurns(0);
    setRevealedTiles(0);
  }, []);

  const handleExitFound = React.useCallback(() => {
    setGameState('Win');
  }, []);

  const handleGameOverFromTurns = React.useCallback(() => {
    setGameState('Game Over');
  }, []);

  const handleNextLevel = React.useCallback(() => {
    setIsLoading(true);
    // Immediate state change for testing, can add delay later for production
    setLevel((prevLevel) => prevLevel + 1);
    setGameState('Active');
    setTurns(0);
    setRevealedTiles(0);
    setIsLoading(false);
  }, []);

  const handleSpendCurrency = React.useCallback(
    async (amount: number) => {
      return await spend(amount);
    },
    [spend]
  );

  return (
    <DungeonGameLayout
      level={level}
      turns={turns}
      gameState={gameState}
      revealedTiles={revealedTiles}
      totalTiles={totalTiles}
      currency={currency}
      availableTurns={availableTurns}
      turnCost={turnCost}
      isLoading={isLoading}
      onTurnsUpdate={handleTurnsUpdate}
      onRevealedTilesUpdate={handleRevealedTilesUpdate}
      onWinGame={handleWinGame}
      onGameOver={handleGameOver}
      onResetGame={handleResetGame}
      onHomePress={handleHomePress}
      onExitFound={handleExitFound}
      onGameOverFromTurns={handleGameOverFromTurns}
      onNextLevel={handleNextLevel}
      onSpendCurrency={handleSpendCurrency}
      activeEffects={activeEffects}
    />
  );
}
