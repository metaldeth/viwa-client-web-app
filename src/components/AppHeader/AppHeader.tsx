import { FC } from 'react';
import { Text } from '@asnefedov/uikit/Text';
import ContentCard from '../ContentCard';
import styles from './AppHeader.module.scss';
import HorizontalContainer from '../HorizontalContainer';
import { motion } from 'framer-motion';
import { initialLogo, visibleLogo } from '../../animations/variants/logoVariants';
import { Button } from '@asnefedov/uikit/Button';
import { IconSignOut } from '../../assets/icon/iconSignOut';
import { ACCESS_TOKEN_STORAGE_NAME } from '../../consts/env/storage';
import { ClientDataType } from '../../types/enums/clientDataType';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Заголовок приложения
 */
const AppHeader: FC = () => {
  const location = useLocation();

  const navigate = useNavigate();

  const isLogOutButtonShown = location.pathname.includes('home');

  // Обработчики
  const handleClickSignOut = () => {
    const newPath = location.pathname.replace('home', 'auth');

    navigate(newPath);

    localStorage.removeItem(ACCESS_TOKEN_STORAGE_NAME);
    localStorage.removeItem(ClientDataType.CLIENT_TOKEN);
  };

  return (
    <HorizontalContainer className={styles.AppHeader} justify="center">
      {isLogOutButtonShown && <Button size="l" disabled view="clear" />}
      <HorizontalContainer isAutoWidth justify="center">
        <motion.div initial={initialLogo} animate={visibleLogo}>
          <ContentCard className={styles.cardLogo}>
            <Text className={styles.text} size="3xl" weight="semibold">
              FLOW
            </Text>
          </ContentCard>
        </motion.div>
      </HorizontalContainer>
      {isLogOutButtonShown && (
        <Button size="l" view="clear" iconLeft={IconSignOut} onClick={handleClickSignOut} />
      )}
    </HorizontalContainer>
  );
};
export default AppHeader;
