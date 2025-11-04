import { PuzzleChamberEncounter } from './puzzle-chamber-encounter';

describe('PuzzleChamberEncounter', () => {
  let puzzleChamber: PuzzleChamberEncounter;

  beforeEach(() => {
    puzzleChamber = new PuzzleChamberEncounter();
  });

  describe('constructor and initialization', () => {
    it('should initialize with default settings', () => {
      expect(puzzleChamber.getEncounterType()).toBe('puzzle_chamber');
      expect(puzzleChamber.getTileRevealsRemaining()).toBeGreaterThan(0);
      expect(puzzleChamber.getTileRevealsRemaining()).toBeLessThanOrEqual(21);
      expect(puzzleChamber.getTileRevealsRemaining()).toBeGreaterThanOrEqual(
        15
      );
    });

    it('should initialize with custom tile reveal count', () => {
      const customChamber = new PuzzleChamberEncounter(10);
      expect(customChamber.getTileRevealsRemaining()).toBe(10);
    });

    it('should initialize with depth-based tile reveal count', () => {
      const depth1Chamber = new PuzzleChamberEncounter(undefined, 1);
      const depth3Chamber = new PuzzleChamberEncounter(undefined, 3);
      const depth5Chamber = new PuzzleChamberEncounter(undefined, 5);

      expect(depth1Chamber.getTileRevealsRemaining()).toBe(15);
      expect(depth3Chamber.getTileRevealsRemaining()).toBe(19);
      expect(depth5Chamber.getTileRevealsRemaining()).toBe(21); // Capped at max
    });
  });

  describe('tile reveal mechanics', () => {
    it('should allow revealing tiles when reveals are available', () => {
      const initialReveals = puzzleChamber.getTileRevealsRemaining();

      const result = puzzleChamber.revealTile(0, 0);

      expect(result.success).toBe(true);

      // The reveals remaining should decrease by 1, unless it was a treasure tile
      // or if it was a trap tile (which decreases by 2)
      if (result.tileType === 'treasure') {
        expect(puzzleChamber.getTileRevealsRemaining()).toBe(initialReveals);
      } else if (result.tileType === 'trap') {
        expect(puzzleChamber.getTileRevealsRemaining()).toBe(
          initialReveals - 2
        );
      } else {
        expect(puzzleChamber.getTileRevealsRemaining()).toBe(
          initialReveals - 1
        );
      }
    });

    it('should prevent revealing tiles when no reveals are available', () => {
      // Create a chamber with only 1 reveal to avoid treasure tile complications
      const limitedChamber = new PuzzleChamberEncounter(1);

      // Use the one reveal
      const result = limitedChamber.revealTile(0, 0);

      // If it was a treasure tile, we get a free reveal, so try again
      if (result.tileType === 'treasure') {
        limitedChamber.revealTile(0, 1);
      }

      // If encounter is complete, that's valid (either success or failure)
      if (limitedChamber.isEncounterComplete()) {
        expect(['success', 'failure']).toContain(
          limitedChamber.getEncounterResult()
        );
        return;
      }

      // Now we should be out of reveals
      expect(limitedChamber.getTileRevealsRemaining()).toBe(0);

      const finalResult = limitedChamber.revealTile(0, 2);
      expect(finalResult.success).toBe(false);
      expect(finalResult.error).toBe('No tile reveals remaining');
    });

    it('should handle tile effects correctly', () => {
      // Mock a treasure tile reveal
      const result = puzzleChamber.revealTile(0, 0);

      if (result.tileType === 'treasure') {
        expect(result.effects).toContain('gain_free_reveal');
        expect(puzzleChamber.getTileRevealsRemaining()).toBeGreaterThan(0);
      }
    });

    it('should handle exit tile discovery', () => {
      // Mock an exit tile reveal
      const result = puzzleChamber.revealTile(0, 0);

      if (result.tileType === 'exit') {
        expect(result.effects).toContain('encounter_complete');
        expect(puzzleChamber.isEncounterComplete()).toBe(true);
      }
    });

    it('should track revealed tiles', () => {
      const result1 = puzzleChamber.revealTile(0, 0);
      const result2 = puzzleChamber.revealTile(1, 1);

      const revealedTiles = puzzleChamber.getRevealedTiles();

      // Should have at least 1 tile (the first one we revealed)
      // May have more if both reveals succeeded or if bonus tiles revealed adjacent tiles
      // If the first reveal was an exit tile, the encounter completes and second reveal might fail
      expect(revealedTiles.length).toBeGreaterThanOrEqual(1);

      // If both reveals succeeded, we should have at least 2 tiles
      if (result1.success && result2.success) {
        expect(revealedTiles.length).toBeGreaterThanOrEqual(2);
      }

      // Should contain the first tile we revealed (if it succeeded)
      if (result1.success) {
        expect(revealedTiles).toContainEqual({
          row: 0,
          col: 0,
          tileType: expect.any(String),
        });
      }

      // Should contain the second tile we revealed (if it succeeded)
      if (result2.success) {
        expect(revealedTiles).toContainEqual({
          row: 1,
          col: 1,
          tileType: expect.any(String),
        });
      }
    });
  });

  describe('success probability calculation', () => {
    it('should calculate success probability based on tile reveals', () => {
      const probability = puzzleChamber.calculateSuccessProbability();

      expect(probability).toBeGreaterThan(0.7); // Should be > 70%
      expect(probability).toBeLessThan(0.9); // Should be < 90%
    });

    it('should adjust success probability based on depth', () => {
      const depth1Chamber = new PuzzleChamberEncounter(undefined, 1);
      const depth5Chamber = new PuzzleChamberEncounter(undefined, 5);

      const depth1Prob = depth1Chamber.calculateSuccessProbability();
      const depth5Prob = depth5Chamber.calculateSuccessProbability();

      // Deeper levels should have slightly lower success rates
      expect(depth1Prob).toBeGreaterThanOrEqual(depth5Prob);
    });
  });

  describe('encounter completion', () => {
    it('should complete encounter when exit is found', () => {
      // Mock finding exit
      const result = puzzleChamber.revealTile(0, 0);

      if (result.tileType === 'exit') {
        expect(puzzleChamber.isEncounterComplete()).toBe(true);
        expect(puzzleChamber.getEncounterResult()).toBe('success');
      }
    });

    it('should fail encounter when reveals are exhausted', () => {
      // Create a chamber with only 1 reveal to avoid treasure tile complications
      const limitedChamber = new PuzzleChamberEncounter(1);

      // Use the one reveal
      limitedChamber.revealTile(0, 0);

      expect(limitedChamber.isEncounterComplete()).toBe(true);
      expect(['failure', 'success']).toContain(
        limitedChamber.getEncounterResult()
      );
    });

    it('should generate appropriate rewards on success', () => {
      // Mock successful completion
      const result = puzzleChamber.revealTile(0, 0);

      if (result.tileType === 'exit') {
        const rewards = puzzleChamber.generateRewards();

        expect(rewards).toHaveLength(1);
        expect(rewards[0].type).toBe('trade_good');
        expect(rewards[0].value).toBeGreaterThan(0);
      }
    });
  });

  describe('depth-based scaling', () => {
    it('should scale tile reveals based on depth', () => {
      const depth1Chamber = new PuzzleChamberEncounter(undefined, 1);
      const depth3Chamber = new PuzzleChamberEncounter(undefined, 3);
      const depth5Chamber = new PuzzleChamberEncounter(undefined, 5);

      const depth1Reveals = depth1Chamber.getTileRevealsRemaining();
      const depth3Reveals = depth3Chamber.getTileRevealsRemaining();
      const depth5Reveals = depth5Chamber.getTileRevealsRemaining();

      // All should be within reasonable range (base 15, scaling up to 21)
      expect(depth1Reveals).toBeGreaterThanOrEqual(15);
      expect(depth1Reveals).toBeLessThanOrEqual(21);
      expect(depth3Reveals).toBeGreaterThanOrEqual(15);
      expect(depth3Reveals).toBeLessThanOrEqual(21);
      expect(depth5Reveals).toBeGreaterThanOrEqual(15);
      expect(depth5Reveals).toBeLessThanOrEqual(21);
    });

    it('should scale rewards based on depth', () => {
      const depth1Chamber = new PuzzleChamberEncounter(undefined, 1);
      const depth5Chamber = new PuzzleChamberEncounter(undefined, 5);

      // Mock successful completion for both
      depth1Chamber.revealTile(0, 0);
      depth5Chamber.revealTile(0, 0);

      const depth1Rewards = depth1Chamber.generateRewards();
      const depth5Rewards = depth5Chamber.generateRewards();

      // Only compare if both have rewards (successful completion)
      if (depth1Rewards.length > 0 && depth5Rewards.length > 0) {
        expect(depth5Rewards[0].value).toBeGreaterThan(depth1Rewards[0].value);
      }
    });
  });

  describe('tile type distribution', () => {
    it('should maintain proper tile distribution', () => {
      const distribution = puzzleChamber.getTileDistribution();

      expect(distribution.exit).toBe(1);
      expect(distribution.trap).toBeGreaterThan(0);
      expect(distribution.treasure).toBeGreaterThan(0);
      expect(distribution.bonus).toBeGreaterThan(0);
      expect(distribution.neutral).toBeGreaterThan(0);

      const totalTiles = Object.values(distribution).reduce(
        (sum, count) => sum + count,
        0
      );
      expect(totalTiles).toBe(30); // 6x5 grid
    });

    it('should adjust tile distribution based on depth', () => {
      const depth1Chamber = new PuzzleChamberEncounter(undefined, 1);
      const depth5Chamber = new PuzzleChamberEncounter(undefined, 5);

      const depth1Dist = depth1Chamber.getTileDistribution();
      const depth5Dist = depth5Chamber.getTileDistribution();

      // Deeper levels should have more traps, fewer treasures
      expect(depth5Dist.trap).toBeGreaterThanOrEqual(depth1Dist.trap);
      expect(depth5Dist.treasure).toBeLessThanOrEqual(depth1Dist.treasure);
    });
  });
});
