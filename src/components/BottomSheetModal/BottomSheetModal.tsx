import React, { FC, Fragment } from 'react';
import { Modal } from '@asnefedov/uikit/Modal';
import { Text } from '@asnefedov/uikit/Text';
import styles from './BottomSheetModal.module.scss';
import { BottomSheetModalProps } from './types';
import HorizontalContainer from '../HorizontalContainer';
import { Button } from '@asnefedov/uikit/Button';
import { IconCloseFilled } from '../../assets/icon/IconCloseFilled';
import VerticalContainer from '../VerticalContainer';
import classNames from 'classnames';

/**
 * Модальное окно, открывающаяся внизу экрана(шторка)
 */
const BottomSheetModal: FC<BottomSheetModalProps> = ({
  isOpen,
  modalTitle,
  children,
  className,
  onClose,
}) => {
  // Обработчики
  const handleClose = () => {
    onClose && onClose();
  };

  // render методы
  const renderHeader = () => (
    <HorizontalContainer space="l" isAutoWidth>
      <Text size="2xl" weight="semibold">
        {modalTitle}
      </Text>
      <Button view="clear" onlyIcon iconLeft={IconCloseFilled} onClick={onClose} />
    </HorizontalContainer>
  );

  const renderBody = () => <Fragment>{children}</Fragment>;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className={classNames(styles.BottomSheetModal, className)}
    >
      <VerticalContainer>
        {renderHeader()}
        {renderBody()}
      </VerticalContainer>
    </Modal>
  );
};

export default BottomSheetModal;
