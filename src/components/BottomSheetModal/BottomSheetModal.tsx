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
  headerClassName,
  titleClassName,
  closeButtonClassName,
  renderHeader,
  rootClassName,
  onClose,
}) => {
  // Обработчики
  const handleClose = () => {
    onClose && onClose();
  };

  // render методы
  const renderDefaultHeader = () => (
    <HorizontalContainer space="l" isAutoWidth className={headerClassName}>
      <Text size="2xl" weight="semibold" className={titleClassName}>
        {modalTitle}
      </Text>
      <Button
        view="clear"
        onlyIcon
        iconLeft={IconCloseFilled}
        className={closeButtonClassName}
        onClick={onClose}
      />
    </HorizontalContainer>
  );

  const renderBody = () => <Fragment>{children}</Fragment>;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      rootClassName={rootClassName}
      className={classNames(styles.BottomSheetModal, className)}
    >
      <VerticalContainer>
        {renderHeader ? renderHeader() : renderDefaultHeader()}
        {renderBody()}
      </VerticalContainer>
    </Modal>
  );
};

export default BottomSheetModal;
