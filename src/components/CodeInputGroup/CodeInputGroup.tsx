import React, { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import HorizontalContainer from '../HorizontalContainer';
import CodeInput from './CodeInput/CodeInput';
import { animate } from 'motion';
import { highlightCodeInput, shakeCodeInput } from '../../animations/variants/codeInputVariants';
import { CodeInputGroupProps } from './types';

/**
 * Группа кодовых полей
 */
const CodeInputGroup: FC<CodeInputGroupProps> = ({
  count,
  isValid,
  disabled,
  onChangeInput,
  onComplete,
  onExternalInvalid,
  resetVersion,
}) => {
  const [code, setCode] = useState<string[]>(() => new Array(count).fill(''));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const onChangeInputRef = useRef(onChangeInput);
  useEffect(() => {
    onChangeInputRef.current = onChangeInput;
  }, [onChangeInput]);

  useEffect(() => {
    onExternalInvalid?.(handleInvalid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resetVersion === undefined) return;

    setCode(new Array(count).fill(''));
    onChangeInputRef.current?.(0);

    requestAnimationFrame(() => {
      inputRefs.current[0]?.focus();
    });
  }, [resetVersion, count]);

  const handleInvalid = async () => {
    // Активация анимации подсветки и тряски элементов
    const animationInvalid = inputRefs.current.map((item) => {
      if (!item) return Promise.resolve();

      item.style.transition = 'none';

      return Promise.all([
        // animate(item, Shake, SpringOption),
        animate(item, shakeCodeInput, shakeCodeInput.transition),
        animate(item, highlightCodeInput, highlightCodeInput.transition),
      ]);
    });

    await Promise.all(animationInvalid);

    inputRefs.current.forEach((item) => {
      if (!item) return;

      item.style.transition = '';
      item.style.background = '';
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;

    const newCode = [...code];
    newCode[index] = value;

    setCode(newCode);

    if (value && index < count - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((v) => v !== '')) {
      onComplete(newCode.join(''));
    }

    onChangeInputRef.current?.(newCode.filter((item) => item !== '').length);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <HorizontalContainer space="s" isAutoWidth justify="center">
      {code.map((value, index) => (
        <CodeInput
          key={index}
          index={index}
          inputRef={(item) => (inputRefs.current[index] = item as HTMLInputElement)}
          value={value}
          isValid={isValid}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      ))}
    </HorizontalContainer>
  );
};

export default CodeInputGroup;
