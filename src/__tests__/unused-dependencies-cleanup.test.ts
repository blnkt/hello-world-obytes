import { readFileSync } from 'fs';
import { join } from 'path';

describe('Unused Dependencies Cleanup', () => {
  const packageJsonPath = join(__dirname, '../../package.json');
  
  it('should not have unused npm dependencies', () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    
    const unusedDependencies = [
      '@hookform/resolvers',
      'expo-dev-client',
      'expo-font',
      'expo-status-bar',
      'expo-system-ui',
      'react-error-boundary'
    ];
    
    unusedDependencies.forEach(dep => {
      expect(dependencies[dep]).toBeUndefined();
      expect(devDependencies[dep]).toBeUndefined();
    });
  });
});
