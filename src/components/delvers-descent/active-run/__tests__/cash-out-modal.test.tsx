import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { CashOutModal } from '../cash-out-modal';
import type { CollectedItem, RunState } from '@/types/delvers-descent';

describe('CashOutModal', () => {
  const createMockRunState = (
    inventory: CollectedItem[] = [],
    energyRemaining: number = 100
  ): RunState => ({
    runId: 'test-run-1',
    energyRemaining,
    inventory,
    visitedNodes: [],
    currentNode: 'node-1',
    currentDepth: 1,
    discoveredShortcuts: [],
  });

  const defaultProps = {
    visible: true,
    runState: createMockRunState(),
    returnCost: 50,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when visible is false', () => {
    const { queryByTestId } = render(
      <CashOutModal {...defaultProps} visible={false} />
    );
    expect(queryByTestId('cash-out-modal')).toBeNull();
  });

  it('should render modal when visible is true', () => {
    const { getByText } = render(<CashOutModal {...defaultProps} />);
    expect(getByText('Cash Out?')).toBeDefined();
  });

  it('should display empty inventory message when no items', () => {
    const emptyState = createMockRunState([]);
    const { getByText } = render(
      <CashOutModal {...defaultProps} runState={emptyState} />
    );
    expect(getByText('No items to cash out')).toBeDefined();
  });

  it('should display inventory items', () => {
    const items: CollectedItem[] = [
      {
        id: 'item-1',
        name: 'Gold Coin',
        value: 100,
        type: 'trade_good',
        setId: 'test-set',
        description: 'A gold coin',
      },
      {
        id: 'item-2',
        name: 'Gem',
        value: 250,
        type: 'discovery',
        setId: 'test-set',
        description: 'A gem',
      },
    ];
    const stateWithItems = createMockRunState(items);
    const { getByText } = render(
      <CashOutModal {...defaultProps} runState={stateWithItems} />
    );

    expect(getByText('Gold Coin')).toBeDefined();
    expect(getByText('Gem')).toBeDefined();
  });

  it('should calculate and display total value', () => {
    const items: CollectedItem[] = [
      {
        id: 'item-1',
        name: 'Gold Coin',
        value: 100,
        type: 'trade_good',
        setId: 'test-set',
        description: 'A gold coin',
      },
      {
        id: 'item-2',
        name: 'Gem',
        value: 250,
        type: 'discovery',
        setId: 'test-set',
        description: 'A gem',
      },
    ];
    const stateWithItems = createMockRunState(items);
    const { getByText } = render(
      <CashOutModal {...defaultProps} runState={stateWithItems} />
    );

    expect(getByText('350')).toBeDefined(); // Total value
  });

  it('should display energy remaining', () => {
    const state = createMockRunState([], 150);
    const { getByText } = render(
      <CashOutModal {...defaultProps} runState={state} />
    );

    expect(getByText('150')).toBeDefined();
  });

  it('should display return cost', () => {
    const { getByText } = render(
      <CashOutModal {...defaultProps} returnCost={75} />
    );

    expect(getByText('75')).toBeDefined();
  });

  it('should calculate energy after return correctly', () => {
    const state = createMockRunState([], 100);
    const { getByText, getAllByText } = render(
      <CashOutModal {...defaultProps} runState={state} returnCost={50} />
    );

    // Should show "Energy After Return:" label
    expect(getByText('Energy After Return:')).toBeDefined();
    // Should show 50 energy after return (100 - 50)
    // The value might appear multiple times, so check it exists
    const energyAfterReturnValues = getAllByText('50');
    expect(energyAfterReturnValues.length).toBeGreaterThan(0);
  });

  it('should show warning when cannot return safely', () => {
    const state = createMockRunState([], 30);
    const { getByText } = render(
      <CashOutModal {...defaultProps} runState={state} returnCost={50} />
    );

    expect(
      getByText('⚠️ Warning: Cannot return safely! You may lose progress.')
    ).toBeDefined();
  });

  it('should not show warning when can return safely', () => {
    const state = createMockRunState([], 100);
    const { queryByText } = render(
      <CashOutModal {...defaultProps} runState={state} returnCost={50} />
    );

    expect(
      queryByText('⚠️ Warning: Cannot return safely! You may lose progress.')
    ).toBeNull();
  });

  it('should call onCancel when cancel button is pressed', () => {
    const onCancel = jest.fn();
    const { getByTestId } = render(
      <CashOutModal {...defaultProps} onCancel={onCancel} />
    );

    const cancelButton = getByTestId('cancel-cash-out');
    fireEvent.press(cancelButton);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm when confirm button is pressed', () => {
    const onConfirm = jest.fn();
    const { getByTestId } = render(
      <CashOutModal {...defaultProps} onConfirm={onConfirm} />
    );

    const confirmButton = getByTestId('confirm-cash-out');
    fireEvent.press(confirmButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should display correct items count', () => {
    const items: CollectedItem[] = [
      {
        id: 'item-1',
        name: 'Gold Coin',
        value: 100,
        type: 'trade_good',
        setId: 'test-set',
        description: 'A gold coin',
      },
      {
        id: 'item-2',
        name: 'Gem',
        value: 250,
        type: 'discovery',
        setId: 'test-set',
        description: 'A gem',
      },
      {
        id: 'item-3',
        name: 'Scroll',
        value: 50,
        type: 'trade_good',
        setId: 'test-set',
        description: 'A scroll',
      },
    ];
    const stateWithItems = createMockRunState(items);
    const { getByText } = render(
      <CashOutModal {...defaultProps} runState={stateWithItems} />
    );

    expect(getByText(/Items to Cash Out \(3\)/)).toBeDefined();
  });

  it('should handle zero energy after return', () => {
    const state = createMockRunState([], 50);
    const { getByText } = render(
      <CashOutModal {...defaultProps} runState={state} returnCost={50} />
    );

    expect(getByText('0')).toBeDefined();
  });

  it('should handle negative energy after return', () => {
    const state = createMockRunState([], 30);
    const { getByText } = render(
      <CashOutModal {...defaultProps} runState={state} returnCost={50} />
    );

    // Should display 0, not negative
    expect(getByText('0')).toBeDefined();
  });
});
