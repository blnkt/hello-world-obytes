import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useStepCountAsExperience, useStreakTracking } from '../../lib/health';
import {
  getCharacter,
  useDailyStepsGoal,
  useLastCheckedDate,
} from '../../lib/storage';
import { useScenarioTrigger } from '../../lib/use-scenario-trigger';

// TODO: PHASE 2 - Add detailed analytics - Track step trends, patterns, and insights
// TODO: PHASE 2 - Create progress reports - Weekly/monthly progress summaries
// TODO: PHASE 3 - Add data visualization - Charts and graphs for progress tracking

const MILESTONE_INTERVAL = 1000; // Every 1k steps

const StreakSection = ({ stepCount }: { stepCount: number }) => {
  const [lastCheckedDate] = useLastCheckedDate();

  // Default to start of today if not set
  const lastCheckedDateTime = lastCheckedDate
    ? new Date(lastCheckedDate)
    : (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      })();

  const { streaks, currentStreak, longestStreak } =
    useStreakTracking(lastCheckedDateTime);

  if (streaks.length === 0) {
    return (
      <View className="mb-4">
        <View className="mb-2 flex-row justify-between">
          <Text className="text-sm text-white/80">🔥 Streaks</Text>
          <Text className="text-sm text-white/80">No streaks yet</Text>
        </View>
        <View className="rounded-lg bg-white/10 p-3">
          <Text className="text-center text-xs text-white/80">
            Meet your daily goal for 2+ consecutive days to start a streak!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-4">
      <View className="mb-2 flex-row justify-between">
        <Text className="text-sm text-white/80">🔥 Streaks</Text>
        <Text className="text-sm text-white/80">
          {streaks.length} total streak{streaks.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <View className="rounded-lg bg-white/10 p-3">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-xs text-white/80">Longest Streak</Text>
          <Text className="text-xs font-semibold text-white">
            {longestStreak} days
          </Text>
        </View>
        {currentStreak && (
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-white/80">Current Streak</Text>
            <Text className="text-xs font-semibold text-green-300">
              {currentStreak.daysCount} days
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const DailyGoalSection = ({ stepCount }: { stepCount: number }) => {
  const [dailyStepsGoal, setDailyStepsGoal] = useDailyStepsGoal();
  const [goalInput, setGoalInput] = React.useState(dailyStepsGoal.toString());

  // Calculate progress towards daily goal
  const goalProgress = Math.min((stepCount / dailyStepsGoal) * 100, 100);
  const stepsToGoal = Math.max(dailyStepsGoal - stepCount, 0);

  const handleGoalChange = () => {
    const parsed = parseInt(goalInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setDailyStepsGoal(String(parsed));
    } else {
      setGoalInput(dailyStepsGoal.toString());
    }
  };

  return (
    <View className="mb-4">
      <View className="mb-2 flex-row justify-between">
        <Text className="text-sm text-white/80">Daily Goal</Text>
        <Text className="text-sm text-white/80">
          {stepsToGoal > 0
            ? `${stepsToGoal.toLocaleString()} steps left`
            : 'Goal reached!'}
        </Text>
      </View>
      <View className="h-3 rounded-full bg-white/20">
        <View
          className="h-3 rounded-full bg-green-400"
          style={{ width: `${goalProgress}%` }}
        />
      </View>
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-xs text-white/80">
          Goal: {dailyStepsGoal.toLocaleString()} steps
        </Text>
        <View className="flex-row items-center">
          <Text className="mr-2 text-xs text-white/80">Set goal:</Text>
          <input
            type="number"
            min={1}
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            onBlur={handleGoalChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGoalChange();
            }}
            style={{
              width: 80,
              borderRadius: 4,
              padding: 2,
              border: '1px solid #fff',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
            }}
          />
        </View>
      </View>
    </View>
  );
};

const ProgressDashboard = ({
  stepCount,
  experience,
  cumulativeExperience,
}: {
  stepCount: number;
  experience: number;
  cumulativeExperience: number;
}) => {
  const nextMilestone =
    Math.ceil(stepCount / MILESTONE_INTERVAL) * MILESTONE_INTERVAL;
  const progressToNext = stepCount % MILESTONE_INTERVAL;
  const progressPercentage = (progressToNext / MILESTONE_INTERVAL) * 100;

  return (
    <View className="mb-6 rounded-2xl bg-blue-500 p-6">
      <View className="mb-4 items-center">
        <Text className="text-4xl font-bold text-white">
          {stepCount.toLocaleString()}
        </Text>
        <Text className="text-lg text-white/80">Steps Today</Text>
      </View>

      {/* Daily Goal Progress */}
      <DailyGoalSection stepCount={stepCount} />

      {/* Streak Section */}
      <StreakSection stepCount={stepCount} />

      {/* Progress bar to next milestone */}
      <View className="mb-4">
        <View className="mb-2 flex-row justify-between">
          <Text className="text-sm text-white/80">Progress to Adventure</Text>
          <Text className="text-sm text-white/80">
            {MILESTONE_INTERVAL - (stepCount % MILESTONE_INTERVAL)} steps left
          </Text>
        </View>
        <View className="h-3 rounded-full bg-white/20">
          <View
            className="h-3 rounded-full bg-white"
            style={{
              width: `${((stepCount % MILESTONE_INTERVAL) / MILESTONE_INTERVAL) * 100}%`,
            }}
          />
        </View>
      </View>

      <View className="rounded-xl bg-white/10 p-4">
        <Text className="text-center font-semibold text-white">
          🎯 Next adventure at{' '}
          {(
            Math.ceil(stepCount / MILESTONE_INTERVAL) * MILESTONE_INTERVAL
          ).toLocaleString()}{' '}
          steps
        </Text>
        <Text className="mt-1 text-center text-sm text-white/80">
          Today's XP: {experience.toLocaleString()} | Total XP:{' '}
          {cumulativeExperience.toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

const QuickNavigation = () => {
  const router = useRouter();

  const navigationItems = [
    {
      title: 'Character',
      subtitle: 'View & Edit',
      icon: '⚔️',
      color: 'bg-green-500',
      onPress: () => router.push('/character-sheet'),
    },
    {
      title: 'History',
      subtitle: 'Scenarios & Steps',
      icon: '📚',
      color: 'bg-purple-500',
      onPress: () => router.push('/steps-history'),
    },
    {
      title: 'Settings',
      subtitle: 'App Preferences',
      icon: '⚙️',
      color: 'bg-gray-500',
      onPress: () => router.push('/settings'),
    },
  ];

  return (
    <View className="mb-6">
      <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
        Quick Actions
      </Text>
      <View className="space-y-3">
        {navigationItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`${item.color} flex-row items-center rounded-xl p-4`}
            onPress={item.onPress}
            activeOpacity={0.8}
          >
            <Text className="mr-4 text-2xl">{item.icon}</Text>
            <View className="flex-1">
              <Text className="text-lg font-bold text-white">{item.title}</Text>
              <Text className="text-sm text-white/80">{item.subtitle}</Text>
            </View>
            <Text className="text-xl text-white/60">→</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const CharacterPreview = () => {
  const character = getCharacter();

  if (!character || !character.name) {
    return (
      <View className="mb-6 rounded-xl bg-yellow-100 p-4 dark:bg-yellow-900">
        <Text className="text-center font-semibold text-yellow-800 dark:text-yellow-200">
          🎭 Create your character to start your fitness adventure!
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-6 rounded-xl bg-white p-4 dark:bg-gray-800">
      <Text className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
        Your Character
      </Text>
      <View className="flex-row items-center">
        <View className="mr-4 size-12 items-center justify-center rounded-full bg-blue-500">
          <Text className="text-lg font-bold text-white">
            {character.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-gray-900 dark:text-white">
            {character.name}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Level {character.level} {character.class}
          </Text>
        </View>
        <Text className="text-gray-500 dark:text-gray-400">
          {character.experience.toLocaleString()} XP
        </Text>
      </View>
    </View>
  );
};

const MotivationalSection = ({ stepCount }: { stepCount: number }) => {
  const getMotivationalMessage = () => {
    if (stepCount < 1000) {
      return '🚶‍♂️ Every step counts! Keep moving to unlock your first adventure.';
    } else if (stepCount < 5000) {
      return "💪 Great progress! You're building a healthy habit.";
    } else if (stepCount < 10000) {
      return "🔥 Amazing! You're on fire today!";
    } else {
      return "🏆 Legendary! You're unstoppable!";
    }
  };

  return (
    <View className="mb-6 rounded-xl bg-green-100 p-4 dark:bg-green-900">
      <Text className="text-center font-semibold text-gray-800 dark:text-gray-200">
        {getMotivationalMessage()}
      </Text>
    </View>
  );
};

export default function Home() {
  // Use reactive hook for last checked date
  const [lastCheckedDate] = useLastCheckedDate();

  // Default to start of today if not set
  const lastCheckedDateTime = lastCheckedDate
    ? new Date(lastCheckedDate)
    : (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      })();

  const { stepsByDay, experience, cumulativeExperience } =
    useStepCountAsExperience(lastCheckedDateTime);

  // Calculate today's step count
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySteps =
    stepsByDay.find((day) => {
      if (!day || !day.date) return false;

      // Handle both Date objects and string dates
      const dayDate =
        typeof day.date === 'string' ? new Date(day.date) : day.date;
      return dayDate.getTime() === today.getTime();
    })?.steps || 0;

  // Trigger scenarios based on step count
  useScenarioTrigger(todaySteps);

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        <Text className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Welcome Back!
        </Text>

        <ProgressDashboard
          stepCount={todaySteps}
          experience={experience}
          cumulativeExperience={cumulativeExperience}
        />

        <CharacterPreview />

        <QuickNavigation />

        <MotivationalSection stepCount={todaySteps} />
      </View>
    </ScrollView>
  );
}
