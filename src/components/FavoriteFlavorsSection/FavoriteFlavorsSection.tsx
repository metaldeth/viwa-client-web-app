import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Text } from '@asnefedov/uikit/Text';
import { api } from '../../app/api';
import { MAX_FAVORITE_TASTES } from '../../constants/loyalty';
import { tSubscription } from '../../locale/subscriptionLocale';
import type { PublicTasteItemDTO } from '../../types/publicCatalog';
import { toggleFavoriteSelection } from '../../utils/favoriteTastesSelection';
import { getTasteImagePaths, getTastePlaceholderLabel } from '../../utils/viwaAssets';
import styles from './FavoriteFlavorsSection.module.scss';

export type FavoriteFlavorsSectionProps = {
  selectedKeys: string[];
  onSelectionChange: (keys: string[]) => Promise<void> | void;
  disabled?: boolean;
};

type TasteTileProps = {
  taste: PublicTasteItemDTO;
  selected: boolean;
  disabled: boolean;
  onToggle: (mediaKey: string) => void;
};

const TasteTile: FC<TasteTileProps> = ({ taste, selected, disabled, onToggle }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const paths = getTasteImagePaths(taste.mediaKey, taste.nameRu);

  const handleClick = () => {
    if (!disabled) {
      onToggle(taste.mediaKey);
    }
  };

  return (
    <button
      type="button"
      className={`${styles.tasteTile} ${selected ? styles.tasteTileSelected : ''}`}
      aria-pressed={selected}
      aria-label={`${taste.nameRu}${selected ? ', выбран' : ''}`}
      disabled={disabled}
      onClick={handleClick}
    >
      <span className={styles.tasteVisual} aria-hidden="true">
        {!imageFailed ? (
          <picture>
            <source srcSet={paths.webp} type="image/webp" />
            <img
              src={paths.png}
              alt={paths.altRu}
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          </picture>
        ) : (
          <span className={styles.tastePlaceholder}>{getTastePlaceholderLabel(taste.nameRu)}</span>
        )}
      </span>
      <span className={styles.tasteName}>{taste.nameRu}</span>
    </button>
  );
};

const FavoriteFlavorsSection: FC<FavoriteFlavorsSectionProps> = ({
  selectedKeys,
  onSelectionChange,
  disabled = false,
}) => {
  const [catalog, setCatalog] = useState<PublicTasteItemDTO[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    api.publicApi
      .fetchPublicTastes()
      .then((response) => {
        if (cancelled) return;
        const sorted = [...(response.items ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
        setCatalog(sorted);
        setLoadState('ready');
      })
      .catch(() => {
        if (!cancelled) {
          setLoadState('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys]);

  const handleToggle = useCallback(
    async (mediaKey: string) => {
      if (disabled || isSaving) return;

      const next = toggleFavoriteSelection(selectedKeys, mediaKey);
      if (next === null) {
        return;
      }

      setSaveError(null);
      setIsSaving(true);
      try {
        await onSelectionChange(next);
      } catch {
        setSaveError(tSubscription('favoritesError'));
      } finally {
        setIsSaving(false);
      }
    },
    [disabled, isSaving, onSelectionChange, selectedKeys],
  );

  return (
    <section className={styles.FavoriteFlavorsSection} aria-labelledby="favorites-heading">
      <div className={styles.header}>
        <Text id="favorites-heading" size="l" weight="semibold" as="h2">
          {tSubscription('favoritesTitle')}
        </Text>
        <Text size="s" view="secondary">
          {tSubscription('favoritesHint', { max: MAX_FAVORITE_TASTES })}
        </Text>
      </div>

      {loadState === 'loading' && (
        <Text size="m" view="secondary">
          {tSubscription('planLoading')}
        </Text>
      )}

      {loadState === 'error' && (
        <Text size="m" view="alert">
          {tSubscription('favoritesLoadError')}
        </Text>
      )}

      {loadState === 'ready' && (
        <div className={styles.grid} role="group" aria-label={tSubscription('favoritesTitle')}>
          {catalog.map((taste) => (
            <TasteTile
              key={taste.mediaKey}
              taste={taste}
              selected={selectedSet.has(taste.mediaKey)}
              disabled={
                disabled ||
                isSaving ||
                (!selectedSet.has(taste.mediaKey) && selectedKeys.length >= MAX_FAVORITE_TASTES)
              }
              onToggle={(key) => void handleToggle(key)}
            />
          ))}
        </div>
      )}

      {isSaving && (
        <Text size="s" view="secondary">
          {tSubscription('favoritesSaving')}
        </Text>
      )}

      {saveError && (
        <Text size="s" view="alert">
          {saveError}
        </Text>
      )}
    </section>
  );
};

export default FavoriteFlavorsSection;
