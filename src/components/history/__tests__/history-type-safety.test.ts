import { readFileSync } from 'fs';
import { join } from 'path';

describe('History Components Type Safety', () => {
  const projectRoot = join(__dirname, '../../../..');
  
  const historyComponents = [
    'src/components/history/scenario-grid.tsx',
    'src/components/history/scenario-stats.tsx',
    'src/components/history/scenario-timeline.tsx',
  ];

  it('should verify history components use proper interfaces instead of any[] types', () => {
    historyComponents.forEach(componentPath => {
      const fullPath = join(projectRoot, componentPath);
      const content = readFileSync(fullPath, 'utf8');
      
      // Check that the component imports ScenarioHistory type
      expect(content).toMatch(/import.*ScenarioHistory.*from.*['"]@\/types\/scenario['"]/);
      
      // Check that history prop uses ScenarioHistory[] instead of any[]
      expect(content).toMatch(/history:\s*ScenarioHistory\[\]/);
      
      // Verify no any[] types are used for history
      expect(content).not.toMatch(/history:\s*any\[\]/);
    });
  });

  it('should verify individual entry components use proper interfaces', () => {
    const scenarioHistoryItemPath = join(projectRoot, 'src/components/history/scenario-history-item.tsx');
    const content = readFileSync(scenarioHistoryItemPath, 'utf8');
    
    // Check that the component imports ScenarioHistory type
    expect(content).toMatch(/import.*ScenarioHistory.*from.*['"]@\/types\/scenario['"]/);
    
    // Check that entry prop uses ScenarioHistory instead of any
    expect(content).toMatch(/entry:\s*ScenarioHistory/);
    
    // Verify no any types are used for entry
    expect(content).not.toMatch(/entry:\s*any/);
  });

  it('should verify timeline item component uses proper interfaces', () => {
    const timelinePath = join(projectRoot, 'src/components/history/scenario-timeline.tsx');
    const content = readFileSync(timelinePath, 'utf8');
    
    // Check that TimelineItem component uses ScenarioHistory instead of any
    expect(content).toMatch(/TimelineItem.*entry:\s*ScenarioHistory/);
    
    // Verify no any types are used for TimelineItem entry
    expect(content).not.toMatch(/TimelineItem.*entry:\s*any/);
  });
});
