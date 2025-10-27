import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import React from 'react';

import { ReturnCostDisplay } from './return-cost-display';

describe('ReturnCostDisplay Component (Task 5.1)', () => {
  describe('basic functionality', () => {
    it('should render return cost display', () => {
      render(
        <ReturnCostDisplay
          currentEnergy={100}
          returnCost={50}
          currentDepth={3}
        />
      );

      expect(screen.getByTestId('return-cost-display')).toBeInTheDocument();
      expect(screen.getByText('Return to Surface')).toBeInTheDocument();
    });

    it('should display current energy and return cost', () => {
      render(
        <ReturnCostDisplay
          currentEnergy={100}
          returnCost={50}
          currentDepth={3}
        />
      );

      expect(screen.getByText('100')).toBeInTheDocument(); // Current energy
      expect(screen.getByTestId('return-cost-value')).toHaveTextContent('50');
    });

    it('should display depth information', () => {
      render(
        <ReturnCostDisplay
          currentEnergy={100}
          returnCost={50}
          currentDepth={5}
        />
      );

      expect(screen.getByText('Depth: 5')).toBeInTheDocument();
    });

    it('should calculate and display safety margin', () => {
      render(
        <ReturnCostDisplay
          currentEnergy={100}
          returnCost={50}
          currentDepth={3}
        />
      );

      // Safety margin should be +50
      expect(screen.getByText('+50')).toBeInTheDocument();
    });
  });

  describe('highlight modes', () => {
    it('should render without highlighting by default', () => {
      render(
        <ReturnCostDisplay
          currentEnergy={100}
          returnCost={50}
          currentDepth={3}
        />
      );

      // Should not have prominent or critical styling
      const display = screen.getByTestId('return-cost-display');
      expect(display).toBeInTheDocument();
    });

    it('should highlight when highlightMode is "prominent"', () => {
      render(
        <ReturnCostDisplay
          currentEnergy={100}
          returnCost={50}
          currentDepth={3}
          highlightMode="prominent"
        />
      );

      // Should have safety indicator bar
      expect(screen.getByTestId('safety-indicator-bar')).toBeInTheDocument();
    });

    it('should show critical highlighting when highlightMode is "critical"', () => {
      render(
        <ReturnCostDisplay
          currentEnergy={30}
          returnCost={50}
          currentDepth={5}
          highlightMode="critical"
        />
      );

      const warning = screen.getByTestId('critical-warning');
      expect(warning).toBeInTheDocument();
      expect(warning.textContent).toContain('Point of No Return');
    });

    it('should show visual safety indicator when prominent', () => {
      render(
        <ReturnCostDisplay
          currentEnergy={100}
          returnCost={50}
          currentDepth={3}
          highlightMode="prominent"
        />
      );

      expect(screen.getByTestId('safety-indicator-bar')).toBeInTheDocument();
    });
  });

  describe('safety level detection', () => {
    it('should show safe styling when safety margin >= 50%', () => {
      render(
        <ReturnCostDisplay
          currentEnergy={100}
          returnCost={45}
          currentDepth={3}
          highlightMode="prominent"
        />
      );

      expect(screen.getByTestId('return-cost-value')).toHaveClass(
        'text-green-600'
      );
    });

    it('should show caution styling when safety margin >= 30% and < 50%', () => {
      render(
        <ReturnCostDisplay
          currentEnergy={100}
          returnCost={65}
          currentDepth={3}
          highlightMode="prominent"
        />
      );

      expect(screen.getByTestId('return-cost-value')).toHaveClass(
        'text-yellow-600'
      );
    });

    it('should show danger styling when safety margin >= 10% and < 30%', () => {
      render(
        <ReturnCostDisplay
          currentEnergy={100}
          returnCost={85}
          currentDepth={3}
          highlightMode="prominent"
        />
      );

      expect(screen.getByTestId('return-cost-value')).toHaveClass(
        'text-orange-600'
      );
    });

    it('should show critical styling when safety margin < 10%', () => {
      render(
        <ReturnCostDisplay
          currentEnergy={100}
          returnCost={95}
          currentDepth={3}
          highlightMode="prominent"
        />
      );

      expect(screen.getByTestId('return-cost-value')).toHaveClass(
        'text-red-600'
      );
    });

    it('should show critical warning when cannot afford return', () => {
      render(
        <ReturnCostDisplay
          currentEnergy={30}
          returnCost={50}
          currentDepth={5}
          highlightMode="prominent"
        />
      );

      expect(screen.getByTestId('critical-warning')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle zero energy gracefully', () => {
      render(
        <ReturnCostDisplay currentEnergy={0} returnCost={50} currentDepth={3} />
      );

      expect(screen.getByTestId('return-cost-value')).toHaveTextContent('50');
    });

    it('should handle negative safety margin (cannot afford return)', () => {
      render(
        <ReturnCostDisplay
          currentEnergy={30}
          returnCost={50}
          currentDepth={5}
          highlightMode="critical"
        />
      );

      expect(screen.getByText('-20')).toBeInTheDocument();
      expect(screen.getByTestId('critical-warning')).toBeInTheDocument();
    });

    it('should handle very large energy values', () => {
      render(
        <ReturnCostDisplay
          currentEnergy={100000}
          returnCost={50000}
          currentDepth={10}
        />
      );

      expect(screen.getByTestId('return-cost-value')).toHaveTextContent(
        '50,000'
      );
      expect(screen.getByTestId('safety-margin-value')).toHaveTextContent(
        '+50,000'
      );
    });

    it('should display depth at all levels', () => {
      [1, 5, 10, 20].forEach((depth) => {
        const { unmount } = render(
          <ReturnCostDisplay
            currentEnergy={100}
            returnCost={50}
            currentDepth={depth}
          />
        );

        expect(screen.getByText(`Depth: ${depth}`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('accessibility', () => {
    it('should have descriptive labels for cost information', () => {
      render(
        <ReturnCostDisplay
          currentEnergy={100}
          returnCost={50}
          currentDepth={3}
        />
      );

      expect(screen.getByText('Energy Cost:')).toBeInTheDocument();
      expect(screen.getByText('Safety Margin:')).toBeInTheDocument();
      expect(screen.getByText('Current Energy:')).toBeInTheDocument();
    });

    it('should make critical warnings clearly visible', () => {
      render(
        <ReturnCostDisplay
          currentEnergy={10}
          returnCost={50}
          currentDepth={5}
          highlightMode="critical"
        />
      );

      const warning = screen.getByTestId('critical-warning');
      expect(warning).toHaveClass('text-red-700');
      expect(warning).toHaveClass('font-medium');
    });
  });
});
