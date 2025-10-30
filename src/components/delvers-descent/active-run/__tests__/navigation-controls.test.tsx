import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { NavigationControls } from '../navigation-controls';

describe('NavigationControls', () => {
  const defaultProps = {
    onCashOut: jest.fn(),
    energyRemaining: 100,
    returnCost: 50,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render cash out button', () => {
    const { getByText } = render(<NavigationControls {...defaultProps} />);
    expect(getByText('💰 Cash Out')).toBeDefined();
  });

  it('should call onCashOut when cash out button is pressed', () => {
    const onCashOut = jest.fn();
    const { getByText } = render(
      <NavigationControls {...defaultProps} onCashOut={onCashOut} />
    );

    const cashOutButton = getByText('💰 Cash Out');
    fireEvent.press(cashOutButton);
    expect(onCashOut).toHaveBeenCalledTimes(1);
  });

  it('should render continue button when onContinue is provided', () => {
    const onContinue = jest.fn();
    const { getByText } = render(
      <NavigationControls {...defaultProps} onContinue={onContinue} />
    );
    expect(getByText(/Continue/)).toBeDefined();
  });

  it('should not render continue button when onContinue is not provided', () => {
    const { queryByText } = render(<NavigationControls {...defaultProps} />);
    expect(queryByText(/Continue/)).toBeNull();
  });

  it('should call onContinue when continue button is pressed', () => {
    const onContinue = jest.fn();
    const { getByText } = render(
      <NavigationControls {...defaultProps} onContinue={onContinue} />
    );

    const continueButton = getByText(/Continue/);
    fireEvent.press(continueButton);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('should display safe continue button when energy is sufficient', () => {
    const onContinue = jest.fn();
    const { getByText } = render(
      <NavigationControls
        {...defaultProps}
        onContinue={onContinue}
        energyRemaining={150}
        returnCost={50}
      />
    );
    // Should be blue when safe (not orange)
    expect(getByText('▶️ Continue Deeper')).toBeDefined();
  });

  it('should display risky continue button when energy is low', () => {
    const onContinue = jest.fn();
    const { getByText } = render(
      <NavigationControls
        {...defaultProps}
        onContinue={onContinue}
        energyRemaining={60}
        returnCost={50}
      />
    );
    // Should be orange when dangerous
    expect(getByText('⚠️ Continue (Risky)')).toBeDefined();
  });

  it('should show warning when cannot return safely', () => {
    const { getByText } = render(
      <NavigationControls
        {...defaultProps}
        energyRemaining={30}
        returnCost={50}
      />
    );

    expect(
      getByText('⚠️ Warning: Insufficient energy to return safely!')
    ).toBeDefined();
  });

  it('should not show warning when can return safely', () => {
    const { queryByText } = render(
      <NavigationControls
        {...defaultProps}
        energyRemaining={100}
        returnCost={50}
      />
    );

    expect(
      queryByText('⚠️ Warning: Insufficient energy to return safely!')
    ).toBeNull();
  });

  it('should calculate dangerous threshold correctly (1.5x return cost)', () => {
    const onContinue = jest.fn();
    const returnCost = 50;

    // Safe: 100 energy, return cost 50, threshold is 75
    // 100 > 75, so should be safe
    const safeRender = render(
      <NavigationControls
        {...defaultProps}
        onContinue={onContinue}
        energyRemaining={100}
        returnCost={returnCost}
      />
    );
    expect(safeRender.getByText('▶️ Continue Deeper')).toBeDefined();

    // Dangerous: 60 energy, return cost 50, threshold is 75
    // 60 < 75, so should be dangerous
    const dangerousRender = render(
      <NavigationControls
        {...defaultProps}
        onContinue={onContinue}
        energyRemaining={60}
        returnCost={returnCost}
      />
    );
    expect(dangerousRender.getByText('⚠️ Continue (Risky)')).toBeDefined();
  });

  it('should handle edge case at dangerous threshold', () => {
    const onContinue = jest.fn();
    const returnCost = 50;
    const threshold = returnCost * 1.5; // 75

    // Exactly at threshold - should be safe (>=)
    const atThreshold = render(
      <NavigationControls
        {...defaultProps}
        onContinue={onContinue}
        energyRemaining={threshold}
        returnCost={returnCost}
      />
    );
    expect(atThreshold.getByText('▶️ Continue Deeper')).toBeDefined();

    // Just below threshold - should be dangerous
    const belowThreshold = render(
      <NavigationControls
        {...defaultProps}
        onContinue={onContinue}
        energyRemaining={threshold - 1}
        returnCost={returnCost}
      />
    );
    expect(belowThreshold.getByText('⚠️ Continue (Risky)')).toBeDefined();
  });

  it('should handle zero energy', () => {
    const { getByText, queryByText } = render(
      <NavigationControls
        {...defaultProps}
        energyRemaining={0}
        returnCost={50}
      />
    );

    expect(
      getByText('⚠️ Warning: Insufficient energy to return safely!')
    ).toBeDefined();
    expect(queryByText(/Continue/)).toBeNull();
  });
});
