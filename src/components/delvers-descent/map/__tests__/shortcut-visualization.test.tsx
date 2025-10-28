import React from 'react';
import { render } from '@testing-library/react-native';

import { ShortcutVisualization } from '../shortcut-visualization';
import type { Shortcut } from '@/types/delvers-descent';

describe('ShortcutVisualization (Task 1.7)', () => {
  const createMockShortcut = (
    id: string,
    fromDepth: number,
    toDepth: number,
    energyReduction: number
  ): Shortcut => ({
    id,
    fromDepth,
    toDepth,
    energyReduction,
    isPermanent: false,
  });

  it('should render shortcut visualization', () => {
    const shortcuts = [
      createMockShortcut('shortcut-1', 2, 1, 5),
      createMockShortcut('shortcut-2', 3, 1, 10),
    ];
    
    const { getByTestId } = render(<ShortcutVisualization shortcuts={shortcuts} />);
    
    expect(getByTestId('shortcut-visualization')).toBeDefined();
  });

  it('should display all shortcuts', () => {
    const shortcuts = [
      createMockShortcut('shortcut-1', 2, 1, 5),
      createMockShortcut('shortcut-2', 3, 1, 10),
    ];
    
    const { getByText } = render(<ShortcutVisualization shortcuts={shortcuts} />);
    
    expect(getByText(/Depth 2/i)).toBeDefined();
    expect(getByText(/Depth 3/i)).toBeDefined();
  });

  it('should show energy reduction for each shortcut', () => {
    const shortcuts = [
      createMockShortcut('shortcut-1', 2, 1, 5),
    ];
    
    const { getByText } = render(<ShortcutVisualization shortcuts={shortcuts} />);
    
    expect(getByText(/5/i)).toBeDefined();
  });

  it('should indicate permanent shortcuts', () => {
    const permanentShortcut: Shortcut = createMockShortcut('shortcut-1', 2, 1, 5);
    permanentShortcut.isPermanent = true;
    
    const { getByText } = render(<ShortcutVisualization shortcuts={[permanentShortcut]} />);
    
    expect(getByText(/Permanent/i)).toBeDefined();
  });

  it('should handle empty shortcuts array', () => {
    const { getByText } = render(<ShortcutVisualization shortcuts={[]} />);
    
    expect(getByText(/No shortcuts/i)).toBeDefined();
  });

  it('should show shortcut depth range', () => {
    const shortcuts = [
      createMockShortcut('shortcut-1', 3, 1, 15),
    ];
    
    const { getByText } = render(<ShortcutVisualization shortcuts={shortcuts} />);
    
    expect(getByText(/3.*1/i)).toBeDefined();
  });

  it('should highlight shortcuts with high energy savings', () => {
    const shortcuts = [
      createMockShortcut('shortcut-1', 2, 1, 20),
      createMockShortcut('shortcut-2', 3, 1, 5),
    ];
    
    const { getByText } = render(<ShortcutVisualization shortcuts={shortcuts} />);
    
    expect(getByText(/20/i)).toBeDefined();
  });
});

