import React, { FC, useMemo, useState } from 'react';
import styles from './Notification.module.scss';
import { SnackBar } from '@asnefedov/uikit/SnackBar';
import { IconAlert } from '../../assets/icon/iconAlert';
import { useTranslation } from 'react-i18next';

type NotificationItem = { uuid: string; status: string; text: string };

/**
 * Компонент списка уведомлений
 */
const NotificationsList: FC = () => {
  const { t } = useTranslation();

  // const notificationsList = useAppSelector(selectNotificationsList());
  const notificationsList = [] as NotificationItem[];

  const [closedNotificationUuid, setClosedNotificationUuid] = useState<Record<string, boolean>>({});

  const formatedNotificationList = useMemo(
    () => notificationsList.filter(({ uuid }: NotificationItem) => !closedNotificationUuid?.[uuid]),
    [notificationsList, closedNotificationUuid],
  );

  return (
    <div className={styles.list}>
      <SnackBar
        items={formatedNotificationList}
        getItemKey={({ uuid }: NotificationItem) => uuid}
        getItemStatus={({ status }: NotificationItem) => 'normal'}
        getItemMessage={({ text = '' }: NotificationItem) => t(text)}
        getItemAutoClose={() => 5}
        getItemIcon={() => IconAlert as any}
        getItemShowProgress={() => 'line'}
        onItemAutoClose={({ uuid }: NotificationItem) => {
          setClosedNotificationUuid((prevState) => ({ ...prevState, [uuid]: true }));
        }}
        onItemClose={({ uuid }: NotificationItem) => {
          setClosedNotificationUuid((prevState) => ({ ...prevState, [uuid]: true }));
        }}
      />
    </div>
  );
};

export default NotificationsList;
