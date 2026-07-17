import { FC } from 'react';
import HorizontalContainer from '../HorizontalContainer';
import { Button } from '@asnefedov/uikit/Button';
import { HeaderProps } from './types';
import styles from './Header.module.scss';
import { IconSignOut } from '../../assets/icon/iconSignOut';
import { Text } from '@asnefedov/uikit/Text';
import ContentCard from '../ContentCard';

/**
 * Заголовок
 */
const Header: FC<HeaderProps> = ({ onLeftClick, onRightClick }) => {
  return (
    <HorizontalContainer>
      <HorizontalContainer>
        {onLeftClick && <Button className={styles.iconButton} onClick={onLeftClick} />}
      </HorizontalContainer>

      <ContentCard className={styles.logoWrapper}>
        <Text className={styles.text} size="3xl" weight="semibold">
          LOGO
        </Text>
      </ContentCard>

      <HorizontalContainer className={styles.side}>
        {onRightClick && (
          <Button className={styles.iconButton} iconLeft={IconSignOut} onClick={onRightClick} />
        )}
      </HorizontalContainer>
    </HorizontalContainer>
  );
};

export default Header;
