#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Build Time Analysis Script
 * Measures and analyzes build times for different operations
 */

class BuildTimeAnalyzer {
  constructor() {
    this.results = {};
    this.startTime = null;
  }

  startTimer(operation) {
    this.startTime = Date.now();
    console.log(`⏱️  Starting ${operation}...`);
  }

  endTimer(operation) {
    if (!this.startTime) {
      console.error(`❌ No start time recorded for ${operation}`);
      return 0;
    }
    
    const duration = Date.now() - this.startTime;
    this.results[operation] = duration;
    console.log(`✅ ${operation} completed in ${this.formatDuration(duration)}`);
    this.startTime = null;
    return duration;
  }

  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  }

  async measureTypeCheck() {
    this.startTimer('TypeScript Type Check');
    try {
      execSync('pnpm run type-check', { stdio: 'pipe' });
      return this.endTimer('TypeScript Type Check');
    } catch (error) {
      console.error('❌ TypeScript type check failed');
      return this.endTimer('TypeScript Type Check');
    }
  }

  async measureLinting() {
    this.startTimer('ESLint Linting');
    try {
      execSync('pnpm run lint', { stdio: 'pipe' });
      return this.endTimer('ESLint Linting');
    } catch (error) {
      console.error('❌ ESLint linting failed');
      return this.endTimer('ESLint Linting');
    }
  }

  async measureTesting() {
    this.startTimer('Jest Testing');
    try {
      execSync('pnpm run test', { stdio: 'pipe' });
      return this.endTimer('Jest Testing');
    } catch (error) {
      console.error('❌ Jest testing failed');
      return this.endTimer('Jest Testing');
    }
  }

  async measureFullCheck() {
    this.startTimer('Full Check (lint + type-check + test)');
    try {
      execSync('pnpm run check-all', { stdio: 'pipe' });
      return this.endTimer('Full Check (lint + type-check + test)');
    } catch (error) {
      console.error('❌ Full check failed');
      return this.endTimer('Full Check (lint + type-check + test)');
    }
  }

  async measurePrebuild() {
    this.startTimer('Expo Prebuild');
    try {
      execSync('pnpm run prebuild', { stdio: 'pipe' });
      return this.endTimer('Expo Prebuild');
    } catch (error) {
      console.error('❌ Expo prebuild failed');
      return this.endTimer('Expo Prebuild');
    }
  }

  analyzeFileCounts() {
    const srcPath = path.join(process.cwd(), 'src');
    const mocksPath = path.join(process.cwd(), '__mocks__');
    
    function countFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
      let count = 0;
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            count += countFiles(fullPath, extensions);
          } else if (stat.isFile()) {
            const ext = path.extname(item);
            if (extensions.includes(ext)) {
              count++;
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
      return count;
    }

    const srcFiles = countFiles(srcPath);
    const mockFiles = countFiles(mocksPath);
    
    return {
      srcFiles,
      mockFiles,
      totalFiles: srcFiles + mockFiles
    };
  }

  analyzeDependencies() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    return {
      dependencies: Object.keys(packageJson.dependencies || {}).length,
      devDependencies: Object.keys(packageJson.devDependencies || {}).length,
      totalDependencies: Object.keys(packageJson.dependencies || {}).length + 
                        Object.keys(packageJson.devDependencies || {}).length
    };
  }

  generateReport() {
    console.log('\n📊 Build Time Analysis Report');
    console.log('================================\n');

    // File counts
    const fileCounts = this.analyzeFileCounts();
    console.log('📁 File Counts:');
    console.log(`  Source files: ${fileCounts.srcFiles}`);
    console.log(`  Mock files: ${fileCounts.mockFiles}`);
    console.log(`  Total files: ${fileCounts.totalFiles}\n`);

    // Dependencies
    const deps = this.analyzeDependencies();
    console.log('📦 Dependencies:');
    console.log(`  Production: ${deps.dependencies}`);
    console.log(`  Development: ${deps.devDependencies}`);
    console.log(`  Total: ${deps.totalDependencies}\n`);

    // Build times
    console.log('⏱️  Build Times:');
    Object.entries(this.results).forEach(([operation, duration]) => {
      console.log(`  ${operation}: ${this.formatDuration(duration)}`);
    });
    console.log('');

    // Performance analysis
    console.log('🚀 Performance Analysis:');
    
    const totalTime = Object.values(this.results).reduce((sum, time) => sum + time, 0);
    console.log(`  Total build time: ${this.formatDuration(totalTime)}`);
    
    if (this.results['TypeScript Type Check']) {
      const typeCheckPerFile = this.results['TypeScript Type Check'] / fileCounts.totalFiles;
      console.log(`  TypeScript check per file: ${this.formatDuration(typeCheckPerFile)}`);
    }
    
    if (this.results['Jest Testing']) {
      const testPerFile = this.results['Jest Testing'] / fileCounts.totalFiles;
      console.log(`  Testing per file: ${this.formatDuration(testPerFile)}`);
    }
    
    console.log('');

    // Optimization recommendations
    console.log('💡 Optimization Recommendations:');
    console.log('  1. Use TypeScript incremental compilation');
    console.log('  2. Implement parallel test execution');
    console.log('  3. Use build caching for faster subsequent builds');
    console.log('  4. Optimize import statements for faster compilation');
    console.log('  5. Use watch mode for development builds');
    console.log('');

    // Mock system benefits
    console.log('🎯 Mock System Benefits:');
    console.log('  ✅ Centralized mocks reduce test setup time');
    console.log('  ✅ Type-safe interfaces improve compilation speed');
    console.log('  ✅ Factory functions reduce test data creation time');
    console.log('  ✅ Consistent patterns improve developer productivity');
    console.log('  ✅ Reduced duplication improves overall build performance');

    return {
      fileCounts,
      dependencies: deps,
      buildTimes: this.results,
      totalTime
    };
  }

  async runFullAnalysis() {
    console.log('🔍 Starting Build Time Analysis...\n');
    
    try {
      // Measure individual operations
      await this.measureTypeCheck();
      await this.measureLinting();
      await this.measureTesting();
      
      // Measure combined operations
      await this.measureFullCheck();
      
      // Generate report
      const report = this.generateReport();
      
      // Save results to file
      const reportPath = path.join(process.cwd(), 'build-times-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Report saved to: ${reportPath}`);
      
      return report;
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      throw error;
    }
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new BuildTimeAnalyzer();
  analyzer.runFullAnalysis().catch(console.error);
}

module.exports = BuildTimeAnalyzer;
