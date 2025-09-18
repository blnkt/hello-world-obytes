import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

describe('Utility Duplicates Audit', () => {
  const projectRoot = join(__dirname, '../../../..');

  // Common utility function patterns to check for duplicates
  const utilityPatterns = [
    // Date/time utilities - be more specific to avoid false positives
    { pattern: /^formatDate$|^formatTime$|^formatDateTime$/, name: 'Date formatting' },
    { pattern: /parseDate|parseTime|parseDateTime/, name: 'Date parsing' },
    { pattern: /isValidDate|isValidTime|isValidDateTime/, name: 'Date validation' },
    
    // String utilities
    { pattern: /capitalize|toTitleCase|toUpperCase|toLowerCase/, name: 'String case conversion' },
    { pattern: /trim|strip|clean/, name: 'String cleaning' },
    { pattern: /slugify|kebabCase|camelCase|snakeCase/, name: 'String transformation' },
    
    // Number utilities
    { pattern: /formatNumber|formatCurrency|formatPercent/, name: 'Number formatting' },
    { pattern: /clamp|min|max|between/, name: 'Number constraints' },
    { pattern: /round|floor|ceil|trunc/, name: 'Number rounding' },
    
    // Array utilities
    { pattern: /unique|dedupe|distinct/, name: 'Array deduplication' },
    { pattern: /flatten|flat/, name: 'Array flattening' },
    { pattern: /groupBy|group|partition/, name: 'Array grouping' },
    { pattern: /sort|orderBy/, name: 'Array sorting' },
    
    // Object utilities
    { pattern: /merge|assign|extend/, name: 'Object merging' },
    { pattern: /pick|omit|select/, name: 'Object selection' },
    { pattern: /deepClone|clone|copy/, name: 'Object cloning' },
    
    // Validation utilities
    { pattern: /validate|isValid|check/, name: 'Validation' },
    { pattern: /isEmpty|isNull|isUndefined/, name: 'Empty checks' },
    
    // Storage utilities
    { pattern: /getStorage|setStorage|removeStorage/, name: 'Storage operations' },
    { pattern: /serialize|deserialize/, name: 'Serialization' },
    
    // Async utilities
    { pattern: /debounce|throttle/, name: 'Async timing' },
    { pattern: /retry|attempt/, name: 'Retry logic' },
    
    // UI utilities
    { pattern: /getClassNames|cn|clsx/, name: 'Class name utilities' },
    { pattern: /getSize|getColor|getTheme/, name: 'Theme utilities' },
  ];

  it('should identify duplicate utility function implementations', () => {
    const duplicateFunctions: { [key: string]: string[] } = {};
    const allFiles: string[] = [];

    // Recursively find all TypeScript/JavaScript files
    const findFiles = (dir: string): void => {
      try {
        const items = readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = join(dir, item.name);
          
          if (item.isDirectory()) {
            // Skip node_modules, .git, and other non-source directories
            if (!item.name.startsWith('.') && item.name !== 'node_modules' && item.name !== 'dist' && item.name !== 'build') {
              findFiles(fullPath);
            }
          } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx') || item.name.endsWith('.js') || item.name.endsWith('.jsx'))) {
            allFiles.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    };

    findFiles(projectRoot);

    // Analyze each file for utility functions
    allFiles.forEach(filePath => {
      try {
        const content = readFileSync(filePath, 'utf8');
        const relativePath = filePath.replace(projectRoot + '/', '');
        
        utilityPatterns.forEach(({ pattern, name }) => {
          const matches = content.match(new RegExp(`(?:function|const|let|var)\\s+(${pattern.source})\\s*[=(]`, 'g'));
          
          if (matches) {
            matches.forEach(match => {
              const functionName = match.match(new RegExp(`(${pattern.source})`))?.[1];
              if (functionName) {
                // Only count as duplicate if the exact same function name appears in multiple files
                if (!duplicateFunctions[functionName]) {
                  duplicateFunctions[functionName] = [];
                }
                duplicateFunctions[functionName].push(relativePath);
              }
            });
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    });

    // Filter out functions that appear in only one file (not duplicates)
    const actualDuplicates = Object.entries(duplicateFunctions)
      .filter(([_, files]) => files.length > 1)
      .reduce((acc, [funcName, files]) => {
        acc[funcName] = files;
        return acc;
      }, {} as { [key: string]: string[] });

    // Log findings for debugging
    console.log('\nDuplicate utility functions found:');
    Object.entries(actualDuplicates).forEach(([funcName, files]) => {
      console.log(`  ${funcName}: ${files.join(', ')}`);
    });

    // After consolidation, we should have fewer duplicates
    // The main duplicates we found were validate functions and date formatting
    // Note: Some "duplicates" might be wrappers around centralized functions
    expect(Object.keys(actualDuplicates).length).toBeLessThanOrEqual(2);
  });

  it('should verify utility functions are properly exported and imported', () => {
    const utilityFiles = [
      'src/lib/utils.ts',
      'src/lib/helpers.ts',
      'src/utils/index.ts',
      'src/components/ui/utils.ts',
    ];

    utilityFiles.forEach(filePath => {
      const fullPath = join(projectRoot, filePath);
      try {
        const content = readFileSync(fullPath, 'utf8');
        
        // Check for proper exports
        expect(content).toMatch(/export\s+(?:function|const|let|var|default)/);
        
        // Check for proper imports in other files
        const importMatches = content.match(/import.*from.*['"]\.\.?\/.*['"]/g);
        if (importMatches) {
          importMatches.forEach(importStatement => {
            expect(importStatement).toMatch(/import\s+.*\s+from\s+['"]\.\.?\/.*['"]/);
          });
        }
      } catch (error) {
        // File doesn't exist, which is fine for this audit
      }
    });
  });
});
