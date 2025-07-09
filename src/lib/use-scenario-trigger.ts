import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useMMKVString } from 'react-native-mmkv';

const MILESTONE_INTERVAL = 1000; // Every 1k steps

export function useScenarioTrigger(currentSteps: number) {
  const router = useRouter();
  const segments = useSegments();
  const [lastMilestone, setLastMilestone] = useMMKVString('lastMilestone');

  useEffect(() => {
    // Wait until navigation is ready
    if (segments[0] === undefined) return;

    // Calculate the next milestone based on current steps
    const nextMilestone =
      Math.floor(currentSteps / MILESTONE_INTERVAL) * MILESTONE_INTERVAL;

    // Check if we've crossed a new milestone
    if (
      nextMilestone > 0 &&
      (!lastMilestone || nextMilestone > Number(lastMilestone))
    ) {
      setLastMilestone(String(nextMilestone));
      router.push(`/scenario?milestone=${nextMilestone}`);
    }
  }, [currentSteps, lastMilestone, setLastMilestone, router, segments]);
}
