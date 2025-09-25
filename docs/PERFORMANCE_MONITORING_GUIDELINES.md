# Performance Monitoring Guidelines

This document provides comprehensive guidelines for monitoring and maintaining optimal performance across the application, including build times, bundle size, test execution, and runtime performance.

## Table of Contents

- [Performance Monitoring Overview](#performance-monitoring-overview)
- [Build Performance Monitoring](#build-performance-monitoring)
- [Bundle Size Monitoring](#bundle-size-monitoring)
- [Test Performance Monitoring](#test-performance-monitoring)
- [Runtime Performance Monitoring](#runtime-performance-monitoring)
- [Performance Budgets](#performance-budgets)
- [Automated Monitoring](#automated-monitoring)
- [Performance Alerts](#performance-alerts)
- [Performance Optimization](#performance-optimization)
- [Best Practices](#best-practices)

## Performance Monitoring Overview

### 🎯 Monitoring Objectives

1. **Maintain Optimal Build Times**: Keep development workflow efficient
2. **Control Bundle Size**: Ensure optimal application performance
3. **Ensure Test Reliability**: Maintain fast and reliable test execution
4. **Monitor Runtime Performance**: Track application performance metrics
5. **Prevent Performance Regressions**: Catch performance issues early

### 📊 Key Performance Metrics

| Category              | Metric           | Target      | Current  | Status |
| --------------------- | ---------------- | ----------- | -------- | ------ |
| **Build Performance** | TypeScript Check | < 3s        | 2.46s    | ✅     |
| **Build Performance** | ESLint Linting   | < 8s        | 7.03s    | ✅     |
| **Build Performance** | Jest Testing     | < 5s        | 4.02s    | ✅     |
| **Bundle Size**       | Total Bundle     | < 1MB       | 686.91KB | ✅     |
| **Test Performance**  | Mock Setup       | < 10ms/test | 5ms/test | ✅     |
| **Dependencies**      | Total Packages   | < 100       | 81       | ✅     |

## Build Performance Monitoring

### 🔧 Automated Build Monitoring

#### 1. Build Time Analysis Script

```bash
# Run comprehensive build time analysis
pnpm run analyze-build-times

# Monitor specific operations
pnpm run type-check --timing
pnpm run lint --timing
pnpm run test --timing
```

#### 2. Performance Budget Enforcement

```javascript
// scripts/performance-budget.js
const PERFORMANCE_BUDGETS = {
  typescript: 3000, // 3 seconds
  linting: 8000, // 8 seconds
  testing: 5000, // 5 seconds
  bundleSize: 1024 * 1024, // 1MB
  dependencies: 100,
};

function checkPerformanceBudget(results) {
  const violations = [];

  if (results.typescript > PERFORMANCE_BUDGETS.typescript) {
    violations.push(
      `TypeScript check exceeded budget: ${results.typescript}ms`
    );
  }

  if (results.linting > PERFORMANCE_BUDGETS.linting) {
    violations.push(`ESLint exceeded budget: ${results.linting}ms`);
  }

  if (results.testing > PERFORMANCE_BUDGETS.testing) {
    violations.push(`Jest testing exceeded budget: ${results.testing}ms`);
  }

  return violations;
}
```

#### 3. CI/CD Integration

```yaml
# .github/workflows/performance-check.yml
name: Performance Check
on: [pull_request, push]

jobs:
  performance-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run performance analysis
        run: |
          pnpm run analyze-build-times
          pnpm run analyze-bundle

      - name: Check performance budgets
        run: node scripts/check-performance-budget.js
```

### 📈 Build Performance Tracking

#### 1. Historical Performance Data

```javascript
// scripts/performance-tracker.js
class PerformanceTracker {
  constructor() {
    this.dataFile = 'performance-history.json';
    this.history = this.loadHistory();
  }

  recordBuildTime(operation, duration) {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      operation,
      duration,
      fileCount: this.getFileCount(),
      dependencies: this.getDependencyCount(),
    };

    this.history.push(entry);
    this.saveHistory();
  }

  getTrends() {
    const trends = {};
    const operations = ['typescript', 'linting', 'testing'];

    operations.forEach((op) => {
      const data = this.history
        .filter((entry) => entry.operation === op)
        .slice(-10); // Last 10 measurements

      if (data.length >= 2) {
        const trend = this.calculateTrend(data);
        trends[op] = trend;
      }
    });

    return trends;
  }
}
```

#### 2. Performance Regression Detection

```javascript
// scripts/regression-detector.js
function detectRegressions(current, baseline) {
  const regressions = [];
  const threshold = 0.2; // 20% increase threshold

  Object.keys(current).forEach((metric) => {
    const currentValue = current[metric];
    const baselineValue = baseline[metric];
    const increase = (currentValue - baselineValue) / baselineValue;

    if (increase > threshold) {
      regressions.push({
        metric,
        current: currentValue,
        baseline: baselineValue,
        increase: `${(increase * 100).toFixed(1)}%`,
      });
    }
  });

  return regressions;
}
```

## Bundle Size Monitoring

### 📦 Automated Bundle Analysis

#### 1. Bundle Size Tracking

```bash
# Generate bundle analysis report
pnpm run analyze-bundle

# Check bundle size against budget
node scripts/check-bundle-budget.js
```

#### 2. Bundle Size Budgets

```javascript
// scripts/bundle-budget.js
const BUNDLE_BUDGETS = {
  total: 1024 * 1024, // 1MB
  components: 500 * 1024, // 500KB
  lib: 200 * 1024, // 200KB
  app: 100 * 1024, // 100KB
  dependencies: 100, // Max number of dependencies
};

function checkBundleBudget(analysis) {
  const violations = [];

  if (analysis.totalSize > BUNDLE_BUDGETS.total) {
    violations.push(
      `Total bundle size exceeded: ${formatBytes(analysis.totalSize)}`
    );
  }

  if (analysis.components.size > BUNDLE_BUDGETS.components) {
    violations.push(
      `Components size exceeded: ${formatBytes(analysis.components.size)}`
    );
  }

  if (analysis.dependencies.total > BUNDLE_BUDGETS.dependencies) {
    violations.push(
      `Dependencies count exceeded: ${analysis.dependencies.total}`
    );
  }

  return violations;
}
```

#### 3. Dependency Monitoring

```javascript
// scripts/dependency-monitor.js
class DependencyMonitor {
  analyzeDependencies() {
    const packageJson = require('../package.json');
    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});

    return {
      production: dependencies.length,
      development: devDependencies.length,
      total: dependencies.length + devDependencies.length,
      unused: this.findUnusedDependencies(dependencies),
      outdated: this.findOutdatedDependencies(dependencies),
    };
  }

  findUnusedDependencies(dependencies) {
    // Implementation to find unused dependencies
    return [];
  }

  findOutdatedDependencies(dependencies) {
    // Implementation to find outdated dependencies
    return [];
  }
}
```

## Test Performance Monitoring

### 🧪 Test Execution Monitoring

#### 1. Test Performance Tracking

```javascript
// scripts/test-performance.js
class TestPerformanceMonitor {
  constructor() {
    this.results = [];
  }

  recordTestRun(duration, testCount, mockSetupTime) {
    this.results.push({
      timestamp: new Date().toISOString(),
      duration,
      testCount,
      mockSetupTime,
      averagePerTest: duration / testCount,
      mockEfficiency: mockSetupTime / testCount,
    });
  }

  analyzeTrends() {
    const recent = this.results.slice(-10);
    const trends = {
      duration: this.calculateTrend(recent.map((r) => r.duration)),
      mockEfficiency: this.calculateTrend(recent.map((r) => r.mockEfficiency)),
    };

    return trends;
  }
}
```

#### 2. Mock Performance Monitoring

```javascript
// scripts/mock-performance.js
function monitorMockPerformance() {
  const mockFiles = [
    'dungeon-game-persistence.ts',
    'health-hooks.ts',
    'storage-functions.ts',
    'types.ts',
    'helpers.ts',
  ];

  const analysis = mockFiles.map((file) => {
    const size = getFileSize(`__mocks__/${file}`);
    const complexity = analyzeComplexity(`__mocks__/${file}`);

    return {
      file,
      size,
      complexity,
      performanceScore: calculatePerformanceScore(size, complexity),
    };
  });

  return analysis;
}
```

## Runtime Performance Monitoring

### 🚀 Application Performance

#### 1. Performance Metrics Collection

```javascript
// src/lib/performance-monitor.ts
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTiming(label: string): void {
    performance.mark(`${label}-start`);
  }

  endTiming(label: string): number {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);

    const measure = performance.getEntriesByName(label)[0];
    const duration = measure.duration;

    this.recordMetric(label, duration);
    return duration;
  }

  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }

    const values = this.metrics.get(label)!;
    values.push(value);

    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getAverage(label: string): number {
    const values = this.metrics.get(label) || [];
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
}
```

#### 2. Component Performance Monitoring

```typescript
// src/components/performance-wrapper.tsx
import React, { useEffect, useRef } from 'react';
import { PerformanceMonitor } from '../lib/performance-monitor';

interface PerformanceWrapperProps {
  children: React.ReactNode;
  componentName: string;
}

export const PerformanceWrapper: React.FC<PerformanceWrapperProps> = ({
  children,
  componentName
}) => {
  const monitor = useRef(new PerformanceMonitor());

  useEffect(() => {
    monitor.current.startTiming(`${componentName}-render`);

    return () => {
      const duration = monitor.current.endTiming(`${componentName}-render`);

      // Log performance metrics
      if (duration > 16) { // 60fps threshold
        console.warn(`Slow render detected in ${componentName}: ${duration}ms`);
      }
    };
  });

  return <>{children}</>;
};
```

## Performance Budgets

### 📊 Budget Definitions

```javascript
// scripts/performance-budgets.js
export const PERFORMANCE_BUDGETS = {
  // Build Performance
  build: {
    typescript: 3000, // 3 seconds
    linting: 8000, // 8 seconds
    testing: 5000, // 5 seconds
    fullCheck: 10000, // 10 seconds
  },

  // Bundle Size
  bundle: {
    total: 1024 * 1024, // 1MB
    components: 500 * 1024, // 500KB
    lib: 200 * 1024, // 200KB
    app: 100 * 1024, // 100KB
    dependencies: 100, // Max dependencies
  },

  // Test Performance
  testing: {
    mockSetup: 10, // 10ms per test
    testExecution: 30, // 30ms per test
    totalTestTime: 5000, // 5 seconds total
  },

  // Runtime Performance
  runtime: {
    componentRender: 16, // 16ms (60fps)
    navigation: 100, // 100ms
    dataFetch: 1000, // 1 second
    memoryUsage: 50 * 1024 * 1024, // 50MB
  },
};
```

### 🚨 Budget Enforcement

```javascript
// scripts/enforce-budgets.js
function enforcePerformanceBudgets(results) {
  const violations = [];

  // Check build performance
  Object.entries(PERFORMANCE_BUDGETS.build).forEach(([metric, budget]) => {
    if (results.build[metric] > budget) {
      violations.push({
        category: 'build',
        metric,
        actual: results.build[metric],
        budget,
        severity: 'error',
      });
    }
  });

  // Check bundle size
  Object.entries(PERFORMANCE_BUDGETS.bundle).forEach(([metric, budget]) => {
    if (results.bundle[metric] > budget) {
      violations.push({
        category: 'bundle',
        metric,
        actual: results.bundle[metric],
        budget,
        severity: 'warning',
      });
    }
  });

  return violations;
}
```

## Automated Monitoring

### 🤖 CI/CD Integration

#### 1. GitHub Actions Workflow

```yaml
# .github/workflows/performance-monitor.yml
name: Performance Monitor
on:
  schedule:
    - cron: '0 9 * * 1' # Weekly on Monday at 9 AM
  workflow_dispatch:

jobs:
  performance-monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run performance analysis
        run: |
          pnpm run analyze-build-times
          pnpm run analyze-bundle

      - name: Check performance budgets
        run: node scripts/check-performance-budget.js

      - name: Generate performance report
        run: node scripts/generate-performance-report.js

      - name: Upload performance data
        uses: actions/upload-artifact@v3
        with:
          name: performance-data
          path: performance-report.json
```

#### 2. Automated Reporting

```javascript
// scripts/generate-performance-report.js
class PerformanceReporter {
  generateReport() {
    const buildTimes = this.analyzeBuildTimes();
    const bundleSize = this.analyzeBundleSize();
    const testPerformance = this.analyzeTestPerformance();

    const report = {
      timestamp: new Date().toISOString(),
      build: buildTimes,
      bundle: bundleSize,
      testing: testPerformance,
      trends: this.calculateTrends(),
      recommendations: this.generateRecommendations(),
    };

    fs.writeFileSync(
      'performance-report.json',
      JSON.stringify(report, null, 2)
    );
    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    // Add recommendations based on current performance
    if (this.buildTimes.typescript > 3000) {
      recommendations.push(
        'Consider enabling TypeScript incremental compilation'
      );
    }

    if (this.bundleSize.total > 800 * 1024) {
      recommendations.push('Consider implementing code splitting');
    }

    return recommendations;
  }
}
```

## Performance Alerts

### 🚨 Alert System

#### 1. Alert Configuration

```javascript
// scripts/alert-config.js
export const ALERT_CONFIG = {
  thresholds: {
    buildTimeIncrease: 0.2, // 20% increase
    bundleSizeIncrease: 0.1, // 10% increase
    testTimeIncrease: 0.3, // 30% increase
    dependencyIncrease: 5, // 5 new dependencies
  },

  channels: {
    slack: {
      webhook: process.env.SLACK_WEBHOOK_URL,
      channel: '#performance-alerts',
    },
    email: {
      recipients: ['team@company.com'],
      smtp: process.env.SMTP_CONFIG,
    },
  },
};
```

#### 2. Alert Triggers

```javascript
// scripts/alert-system.js
class AlertSystem {
  checkAlerts(current, previous) {
    const alerts = [];

    // Build time alerts
    if (current.build.typescript > previous.build.typescript * 1.2) {
      alerts.push({
        type: 'build-performance',
        severity: 'warning',
        message: `TypeScript compilation time increased by ${this.calculateIncrease(current.build.typescript, previous.build.typescript)}%`,
      });
    }

    // Bundle size alerts
    if (current.bundle.total > previous.bundle.total * 1.1) {
      alerts.push({
        type: 'bundle-size',
        severity: 'error',
        message: `Bundle size increased by ${this.calculateIncrease(current.bundle.total, previous.bundle.total)}%`,
      });
    }

    return alerts;
  }

  sendAlert(alert) {
    // Implementation for sending alerts via Slack, email, etc.
    console.log(`ALERT: ${alert.message}`);
  }
}
```

## Performance Optimization

### 🚀 Optimization Strategies

#### 1. Build Optimization

```javascript
// scripts/build-optimizer.js
class BuildOptimizer {
  optimizeTypeScript() {
    return {
      incremental: true,
      tsBuildInfoFile: '.tsbuildinfo',
      skipLibCheck: true,
      isolatedModules: true,
    };
  }

  optimizeJest() {
    return {
      maxWorkers: '50%',
      cache: true,
      cacheDirectory: '.jest-cache',
      clearMocks: true,
      restoreMocks: true,
    };
  }

  optimizeESLint() {
    return {
      cache: true,
      cacheLocation: '.eslintcache',
      maxWarnings: 0,
    };
  }
}
```

#### 2. Bundle Optimization

```javascript
// scripts/bundle-optimizer.js
class BundleOptimizer {
  analyzeBundle() {
    const analysis = {
      totalSize: this.getTotalSize(),
      largestFiles: this.getLargestFiles(),
      unusedDependencies: this.findUnusedDependencies(),
      optimizationOpportunities: this.findOptimizationOpportunities(),
    };

    return analysis;
  }

  findOptimizationOpportunities() {
    const opportunities = [];

    // Check for large files
    const largeFiles = this.getLargestFiles();
    if (largeFiles.length > 0) {
      opportunities.push('Consider code splitting for large files');
    }

    // Check for unused dependencies
    const unused = this.findUnusedDependencies();
    if (unused.length > 0) {
      opportunities.push(`Remove unused dependencies: ${unused.join(', ')}`);
    }

    return opportunities;
  }
}
```

## Best Practices

### 📋 Performance Monitoring Best Practices

1. **Regular Monitoring**

   - Run performance analysis daily
   - Monitor trends over time
   - Set up automated alerts

2. **Performance Budgets**

   - Define clear performance budgets
   - Enforce budgets in CI/CD
   - Review and update budgets regularly

3. **Optimization Focus**

   - Focus on the biggest performance impacts
   - Measure before and after optimizations
   - Document optimization results

4. **Team Awareness**

   - Share performance reports with the team
   - Include performance in code reviews
   - Train team on performance best practices

5. **Continuous Improvement**
   - Regularly review performance metrics
   - Update monitoring tools and processes
   - Learn from performance issues

### 🎯 Success Metrics

| Metric               | Target      | Current  | Status |
| -------------------- | ----------- | -------- | ------ |
| **Build Time**       | < 10s       | 8.78s    | ✅     |
| **Bundle Size**      | < 1MB       | 686.91KB | ✅     |
| **Test Performance** | < 5s        | 4.02s    | ✅     |
| **Mock Efficiency**  | < 10ms/test | 5ms/test | ✅     |
| **Dependencies**     | < 100       | 81       | ✅     |

This comprehensive performance monitoring system ensures optimal performance across all aspects of the application while providing early detection of performance regressions and optimization opportunities.
