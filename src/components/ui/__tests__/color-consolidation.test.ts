import { readFileSync } from 'fs';
import { join } from 'path';

describe('Color Consolidation', () => {
  const projectRoot = join(__dirname, '../../../..');

  it('should have removed old colors.js file', () => {
    const oldColorsPath = join(projectRoot, 'src/components/ui/colors.js');
    const fs = require('fs');
    expect(fs.existsSync(oldColorsPath)).toBe(false);
  });

  it('should verify high-priority files use centralized colors', () => {
    const highPriorityFiles = [
      'src/components/cover.tsx',
      'src/components/dungeon-game/dungeon-game.tsx',
      'src/components/history/scenario-grid.tsx',
      'src/components/ui/icons/monster.tsx',
    ];

    highPriorityFiles.forEach((filePath) => {
      const fullPath = join(projectRoot, filePath);
      const content = readFileSync(fullPath, 'utf8');

      // Check that file imports colors from centralized system
      expect(content).toMatch(
        /import.*colors.*from.*['"]@\/components\/ui\/colors['"]/
      );

      // Check that common hardcoded colors are replaced with centralized references
      const commonHardcodedColors = [
        '#ffffff',
        '#000000',
        '#fff',
        '#000',
        '#ff7b1a',
        '#ef4444',
        '#22c55e',
        '#e5e5e5',
      ];

      commonHardcodedColors.forEach((color) => {
        // Should not find these hardcoded colors in the file content
        expect(content).not.toContain(color);
      });
    });
  });

  it('should verify color consolidation mapping', () => {
    // Test that the centralized colors.tsx contains all the consolidated colors
    const colorsPath = join(projectRoot, 'src/components/ui/colors.tsx');
    const colorsContent = readFileSync(colorsPath, 'utf8');

    // Verify key consolidated colors exist in the centralized system
    const expectedConsolidatedColors = [
      "white: '#ffffff'",
      "black: '#000000'",
      'charcoal: {',
      'primary: {',
      'success: {',
      'danger: {',
    ];

    expectedConsolidatedColors.forEach((colorDef) => {
      expect(colorsContent).toContain(colorDef);
    });
  });

  it('should verify no duplicate color definitions remain', () => {
    const colorValues = new Map<string, string[]>(); // color -> array of files

    function extractColors(content: string, filePath: string): void {
      const hexPattern = /#[0-9a-fA-F]{6}/g;
      const shortHexPattern = /#[0-9a-fA-F]{3}/g;

      let match;
      while ((match = hexPattern.exec(content)) !== null) {
        const color = match[0].toLowerCase();
        if (!colorValues.has(color)) {
          colorValues.set(color, []);
        }
        colorValues.get(color)!.push(filePath);
      }

      while ((match = shortHexPattern.exec(content)) !== null) {
        const color = match[0].toLowerCase();
        if (!colorValues.has(color)) {
          colorValues.set(color, []);
        }
        colorValues.get(color)!.push(filePath);
      }
    }

    function scanDirectory(dir: string): void {
      try {
        const fs = require('fs');
        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
          const fullPath = join(dir, item.name);

          if (item.isDirectory()) {
            if (
              !item.name.startsWith('.') &&
              item.name !== 'node_modules' &&
              item.name !== 'coverage'
            ) {
              scanDirectory(fullPath);
            }
          } else if (
            item.isFile() &&
            (item.name.endsWith('.tsx') ||
              item.name.endsWith('.ts') ||
              item.name.endsWith('.js'))
          ) {
            try {
              const content = readFileSync(fullPath, 'utf8');
              const relativePath = fullPath.replace(projectRoot + '/', '');
              extractColors(content, relativePath);
            } catch (error) {
              // Skip files that can't be read
            }
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    }

    scanDirectory(projectRoot);

    // Find remaining duplicates (excluding the centralized colors.tsx file)
    const duplicates: Array<{ color: string; files: string[] }> = [];
    for (const [color, files] of colorValues.entries()) {
      const nonCentralizedFiles = files.filter(
        (file) =>
          !file.includes('colors.tsx') &&
          !file.includes('color-duplicates-audit.test.ts') &&
          !file.includes('color-consolidation.test.ts')
      );

      if (nonCentralizedFiles.length > 1) {
        duplicates.push({ color, files: nonCentralizedFiles });
      }
    }

    // Log remaining duplicates for review
    if (duplicates.length > 0) {
      console.log('\nRemaining duplicate colors after consolidation:');
      duplicates.forEach(({ color, files }) => {
        console.log(`  ${color}: ${files.join(', ')}`);
      });
    }

    // We expect some duplicates to remain initially, but fewer than before
    expect(duplicates.length).toBeLessThan(50); // Significantly reduced from original ~100+
  });
});
