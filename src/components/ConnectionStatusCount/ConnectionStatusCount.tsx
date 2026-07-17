import { FC } from 'react';
import { ConnectionStatusCountProps } from './types';
import HorizontalContainer from '../HorizontalContainer';
import { Badge } from '@asnefedov/uikit/Badge';
import { IconWifi } from '@asnefedov/icons/IconWifi';
import { IconWifiOff } from '@asnefedov/icons/IconWifiOff';

/**
 * Компонент отображения количества статуса online offline
 */
const ConnectionStatusCount: FC<ConnectionStatusCountProps> = ({ onlineCount, offlineCount }) => {
  return (
    <HorizontalContainer space="2xs">
      <Badge size="m" status="success" label={String(onlineCount)} iconRight={IconWifi} />
      <Badge size="m" status="error" label={String(offlineCount)} iconRight={IconWifiOff} />
    </HorizontalContainer>
  );
};

export default ConnectionStatusCount;
