import type { EncounterType, Scenario } from '../types/scenario';

// TODO: PHASE 2 - Expand scenario variety - Add more merchant and monster encounters
// TODO: PHASE 2 - Add scenario outcomes - Implement actual rewards and consequences

const ENCOUNTER_TYPES: EncounterType[] = ['merchant', 'monster'];

const SCENARIO_TEMPLATES: Record<EncounterType, Omit<Scenario, 'id'>[]> = {
  merchant: [
    {
      type: 'merchant',
      title: 'Mystical Merchant',
      description:
        'A hooded figure offers rare potions and enchanted gear. Their wares glow with magical energy.',
      reward: 'Gain a random magical item or health potion',
    },
    {
      type: 'merchant',
      title: 'Traveling Trader',
      description:
        'A friendly merchant with a colorful cart full of exotic goods from distant lands.',
      reward: 'Receive bonus XP or special equipment',
    },
    {
      type: 'merchant',
      title: 'Black Market Dealer',
      description:
        'A shady character in dark robes offers powerful but risky items. Choose wisely.',
      reward: 'High risk, high reward items available',
    },
  ],
  monster: [
    {
      type: 'monster',
      title: 'Ancient Guardian',
      description:
        'A massive stone golem blocks your path. Its eyes glow with ancient magic.',
      reward: 'Defeat for rare loot or flee to safety',
    },
    {
      type: 'monster',
      title: 'Shadow Stalker',
      description:
        'A dark creature emerges from the shadows, its form shifting and unstable.',
      reward: 'Battle for experience or sneak past',
    },
    {
      type: 'monster',
      title: 'Wild Beast',
      description:
        'A ferocious creature with glowing eyes and sharp claws stands in your way.',
      reward: 'Fight for glory or find another path',
    },
  ],
};

export function generateRandomScenarios<T extends Scenario>(
  milestone: number,
  encounterTypes: EncounterType[] = ENCOUNTER_TYPES,
  scenarioTemplates: Record<
    EncounterType,
    Omit<T, 'id'>[]
  > = SCENARIO_TEMPLATES as Record<EncounterType, Omit<T, 'id'>[]>
): T[] {
  // Shuffle and pick two different encounter types
  const shuffled = encounterTypes.sort(() => 0.5 - Math.random());
  const [type1, type2] = shuffled;

  // Pick random scenarios for each type
  const scenario1 =
    scenarioTemplates[type1][
      Math.floor(Math.random() * scenarioTemplates[type1].length)
    ];
  const scenario2 =
    scenarioTemplates[type2][
      Math.floor(Math.random() * scenarioTemplates[type2].length)
    ];

  return [
    { ...scenario1, id: `${scenario1.type}_${milestone}_1` } as T,
    { ...scenario2, id: `${scenario2.type}_${milestone}_2` } as T,
  ];
}
