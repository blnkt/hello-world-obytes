import { FITNESS_BACKGROUNDS, FITNESS_CLASSES } from '../../types/character';

export const getValidFitnessBackground = (fitnessBackground: string) =>
  FITNESS_BACKGROUNDS[fitnessBackground as keyof typeof FITNESS_BACKGROUNDS]
    ? fitnessBackground
    : Object.keys(FITNESS_BACKGROUNDS)[0];

export const getValidClass = (characterClass: string) =>
  FITNESS_CLASSES[characterClass as keyof typeof FITNESS_CLASSES]
    ? characterClass
    : Object.keys(FITNESS_CLASSES)[0];
