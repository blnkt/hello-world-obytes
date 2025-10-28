/**
 * Error Feedback Tests
 * Tests for error feedback system with recovery suggestions
 */

import { ErrorFeedback } from '../error-feedback';

describe('ErrorFeedback', () => {
  let feedback: ErrorFeedback;

  beforeEach(() => {
    feedback = new ErrorFeedback();
  });

  describe('error generation', () => {
    it('should generate feedback for network errors', () => {
      const result = feedback.generateErrorFeedback({
        errorType: 'network',
        message: 'Connection failed',
      });

      expect(result.errorType).toBe('network');
      expect(result.severity).toBe('high');
      expect(result.hasRecovery).toBe(true);
      expect(result.recoverySteps?.length).toBeGreaterThan(0);
    });

    it('should generate feedback for validation errors', () => {
      const result = feedback.generateErrorFeedback({
        errorType: 'validation',
        message: 'Invalid input',
      });

      expect(result.errorType).toBe('validation');
      expect(result.severity).toBe('medium');
      expect(result.recoverySteps).toBeDefined();
    });

    it('should generate feedback for system errors', () => {
      const result = feedback.generateErrorFeedback({
        errorType: 'system',
        message: 'Unexpected error',
      });

      expect(result.errorType).toBe('system');
      expect(result.severity).toBe('critical');
      expect(result.hasRecovery).toBe(true);
    });
  });

  describe('recovery suggestions', () => {
    it('should provide recovery steps for network errors', () => {
      const result = feedback.generateErrorFeedback({
        errorType: 'network',
        message: 'Connection timeout',
      });

      expect(result.recoverySteps).toBeDefined();
      expect(result.recoverySteps?.some(step => step.includes('Check'))).toBe(true);
    });

    it('should provide recovery steps for validation errors', () => {
      const result = feedback.generateErrorFeedback({
        errorType: 'validation',
        message: 'Invalid data',
      });

      expect(result.recoverySteps).toBeDefined();
      expect(result.recoverySteps?.some(step => step.toLowerCase().includes('check') || step.toLowerCase().includes('verify'))).toBe(true);
    });

    it('should provide fallback options for critical errors', () => {
      const result = feedback.generateErrorFeedback({
        errorType: 'system',
        message: 'System failure',
      });

      expect(result.hasFallback).toBe(true);
      expect(result.fallbackOptions).toBeDefined();
      expect(result.fallbackOptions?.length).toBeGreaterThan(0);
    });
  });

  describe('user-friendly messages', () => {
    it('should generate user-friendly messages', () => {
      const result = feedback.generateErrorFeedback({
        errorType: 'network',
        message: 'Connection failed',
      });

      expect(result.userMessage).toBeDefined();
      expect(result.userMessage.length).toBeGreaterThan(0);
      expect(result.userMessage.toLowerCase()).not.toContain('error');
    });
  });
});

