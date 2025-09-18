import { existsSync } from 'fs';
import { join } from 'path';

describe('Demo Components Cleanup', () => {
  const componentsDir = join(__dirname, '..');

  it('should not have demo component files', () => {
    const demoFiles = [
      'buttons.tsx',
      'colors.tsx', 
      'inputs.tsx',
      'typography.tsx',
      'title.tsx'
    ];

    demoFiles.forEach(file => {
      const filePath = join(componentsDir, file);
      expect(existsSync(filePath)).toBe(false);
    });
  });

  it('should not have demo screen file', () => {
    const demoScreenPath = join(__dirname, '../../app/(app)/style.tsx');
    expect(existsSync(demoScreenPath)).toBe(false);
  });

  it('should have character utils file (it is actually used)', () => {
    const utilsPath = join(componentsDir, 'character/utils.ts');
    expect(existsSync(utilsPath)).toBe(true);
  });
});
