/**
 * Error Feedback
 * Provides user-friendly error feedback with recovery suggestions
 */

export type ErrorType = 'network' | 'validation' | 'system' | 'unknown';
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorFeedbackData {
  errorType: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  hasRecovery: boolean;
  hasFallback: boolean;
  recoverySteps?: string[];
  fallbackOptions?: string[];
}

interface ErrorFeedbackParams {
  errorType: ErrorType;
  message: string;
}

export class ErrorFeedback {
  generateErrorFeedback(params: ErrorFeedbackParams): ErrorFeedbackData {
    const severity = this.determineSeverity(params.errorType);
    const userMessage = this.generateUserMessage(params);
    const recoverySteps = this.generateRecoverySteps(params.errorType);
    const fallbackOptions = this.generateFallbackOptions(params.errorType);

    return {
      errorType: params.errorType,
      severity,
      message: params.message,
      userMessage,
      hasRecovery: recoverySteps ? recoverySteps.length > 0 : false,
      hasFallback: fallbackOptions ? fallbackOptions.length > 0 : false,
      recoverySteps,
      fallbackOptions,
    };
  }

  private determineSeverity(errorType: ErrorType): ErrorSeverity {
    switch (errorType) {
      case 'network':
        return 'high';
      case 'validation':
        return 'medium';
      case 'system':
        return 'critical';
      default:
        return 'low';
    }
  }

  private generateUserMessage(params: ErrorFeedbackParams): string {
    const errorMessages: Record<ErrorType, string> = {
      network:
        'Having trouble connecting. Please check your connection and try again.',
      validation:
        'Something went wrong with your input. Please verify and try again.',
      system: 'An unexpected issue occurred. Our team has been notified.',
      unknown: 'Something unexpected happened. Please try again.',
    };

    return errorMessages[params.errorType];
  }

  private generateRecoverySteps(errorType: ErrorType): string[] | undefined {
    switch (errorType) {
      case 'network':
        return [
          'Check your internet connection',
          'Try again in a few seconds',
          'Restart the app if the issue persists',
        ];
      case 'validation':
        return [
          'Verify your input is correct',
          'Check for required fields',
          'Try with different values',
        ];
      case 'system':
        return [
          'Close and reopen the app',
          'Check for app updates',
          'Contact support if the issue continues',
        ];
      default:
        return undefined;
    }
  }

  private generateFallbackOptions(errorType: ErrorType): string[] | undefined {
    if (errorType === 'system' || errorType === 'network') {
      return [
        'Continue offline mode',
        'Retry the operation',
        'Return to main menu',
      ];
    }
    return undefined;
  }
}
