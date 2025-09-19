import { readFileSync } from 'fs';
import { join } from 'path';

describe('Storage Type Safety', () => {
  const projectRoot = join(__dirname, '../../..');
  const storagePath = join(projectRoot, 'src/lib/storage.tsx');

  it('should verify storage functions use proper TypeScript interfaces instead of any types', () => {
    const storageContent = readFileSync(storagePath, 'utf8');
    
    // Check that we have proper type definitions
    expect(storageContent).toContain('type');
    
    // Check that scenario history functions use proper types
    expect(storageContent).toMatch(/getScenarioHistory\(\):\s*ScenarioHistory\[\]/);
    expect(storageContent).toMatch(/addScenarioToHistory\(historyEntry:\s*ScenarioHistory\)/);
    
    // Check that character functions use proper types
    expect(storageContent).toMatch(/getCharacter\(\):\s*Character/);
    expect(storageContent).toMatch(/setCharacter\(character:\s*Character\)/);
    
    // Check that manual step functions use proper types
    expect(storageContent).toMatch(/getManualStepsByDay\(\):\s*ManualStepEntry\[\]/);
    expect(storageContent).toMatch(/setManualStepsByDay\(stepsByDay:\s*ManualStepEntry\[\]\)/);
    
    // Verify no 'any' types are used in function signatures
    const anyTypesInFunctions = storageContent.match(/:\s*any[\[\]]?/g) || [];
    const anyTypesInFunctionSignatures = anyTypesInFunctions.filter(type => {
      // Only count 'any' types that are in function signatures, not in comments or strings
      const lines = storageContent.split('\n');
      return lines.some(line => 
        line.includes(type) && 
        (line.includes('function') || line.includes('=>')) &&
        !line.trim().startsWith('//') &&
        !line.trim().startsWith('*')
      );
    });
    
    expect(anyTypesInFunctionSignatures.length).toBe(0);
  });

  it('should verify proper imports of type definitions', () => {
    const storageContent = readFileSync(storagePath, 'utf8');
    
    // Check that we import the necessary types
    expect(storageContent).toMatch(/import.*Character.*from.*['"]@\/types\/character['"]/);
    expect(storageContent).toMatch(/import.*ScenarioHistory.*from.*['"]@\/types\/scenario['"]/);
  });

  it('should verify type safety in React hooks', () => {
    const storageContent = readFileSync(storagePath, 'utf8');
    
    // Check that React hooks use proper types
    expect(storageContent).toMatch(/useCharacter.*:\s*\[Character\s*\|\s*null,\s*\(character:\s*Character\)\s*=>\s*void\]/);
    expect(storageContent).toMatch(/useManualStepsByDay.*:\s*\[ManualStepEntry\[\],\s*\(steps:\s*ManualStepEntry\[\]\)\s*=>\s*void\]/);
  });

  it('should verify validation functions use proper type guards', () => {
    const storageContent = readFileSync(storagePath, 'utf8');
    
    // Check that validation functions use proper type guards
    expect(storageContent).toMatch(/validateManualStepEntry\(entry:\s*unknown\):\s*entry is ManualStepEntry/);
  });
});
