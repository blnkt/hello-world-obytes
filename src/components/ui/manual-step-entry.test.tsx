/* eslint-disable max-lines-per-function */
import { fireEvent } from '@testing-library/react-native';
import React from 'react';

import { cleanup, render, screen, setup } from '@/lib/test-utils';

import { ManualStepEntry } from './manual-step-entry';

afterEach(cleanup);

describe('ManualStepEntry component', () => {
  describe('basic rendering', () => {
    it('renders correctly with number input field', () => {
      render(<ManualStepEntry testID="manual-step-entry" />);
      expect(screen.getByTestId('manual-step-entry')).toBeOnTheScreen();
    });

    it('should render with a label for step count', () => {
      render(<ManualStepEntry testID="manual-step-entry" />);
      expect(screen.getByTestId('manual-step-entry-label')).toHaveTextContent(
        'Step Count'
      );
    });

    it('should render with placeholder text', () => {
      render(<ManualStepEntry testID="manual-step-entry" />);
      expect(
        screen.getByPlaceholderText('Enter your step count')
      ).toBeOnTheScreen();
    });

    it('should have keyboard type set to numeric', () => {
      render(<ManualStepEntry testID="manual-step-entry" />);
      const input = screen.getByTestId('manual-step-entry');
      expect(input.props.keyboardType).toBe('numeric');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<ManualStepEntry testID="manual-step-entry" disabled={true} />);
      const input = screen.getByTestId('manual-step-entry');
      expect(input.props.editable).toBe(false);
    });

    it('should display error message when error prop is provided', () => {
      render(
        <ManualStepEntry
          testID="manual-step-entry"
          error="Please enter a valid step count"
        />
      );
      expect(screen.getByTestId('manual-step-entry-error')).toHaveTextContent(
        'Please enter a valid step count'
      );
    });
  });

  describe('input behavior', () => {
    it('should accept only numeric input', async () => {
      function Wrapper() {
        const [val, setVal] = React.useState('');
        return (
          <ManualStepEntry
            testID="manual-step-entry"
            value={val}
            onChangeText={setVal}
          />
        );
      }
      const { user } = setup(<Wrapper />);
      const input = screen.getByTestId('manual-step-entry');
      await user.type(input, '12345');
      expect(input.props.value).toBe('12345');
    });

    it('should reject non-numeric input', async () => {
      function Wrapper() {
        const [val, setVal] = React.useState('');
        return (
          <ManualStepEntry
            testID="manual-step-entry"
            value={val}
            onChangeText={setVal}
          />
        );
      }
      const { user } = setup(<Wrapper />);
      const input = screen.getByTestId('manual-step-entry');
      await user.type(input, 'abc123def');
      expect(input.props.value).toBe('123');
    });

    it('should trigger onFocus and onBlur events correctly', async () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      const { user } = setup(
        <ManualStepEntry
          testID="manual-step-entry"
          onFocus={onFocus}
          onBlur={onBlur}
        />
      );

      const input = screen.getByTestId('manual-step-entry');
      await user.type(input, '1000');
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });
});

describe('ManualStepEntry validation', () => {
  it('should show error for empty input', () => {
    render(<ManualStepEntry testID="manual-step-entry" value="" />);
    const input = screen.getByTestId('manual-step-entry');
    fireEvent(input, 'blur');
    expect(screen.getByTestId('manual-step-entry-error')).toHaveTextContent(
      /step count is required/i
    );
  });

  it('should show error for zero or negative input', () => {
    render(<ManualStepEntry testID="manual-step-entry" value="0" />);
    const input = screen.getByTestId('manual-step-entry');
    fireEvent(input, 'blur');
    expect(screen.getByTestId('manual-step-entry-error')).toHaveTextContent(
      /must be a positive number/i
    );
    render(<ManualStepEntry testID="manual-step-entry" value="-100" />);
    const input2 = screen.getByTestId('manual-step-entry');
    fireEvent(input2, 'blur');
    expect(screen.getByTestId('manual-step-entry-error')).toHaveTextContent(
      /must be a positive number/i
    );
  });

  it('should show error for decimal input', () => {
    render(<ManualStepEntry testID="manual-step-entry" value="123.45" />);
    const input = screen.getByTestId('manual-step-entry');
    fireEvent(input, 'blur');
    expect(screen.getByTestId('manual-step-entry-error')).toHaveTextContent(
      /must be a whole number/i
    );
  });

  it('should show error for excessively large input', () => {
    render(<ManualStepEntry testID="manual-step-entry" value="1000000" />);
    const input = screen.getByTestId('manual-step-entry');
    fireEvent(input, 'blur');
    expect(screen.getByTestId('manual-step-entry-error')).toHaveTextContent(
      /too large/i
    );
  });

  it('should accept valid positive integer input', () => {
    render(<ManualStepEntry testID="manual-step-entry" value="12345" />);
    const input = screen.getByTestId('manual-step-entry');
    fireEvent(input, 'blur');
    expect(screen.queryByTestId('manual-step-entry-error')).toBeNull();
  });
});
