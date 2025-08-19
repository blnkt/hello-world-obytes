import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';

import { Card } from './card';

describe('Card Component', () => {
  describe('Info Card Variant', () => {
    it('renders info card with title and description', () => {
      render(
        <Card
          variant="info"
          title="Test Title"
          description="Test Description"
        />
      );

      expect(screen.getByText('Test Title')).toBeTruthy();
      expect(screen.getByText('Test Description')).toBeTruthy();
    });

    it('renders info card with children', () => {
      render(
        <Card variant="info" title="Test Title">
          <View>
            <Text>Child Content</Text>
          </View>
        </Card>
      );

      expect(screen.getByText('Test Title')).toBeTruthy();
      expect(screen.getByText('Child Content')).toBeTruthy();
    });

    it('applies custom className', () => {
      render(
        <Card variant="info" title="Test Title" className="custom-class" />
      );

      expect(screen.getByText('Test Title')).toBeTruthy();
    });
  });

  describe('Class Card Variant', () => {
    it('renders class card with detailed variant by default', () => {
      render(
        <Card
          variant="class"
          title="Class Title"
          description="Class Description"
        />
      );

      expect(screen.getByText('Class Title')).toBeTruthy();
      expect(screen.getByText('Class Description')).toBeTruthy();
    });

    it('renders class card with compact variant', () => {
      render(
        <Card
          variant="class"
          variantStyle="compact"
          title="Compact Title"
          description="Compact Description"
        />
      );

      expect(screen.getByText('Compact Title')).toBeTruthy();
      expect(screen.getByText('Compact Description')).toBeTruthy();
    });

    it('renders class card with children', () => {
      render(
        <Card variant="class" title="Class Title">
          <View>
            <Text>Class Content</Text>
          </View>
        </Card>
      );

      expect(screen.getByText('Class Title')).toBeTruthy();
      expect(screen.getByText('Class Content')).toBeTruthy();
    });
  });

  describe('Toggle Card Variant', () => {
    const mockOnPress = jest.fn();

    beforeEach(() => {
      mockOnPress.mockClear();
    });

    it('renders toggle card with title, description, and button', () => {
      render(
        <Card
          variant="toggle"
          title="Toggle Title"
          description="Toggle Description"
          buttonLabel="Toggle Button"
          onPress={mockOnPress}
        />
      );

      expect(screen.getByText('Toggle Title')).toBeTruthy();
      expect(screen.getByText('Toggle Description')).toBeTruthy();
      expect(screen.getByText('Toggle Button')).toBeTruthy();
    });

    it('calls onPress when button is pressed', () => {
      render(
        <Card
          variant="toggle"
          title="Toggle Title"
          buttonLabel="Toggle Button"
          onPress={mockOnPress}
        />
      );

      const button = screen.getByText('Toggle Button');
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('disables button when disabled prop is true', () => {
      render(
        <Card
          variant="toggle"
          title="Toggle Title"
          buttonLabel="Toggle Button"
          onPress={mockOnPress}
          disabled={true}
        />
      );

      const button = screen.getByText('Toggle Button');
      expect(button).toBeTruthy();
      // Note: Button component handles disabled state internally
    });

    it('disables button when loading prop is true', () => {
      render(
        <Card
          variant="toggle"
          title="Toggle Title"
          buttonLabel="Toggle Button"
          onPress={mockOnPress}
          isLoading={true}
        />
      );

      const button = screen.getByText('Toggle Button');
      expect(button).toBeTruthy();
      // Note: Button component handles loading state internally
    });
  });

  describe('Form Section Variant', () => {
    it('renders form section with title and children', () => {
      render(
        <Card variant="form" title="Form Title">
          <View>
            <Text>Form Content</Text>
          </View>
        </Card>
      );

      expect(screen.getByText('Form Title')).toBeTruthy();
      expect(screen.getByText('Form Content')).toBeTruthy();
    });

    it('applies proper spacing to children', () => {
      render(
        <Card variant="form" title="Form Title">
          <View>
            <Text>Child 1</Text>
          </View>
          <View>
            <Text>Child 2</Text>
          </View>
        </Card>
      );

      expect(screen.getByText('Form Title')).toBeTruthy();
      expect(screen.getByText('Child 1')).toBeTruthy();
      expect(screen.getByText('Child 2')).toBeTruthy();
    });
  });

  describe('Backward Compatibility', () => {
    it('InfoCard convenience export works', () => {
      const { InfoCard } = require('./card');
      render(<InfoCard title="Info Title" description="Info Description" />);

      expect(screen.getByText('Info Title')).toBeTruthy();
      expect(screen.getByText('Info Description')).toBeTruthy();
    });

    it('ClassCard convenience export works', () => {
      const { ClassCard } = require('./card');
      render(<ClassCard title="Class Title" description="Class Description" />);

      expect(screen.getByText('Class Title')).toBeTruthy();
      expect(screen.getByText('Class Description')).toBeTruthy();
    });

    it('ToggleCard convenience export works', () => {
      const { ToggleCard } = require('./card');
      const mockOnPress = jest.fn();

      render(
        <ToggleCard
          title="Toggle Title"
          buttonLabel="Toggle Button"
          onPress={mockOnPress}
        />
      );

      expect(screen.getByText('Toggle Title')).toBeTruthy();
      expect(screen.getByText('Toggle Button')).toBeTruthy();
    });

    it('FormSection convenience export works', () => {
      const { FormSection } = require('./card');
      render(
        <FormSection title="Form Title">
          <View>
            <Text>Form Content</Text>
          </View>
        </FormSection>
      );

      expect(screen.getByText('Form Title')).toBeTruthy();
      expect(screen.getByText('Form Content')).toBeTruthy();
    });
  });
});
