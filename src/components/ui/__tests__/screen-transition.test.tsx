import React from 'react';
import { Text, View } from 'react-native';
import { render } from '@testing-library/react-native';
import { ScreenTransition } from '../screen-transition';

describe('ScreenTransition', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ScreenTransition>
        <Text>Test Content</Text>
      </ScreenTransition>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('applies fade animation by default', () => {
    const { UNSAFE_getByType } = render(
      <ScreenTransition>Content</ScreenTransition>
    );
    const view = UNSAFE_getByType(View);

    expect(view.props.className).toContain('animate-fade-in');
  });

  it('applies slide animation when type is slide', () => {
    const { UNSAFE_getByType } = render(
      <ScreenTransition type="slide">Content</ScreenTransition>
    );
    const view = UNSAFE_getByType(View);

    expect(view.props.className).toContain('animate-slide-up');
  });

  it('applies bounce animation when type is bounce', () => {
    const { UNSAFE_getByType } = render(
      <ScreenTransition type="bounce">Content</ScreenTransition>
    );
    const view = UNSAFE_getByType(View);

    expect(view.props.className).toContain('animate-bounce-in');
  });
});
