import { readFileSync } from 'fs';
import { join } from 'path';

describe('Character Components Type Safety', () => {
  const projectRoot = join(__dirname, '../../../..');
  
  const characterComponentsWithUpdateField = [
    'src/components/character/name-field.tsx',
    'src/components/character/fitness-background-class-fields.tsx',
  ];

  const allCharacterComponents = [
    'src/components/character/name-field.tsx',
    'src/components/character/fitness-background-class-fields.tsx',
    'src/components/character/character-sheet.tsx',
  ];

  it('should verify character components use proper interfaces instead of any types', () => {
    characterComponentsWithUpdateField.forEach(componentPath => {
      const fullPath = join(projectRoot, componentPath);
      const content = readFileSync(fullPath, 'utf8');
      
      // Check that the component imports Character type (allow both absolute and relative imports)
      expect(content).toMatch(/import.*Character.*from.*['"]@\/types\/character['"]|import.*Character.*from.*['"]\.\.\/\.\.\/types\/character['"]/);
      
      // Check that updateField functions use proper types instead of any
      expect(content).toMatch(/updateField.*string.*number.*boolean/);
      
      // Verify no any types are used in function signatures
      expect(content).not.toMatch(/:\s*any\)\s*=>/);
    });
  });

  it('should verify character components have proper type definitions', () => {
    allCharacterComponents.forEach(componentPath => {
      const fullPath = join(projectRoot, componentPath);
      const content = readFileSync(fullPath, 'utf8');
      
      // Check that components have proper type definitions
      expect(content).toMatch(/type\s+\w+Props\s*=/);
      
      // Check that Character type is used in props
      expect(content).toMatch(/character\??:\s*Character/);
    });
  });

  it('should verify character form components use proper interfaces', () => {
    const characterFormPath = join(projectRoot, 'src/components/character/character-form.tsx');
    const content = readFileSync(characterFormPath, 'utf8');
    
    // Check that the component has proper type definitions
    expect(content).toMatch(/type\s+\w+Props\s*=/);
    
    // Check that props use proper types instead of any
    expect(content).toMatch(/:\s*string\)\s*=>\s*void/);
    
    // Verify no any types are used
    expect(content).not.toMatch(/:\s*any\)\s*=>/);
  });
});
