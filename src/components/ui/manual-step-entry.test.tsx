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
      /at least 1 step/i
    );
    render(<ManualStepEntry testID="manual-step-entry" value="-100" />);
    const input2 = screen.getByTestId('manual-step-entry');
    fireEvent(input2, 'blur');
    expect(screen.getByTestId('manual-step-entry-error')).toHaveTextContent(
      /at least 1 step/i
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
    render(<ManualStepEntry testID="manual-step-entry" value="150000" />);
    const input = screen.getByTestId('manual-step-entry');
    fireEvent(input, 'blur');
    expect(screen.getByTestId('manual-step-entry-error')).toHaveTextContent(
      /exceeds maximum daily limit/i
    );
  });

  it('should accept valid positive integer input', () => {
    render(<ManualStepEntry testID="manual-step-entry" value="12345" />);
    const input = screen.getByTestId('manual-step-entry');
    fireEvent(input, 'blur');
    expect(screen.queryByTestId('manual-step-entry-error')).toBeNull();
  });
});

describe('ManualStepEntry input constraints', () => {
  it('should show error for step count below minimum (1)', () => {
    render(<ManualStepEntry testID="manual-step-entry" value="0" />);
    const input = screen.getByTestId('manual-step-entry');
    fireEvent(input, 'blur');
    expect(screen.getByTestId('manual-step-entry-error')).toHaveTextContent(
      /at least 1 step/i
    );
  });

  it('should show error for step count above maximum daily limit', () => {
    render(<ManualStepEntry testID="manual-step-entry" value="150000" />);
    const input = screen.getByTestId('manual-step-entry');
    fireEvent(input, 'blur');
    expect(screen.getByTestId('manual-step-entry-error')).toHaveTextContent(
      /exceeds maximum daily limit/i
    );
  });

  it('should accept step count within reasonable daily limits', () => {
    render(<ManualStepEntry testID="manual-step-entry" value="25000" />);
    const input = screen.getByTestId('manual-step-entry');
    fireEvent(input, 'blur');
    expect(screen.queryByTestId('manual-step-entry-error')).toBeNull();
  });

  it('should accept step count at the boundary of maximum limit', () => {
    render(<ManualStepEntry testID="manual-step-entry" value="100000" />);
    const input = screen.getByTestId('manual-step-entry');
    fireEvent(input, 'blur');
    expect(screen.queryByTestId('manual-step-entry-error')).toBeNull();
  });

  it('should show error for step count just above the maximum limit', () => {
    render(<ManualStepEntry testID="manual-step-entry" value="100001" />);
    const input = screen.getByTestId('manual-step-entry');
    fireEvent(input, 'blur');
    expect(screen.getByTestId('manual-step-entry-error')).toHaveTextContent(
      /exceeds maximum daily limit/i
    );
  });

  it('should accept step count at the boundary of minimum limit', () => {
    render(<ManualStepEntry testID="manual-step-entry" value="1" />);
    const input = screen.getByTestId('manual-step-entry');
    fireEvent(input, 'blur');
    expect(screen.queryByTestId('manual-step-entry-error')).toBeNull();
  });
});

describe('ManualStepEntry error handling on submit', () => {
  function Wrapper({ initialValue = '' }: { initialValue?: string }) {
    const [val, setVal] = React.useState(initialValue);
    const [showDialog, setShowDialog] = React.useState(false);
    return (
      <>
        <ManualStepEntry
          testID="manual-step-entry"
          value={val}
          onChangeText={setVal}
          onSubmitEditing={() => setShowDialog(true)}
        />
        {showDialog && <div data-testid="confirmation-dialog">Dialog</div>}
      </>
    );
  }

  it('should show error and not open dialog if value is empty', async () => {
    render(<Wrapper initialValue="" />);
    const input = screen.getByTestId('manual-step-entry');
    fireEvent(input, 'submitEditing');
    expect(
      await screen.findByTestId('manual-step-entry-error')
    ).toBeOnTheScreen();
    expect(screen.queryByTestId('confirmation-dialog')).toBeNull();
  });

  it('should show error and not open dialog if value is invalid', async () => {
    render(<Wrapper initialValue="-100" />);
    const input = screen.getByTestId('manual-step-entry');
    fireEvent(input, 'submitEditing');
    expect(
      await screen.findByTestId('manual-step-entry-error')
    ).toBeOnTheScreen();
    expect(screen.queryByTestId('confirmation-dialog')).toBeNull();
  });

  it('should open dialog if value is valid', async () => {
    render(<Wrapper initialValue="12345" />);
    const input = screen.getByTestId('manual-step-entry');
    fireEvent(input, 'submitEditing');
    expect(await screen.findByTestId('confirmation-dialog')).toBeOnTheScreen();
  });
});

describe('ManualStepEntry loading states', () => {
  it('should show loading indicator when loading prop is true', () => {
    render(<ManualStepEntry testID="manual-step-entry" loading={true} />);
    expect(screen.getByTestId('manual-step-entry-loading')).toBeOnTheScreen();
  });

  it('should not show loading indicator when loading prop is false', () => {
    render(<ManualStepEntry testID="manual-step-entry" loading={false} />);
    expect(screen.queryByTestId('manual-step-entry-loading')).toBeNull();
  });

  it('should disable input when loading is true', () => {
    render(<ManualStepEntry testID="manual-step-entry" loading={true} />);
    const input = screen.getByTestId('manual-step-entry');
    expect(input.props.editable).toBe(false);
  });

  it('should enable input when loading is false', () => {
    render(<ManualStepEntry testID="manual-step-entry" loading={false} />);
    const input = screen.getByTestId('manual-step-entry');
    expect(input.props.editable).toBe(true);
  });

  it('should show loading text when loading is true', () => {
    render(<ManualStepEntry testID="manual-step-entry" loading={true} />);
    expect(screen.getByTestId('manual-step-entry-loading')).toHaveTextContent(
      'Processing...'
    );
  });

  it('should maintain loading state during async operations', async () => {
    function Wrapper() {
      const [loading, setLoading] = React.useState(false);
      const [val, setVal] = React.useState('');

      const handleSubmit = async () => {
        setLoading(true);
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 100));
        setLoading(false);
      };

      return (
        <ManualStepEntry
          testID="manual-step-entry"
          value={val}
          onChangeText={setVal}
          loading={loading}
          onSubmitEditing={handleSubmit}
        />
      );
    }

    render(<Wrapper />);
    const input = screen.getByTestId('manual-step-entry');

    // Initially not loading
    expect(screen.queryByTestId('manual-step-entry-loading')).toBeNull();

    // Trigger loading state
    fireEvent(input, 'submitEditing');

    // Should show loading indicator
    expect(screen.getByTestId('manual-step-entry-loading')).toBeOnTheScreen();

    // Wait for async operation to complete
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Should hide loading indicator
    expect(screen.queryByTestId('manual-step-entry-loading')).toBeNull();
  });
});
