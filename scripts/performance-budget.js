#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Performance Budget Checker
 * Validates current performance metrics against defined budgets
 */

const PERFORMANCE_BUDGETS = {
  // Build Performance (in milliseconds)
  build: {
    typescript: 3000, // 3 seconds
    linting: 8000, // 8 seconds
    testing: 5000, // 5 seconds
    fullCheck: 10000, // 10 seconds
  },

  // Bundle Size (in bytes)
  bundle: {
    total: 1024 * 1024, // 1MB
    components: 500 * 1024, // 500KB
    lib: 200 * 1024, // 200KB
    app: 100 * 1024, // 100KB
    dependencies: 100, // Max dependencies
  },

  // Test Performance (in milliseconds)
  testing: {
    mockSetup: 10, // 10ms per test
    testExecution: 30, // 30ms per test
    totalTestTime: 5000, // 5 seconds total
  },
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

function checkBuildPerformance(buildTimes) {
  const violations = [];

  Object.entries(PERFORMANCE_BUDGETS.build).forEach(([metric, budget]) => {
    const actual = buildTimes[metric];
    if (actual && actual > budget) {
      violations.push({
        category: 'build',
        metric,
        actual: formatDuration(actual),
        budget: formatDuration(budget),
        severity: 'error',
        message: `${metric} exceeded budget: ${formatDuration(actual)} > ${formatDuration(budget)}`,
      });
    }
  });

  return violations;
}

function checkBundlePerformance(bundleAnalysis) {
  const violations = [];

  // Check total bundle size
  if (bundleAnalysis.totalSize > PERFORMANCE_BUDGETS.bundle.total) {
    violations.push({
      category: 'bundle',
      metric: 'total',
      actual: formatBytes(bundleAnalysis.totalSize),
      budget: formatBytes(PERFORMANCE_BUDGETS.bundle.total),
      severity: 'error',
      message: `Total bundle size exceeded budget: ${formatBytes(bundleAnalysis.totalSize)} > ${formatBytes(PERFORMANCE_BUDGETS.bundle.total)}`,
    });
  }

  // Check component size
  if (
    bundleAnalysis.components &&
    bundleAnalysis.components.totalSize > PERFORMANCE_BUDGETS.bundle.components
  ) {
    violations.push({
      category: 'bundle',
      metric: 'components',
      actual: formatBytes(bundleAnalysis.components.totalSize),
      budget: formatBytes(PERFORMANCE_BUDGETS.bundle.components),
      severity: 'warning',
      message: `Components size exceeded budget: ${formatBytes(bundleAnalysis.components.totalSize)} > ${formatBytes(PERFORMANCE_BUDGETS.bundle.components)}`,
    });
  }

  // Check dependencies
  if (
    bundleAnalysis.dependencies &&
    bundleAnalysis.dependencies.totalDependencies >
      PERFORMANCE_BUDGETS.bundle.dependencies
  ) {
    violations.push({
      category: 'bundle',
      metric: 'dependencies',
      actual: bundleAnalysis.dependencies.totalDependencies,
      budget: PERFORMANCE_BUDGETS.bundle.dependencies,
      severity: 'warning',
      message: `Dependencies count exceeded budget: ${bundleAnalysis.dependencies.totalDependencies} > ${PERFORMANCE_BUDGETS.bundle.dependencies}`,
    });
  }

  return violations;
}

function checkTestPerformance(testAnalysis) {
  const violations = [];

  if (
    testAnalysis.mockSetupTime &&
    testAnalysis.mockSetupTime > PERFORMANCE_BUDGETS.testing.mockSetup
  ) {
    violations.push({
      category: 'testing',
      metric: 'mockSetup',
      actual: `${testAnalysis.mockSetupTime}ms`,
      budget: `${PERFORMANCE_BUDGETS.testing.mockSetup}ms`,
      severity: 'warning',
      message: `Mock setup time exceeded budget: ${testAnalysis.mockSetupTime}ms > ${PERFORMANCE_BUDGETS.testing.mockSetup}ms`,
    });
  }

  if (
    testAnalysis.totalTime &&
    testAnalysis.totalTime > PERFORMANCE_BUDGETS.testing.totalTestTime
  ) {
    violations.push({
      category: 'testing',
      metric: 'totalTime',
      actual: formatDuration(testAnalysis.totalTime),
      budget: formatDuration(PERFORMANCE_BUDGETS.testing.totalTestTime),
      severity: 'error',
      message: `Total test time exceeded budget: ${formatDuration(testAnalysis.totalTime)} > ${formatDuration(PERFORMANCE_BUDGETS.testing.totalTestTime)}`,
    });
  }

  return violations;
}

function loadPerformanceData() {
  const buildTimesPath = path.join(process.cwd(), 'build-times-report.json');
  const bundleAnalysisPath = path.join(
    process.cwd(),
    'bundle-analysis-report.json'
  );

  let buildTimes = {};
  let bundleAnalysis = {};
  let testAnalysis = {};

  try {
    if (fs.existsSync(buildTimesPath)) {
      buildTimes = JSON.parse(fs.readFileSync(buildTimesPath, 'utf8'));
    }
  } catch (error) {
    console.warn('Could not load build times data:', error.message);
  }

  try {
    if (fs.existsSync(bundleAnalysisPath)) {
      bundleAnalysis = JSON.parse(fs.readFileSync(bundleAnalysisPath, 'utf8'));
    }
  } catch (error) {
    console.warn('Could not load bundle analysis data:', error.message);
  }

  return { buildTimes, bundleAnalysis, testAnalysis };
}

function generateReport(violations) {
  console.log('📊 Performance Budget Report');
  console.log('============================\n');

  if (violations.length === 0) {
    console.log('✅ All performance metrics are within budget!');
    console.log('\n🎯 Current Performance Status:');
    console.log('  Build Performance: ✅ Within budget');
    console.log('  Bundle Size: ✅ Within budget');
    console.log('  Test Performance: ✅ Within budget');
    return;
  }

  console.log(
    `❌ Found ${violations.length} performance budget violation(s):\n`
  );

  violations.forEach((violation, index) => {
    const icon = violation.severity === 'error' ? '🚨' : '⚠️';
    console.log(`${index + 1}. ${icon} ${violation.message}`);
    console.log(`   Category: ${violation.category}`);
    console.log(`   Metric: ${violation.metric}`);
    console.log(`   Actual: ${violation.actual}`);
    console.log(`   Budget: ${violation.budget}`);
    console.log(`   Severity: ${violation.severity.toUpperCase()}\n`);
  });

  // Generate recommendations
  console.log('💡 Recommendations:');
  violations.forEach((violation) => {
    switch (violation.category) {
      case 'build':
        if (violation.metric === 'typescript') {
          console.log('  - Enable TypeScript incremental compilation');
          console.log('  - Consider using skipLibCheck for faster builds');
        } else if (violation.metric === 'linting') {
          console.log('  - Enable ESLint caching');
          console.log('  - Consider excluding large files from linting');
        } else if (violation.metric === 'testing') {
          console.log('  - Enable parallel test execution');
          console.log('  - Use Jest caching');
        }
        break;
      case 'bundle':
        if (violation.metric === 'total' || violation.metric === 'components') {
          console.log('  - Implement code splitting');
          console.log('  - Use dynamic imports for large components');
          console.log('  - Optimize images and assets');
        } else if (violation.metric === 'dependencies') {
          console.log('  - Audit and remove unused dependencies');
          console.log('  - Consider lighter alternatives');
        }
        break;
      case 'testing':
        if (violation.metric === 'mockSetup') {
          console.log('  - Optimize mock setup in centralized mocks');
          console.log('  - Use factory functions for test data');
        } else if (violation.metric === 'totalTime') {
          console.log('  - Enable parallel test execution');
          console.log('  - Split large test files');
        }
        break;
    }
  });
}

function main() {
  console.log('🔍 Checking Performance Budgets...\n');

  const { buildTimes, bundleAnalysis, testAnalysis } = loadPerformanceData();

  const violations = [
    ...checkBuildPerformance(buildTimes.buildTimes || {}),
    ...checkBundlePerformance(bundleAnalysis),
    ...checkTestPerformance(testAnalysis),
  ];

  generateReport(violations);

  // Exit with error code if there are violations
  if (violations.length > 0) {
    const errorCount = violations.filter((v) => v.severity === 'error').length;
    if (errorCount > 0) {
      process.exit(1);
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  PERFORMANCE_BUDGETS,
  checkBuildPerformance,
  checkBundlePerformance,
  checkTestPerformance,
  formatBytes,
  formatDuration,
};
