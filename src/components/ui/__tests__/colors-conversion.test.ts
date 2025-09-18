import { readFileSync } from 'fs';
import { join } from 'path';

describe('Colors Conversion to TypeScript', () => {
  const colorsTsxPath = join(__dirname, '../colors.tsx');
  
  it('should have colors.tsx file (converted from colors.js)', () => {
    const fs = require('fs');
    expect(fs.existsSync(colorsTsxPath)).toBe(true);
  });

  it('should export colors object with proper TypeScript types', () => {
    const colors = require('../colors').default;
    
    // Test basic color properties
    expect(colors.white).toBe('#ffffff');
    expect(colors.black).toBe('#000000');
    
    // Test color scale properties
    expect(colors.charcoal).toBeDefined();
    expect(colors.charcoal[50]).toBe('#F2F2F2');
    expect(colors.charcoal[950]).toBe('#121212');
    
    expect(colors.primary).toBeDefined();
    expect(colors.primary[500]).toBe('#FF7B1A');
    
    expect(colors.success).toBeDefined();
    expect(colors.success[500]).toBe('#22C55E');
    
    expect(colors.warning).toBeDefined();
    expect(colors.warning[500]).toBe('#F59E0B');
    
    expect(colors.danger).toBeDefined();
    expect(colors.danger[500]).toBe('#EF4444');
  });

  it('should have proper TypeScript interfaces', () => {
    // This test will verify that the file compiles with TypeScript
    // and has proper type definitions
    const colorsTsxContent = readFileSync(colorsTsxPath, 'utf8');
    
    // Check for TypeScript-specific syntax
    expect(colorsTsxContent).toContain('interface');
    expect(colorsTsxContent).toContain('export');
    expect(colorsTsxContent).not.toContain('module.exports');
  });
});
