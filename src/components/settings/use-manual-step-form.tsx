import React from 'react';

import { setManualStepEntry } from '@/lib/storage';

// Utility functions
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // YYYY-MM-DD format
};

const validateStepCount = (stepCount: string): string | null => {
  if (!stepCount.trim()) {
    return 'Please enter a step count';
  }
  const steps = parseInt(stepCount, 10);
  if (isNaN(steps) || steps < 1) {
    return 'Please enter a valid step count';
  }
  if (steps > 100000) {
    return 'Step count cannot exceed 100,000';
  }
  return null;
};

const resetForm = (
  setStepCount: React.Dispatch<React.SetStateAction<string>>,
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>
) => {
  setStepCount('');
  setSelectedDate(getTodayDateString());
};

export const useManualStepForm = (onStepAdded: () => void) => {
  const [stepCount, setStepCount] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState(getTodayDateString);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const handleSubmit = async () => {
    const validationError = validateStepCount(stepCount);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(undefined);

      const steps = parseInt(stepCount, 10);

      await setManualStepEntry({
        date: selectedDate,
        steps,
        source: 'manual',
      });

      resetForm(setStepCount, setSelectedDate);
      onStepAdded();

      alert(
        `Successfully added ${steps.toLocaleString()} steps for ${selectedDate}!`
      );
    } catch (error) {
      console.error('Error adding manual step entry:', error);
      setError('Failed to add step entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    stepCount,
    setStepCount,
    selectedDate,
    setSelectedDate,
    isSubmitting,
    error,
    handleSubmit,
  };
};
