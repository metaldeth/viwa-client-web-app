import React, { FC } from 'react';
import styles from './CodeInput.module.scss';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { initialCodeInput, visibleCodeInput } from '../../../animations/variants/codeInputVariants';
import { CodeInputProps } from './types';

const CodeInput: FC<CodeInputProps> = ({
  index,
  total,
  inputRef,
  value,
  isValid,
  disabled,
  onChange = () => {
    null;
  },
  onKeyDown = () => {
    null;
  },
}) => {
  const [isFocus, setIsFocus] = React.useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocus(true);
    // Keep digit in the visual viewport above the iOS keyboard without jumping under the logo
    const target = e.currentTarget;
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  };

  const handleUnfocus = () => {
    setIsFocus(false);
  };

  return (
    <motion.div
      key={index}
      id={String(index)}
      className={styles.slotOuter}
      initial={initialCodeInput}
      animate={visibleCodeInput(index)}
    >
      <motion.div
        key={index}
        id={String(index)}
        className={styles.slotInner}
        animate={{ scale: isFocus ? 1.02 : 1 }}
      >
        <input
          className={classNames(
            styles.CodeInput,
            isValid !== undefined && !isValid && styles.invalid,
          )}
          ref={inputRef}
          id={`otp-digit-${index}`}
          name={`otp-digit-${index}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Цифра ${index + 1} из ${total}`}
          disabled={disabled}
          maxLength={1}
          value={value}
          onChange={(e) => onChange(e, index)}
          onKeyDown={(e) => onKeyDown(e, index)}
          onFocus={handleFocus}
          onBlur={handleUnfocus}
        />
      </motion.div>
    </motion.div>
  );
};

export default CodeInput;
