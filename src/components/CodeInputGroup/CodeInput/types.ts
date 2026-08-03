import React, { ChangeEvent, LegacyRef } from 'react';

export type CodeInputProps = {
  index: number;
  total: number;
  inputRef?: LegacyRef<HTMLInputElement> | undefined;
  value?: string | number;
  isValid?: boolean;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>, index: number) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
};
