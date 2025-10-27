import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { SafetyMarginIndicator } from './safety-margin-indicator';

describe('SafetyMarginIndicator', () => {
  it('should render with safe zone', () => {
    render(<SafetyMarginIndicator currentEnergy={200} returnCost={50} />);

    expect(screen.getByTestId('safety-margin-indicator')).toBeDefined();
    expect(screen.getByText(/Safe Zone/)).toBeDefined();
  });

  it('should render with caution zone', () => {
    render(<SafetyMarginIndicator currentEnergy={100} returnCost={70} />);

    expect(screen.getByTestId('safety-margin-indicator')).toBeDefined();
    expect(screen.getByText(/Caution Zone/)).toBeDefined();
  });

  it('should render with danger zone', () => {
    render(<SafetyMarginIndicator currentEnergy={100} returnCost={85} />);

    expect(screen.getByTestId('safety-margin-indicator')).toBeDefined();
    expect(screen.getByText(/Danger Zone/)).toBeDefined();
  });

  it('should render with critical zone', () => {
    render(<SafetyMarginIndicator currentEnergy={100} returnCost={95} />);

    expect(screen.getByTestId('safety-margin-indicator')).toBeDefined();
    expect(screen.getByText(/Critical Zone/)).toBeDefined();
  });

  it('should render with negative margin', () => {
    render(<SafetyMarginIndicator currentEnergy={50} returnCost={100} />);

    expect(screen.getByTestId('safety-margin-indicator')).toBeDefined();
  });

  it('should render with zero margin', () => {
    render(<SafetyMarginIndicator currentEnergy={100} returnCost={100} />);

    expect(screen.getByTestId('safety-margin-indicator')).toBeDefined();
  });

  it('should have correct safety level for each zone', () => {
    const { container, rerender } = render(
      <SafetyMarginIndicator currentEnergy={200} returnCost={50} />
    );
    expect(screen.getByText(/Safe/)).toBeDefined();

    rerender(<SafetyMarginIndicator currentEnergy={100} returnCost={70} />);
    expect(screen.getByText(/Caution/)).toBeDefined();

    rerender(<SafetyMarginIndicator currentEnergy={100} returnCost={85} />);
    expect(screen.getByText(/Danger/)).toBeDefined();

    rerender(<SafetyMarginIndicator currentEnergy={100} returnCost={95} />);
    expect(screen.getByText(/Critical/)).toBeDefined();
  });

  it('should display different sizes', () => {
    const { rerender } = render(
      <SafetyMarginIndicator currentEnergy={100} returnCost={50} size="small" />
    );
    expect(screen.getByTestId('safety-margin-indicator')).toBeDefined();

    rerender(
      <SafetyMarginIndicator currentEnergy={100} returnCost={50} size="large" />
    );
    expect(screen.getByTestId('safety-margin-indicator')).toBeDefined();
  });
});
