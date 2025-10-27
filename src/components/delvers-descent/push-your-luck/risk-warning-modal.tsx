import React from 'react';

export interface RiskWarning {
  type: 'safe' | 'caution' | 'danger' | 'critical';
  message: string;
  severity: number;
}

export interface RiskWarningModalProps {
  /** Warning to display */
  warning: RiskWarning;
  /** Callback when user confirms */
  onConfirm: () => void;
  /** Callback when user cancels */
  onCancel: () => void;
  /** Optional: Whether to show as a blocking modal */
  blocking?: boolean;
}

const getWarningClasses = (
  warningType: 'safe' | 'caution' | 'danger' | 'critical'
): {
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
} => {
  switch (warningType) {
    case 'safe':
      return {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-500',
        textColor: 'text-green-700',
        icon: '✓',
      };
    case 'caution':
      return {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-700',
        icon: '⚠',
      };
    case 'danger':
      return {
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-500',
        textColor: 'text-orange-700',
        icon: '⚠',
      };
    case 'critical':
      return {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-500',
        textColor: 'text-red-700',
        icon: '⚠',
      };
  }
};

const ModalOverlay: React.FC<{ blocking?: boolean; onCancel: () => void }> = ({
  blocking,
  onCancel,
}) => {
  if (!blocking) return null;

  return (
    <div
      data-testid="modal-overlay"
      className="fixed inset-0 z-50 bg-black/50"
      onClick={onCancel}
    />
  );
};

/**
 * RiskWarningModal - Contextual warnings and confirmations for risky decisions
 *
 * Displays warnings with appropriate visual styling based on severity.
 */
export const RiskWarningModal: React.FC<RiskWarningModalProps> = ({
  warning,
  onConfirm,
  onCancel,
  blocking = false,
}) => {
  const warningClasses = getWarningClasses(warning.type);

  return (
    <>
      <ModalOverlay blocking={blocking} onCancel={onCancel} />
      <div
        data-testid="risk-warning-modal"
        className={`fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 p-6 shadow-xl ${warningClasses.bgColor} ${warningClasses.borderColor}`}
      >
        <div className="mb-4 text-center">
          <div
            className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-full text-4xl ${warningClasses.bgColor}`}
          >
            {warningClasses.icon}
          </div>
          <h3 className={`text-xl font-bold ${warningClasses.textColor}`}>
            {warning.type === 'critical'
              ? 'CRITICAL WARNING'
              : warning.type === 'danger'
                ? 'Danger Zone'
                : warning.type === 'caution'
                  ? 'Caution'
                  : 'Safe Zone'}
          </h3>
        </div>

        <div className={`mb-6 text-center ${warningClasses.textColor}`}>
          <p className="text-lg">{warning.message}</p>
        </div>

        <div className="flex justify-center space-x-4">
          {warning.type === 'critical' || warning.type === 'danger' ? (
            <>
              <button
                data-testid="cancel-button"
                onClick={onCancel}
                className="rounded-lg border-2 border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                data-testid="confirm-button"
                onClick={onConfirm}
                className="rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700"
              >
                Proceed Despite Risk
              </button>
            </>
          ) : (
            <button
              data-testid="confirm-button"
              onClick={onConfirm}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </>
  );
};
