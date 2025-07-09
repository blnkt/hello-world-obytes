import { FITNESS_CLASSES } from '../../types/character';

export const getValidClass = (characterClass: string) =>
  FITNESS_CLASSES[characterClass as keyof typeof FITNESS_CLASSES]
    ? characterClass
    : Object.keys(FITNESS_CLASSES)[0];
