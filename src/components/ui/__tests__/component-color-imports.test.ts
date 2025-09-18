import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

describe('Component Color Imports', () => {
  const projectRoot = join(__dirname, '../../../..');
  const componentsDir = join(projectRoot, 'src/components');

  it('should verify all components import colors from centralized system', () => {
    const filesWithHardcodedColors = [
      'src/components/ui/progress-bar.tsx',
      'src/components/ui/modal.tsx',
      'src/components/dungeon-game/grid-tile.tsx',
      'src/components/dungeon-game/game-grid.tsx',
      'src/components/character/name-field.tsx',
      'src/components/dungeon-game/currency-display.tsx',
      'src/components/character/experience-field.tsx',
      'src/components/character/character-avatar.tsx',
      'src/components/dungeon-game/persistence-error-display.tsx',
      'src/components/dungeon-game/resume-choice-modal.tsx',
      'src/components/ui/manual-step-entry.tsx',
      'src/components/ui/game-progress.tsx',
      'src/components/dungeon-game/purchased-items-grid.tsx',
      'src/components/history/scenario-illustrations.tsx',
      'src/components/history/scenario-stats.tsx',
      'src/components/scenario-card.tsx',
      'src/components/ui/icons/merchant.tsx',
      'src/components/ui/list.tsx',
      'src/components/ui/icons/language.tsx',
      'src/components/ui/checkbox.tsx',
    ];

    filesWithHardcodedColors.forEach(filePath => {
      const fullPath = join(projectRoot, filePath);
      const content = readFileSync(fullPath, 'utf8');
      
      // Check that file imports colors from centralized system (absolute or relative)
      expect(content).toMatch(/import.*colors.*from.*['"]@\/components\/ui\/colors['"]|import.*colors.*from.*['"]\.\.?\/colors['"]/);
      
      // Check that common hardcoded colors are replaced with centralized references
      const commonHardcodedColors = [
        '#ffffff', '#000000', '#fff', '#000',
        '#ff7b1a', '#ef4444', '#22c55e', '#e5e5e5',
        '#3B82F6', '#8B5CF6', '#10B981', '#6B7280',
        '#D96B5E', '#C55A4D', '#7A6F66', '#6B5F57',
        '#F7D17B', '#E6C269', '#8C7099', '#7D618A',
        '#5EC0C0', '#4DAFAF', '#E0D9CE', '#D1CABF'
      ];
      
      commonHardcodedColors.forEach(color => {
        // Should not find these hardcoded colors in the file content
        expect(content).not.toContain(color);
      });
    });
  });

  it('should verify components use colors object instead of hardcoded values', () => {
    const testFiles = [
      'src/components/character/character-avatar.tsx',
      'src/components/dungeon-game/grid-tile.tsx',
      'src/components/ui/progress-bar.tsx'
    ];

    testFiles.forEach(filePath => {
      const fullPath = join(projectRoot, filePath);
      const content = readFileSync(fullPath, 'utf8');
      
      // Should use colors object references
      expect(content).toMatch(/colors\.(white|black|primary|danger|success|warning|charcoal|neutral)/);
    });
  });
});
