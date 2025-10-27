import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';

import { RiskWarningModal } from './risk-warning-modal';

describe('RiskWarningModal', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultWarning = {
    type: 'caution' as const,
    message: 'This is a caution warning',
    severity: 3,
  };

  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnCancel.mockClear();
  });

  it('should render caution warning', () => {
    render(
      <RiskWarningModal
        warning={defaultWarning}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByTestId('risk-warning-modal')).toBeDefined();
    expect(screen.getByText(/Caution/)).toBeDefined();
    expect(screen.getByText(/This is a caution warning/)).toBeDefined();
  });

  it('should render danger warning', () => {
    render(
      <RiskWarningModal
        warning={{
          type: 'danger',
          message: 'This is dangerous',
          severity: 6,
        }}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByTestId('risk-warning-modal')).toBeDefined();
    expect(screen.getByText(/Danger Zone/)).toBeDefined();
    expect(screen.getByText(/This is dangerous/)).toBeDefined();
  });

  it('should render critical warning', () => {
    render(
      <RiskWarningModal
        warning={{
          type: 'critical',
          message: 'This is critical!',
          severity: 10,
        }}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByTestId('risk-warning-modal')).toBeDefined();
    expect(screen.getByText(/CRITICAL WARNING/)).toBeDefined();
    expect(screen.getByText(/This is critical!/)).toBeDefined();
  });

  it('should render safe warning', () => {
    render(
      <RiskWarningModal
        warning={{
          type: 'safe',
          message: 'You are safe',
          severity: 1,
        }}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByTestId('risk-warning-modal')).toBeDefined();
    expect(screen.getByText(/Safe Zone/)).toBeDefined();
    expect(screen.getByText(/You are safe/)).toBeDefined();
  });

  it('should call onConfirm when Continue button is clicked', () => {
    render(
      <RiskWarningModal
        warning={defaultWarning}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('should show both Cancel and Proceed buttons for danger warnings', () => {
    render(
      <RiskWarningModal
        warning={{
          type: 'danger',
          message: 'Danger!',
          severity: 7,
        }}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByTestId('cancel-button')).toBeDefined();
    expect(screen.getByTestId('confirm-button')).toBeDefined();
  });

  it('should show both buttons for critical warnings', () => {
    render(
      <RiskWarningModal
        warning={{
          type: 'critical',
          message: 'Critical!',
          severity: 10,
        }}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByTestId('cancel-button')).toBeDefined();
    expect(screen.getByTestId('confirm-button')).toBeDefined();
  });

  it('should call onCancel when Cancel button is clicked', () => {
    render(
      <RiskWarningModal
        warning={{
          type: 'danger',
          message: 'Danger!',
          severity: 7,
        }}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should show modal overlay when blocking is true', () => {
    render(
      <RiskWarningModal
        warning={defaultWarning}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        blocking={true}
      />
    );

    expect(screen.getByTestId('modal-overlay')).toBeDefined();
  });

  it('should not show modal overlay when blocking is false', () => {
    render(
      <RiskWarningModal
        warning={defaultWarning}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        blocking={false}
      />
    );

    expect(screen.queryByTestId('modal-overlay')).toBeNull();
  });

  it('should call onCancel when overlay is clicked', () => {
    render(
      <RiskWarningModal
        warning={defaultWarning}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        blocking={true}
      />
    );

    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
