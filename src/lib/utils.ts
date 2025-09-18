/**
 * Centralized utility functions for the application
 * This file consolidates duplicate utility functions across the codebase
 */

/**
 * Date formatting utilities
 */
export const formatDate = (dateString: string | Date): string => {
  try {
    const date =
      typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatDateTime = (dateInput: string | Date | number): string => {
  try {
    const date =
      typeof dateInput === 'number'
        ? new Date(dateInput)
        : typeof dateInput === 'string'
          ? new Date(dateInput)
          : dateInput;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatDateDetailed = (dateString: string): string => {
  try {
    // Create date in local timezone to avoid UTC conversion issues
    const [year, month, day] = dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day); // month is 0-indexed

    return localDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Validation utilities
 */
export const validateStepCount = (val: string): string | undefined => {
  if (!val || val.trim() === '') {
    return 'Step count is required';
  }
  if (!/^[0-9]+$/.test(val)) {
    if (/\./.test(val)) return 'Step count must be a whole number';
    return 'Step count must be a positive number';
  }
  const num = Number(val);
  if (num < 1) return 'Step count must be at least 1 step';
  if (num > 100000)
    return 'Step count exceeds maximum daily limit of 100,000 steps';
  return undefined;
};

export const validateI18nMessage = (message = ''): void => {
  if (!(message || '').trim()) {
    throw new SyntaxError('Message is Empty.');
  }
  if (typeof message !== 'string') {
    throw new TypeError('Message must be a String.');
  }
};

/**
 * String utilities
 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str: string, length: number): string => {
  if (!str || str.length <= length) return str;
  return str.slice(0, length) + '...';
};

/**
 * Number utilities
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Array utilities
 */
export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

export const groupBy = <T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> => {
  return array.reduce(
    (groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    },
    {} as Record<K, T[]>
  );
};

/**
 * Object utilities
 */
export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
};

/**
 * Async utilities
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
