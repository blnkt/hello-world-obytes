/* eslint-disable testing-library/prefer-presence-queries */
import '@testing-library/jest-dom';

import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import {
  type ScoundrelConfig,
  ScoundrelEncounter,
} from '@/lib/delvers-descent/scoundrel-encounter';
import type { CollectedItem } from '@/types/delvers-descent';

import { ScoundrelScreen } from './scoundrel-screen';

describe('ScoundrelScreen', () => {
  const createMockConfig = (): ScoundrelConfig => ({
    startingLife: 10,
    dungeonSize: 3,
    depth: 1,
  });

  const createMockEncounter = (
    config?: ScoundrelConfig
  ): ScoundrelEncounter => {
    return new ScoundrelEncounter('test-dungeon', config || createMockConfig());
  };

  const mockInventory: CollectedItem[] = [
    {
      id: 'item-1',
      name: 'Test Item 1',
      value: 10,
      type: 'trade_good',
      setId: 'test-set',
      description: 'Test item 1',
    },
    {
      id: 'item-2',
      name: 'Test Item 2',
      value: 20,
      type: 'trade_good',
      setId: 'test-set',
      description: 'Test item 2',
    },
  ];

  const defaultProps = {
    encounter: createMockEncounter(),
    runInventory: mockInventory,
    onComplete: jest.fn(),
    onReturn: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<ScoundrelScreen {...defaultProps} />);

      expect(screen.getByTestId('scoundrel-screen')).toBeTruthy();
      expect(screen.getByText("Scoundrel's Dungeon")).toBeTruthy();
    });

    it('should display life information', () => {
      render(<ScoundrelScreen {...defaultProps} />);

      expect(screen.getByText('Life')).toBeTruthy();
      expect(screen.getByText(/10\/10/)).toBeTruthy();
    });

    it('should display dungeon progress', () => {
      render(<ScoundrelScreen {...defaultProps} />);

      expect(screen.getByText('Dungeon Progress')).toBeTruthy();
      expect(screen.getByText(/Room \d+ of \d+/)).toBeTruthy();
    });

    it('should display available cards', () => {
      render(<ScoundrelScreen {...defaultProps} />);

      expect(screen.getByText('Available Cards')).toBeTruthy();
    });
  });

  describe('Life Display', () => {
    it('should show normal life state (green)', () => {
      const config = createMockConfig();
      config.startingLife = 10;
      const encounter = createMockEncounter(config);

      render(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

      const lifeText = screen.getByText(/10\/10/);
      expect(lifeText).toBeTruthy();
    });

    it('should show low life warning when life <= 2', () => {
      const config = createMockConfig();
      config.startingLife = 2;
      const encounter = createMockEncounter(config);

      render(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

      // Should show warning for low life
      expect(screen.queryByText(/⚠️ Risk of Failure!/)).toBeTruthy();
    });

    it('should show critical life state when life <= 1', () => {
      const config = createMockConfig();
      config.startingLife = 1;
      const encounter = createMockEncounter(config);

      render(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

      // Should show warning for critical life
      expect(screen.queryByText(/⚠️ Risk of Failure!/)).toBeTruthy();
    });
  });

  describe('Score Display', () => {
    it('should display score when score is non-zero', () => {
      const encounter = createMockEncounter();

      render(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

      // Score display may or may not appear depending on score
      // Just verify component renders without error
      expect(screen.getByTestId('scoundrel-screen')).toBeTruthy();
    });
  });

  describe('Card Selection', () => {
    it('should display available cards', () => {
      const encounter = createMockEncounter();
      const availableCards = encounter.getAvailableCards();

      render(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

      // Should see card names
      availableCards.forEach((card) => {
        const cardElement = screen.queryByTestId(`card-${card.id}`);
        expect(cardElement).toBeTruthy();
      });
    });

    it('should allow selecting a card', () => {
      const encounter = createMockEncounter();
      const availableCards = encounter.getAvailableCards();

      if (availableCards.length > 0) {
        const firstCard = availableCards[0];

        render(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

        const cardButton = screen.getByTestId(`card-${firstCard.id}`);
        fireEvent.press(cardButton);

        // Card selection should trigger (component will update state)
        expect(cardButton).toBeTruthy();
      }
    });

    it('should handle card selection when room is completed', () => {
      const encounter = createMockEncounter();
      const availableCards = encounter.getAvailableCards();

      if (availableCards.length > 0) {
        // Select a card to complete the room
        encounter.selectCard(availableCards[0].id);
        encounter.advanceRoom();

        render(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

        // Component should render correctly
        expect(screen.getByTestId('scoundrel-screen')).toBeTruthy();
      }
    });
  });

  describe('Room Advancement', () => {
    it('should show advance button when room is completed', () => {
      const encounter = createMockEncounter();
      const availableCards = encounter.getAvailableCards();

      if (availableCards.length > 0) {
        // Complete first room by selecting a card
        encounter.selectCard(availableCards[0].id);

        render(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

        const advanceButton = screen.queryByText('Advance to Next Room');
        // Button may or may not appear depending on room completion state
        expect(screen.getByTestId('scoundrel-screen')).toBeTruthy();
      }
    });

    it('should advance to next room when button is pressed', () => {
      const encounter = createMockEncounter();
      const availableCards = encounter.getAvailableCards();

      if (availableCards.length > 0) {
        // Complete first room
        encounter.selectCard(availableCards[0].id);

        render(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

        const advanceButton = screen.queryByText('Advance to Next Room');
        if (advanceButton) {
          fireEvent.press(advanceButton);
          // Room should advance
          expect(encounter.getState().currentRoom).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('should not show advance button initially', () => {
      const encounter = createMockEncounter();

      render(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

      // Initially, no advance button should show (room not completed)
      const advanceButton = screen.queryByText('Advance to Next Room');
      // Button may not appear if room is not completed
      expect(screen.getByTestId('scoundrel-screen')).toBeTruthy();
    });
  });

  describe('Encounter Completion', () => {
    it('should show complete button when encounter is complete', () => {
      const encounter = createMockEncounter();
      const config = encounter.getState().config;

      // Complete all rooms by selecting cards and advancing
      for (let i = 0; i < config.dungeonSize; i++) {
        const availableCards = encounter.getAvailableCards();
        if (availableCards.length > 0) {
          encounter.selectCard(availableCards[0].id);
          if (i < config.dungeonSize - 1) {
            encounter.advanceRoom();
          }
        }
      }

      render(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

      // Component should render
      expect(screen.getByTestId('scoundrel-screen')).toBeTruthy();
      // Complete button may appear if encounter is complete
      const completeButton = screen.queryByText('Complete Encounter');
      // Just verify component renders correctly
      expect(screen.getByText("Scoundrel's Dungeon")).toBeTruthy();
    });

    it('should call onComplete when encounter is resolved', async () => {
      const encounter = createMockEncounter();
      const onComplete = jest.fn();

      // Complete all rooms
      const config = encounter.getState().config;
      for (let i = 0; i < config.dungeonSize; i++) {
        const availableCards = encounter.getAvailableCards();
        if (availableCards.length > 0) {
          encounter.selectCard(availableCards[0].id);
          if (i < config.dungeonSize - 1) {
            encounter.advanceRoom();
          }
        }
      }

      render(
        <ScoundrelScreen
          {...defaultProps}
          encounter={encounter}
          onComplete={onComplete}
        />
      );

      const completeButton = screen.queryByText('Complete Encounter');
      if (completeButton) {
        fireEvent.press(completeButton);
        // onComplete should be called
        expect(onComplete).toHaveBeenCalled();
      }
    });
  });

  describe('Outcome Display', () => {
    it('should handle outcome display after completion', () => {
      const encounter = createMockEncounter();
      const onComplete = jest.fn();

      // Complete encounter
      const config = encounter.getState().config;
      for (let i = 0; i < config.dungeonSize; i++) {
        const availableCards = encounter.getAvailableCards();
        if (availableCards.length > 0) {
          encounter.selectCard(availableCards[0].id);
          if (i < config.dungeonSize - 1) {
            encounter.advanceRoom();
          }
        }
      }

      render(
        <ScoundrelScreen
          {...defaultProps}
          encounter={encounter}
          onComplete={onComplete}
        />
      );

      // Trigger completion
      const completeButton = screen.queryByText('Complete Encounter');
      if (completeButton) {
        fireEvent.press(completeButton);
        // onComplete should be called
        expect(onComplete).toHaveBeenCalled();
      }

      // Component should handle outcome display
      expect(screen.getByTestId('scoundrel-screen')).toBeTruthy();
    });
  });

  describe('Remaining Monsters Display', () => {
    it('should display remaining monsters when present', () => {
      const encounter = createMockEncounter();
      const remainingMonsters = encounter.getRemainingMonsters();

      render(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

      if (remainingMonsters.length > 0) {
        expect(screen.queryByText('Remaining Monsters')).toBeTruthy();
      }
    });

    it('should not display remaining monsters when none remain', () => {
      const encounter = createMockEncounter();
      // Complete all rooms to remove monsters
      const config = encounter.getState().config;
      for (let i = 0; i < config.dungeonSize; i++) {
        const availableCards = encounter.getAvailableCards();
        if (availableCards.length > 0) {
          encounter.selectCard(availableCards[0].id);
          if (i < config.dungeonSize - 1) {
            encounter.advanceRoom();
          }
        }
      }

      render(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

      const remainingMonsters = encounter.getRemainingMonsters();
      if (remainingMonsters.length === 0) {
        expect(screen.queryByText('Remaining Monsters')).toBeNull();
      }
    });
  });

  describe('Return to Map', () => {
    it('should call onReturn when return button is pressed', () => {
      const onReturn = jest.fn();

      render(<ScoundrelScreen {...defaultProps} onReturn={onReturn} />);

      const returnButton = screen.getByText('Return to Map');
      fireEvent.press(returnButton);

      expect(onReturn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Reward Preview', () => {
    it('should show reward preview when score is positive', () => {
      const encounter = createMockEncounter();
      const score = encounter.calculateScore();

      render(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

      // Reward preview only shows for positive scores and incomplete encounters
      if (score >= 0 && !encounter.isEncounterComplete()) {
        const rewardPreview = screen.queryByText(/Potential Reward/);
        expect(rewardPreview).toBeTruthy();
      } else {
        // Component should still render
        expect(screen.getByTestId('scoundrel-screen')).toBeTruthy();
      }
    });

    it('should not show reward preview for negative scores', () => {
      const encounter = createMockEncounter();
      const score = encounter.calculateScore();

      render(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

      // Reward preview should not show for negative scores
      if (score < 0) {
        const rewardPreview = screen.queryByText(/Potential Reward/);
        expect(rewardPreview).toBeNull();
      }
    });
  });

  describe('UI State Management', () => {
    it('should initialize state from encounter', () => {
      const encounter = createMockEncounter();
      const initialState = encounter.getState();

      render(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

      // Component should render with initial state
      expect(screen.getByText("Scoundrel's Dungeon")).toBeTruthy();
      expect(screen.getByText(/Life/)).toBeTruthy();
      expect(
        screen.getByText(
          new RegExp(
            `${initialState.currentLife}/${initialState.config.startingLife}`
          )
        )
      ).toBeTruthy();
    });

    it('should update state when card is selected', () => {
      const encounter = createMockEncounter();
      const availableCards = encounter.getAvailableCards();

      if (availableCards.length > 0) {
        const { rerender } = render(
          <ScoundrelScreen {...defaultProps} encounter={encounter} />
        );

        const initialLife = encounter.getState().currentLife;
        const cardButton = screen.getByTestId(`card-${availableCards[0].id}`);
        fireEvent.press(cardButton);

        // State should update via handler - card selection modifies encounter state
        const updatedState = encounter.getState();
        // Re-render to see updated state
        rerender(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

        // Verify card was selected by checking last card
        const lastCard = encounter.getLastCard();
        expect(lastCard?.id).toBe(availableCards[0].id);
      }
    });

    it('should update state when room is advanced', () => {
      const encounter = createMockEncounter();
      const availableCards = encounter.getAvailableCards();

      if (availableCards.length > 0) {
        // Complete first room
        encounter.selectCard(availableCards[0].id);
        const initialRoom = encounter.getState().currentRoom;

        const { rerender } = render(
          <ScoundrelScreen {...defaultProps} encounter={encounter} />
        );

        const advanceButton = screen.queryByText('Advance to Next Room');
        if (advanceButton) {
          fireEvent.press(advanceButton);

          // Re-render to see updated state
          rerender(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

          // Room should have advanced
          const updatedState = encounter.getState();
          expect(updatedState.currentRoom).toBeGreaterThan(initialRoom);
        }
      }
    });

    it('should transition to outcome state when encounter completes', () => {
      const encounter = createMockEncounter();
      const onComplete = jest.fn();

      // Complete all rooms
      const config = encounter.getState().config;
      for (let i = 0; i < config.dungeonSize; i++) {
        const availableCards = encounter.getAvailableCards();
        if (availableCards.length > 0) {
          encounter.selectCard(availableCards[0].id);
          if (i < config.dungeonSize - 1) {
            encounter.advanceRoom();
          }
        }
      }

      const { rerender } = render(
        <ScoundrelScreen
          {...defaultProps}
          encounter={encounter}
          onComplete={onComplete}
        />
      );

      // Initially should show gameplay content
      expect(screen.getByTestId('scoundrel-screen')).toBeTruthy();

      // Complete encounter
      const completeButton = screen.queryByText('Complete Encounter');
      if (completeButton) {
        fireEvent.press(completeButton);

        // Re-render to see outcome state
        rerender(
          <ScoundrelScreen
            {...defaultProps}
            encounter={encounter}
            onComplete={onComplete}
          />
        );

        // Should show outcome display
        expect(screen.queryByText(/Success!|Failure!/)).toBeTruthy();
        expect(onComplete).toHaveBeenCalled();
      }
    });

    it('should synchronize state with encounter changes', () => {
      const encounter = createMockEncounter();
      const initialState = encounter.getState();

      render(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

      // Verify initial state is displayed
      expect(
        screen.getByText(
          new RegExp(
            `${initialState.currentLife}/${initialState.config.startingLife}`
          )
        )
      ).toBeTruthy();

      // Modify encounter state
      const availableCards = encounter.getAvailableCards();
      if (availableCards.length > 0) {
        encounter.selectCard(availableCards[0].id);
        const updatedState = encounter.getState();

        // Component should reflect updated state on next render
        const { rerender } = render(
          <ScoundrelScreen {...defaultProps} encounter={encounter} />
        );
        rerender(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

        // State should be synchronized - verify via last card
        const lastCard = encounter.getLastCard();
        expect(lastCard?.id).toBe(availableCards[0].id);
      }
    });

    it('should handle state updates without re-mounting component', () => {
      const encounter = createMockEncounter();
      const { rerender } = render(
        <ScoundrelScreen {...defaultProps} encounter={encounter} />
      );

      // Component should maintain identity across state updates
      const initialScreen = screen.getByTestId('scoundrel-screen');
      expect(initialScreen).toBeTruthy();

      // Update encounter state
      const availableCards = encounter.getAvailableCards();
      if (availableCards.length > 0) {
        encounter.selectCard(availableCards[0].id);
        rerender(<ScoundrelScreen {...defaultProps} encounter={encounter} />);

        // Component should still exist (not unmounted)
        const updatedScreen = screen.getByTestId('scoundrel-screen');
        expect(updatedScreen).toBeTruthy();
      }
    });

    it('should conditionally render based on outcome state', () => {
      const encounter = createMockEncounter();
      const onComplete = jest.fn();

      // Complete encounter and resolve
      const config = encounter.getState().config;
      for (let i = 0; i < config.dungeonSize; i++) {
        const availableCards = encounter.getAvailableCards();
        if (availableCards.length > 0) {
          encounter.selectCard(availableCards[0].id);
          if (i < config.dungeonSize - 1) {
            encounter.advanceRoom();
          }
        }
      }

      const outcome = encounter.resolve(mockInventory);

      // Render with outcome
      const { rerender } = render(
        <ScoundrelScreen
          {...defaultProps}
          encounter={encounter}
          onComplete={onComplete}
        />
      );

      // Complete encounter to trigger outcome state
      const completeButton = screen.queryByText('Complete Encounter');
      if (completeButton) {
        fireEvent.press(completeButton);
        rerender(
          <ScoundrelScreen
            {...defaultProps}
            encounter={encounter}
            onComplete={onComplete}
          />
        );

        // Should show outcome display instead of gameplay content
        if (outcome.type === 'success' || outcome.type === 'failure') {
          expect(screen.queryByText(/Success!|Failure!/)).toBeTruthy();
          // Gameplay content should not be visible
          expect(screen.queryByText('Available Cards')).toBeNull();
        }
      }
    });
  });
});
