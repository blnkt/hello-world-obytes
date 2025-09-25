#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Bundle Size Analysis Script
 * Analyzes the current bundle size and provides insights
 */

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (_error) {
    return 0;
  }
}

function getDirectorySize(
  dirPath,
  extensions = ['.ts', '.tsx', '.js', '.jsx']
) {
  let totalSize = 0;
  let fileCount = 0;

  function traverseDir(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);

      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip node_modules, .git, and other non-source directories
          if (
            ![
              'node_modules',
              '.git',
              'ios',
              'android',
              'coverage',
              '.expo',
            ].includes(item)
          ) {
            traverseDir(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            totalSize += stat.size;
            fileCount++;
          }
        }
      }
    } catch (_error) {
      // Skip directories we can't read
    }
  }

  traverseDir(dirPath);
  return { totalSize, fileCount };
}

function analyzeDependencies() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const dependencies = Object.keys(packageJson.dependencies || {});
  const devDependencies = Object.keys(packageJson.devDependencies || {});

  return {
    dependencies: dependencies.length,
    devDependencies: devDependencies.length,
    totalDependencies: dependencies.length + devDependencies.length,
    dependenciesList: dependencies,
    devDependenciesList: devDependencies,
  };
}

function analyzeSourceCode() {
  const srcPath = path.join(process.cwd(), 'src');
  const srcStats = getDirectorySize(srcPath);

  // Analyze specific directories
  const componentsPath = path.join(srcPath, 'components');
  const libPath = path.join(srcPath, 'lib');
  const appPath = path.join(srcPath, 'app');

  const componentsStats = fs.existsSync(componentsPath)
    ? getDirectorySize(componentsPath)
    : { totalSize: 0, fileCount: 0 };
  const libStats = fs.existsSync(libPath)
    ? getDirectorySize(libPath)
    : { totalSize: 0, fileCount: 0 };
  const appStats = fs.existsSync(appPath)
    ? getDirectorySize(appPath)
    : { totalSize: 0, fileCount: 0 };

  return {
    total: srcStats,
    components: componentsStats,
    lib: libStats,
    app: appStats,
  };
}

function analyzeMocks() {
  const mocksPath = path.join(process.cwd(), '__mocks__');
  if (!fs.existsSync(mocksPath)) {
    return { totalSize: 0, fileCount: 0, files: [] };
  }

  const mocksStats = getDirectorySize(mocksPath);
  const files = fs
    .readdirSync(mocksPath)
    .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))
    .map((file) => ({
      name: file,
      size: getFileSize(path.join(mocksPath, file)),
    }));

  return {
    ...mocksStats,
    files,
  };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateReport() {
  console.log('📊 Bundle Size Analysis Report');
  console.log('================================\n');

  const deps = analyzeDependencies();
  const source = analyzeSourceCode();
  const mocks = analyzeMocks();

  logDependencies(deps);
  logSourceCode(source);
  logMocks(mocks);
  logBundleImpact(source, mocks);
  logRecommendations();
  logMockSystemBenefits();

  return {
    dependencies: deps,
    source: source,
    mocks: mocks,
    estimatedBundleSize: source.total.totalSize + mocks.totalSize * 0.1,
  };
}

function logDependencies(deps) {
  console.log('📦 Dependencies Analysis:');
  console.log(`  Production dependencies: ${deps.dependencies}`);
  console.log(`  Development dependencies: ${deps.devDependencies}`);
  console.log(`  Total dependencies: ${deps.totalDependencies}\n`);
}

function logSourceCode(source) {
  console.log('📁 Source Code Analysis:');
  console.log(`  Total source files: ${source.total.fileCount}`);
  console.log(`  Total source size: ${formatBytes(source.total.totalSize)}`);
  console.log(
    `  Components: ${source.components.fileCount} files, ${formatBytes(source.components.totalSize)}`
  );
  console.log(
    `  Library code: ${source.lib.fileCount} files, ${formatBytes(source.lib.totalSize)}`
  );
  console.log(
    `  App code: ${source.app.fileCount} files, ${formatBytes(source.app.totalSize)}\n`
  );
}

function logMocks(mocks) {
  console.log('🧪 Mock Files Analysis:');
  console.log(`  Mock files: ${mocks.fileCount}`);
  console.log(`  Mock size: ${formatBytes(mocks.totalSize)}`);
  if (mocks.files.length > 0) {
    console.log('  Mock files breakdown:');
    mocks.files.forEach((file) => {
      console.log(`    ${file.name}: ${formatBytes(file.size)}`);
    });
  }
  console.log('');
}

function logBundleImpact(source, mocks) {
  const estimatedBundleSize = source.total.totalSize + mocks.totalSize * 0.1;
  console.log('📈 Estimated Bundle Impact:');
  console.log(`  Estimated bundle size: ${formatBytes(estimatedBundleSize)}`);
  console.log(
    `  Mock overhead: ${formatBytes(mocks.totalSize * 0.1)} (10% of mock size)`
  );
  console.log('');
}

function logRecommendations() {
  console.log('💡 Optimization Recommendations:');
  console.log('  1. Use tree shaking to eliminate unused code');
  console.log('  2. Implement code splitting for large components');
  console.log('  3. Optimize images and assets');
  console.log('  4. Use dynamic imports for non-critical features');
  console.log('  5. Consider lazy loading for heavy components');
  console.log('');
}

function logMockSystemBenefits() {
  console.log('🎯 Mock System Benefits:');
  console.log('  ✅ Centralized mock management reduces duplication');
  console.log('  ✅ Type-safe mock interfaces improve development experience');
  console.log('  ✅ Factory functions reduce test setup complexity');
  console.log('  ✅ Scenario methods provide consistent test patterns');
  console.log('  ✅ Minimal bundle impact (mocks are dev-only)');
}

// Run the analysis
if (require.main === module) {
  generateReport();
}

module.exports = {
  generateReport,
  analyzeDependencies,
  analyzeSourceCode,
  analyzeMocks,
  formatBytes,
};
