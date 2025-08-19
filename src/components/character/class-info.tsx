import React from 'react';

import { AttributeList, ClassCard, FeatureList } from '@/components/ui';

import { FITNESS_CLASSES } from '../../types/character';

type ClassInfoProps = {
  characterClass: string;
  variant?: 'compact' | 'detailed';
  showAttributes?: boolean;
};

const ClassAttributes: React.FC<{
  attributes: { might: number; speed: number; fortitude: number };
}> = ({ attributes }) => (
  <AttributeList
    title="Starting Attributes"
    attributes={[
      { name: 'Might', value: attributes.might, icon: '💪' },
      { name: 'Speed', value: attributes.speed, icon: '⚡' },
      { name: 'Fortitude', value: attributes.fortitude, icon: '🛡️' },
    ]}
  />
);

const ClassStrengths: React.FC<{
  strengths: Record<string, string>;
  variant?: 'compact' | 'detailed';
}> = ({ strengths, variant = 'detailed' }) => (
  <FeatureList
    title="Strengths"
    features={strengths}
    variant={variant}
    colorScheme="green"
  />
);

const ClassWeaknesses: React.FC<{
  weaknesses: Record<string, string>;
  variant?: 'compact' | 'detailed';
}> = ({ weaknesses, variant = 'detailed' }) => (
  <FeatureList
    title="Weaknesses"
    features={weaknesses}
    variant={variant}
    colorScheme="red"
  />
);

const ClassSpecialAbility: React.FC<{
  specialAbility: string;
  variant?: 'compact' | 'detailed';
}> = ({ specialAbility, variant = 'detailed' }) => (
  <FeatureList
    title="Special Ability"
    features={[specialAbility]}
    variant={variant}
    colorScheme="purple"
  />
);

export const ClassInfo: React.FC<ClassInfoProps> = ({
  characterClass,
  variant = 'detailed',
  showAttributes = false,
}) => {
  const classData =
    FITNESS_CLASSES[characterClass as keyof typeof FITNESS_CLASSES];
  if (!classData) return null;

  return (
    <ClassCard
      title={characterClass}
      description={classData.description}
      variant={variant}
    >
      {showAttributes && <ClassAttributes attributes={classData.attributes} />}
      <ClassStrengths strengths={classData.strengths} variant={variant} />
      <ClassWeaknesses weaknesses={classData.weaknesses} variant={variant} />
      <ClassSpecialAbility
        specialAbility={classData.specialAbility}
        variant={variant}
      />
    </ClassCard>
  );
};
