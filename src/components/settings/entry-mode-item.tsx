import React from 'react';

import type { OptionType } from '@/components/ui';
import { Options, useModal } from '@/components/ui';
import { useHealthKitFallback, useManualEntryMode } from '@/lib/health';
import { translate } from '@/lib/i18n/utils';

import { Item } from './item';

const useEntryModeLogic = () => {
  const { isManualMode, setManualMode, isLoading } = useManualEntryMode();
  const { suggestion } = useHealthKitFallback();
  const modal = useModal();

  const onSelect = React.useCallback(
    async (option: OptionType) => {
      const isManual = option.value === 'manual';
      try {
        await setManualMode(isManual);
      } catch (error) {
        console.error('Error setting entry mode:', error);
      }
      modal.dismiss();
    },
    [setManualMode, modal]
  );

  const entryModes = React.useMemo(
    () => [
      {
        label: `${translate('settings.entryMode.healthkit')} 📱`,
        value: 'healthkit',
        disabled: suggestion === 'force_manual',
      },
      {
        label: `${translate('settings.entryMode.manual')} ✏️`,
        value: 'manual',
        disabled: false,
      },
    ],
    [suggestion]
  );

  const currentMode = React.useMemo(
    () =>
      entryModes.find(
        (mode) =>
          (mode.value === 'manual' && isManualMode) ||
          (mode.value === 'healthkit' && !isManualMode)
      ),
    [isManualMode, entryModes]
  );

  const getModeLabel = () => {
    if (isLoading) return translate('common.loading');
    if (suggestion === 'force_manual')
      return translate('settings.entryMode.manual') + ' ✏️';
    return (
      currentMode?.label || translate('settings.entryMode.healthkit') + ' 📱'
    );
  };

  const isDisabled = isLoading || suggestion === 'force_manual';

  return {
    modal,
    onSelect,
    entryModes,
    currentMode,
    getModeLabel,
    isDisabled,
  };
};

export const EntryModeItem = () => {
  const { modal, onSelect, entryModes, currentMode, getModeLabel, isDisabled } =
    useEntryModeLogic();

  return (
    <>
      <Item
        text="settings.entryMode.title"
        value={getModeLabel()}
        onPress={isDisabled ? undefined : modal.present}
      />
      <Options
        ref={modal.ref}
        options={entryModes.filter((mode) => !mode.disabled)}
        onSelect={onSelect}
        value={currentMode?.value}
      />
    </>
  );
};
