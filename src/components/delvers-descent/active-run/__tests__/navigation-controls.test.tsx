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
    // Continue button was removed; ensure it is not rendered
    const { queryByText } = render(
      <NavigationControls {...defaultProps} />
    );
    expect(queryByText(/Continue/)).toBeNull();
  });

  it('should not render continue button when onContinue is not provided', () => {
    const { queryByText } = render(<NavigationControls {...defaultProps} />);
    expect(queryByText(/Continue/)).toBeNull();
  });

  // Removed tests related to Continue Deeper button appearance and behavior

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

  // Removed threshold styling tests tied to Continue Deeper button

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
