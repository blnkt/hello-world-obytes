import React from 'react';

import { cleanup, render, screen, setup } from '@/lib/test-utils';

import { ConfirmationDialog } from './confirmation-dialog';

afterEach(cleanup);

describe('ConfirmationDialog component', () => {
  it('renders correctly with title and message', () => {
    render(
      <ConfirmationDialog
        visible={true}
        title="Confirm Step Entry"
        message="Are you sure you want to submit 10,000 steps for today?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText('Confirm Step Entry')).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Are you sure you want to submit 10,000 steps for today?'
      )
    ).toBeOnTheScreen();
  });

  it('should not render when visible is false', () => {
    render(
      <ConfirmationDialog
        visible={false}
        title="Confirm Step Entry"
        message="Are you sure you want to submit 10,000 steps for today?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.queryByText('Confirm Step Entry')).not.toBeOnTheScreen();
  });

  it('should call onConfirm when confirm button is pressed', async () => {
    const onConfirm = jest.fn();
    const { user } = setup(
      <ConfirmationDialog
        visible={true}
        title="Confirm Step Entry"
        message="Are you sure you want to submit 10,000 steps for today?"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );

    const confirmButton = screen.getByText('Confirm');
    await user.press(confirmButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when cancel button is pressed', async () => {
    const onCancel = jest.fn();
    const { user } = setup(
      <ConfirmationDialog
        visible={true}
        title="Confirm Step Entry"
        message="Are you sure you want to submit 10,000 steps for today?"
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    await user.press(cancelButton);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should display custom button text when provided', () => {
    render(
      <ConfirmationDialog
        visible={true}
        title="Confirm Step Entry"
        message="Are you sure you want to submit 10,000 steps for today?"
        confirmText="Submit Steps"
        cancelText="Go Back"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText('Submit Steps')).toBeOnTheScreen();
    expect(screen.getByText('Go Back')).toBeOnTheScreen();
  });

  it('should use default button text when custom text is not provided', () => {
    render(
      <ConfirmationDialog
        visible={true}
        title="Confirm Step Entry"
        message="Are you sure you want to submit 10,000 steps for today?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText('Confirm')).toBeOnTheScreen();
    expect(screen.getByText('Cancel')).toBeOnTheScreen();
  });
});
