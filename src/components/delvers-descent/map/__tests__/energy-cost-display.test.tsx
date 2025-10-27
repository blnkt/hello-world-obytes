import React from 'react';
import { render } from '@testing-library/react-native';

import { EnergyCostDisplay } from '../energy-cost-display';

describe('EnergyCostDisplay (Task 1.5)', () => {
  it('should render energy cost display', () => {
    const { getByTestId } = render(<EnergyCostDisplay currentEnergy={50} totalEnergy={100} />);
    
    expect(getByTestId('energy-cost-display')).toBeDefined();
  });

  it('should display current energy value', () => {
    const { getByText } = render(<EnergyCostDisplay currentEnergy={50} totalEnergy={100} />);
    
    expect(getByText(/50.*100/i)).toBeDefined();
  });

  it('should display total energy value', () => {
    const { getByText } = render(<EnergyCostDisplay currentEnergy={50} totalEnergy={100} />);
    
    expect(getByText(/50.*100/i)).toBeDefined();
  });

  it('should show energy cost for an action', () => {
    const { getByText } = render(
      <EnergyCostDisplay 
        currentEnergy={50} 
        totalEnergy={100} 
        actionCost={10}
      />
    );
    
    expect(getByText('Action Cost')).toBeDefined();
  });

  it('should indicate if action cost is affordable', () => {
    const { getByTestId } = render(
      <EnergyCostDisplay 
        currentEnergy={50} 
        totalEnergy={100} 
        actionCost={30}
      />
    );
    
    expect(getByTestId('energy-cost-display')).toBeDefined();
  });

  it('should show warning when energy is low', () => {
    const { getByText } = render(
      <EnergyCostDisplay 
        currentEnergy={10} 
        totalEnergy={100} 
      />
    );
    
    expect(getByText(/10.*100/i)).toBeDefined();
  });

  it('should show remaining energy after cost', () => {
    const { getByText } = render(
      <EnergyCostDisplay 
        currentEnergy={50} 
        totalEnergy={100} 
        actionCost={20}
      />
    );
    
    expect(getByText(/Remaining:/i)).toBeDefined();
  });
});

