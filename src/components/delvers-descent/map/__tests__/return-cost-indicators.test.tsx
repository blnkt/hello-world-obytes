import React from 'react';
import { render } from '@testing-library/react-native';

import { ReturnCostIndicators } from '../return-cost-indicators';

describe('ReturnCostIndicators (Task 1.6)', () => {
  it('should render return cost indicators', () => {
    const { getByTestId } = render(
      <ReturnCostIndicators 
        currentEnergy={50}
        returnCost={30}
        depth={2}
      />
    );
    
    expect(getByTestId('return-cost-indicators')).toBeDefined();
  });

  it('should display return cost value', () => {
    const { getByText } = render(
      <ReturnCostIndicators 
        currentEnergy={50}
        returnCost={30}
        depth={2}
      />
    );
    
    expect(getByText(/Return Cost/i)).toBeDefined();
  });

  it('should calculate and display safety margin', () => {
    const { getAllByText } = render(
      <ReturnCostIndicators 
        currentEnergy={50}
        returnCost={30}
        depth={2}
      />
    );
    
    expect(getAllByText(/Safety/i).length).toBeGreaterThan(0);
  });

  it('should show positive safety margin when energy is sufficient', () => {
    const { getByText } = render(
      <ReturnCostIndicators 
        currentEnergy={50}
        returnCost={30}
        depth={2}
      />
    );
    
    expect(getByText(/20/i)).toBeDefined();
  });

  it('should show warning when safety margin is low', () => {
    const { getByTestId } = render(
      <ReturnCostIndicators 
        currentEnergy={35}
        returnCost={30}
        depth={2}
      />
    );
    
    expect(getByTestId('return-cost-indicators')).toBeDefined();
  });

  it('should indicate critical safety margin', () => {
    const { getByText } = render(
      <ReturnCostIndicators 
        currentEnergy={25}
        returnCost={30}
        depth={2}
      />
    );
    
    expect(getByText(/Return Cost/i)).toBeDefined();
  });

  it('should display depth information', () => {
    const { getAllByText } = render(
      <ReturnCostIndicators 
        currentEnergy={50}
        returnCost={30}
        depth={3}
      />
    );
    
    expect(getAllByText(/Depth/i).length).toBeGreaterThan(0);
  });

  it('should show recommended action when margin is low', () => {
    const { getByText } = render(
      <ReturnCostIndicators 
        currentEnergy={35}
        returnCost={30}
        depth={2}
      />
    );
    
    expect(getByText(/Low safety/i)).toBeDefined();
  });
});

