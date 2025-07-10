import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { ClassDetails } from '../class-details';

describe('ClassDetails', () => {
  it('renders class details for General Fitness', () => {
    render(<ClassDetails selectedClass="General Fitness" />);
    
    expect(screen.getByText('General Fitness')).toBeTruthy();
    expect(screen.getByText('Balanced approach to overall health')).toBeTruthy();
    expect(screen.getByText('Starting Attributes:')).toBeTruthy();
    expect(screen.getByText('💪 Might: 8')).toBeTruthy();
    expect(screen.getByText('⚡ Speed: 8')).toBeTruthy();
    expect(screen.getByText('🛡️ Fortitude: 8')).toBeTruthy();
    expect(screen.getByText('Strengths:')).toBeTruthy();
    expect(screen.getByText('Weaknesses:')).toBeTruthy();
    expect(screen.getByText('Special Ability:')).toBeTruthy();
  });

  it('renders class details for Cardio Crusher', () => {
    render(<ClassDetails selectedClass="Cardio Crusher" />);
    
    expect(screen.getByText('Cardio Crusher')).toBeTruthy();
    expect(screen.getByText('Focus on heart health and endurance')).toBeTruthy();
    expect(screen.getByText('💪 Might: 6')).toBeTruthy();
    expect(screen.getByText('⚡ Speed: 12')).toBeTruthy();
    expect(screen.getByText('🛡️ Fortitude: 10')).toBeTruthy();
  });

  it('returns null for invalid class', () => {
    const { queryByText } = render(<ClassDetails selectedClass="Invalid Class" />);
    expect(queryByText('Invalid Class')).toBeNull();
  });
}); 