import React from 'react';
import { render, screen } from '@testing-library/react-native';

import CurrencyDisplay from './currency-display';

describe('CurrencyDisplay', () => {
  const defaultProps = {
    currency: 1000,
    availableTurns: 10,
    turnCost: 100,
  };

  it('should render currency information correctly', () => {
    render(<CurrencyDisplay {...defaultProps} />);
    
    expect(screen.getByText('Currency & Turns')).toBeTruthy();
    expect(screen.getByText('1000 steps')).toBeTruthy();
    expect(screen.getByText('100 steps')).toBeTruthy();
  });

  it('should render available turns correctly', () => {
    render(<CurrencyDisplay {...defaultProps} />);
    
    expect(screen.getByText('Available Turns:')).toBeTruthy();
    expect(screen.getByText('10')).toBeTruthy();
  });

  it('should display ready to play status when sufficient turns available', () => {
    render(<CurrencyDisplay {...defaultProps} />);
    
    expect(screen.getByText('💰')).toBeTruthy();
    expect(screen.getByText('Ready to play')).toBeTruthy();
    expect(screen.getByText('10 turns available')).toBeTruthy();
  });

  it('should display low currency warning when turns are limited', () => {
    render(<CurrencyDisplay {...defaultProps} availableTurns={2} />);
    
    expect(screen.getByText('⚡')).toBeTruthy();
    expect(screen.getByText('Low currency warning')).toBeTruthy();
    expect(screen.getByText('Only 2 turns remaining')).toBeTruthy();
  });

  it('should display insufficient currency warning when no turns available', () => {
    render(<CurrencyDisplay {...defaultProps} availableTurns={0} />);
    
    expect(screen.getByText('⚠️')).toBeTruthy();
    expect(screen.getByText('Insufficient currency to play')).toBeTruthy();
    expect(screen.getByText('Need at least 100 steps')).toBeTruthy();
  });

  it('should handle different currency amounts correctly', () => {
    render(<CurrencyDisplay {...defaultProps} currency={500} />);
    
    expect(screen.getByText('500 steps')).toBeTruthy();
  });

  it('should handle different turn costs correctly', () => {
    render(<CurrencyDisplay {...defaultProps} turnCost={50} />);
    
    expect(screen.getByText('50 steps')).toBeTruthy();
  });

  it('should handle edge case of exactly 3 turns', () => {
    render(<CurrencyDisplay {...defaultProps} availableTurns={3} />);
    
    expect(screen.getByText('💰')).toBeTruthy();
    expect(screen.getByText('Ready to play')).toBeTruthy();
    expect(screen.getByText('3 turns available')).toBeTruthy();
  });

  it('should handle edge case of exactly 1 turn', () => {
    render(<CurrencyDisplay {...defaultProps} availableTurns={1} />);
    
    expect(screen.getByText('⚡')).toBeTruthy();
    expect(screen.getByText('Low currency warning')).toBeTruthy();
    expect(screen.getByText('Only 1 turns remaining')).toBeTruthy();
  });

  it('should display correct status colors for different turn counts', () => {
    const { rerender } = render(<CurrencyDisplay {...defaultProps} availableTurns={5} />);
    
    // Should show green status for 5 turns
    expect(screen.getByText('Ready to play')).toBeTruthy();
    
    // Rerender with low turns
    rerender(<CurrencyDisplay {...defaultProps} availableTurns={2} />);
    expect(screen.getByText('Low currency warning')).toBeTruthy();
    
    // Rerender with no turns
    rerender(<CurrencyDisplay {...defaultProps} availableTurns={0} />);
    expect(screen.getByText('Insufficient currency to play')).toBeTruthy();
  });
});
