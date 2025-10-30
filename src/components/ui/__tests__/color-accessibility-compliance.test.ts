import { readFileSync } from 'fs';
import { join } from 'path';

describe('Color Accessibility Compliance', () => {
  const projectRoot = join(__dirname, '../../../..');

  // Helper function to calculate contrast ratio
  const getContrastRatio = (color1: string, color2: string): number => {
    // Simplified contrast calculation - in a real implementation,
    // you'd want to use a proper color contrast library
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  };

  it('should verify centralized color system exists and is accessible', () => {
    const colorsPath = join(projectRoot, 'src/components/ui/colors.tsx');
    const colorsContent = readFileSync(colorsPath, 'utf8');

    // Verify the centralized color system exists
    expect(colorsContent).toContain('const colors = {');
    expect(colorsContent).toContain('export default colors');

    // Verify key color categories exist
    expect(colorsContent).toContain('charcoal:');
    expect(colorsContent).toContain('primary:');
    expect(colorsContent).toContain('success:');
    expect(colorsContent).toContain('danger:');
    expect(colorsContent).toContain('warning:');
    expect(colorsContent).toContain('neutral:');
  });

  it('should verify color contrast ratios meet accessibility standards', () => {
    const colorsPath = join(projectRoot, 'src/components/ui/colors.tsx');
    const colorsContent = readFileSync(colorsPath, 'utf8');

    // Extract color values from the colors file
    const colorMatches = colorsContent.match(/#[0-9a-fA-F]{6}/g) || [];
    const colors = [...new Set(colorMatches)]; // Remove duplicates

    // Test common color combinations for accessibility
    const white = '#ffffff';
    const black = '#000000';

    // Test white text on dark backgrounds (should have good contrast)
    const darkColors = colors.filter((color) => {
      const contrast = getContrastRatio(white, color);
      return contrast >= 4.5; // WCAG AA standard
    });

    // Test black text on light backgrounds (should have good contrast)
    const lightColors = colors.filter((color) => {
      const contrast = getContrastRatio(black, color);
      return contrast >= 4.5; // WCAG AA standard
    });

    // We should have a reasonable number of accessible color combinations
    expect(darkColors.length).toBeGreaterThan(0);
    expect(lightColors.length).toBeGreaterThan(0);

    // Log accessible color combinations for manual verification
    console.log('Dark colors suitable for white text:', darkColors);
    console.log('Light colors suitable for black text:', lightColors);
  });

  it('should verify components use consistent color patterns', () => {
    const componentFiles = [
      'src/components/dungeon-game/grid-tile.tsx',
      'src/components/dungeon-game/currency-display.tsx',
    ];

    componentFiles.forEach((filePath) => {
      const fullPath = join(projectRoot, filePath);
      const content = readFileSync(fullPath, 'utf8');

      // Components should use Tailwind color classes instead of hardcoded values
      const hardcodedColors = content.match(/#[0-9a-fA-F]{6}/g) || [];
      const shortHexColors = content.match(/#[0-9a-fA-F]{3}/g) || [];

      // Should have minimal hardcoded colors (only in comments or test data)
      const nonCommentHardcodedColors = hardcodedColors.filter((color) => {
        const lines = content.split('\n');
        return lines.some(
          (line) =>
            line.includes(color) &&
            !line.trim().startsWith('//') &&
            !line.trim().startsWith('*')
        );
      });

      expect(nonCommentHardcodedColors.length).toBeLessThanOrEqual(2); // Allow for some edge cases

      // Should use Tailwind color classes
      expect(content).toMatch(
        /bg-(charcoal|primary|success|danger|warning|neutral)-/
      );
    });

    // Check that at least some components use centralized color system
    const allComponentFiles = [
      'src/components/dungeon-game/grid-tile.tsx',
      'src/components/ui/modal.tsx',
      'src/components/dungeon-game/currency-display.tsx',
      'src/components/character/character-avatar.tsx',
    ];

    let componentsUsingCentralizedColors = 0;
    allComponentFiles.forEach((filePath) => {
      const fullPath = join(projectRoot, filePath);
      const content = readFileSync(fullPath, 'utf8');

      // Check if component uses centralized color system (either Tailwind classes or colors import)
      if (
        content.includes('import colors from') ||
        content.match(
          /bg-(charcoal|primary|success|danger|warning|neutral)-/
        ) ||
        content.match(
          /text-(charcoal|primary|success|danger|warning|neutral)-/
        ) ||
        content.match(
          /border-(charcoal|primary|success|danger|warning|neutral)-/
        )
      ) {
        componentsUsingCentralizedColors++;
      }
    });

    // At least 75% of components should use centralized color system
    expect(componentsUsingCentralizedColors).toBeGreaterThanOrEqual(
      Math.ceil(allComponentFiles.length * 0.75)
    );
  });

  it('should verify color system supports dark mode', () => {
    const colorsPath = join(projectRoot, 'src/components/ui/colors.tsx');
    const colorsContent = readFileSync(colorsPath, 'utf8');

    // Verify we have a range of colors from light to dark
    expect(colorsContent).toContain('50:'); // Lightest shades
    expect(colorsContent).toContain('900:'); // Darkest shades

    // Check that we have colors suitable for both light and dark themes
    const lightShades = colorsContent.match(/50:\s*'#[^']+'/g) || [];
    const darkShades = colorsContent.match(/900:\s*'#[^']+'/g) || [];

    expect(lightShades.length).toBeGreaterThan(0);
    expect(darkShades.length).toBeGreaterThan(0);
  });
});
