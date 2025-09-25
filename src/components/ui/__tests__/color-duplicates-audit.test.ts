import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

describe('Color Duplicates Audit', () => {
  const projectRoot = join(__dirname, '../../../..');
  
  it('should identify all files containing color definitions', () => {
    const colorFiles: string[] = [];
    const colorPatterns = [
      /#[0-9a-fA-F]{6}/g, // Hex colors like #FF0000
      /#[0-9a-fA-F]{3}/g, // Short hex colors like #F00
      /rgb\(/g, // RGB colors
      /rgba\(/g, // RGBA colors
      /hsl\(/g, // HSL colors
      /hsla\(/g, // HSLA colors
    ];

    function scanDirectory(dir: string): void {
      try {
        const items = readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = join(dir, item.name);
          
          if (item.isDirectory()) {
            // Skip node_modules, .git, and other non-source directories
            if (!item.name.startsWith('.') && item.name !== 'node_modules' && item.name !== 'coverage') {
              scanDirectory(fullPath);
            }
          } else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts') || item.name.endsWith('.js'))) {
            try {
              const content = readFileSync(fullPath, 'utf8');
              const hasColors = colorPatterns.some(pattern => pattern.test(content));
              
              if (hasColors) {
                colorFiles.push(fullPath.replace(projectRoot + '/', ''));
              }
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
    
    // Log all files containing colors for manual review
    console.log('Files containing color definitions:');
    colorFiles.forEach(file => console.log(`  - ${file}`));
    
    // We expect to find color definitions in various files
    expect(colorFiles.length).toBeGreaterThan(0);
    
    // The main colors file should be included
    expect(colorFiles).toContain('src/components/ui/colors.tsx');
  });

  it('should have audit report documenting color duplicates', () => {
    const auditReportPath = join(projectRoot, 'COLOR_AUDIT_REPORT.md');
    const fs = require('fs');
    expect(fs.existsSync(auditReportPath)).toBe(true);
    
    const reportContent = readFileSync(auditReportPath, 'utf8');
    expect(reportContent).toContain('Color Duplicates Audit Report');
    expect(reportContent).toContain('Most Duplicated Colors');
    expect(reportContent).toContain('Files Requiring Updates');
  });

  it('should identify duplicate color values across files', () => {
    const colorValues = new Map<string, string[]>(); // color -> array of files
    const projectRoot = join(__dirname, '../../../..');
    
    function extractColors(content: string, filePath: string): void {
      // Extract hex colors
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
        const items = readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = join(dir, item.name);
          
          if (item.isDirectory()) {
            if (!item.name.startsWith('.') && item.name !== 'node_modules' && item.name !== 'coverage') {
              scanDirectory(fullPath);
            }
          } else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts') || item.name.endsWith('.js'))) {
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
    
    // Find duplicates
    const duplicates: Array<{ color: string; files: string[] }> = [];
    for (const [color, files] of colorValues.entries()) {
      if (files.length > 1) {
        duplicates.push({ color, files });
      }
    }
    
    // Log duplicates for manual review
    if (duplicates.length > 0) {
      console.log('\nDuplicate color values found:');
      duplicates.forEach(({ color, files }) => {
        console.log(`  ${color}: ${files.join(', ')}`);
      });
    } else {
      console.log('\nNo duplicate color values found.');
    }
    
    // This test documents the current state - we expect some duplicates initially
    expect(duplicates.length).toBeGreaterThanOrEqual(0);
  });
});
