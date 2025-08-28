// Mock for the currency system used in dungeon game tests
// This provides a consistent way to mock useCurrencySystem across all test files

// Define the type based on what useCurrencySystem returns
export interface CurrencySystemHook {
  currency: number;
  availableCurrency: number;
  totalCurrencyEarned: number;
  convertCurrentExperience: () => Promise<number>;
  spend: (amount: number) => Promise<boolean>;
  conversionRate: number;
}

// Default mock implementation
const defaultMockCurrencySystem: CurrencySystemHook = {
  currency: 1000,
  availableCurrency: 0,
  totalCurrencyEarned: 1000,
  convertCurrentExperience: jest.fn().mockResolvedValue(0),
  spend: jest.fn().mockResolvedValue(true),
  conversionRate: 0.1,
};

// Mock function that can be controlled in tests
export const useCurrencySystem = jest.fn(() => defaultMockCurrencySystem);

// Helper function for consistent mock setup
export const mockUseCurrencySystem = (currency: number) => {
  useCurrencySystem.mockReturnValue({
    ...defaultMockCurrencySystem,
    currency,
    totalCurrencyEarned: currency,
  });
};

// Helper function to set specific currency values for different test scenarios
export const mockUseCurrencySystemWithValues = (
  overrides: Partial<CurrencySystemHook>
) => {
  useCurrencySystem.mockReturnValue({
    ...defaultMockCurrencySystem,
    ...overrides,
  });
};

// Reset function to clear mock state
export const resetUseCurrencySystem = () => {
  useCurrencySystem.mockReset();
  useCurrencySystem.mockImplementation(() => defaultMockCurrencySystem);
};

// Common currency scenarios for testing
export const currencyScenarios = {
  // Insufficient currency (can't start game)
  insufficient: () => mockUseCurrencySystem(50),

  // Minimum currency (exactly 1 turn)
  minimum: () => mockUseCurrencySystem(100),

  // Standard currency (10 turns)
  standard: () => mockUseCurrencySystem(1000),

  // High currency (100 turns)
  high: () => mockUseCurrencySystem(10000),

  // Very high currency (1000 turns)
  veryHigh: () => mockUseCurrencySystem(100000),

  // Zero currency (can't play)
  zero: () => mockUseCurrencySystem(0),
};

// Export the mock for Jest to use
export default {
  useCurrencySystem,
  mockUseCurrencySystem,
  mockUseCurrencySystemWithValues,
  resetUseCurrencySystem,
  currencyScenarios,
};
