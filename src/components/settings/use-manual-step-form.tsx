import React from 'react';

import { setManualStepEntry } from '@/lib/storage';

// eslint-disable-next-line max-lines-per-function
export const useManualStepForm = (onStepAdded: () => void) => {
  const [stepCount, setStepCount] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState(() => {
    // Get today's date in local timezone without timezone conversion issues
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD format
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const validateInput = () => {
    if (!stepCount.trim()) {
      setError('Please enter a step count');
      return false;
    }
    const steps = parseInt(stepCount, 10);
    if (isNaN(steps) || steps < 1) {
      setError('Please enter a valid step count');
      return false;
    }
    if (steps > 100000) {
      setError('Step count cannot exceed 100,000');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInput()) return;

    try {
      setIsSubmitting(true);
      setError(undefined);

      const steps = parseInt(stepCount, 10);

      await setManualStepEntry({
        date: selectedDate,
        steps,
        source: 'manual',
      });

      // Reset form with timezone-safe date
      setStepCount('');
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setSelectedDate(`${year}-${month}-${day}`);

      // Notify parent to refresh
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
