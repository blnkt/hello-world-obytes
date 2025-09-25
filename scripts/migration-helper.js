#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Migration Helper Script
 * Automates common migration tasks for the codebase cleanup
 */

class MigrationHelper {
  constructor() {
    this.projectRoot = process.cwd();
    this.migrationLog = [];
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    this.migrationLog.push(logEntry);
  }

  error(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ERROR: ${message}`;
    console.error(logEntry);
    this.migrationLog.push(logEntry);
  }

  // Check if a file exists
  fileExists(filePath) {
    return fs.existsSync(path.join(this.projectRoot, filePath));
  }

  // Read file content
  readFile(filePath) {
    try {
      return fs.readFileSync(path.join(this.projectRoot, filePath), 'utf8');
    } catch (error) {
      this.error(`Failed to read file ${filePath}: ${error.message}`);
      return null;
    }
  }

  // Write file content
  writeFile(filePath, content) {
    try {
      fs.writeFileSync(path.join(this.projectRoot, filePath), content, 'utf8');
      this.log(`Updated file: ${filePath}`);
      return true;
    } catch (error) {
      this.error(`Failed to write file ${filePath}: ${error.message}`);
      return false;
    }
  }

  // Check function length violations
  checkFunctionLength(filePath) {
    const content = this.readFile(filePath);
    if (!content) return [];

    const violations = [];
    const lines = content.split('\n');
    let currentFunction = null;
    let functionStartLine = 0;
    let braceCount = 0;
    let inFunction = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect function start
      if (line.match(/^\s*(export\s+)?(async\s+)?function\s+\w+/) || 
          line.match(/^\s*(export\s+)?const\s+\w+\s*=\s*(async\s+)?\(/) ||
          line.match(/^\s*(export\s+)?\w+\s*:\s*(async\s+)?\(/)) {
        currentFunction = line.trim();
        functionStartLine = i;
        inFunction = true;
        braceCount = 0;
      }

      if (inFunction) {
        // Count braces
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;

        // Function ended
        if (braceCount === 0 && line.includes('}')) {
          const functionLength = i - functionStartLine + 1;
          if (functionLength > 70) {
            violations.push({
              function: currentFunction,
              startLine: functionStartLine + 1,
              endLine: i + 1,
              length: functionLength
            });
          }
          inFunction = false;
          currentFunction = null;
        }
      }
    }

    return violations;
  }

  // Check parameter count violations
  checkParameterCount(filePath) {
    const content = this.readFile(filePath);
    if (!content) return [];

    const violations = [];
    const functionRegex = /^\s*(export\s+)?(async\s+)?function\s+(\w+)\s*\(([^)]*)\)/gm;
    const arrowFunctionRegex = /^\s*(export\s+)?const\s+(\w+)\s*=\s*(async\s+)?\(([^)]*)\)/gm;
    const methodRegex = /^\s*(\w+)\s*:\s*(async\s+)?\(([^)]*)\)/gm;

    let match;
    
    // Check regular functions
    while ((match = functionRegex.exec(content)) !== null) {
      const functionName = match[3];
      const parameters = match[4].split(',').filter(p => p.trim()).length;
      if (parameters > 3) {
        violations.push({
          function: functionName,
          parameters: parameters,
          type: 'function'
        });
      }
    }

    // Check arrow functions
    while ((match = arrowFunctionRegex.exec(content)) !== null) {
      const functionName = match[2];
      const parameters = match[4].split(',').filter(p => p.trim()).length;
      if (parameters > 3) {
        violations.push({
          function: functionName,
          parameters: parameters,
          type: 'arrow function'
        });
      }
    }

    // Check methods
    while ((match = methodRegex.exec(content)) !== null) {
      const functionName = match[1];
      const parameters = match[3].split(',').filter(p => p.trim()).length;
      if (parameters > 3) {
        violations.push({
          function: functionName,
          parameters: parameters,
          type: 'method'
        });
      }
    }

    return violations;
  }

  // Check TypeScript type violations
  checkTypeScriptTypes(filePath) {
    const content = this.readFile(filePath);
    if (!content) return [];

    const violations = [];
    
    // Check for implicit any types
    const implicitAnyRegex = /:\s*any\b/g;
    let match;
    while ((match = implicitAnyRegex.exec(content)) !== null) {
      violations.push({
        type: 'implicit any',
        position: match.index,
        message: 'Found implicit any type'
      });
    }

    // Check for missing return types
    const functionRegex = /^\s*(export\s+)?(async\s+)?function\s+\w+\s*\([^)]*\)\s*(?::\s*\w+)?\s*{/gm;
    while ((match = functionRegex.exec(content)) !== null) {
      if (!match[0].includes(':')) {
        violations.push({
          type: 'missing return type',
          position: match.index,
          message: 'Function missing explicit return type'
        });
      }
    }

    return violations;
  }

  // Generate migration report
  generateMigrationReport() {
    this.log('🔍 Starting Migration Analysis...\n');

    const report = {
      timestamp: new Date().toISOString(),
      files: [],
      summary: {
        totalFiles: 0,
        functionLengthViolations: 0,
        parameterCountViolations: 0,
        typeScriptViolations: 0,
        migrationRequired: 0
      }
    };

    // Find all TypeScript files
    const srcPath = path.join(this.projectRoot, 'src');
    const files = this.findTypeScriptFiles(srcPath);

    this.log(`Found ${files.length} TypeScript files to analyze\n`);

    files.forEach(filePath => {
      const relativePath = path.relative(this.projectRoot, filePath);
      this.log(`Analyzing: ${relativePath}`);

      const fileReport = {
        path: relativePath,
        functionLengthViolations: this.checkFunctionLength(relativePath),
        parameterCountViolations: this.checkParameterCount(relativePath),
        typeScriptViolations: this.checkTypeScriptTypes(relativePath)
      };

      report.files.push(fileReport);
      report.summary.totalFiles++;
      report.summary.functionLengthViolations += fileReport.functionLengthViolations.length;
      report.summary.parameterCountViolations += fileReport.parameterCountViolations.length;
      report.summary.typeScriptViolations += fileReport.typeScriptViolations.length;

      if (fileReport.functionLengthViolations.length > 0 || 
          fileReport.parameterCountViolations.length > 0 || 
          fileReport.typeScriptViolations.length > 0) {
        report.summary.migrationRequired++;
      }
    });

    // Generate summary
    this.log('\n📊 Migration Analysis Summary');
    this.log('============================');
    this.log(`Total files analyzed: ${report.summary.totalFiles}`);
    this.log(`Files requiring migration: ${report.summary.migrationRequired}`);
    this.log(`Function length violations: ${report.summary.functionLengthViolations}`);
    this.log(`Parameter count violations: ${report.summary.parameterCountViolations}`);
    this.log(`TypeScript violations: ${report.summary.typeScriptViolations}`);

    // Save detailed report
    const reportPath = path.join(this.projectRoot, 'migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`\n📄 Detailed report saved to: ${reportPath}`);

    return report;
  }

  // Find TypeScript files recursively
  findTypeScriptFiles(dir) {
    const files = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.findTypeScriptFiles(fullPath));
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      this.error(`Failed to read directory ${dir}: ${error.message}`);
    }
    
    return files;
  }

  // Generate migration recommendations
  generateRecommendations(report) {
    this.log('\n💡 Migration Recommendations');
    this.log('============================');

    if (report.summary.functionLengthViolations > 0) {
      this.log('\n🔧 Function Length Violations:');
      this.log('- Break down functions exceeding 70 lines');
      this.log('- Extract helper functions for complex logic');
      this.log('- Use object parameters for related data');
    }

    if (report.summary.parameterCountViolations > 0) {
      this.log('\n🔧 Parameter Count Violations:');
      this.log('- Use object parameters for functions with > 3 parameters');
      this.log('- Group related parameters into interfaces');
      this.log('- Consider builder pattern for complex objects');
    }

    if (report.summary.typeScriptViolations > 0) {
      this.log('\n🔧 TypeScript Violations:');
      this.log('- Add explicit return types to all functions');
      this.log('- Replace any types with proper interfaces');
      this.log('- Use generic types for reusable functions');
    }

    this.log('\n📚 Additional Resources:');
    this.log('- See docs/BREAKING_CHANGES_AND_MIGRATION.md for detailed guides');
    this.log('- Check docs/TESTING_GUIDELINES.md for mock migration');
    this.log('- Review docs/COMPONENT_GUIDELINES.md for component standards');
  }

  // Run migration analysis
  runAnalysis() {
    try {
      const report = this.generateMigrationReport();
      this.generateRecommendations(report);
      
      // Save migration log
      const logPath = path.join(this.projectRoot, 'migration-log.txt');
      fs.writeFileSync(logPath, this.migrationLog.join('\n'));
      this.log(`\n📝 Migration log saved to: ${logPath}`);

      return report;
    } catch (error) {
      this.error(`Migration analysis failed: ${error.message}`);
      throw error;
    }
  }
}

// Run migration analysis if called directly
if (require.main === module) {
  const helper = new MigrationHelper();
  helper.runAnalysis();
}

module.exports = MigrationHelper;
