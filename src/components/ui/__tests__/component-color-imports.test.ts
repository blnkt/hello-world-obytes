import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

describe('Component Color Imports', () => {
  const projectRoot = join(__dirname, '../../../..');

  // List of files that are expected to use the centralized color system
  const filesToAudit = [
    // 'src/components/character/character-avatar.tsx', // Now uses pure Tailwind classes
    'src/components/character/experience-field.tsx',
    'src/components/character/name-field.tsx',
    'src/components/dungeon-game/currency-display.tsx',
    'src/components/dungeon-game/game-grid.tsx',
    // 'src/components/dungeon-game/grid-tile.tsx', // Now uses pure Tailwind classes
    'src/components/dungeon-game/persistence-error-display.tsx',
    'src/components/dungeon-game/resume-choice-modal.tsx',
    'src/components/history/scenario-illustrations.tsx',
    'src/components/history/scenario-stats.tsx',
    'src/components/scenario-card.tsx',
    'src/components/ui/checkbox.tsx',
    'src/components/ui/game-progress.tsx',
    'src/components/ui/icons/merchant.tsx',
    'src/components/ui/icons/language.tsx',
    'src/components/ui/list.tsx',
    'src/components/ui/manual-step-entry.tsx',
    // 'src/components/ui/modal.tsx', // Now uses pure Tailwind classes
    'src/components/ui/progress-bar.tsx',
  ];

  // List of common hardcoded colors to check for (excluding Tailwind classes)
  const commonHardcodedColors = [
    '#ffffff',
    '#000000',
    '#fff',
    '#000',
    '#ff7b1a',
    '#ef4444',
    '#22c55e',
    '#e5e5e5',
    '#f2f2f2',
    '#3f3d56',
    '#7eb55a',
    '#e6e6e6',
    '#FC6276',
    '#192332',
    '#CCCFD6',
    '#D96B5E',
    '#C55A4D',
    '#7A6F66',
    '#6B5F57',
    '#F7D17B',
    '#E6C269',
    '#8C7099',
    '#7D618A',
    '#5EC0C0',
    '#4DAFAF',
    '#E0D9CE',
    '#D1CABF',
    '#9CA3AF',
    '#F3F4F6',
    '#DC2626',
    '#3B82F6',
    '#8B5CF6',
    '#10B981',
    '#6B7280',
    '#F5F0E8',
    '#4CAF50',
    '#2196F3',
    '#666',
    '#888',
  ];

  it('should verify all components import colors from centralized system', () => {
    filesToAudit.forEach((filePath) => {
      const fullPath = join(projectRoot, filePath);
      const content = readFileSync(fullPath, 'utf8');

      // Check that file imports colors from centralized system (absolute or relative)
      expect(content).toMatch(
        /import.*colors.*from.*['"]@\/components\/ui\/colors['"]|import.*colors.*from.*['"]\.\.?\/colors['"]/
      );
    });
  });

  it('should verify components use colors object instead of hardcoded values', () => {
    filesToAudit.forEach((filePath) => {
      const fullPath = join(projectRoot, filePath);
      const content = readFileSync(fullPath, 'utf8');

      // Should not find these hardcoded colors in the file content
      commonHardcodedColors.forEach((color) => {
        expect(content).not.toContain(color);
      });

      // Should use colors object references
      expect(content).toMatch(
        /colors\.(white|black|primary|danger|success|warning|charcoal|neutral)/
      );
    });
  });
});
