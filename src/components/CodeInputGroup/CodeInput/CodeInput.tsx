import React, { FC } from 'react';
import styles from './CodeInput.module.scss';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { initialCodeInput, visibleCodeInput } from '../../../animations/variants/codeInputVariants';
import { CodeInputProps } from './types';

/**
 * Кодовое поле
 */
const CodeInput: FC<CodeInputProps> = ({
  index,
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

  // Обработчики
  const handleFocus = () => {
    setIsFocus(true);
  };

  const handleUnfocus = () => {
    setIsFocus(false);
  };

  return (
    <motion.div
      key={index}
      id={String(index)}
      initial={initialCodeInput}
      animate={visibleCodeInput(index)}
    >
      <motion.div key={index} id={String(index)} animate={{ scale: isFocus ? 1.1 : 1 }}>
        <input
          className={classNames(
            styles.CodeInput,
            isValid !== undefined && !isValid && styles.invalid,
          )}
          ref={inputRef}
          id={String(index)}
          type="text"
          inputMode="numeric"
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
