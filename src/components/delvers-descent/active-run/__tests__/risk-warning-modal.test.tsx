import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { RiskWarningModal } from '../risk-warning-modal';
import type { RiskWarning } from '../risk-warning-modal';

describe('RiskWarningModal', () => {
  const createMockWarning = (
    type: 'safe' | 'caution' | 'danger' | 'critical',
    message: string = 'Test warning message',
    severity: number = 5
  ): RiskWarning => ({
    type,
    message,
    severity,
  });

  const defaultProps = {
    visible: true,
    warning: createMockWarning('danger'),
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when visible is false', () => {
    const { queryByTestId } = render(
      <RiskWarningModal {...defaultProps} visible={false} />
    );
    expect(queryByTestId('risk-warning-modal')).toBeNull();
  });

  it('should render modal when visible is true', () => {
    const { getByText } = render(<RiskWarningModal {...defaultProps} />);
    expect(getByText(/DANGER WARNING/)).toBeDefined();
  });

  it('should display warning message', () => {
    const warning = createMockWarning('danger', 'Custom warning message');
    const { getByText } = render(
      <RiskWarningModal {...defaultProps} warning={warning} />
    );
    expect(getByText('Custom warning message')).toBeDefined();
  });

  it('should display safe warning correctly', () => {
    const warning = createMockWarning('safe', 'Safe to continue');
    const { getByText } = render(
      <RiskWarningModal {...defaultProps} warning={warning} />
    );
    expect(getByText(/SAFE WARNING/)).toBeDefined();
    expect(getByText('Safe to continue')).toBeDefined();
  });

  it('should display caution warning correctly', () => {
    const warning = createMockWarning('caution', 'Proceed with caution');
    const { getByText } = render(
      <RiskWarningModal {...defaultProps} warning={warning} />
    );
    expect(getByText(/CAUTION WARNING/)).toBeDefined();
    expect(getByText('Proceed with caution')).toBeDefined();
  });

  it('should display danger warning correctly', () => {
    const warning = createMockWarning('danger', 'High risk ahead');
    const { getByText } = render(
      <RiskWarningModal {...defaultProps} warning={warning} />
    );
    expect(getByText(/DANGER WARNING/)).toBeDefined();
    expect(getByText('High risk ahead')).toBeDefined();
  });

  it('should display critical warning correctly', () => {
    const warning = createMockWarning('critical', 'Extreme danger!');
    const { getByText } = render(
      <RiskWarningModal {...defaultProps} warning={warning} />
    );
    expect(getByText(/CRITICAL WARNING/)).toBeDefined();
    expect(getByText('Extreme danger!')).toBeDefined();
  });

  it('should display severity when provided', () => {
    const warning = createMockWarning('danger', 'Test', 7);
    const { getByText } = render(
      <RiskWarningModal {...defaultProps} warning={warning} />
    );
    expect(getByText(/Severity: 7\/10/)).toBeDefined();
  });

  it('should call onCancel when cancel button is pressed', () => {
    const onCancel = jest.fn();
    const { getByTestId } = render(
      <RiskWarningModal {...defaultProps} onCancel={onCancel} />
    );

    const cancelButton = getByTestId('cancel-risk-warning');
    fireEvent.press(cancelButton);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm when confirm button is pressed', () => {
    const onConfirm = jest.fn();
    const { getByTestId } = render(
      <RiskWarningModal {...defaultProps} onConfirm={onConfirm} />
    );

    const confirmButton = getByTestId('confirm-risk-warning');
    fireEvent.press(confirmButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should display correct button text', () => {
    const { getByText } = render(<RiskWarningModal {...defaultProps} />);
    expect(getByText('Go Back')).toBeDefined();
    expect(getByText('Continue Anyway')).toBeDefined();
  });

  it('should handle zero severity', () => {
    const warning = createMockWarning('danger', 'Test', 0);
    const { queryByText } = render(
      <RiskWarningModal {...defaultProps} warning={warning} />
    );
    // Severity should not be displayed when 0
    expect(queryByText(/Severity:/)).toBeNull();
  });

  it('should handle different warning types styling', () => {
    const types: Array<'safe' | 'caution' | 'danger' | 'critical'> = [
      'safe',
      'caution',
      'danger',
      'critical',
    ];

    types.forEach((type) => {
      const warning = createMockWarning(type, `Test ${type}`);
      const { getByText } = render(
        <RiskWarningModal {...defaultProps} warning={warning} />
      );
      expect(
        getByText(new RegExp(`${type.toUpperCase()} WARNING`))
      ).toBeDefined();
    });
  });
});
