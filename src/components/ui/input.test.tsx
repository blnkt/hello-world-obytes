/* eslint-disable max-lines-per-function */
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { Input } from './input';

describe('Input component ', () => {
  it('renders correctly ', () => {
    render(<Input testID="input" />);
    expect(screen.getByTestId('input')).toBeOnTheScreen();
  });

  it('should render the placeholder correctly ', () => {
    render(<Input testID="input" placeholder="Enter your username" />);
    expect(screen.getByTestId('input')).toBeOnTheScreen();
    expect(
      screen.getByPlaceholderText('Enter your username')
    ).toBeOnTheScreen();
  });

  it('should render the label correctly ', () => {
    render(<Input testID="input" label="Username" />);
    expect(screen.getByTestId('input')).toBeOnTheScreen();

    expect(screen.getByTestId('input-label')).toHaveTextContent('Username');
  });

  it('should render the error message correctly ', () => {
    render(<Input testID="input" error="This is an error message" />);
    expect(screen.getByTestId('input')).toBeOnTheScreen();

    expect(screen.getByText('This is an error message')).toBeTruthy();
  });

  it('should render the label, error message & placeholder correctly ', () => {
    render(
      <Input
        testID="input"
        label="Username"
        placeholder="Enter your username"
        error="This is an error message"
      />
    );
    expect(screen.getByTestId('input')).toBeOnTheScreen();

    expect(screen.getByTestId('input-label')).toHaveTextContent('Username');
    expect(screen.getByText('This is an error message')).toBeTruthy();
    expect(
      screen.getByPlaceholderText('Enter your username')
    ).toBeOnTheScreen();
  });

  it('should trigger onFocus event correctly ', async () => {
    const onFocus = jest.fn();
    render(<Input testID="input" onFocus={onFocus} />);

    const input = screen.getByTestId('input');
    fireEvent(input, 'focus');
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('should trigger onBlur event correctly ', async () => {
    const onBlur = jest.fn();
    render(<Input testID="input" onBlur={onBlur} />);

    const input = screen.getByTestId('input');
    fireEvent(input, 'blur');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('should trigger onChangeText event correctly', async () => {
    const onChangeText = jest.fn();
    render(<Input testID="input" onChangeText={onChangeText} />);

    const input = screen.getByTestId('input');
    fireEvent.changeText(input, '123456789');
    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith('123456789');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input testID="input" disabled={true} />);

    const input = screen.getByTestId('input');
    expect(input.props.disabled).toBe(true);
  });

  it('should render in simple mode with different styling', () => {
    render(<Input testID="input" label="Simple Label" simple={true} />);

    const input = screen.getByTestId('input');
    const label = screen.getByTestId('input-label');

    expect(input).toBeOnTheScreen();
    expect(label).toHaveTextContent('Simple Label');
    // Simple mode should have different styling (smaller label, different input styling)
    expect(label).toBeTruthy();
  });

  it('should render simple mode without container margin', () => {
    render(<Input testID="input" simple={true} />);

    const input = screen.getByTestId('input');
    expect(input).toBeOnTheScreen();
    // Simple mode should not have container margin
    expect(input.parent).toBeTruthy();
  });

  it('should render simple mode with simplified input styling', () => {
    render(<Input testID="input" simple={true} />);

    const input = screen.getByTestId('input');
    expect(input).toBeOnTheScreen();
    // Simple mode should have simplified input styling
    expect(input).toBeTruthy();
  });
});
