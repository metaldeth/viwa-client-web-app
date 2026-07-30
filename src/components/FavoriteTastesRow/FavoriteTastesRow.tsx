import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { tSubscription } from '../../locale/subscriptionLocale';
import type {
  FavoriteTasteCatalogItem,
  FavoriteTasteFeedItem,
} from '../../utils/favoriteTastesSlots';
import {
  buildCabinetTastesFeed,
  getUnknownTasteFallbackLabel,
} from '../../utils/favoriteTastesSlots';
import { loadPublicTastesCatalog } from '../../utils/publicTastesCatalogCache';
import { getTasteMedallionImagePaths, getTastePlaceholderLabel } from '../../utils/viwaAssets';
import styles from './FavoriteTastesRow.module.scss';

export type FavoriteTastesRowProps = {
  favoriteKeys: string[];
};

type TasteCircleProps = {
  nameRu: string;
  mediaKey: string;
  rank: number | null;
  catalogReady: boolean;
  isKnownInCatalog: boolean;
};

const TasteCircle: FC<TasteCircleProps> = ({
  nameRu,
  mediaKey,
  rank,
  catalogReady,
  isKnownInCatalog,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const paths = getTasteMedallionImagePaths(mediaKey, nameRu);
  const blockImage = catalogReady && !isKnownInCatalog;
  const showImage = !imageFailed && !blockImage;
  const displayName =
    catalogReady && !isKnownInCatalog ? getUnknownTasteFallbackLabel(mediaKey) : nameRu;

  return (
    <li className={styles.slot}>
      <div className={styles.circle} aria-hidden="true">
        {showImage ? (
          <picture>
            <source srcSet={paths.webp} type="image/webp" />
            <img
              src={paths.png}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          </picture>
        ) : (
          <span className={styles.placeholderGlyph}>{getTastePlaceholderLabel(displayName)}</span>
        )}
      </div>
      <span className={styles.tasteName}>{displayName}</span>
      {rank != null ? (
        <span className={styles.rankLabel}>{tSubscription('favoritesDoseRank', { rank })}</span>
      ) : (
        <span className={styles.rankLabel} aria-hidden="true" />
      )}
    </li>
  );
};

/** Horizontally scrollable tastes feed for the cabinet page. */
const FavoriteTastesRow: FC<FavoriteTastesRowProps> = ({ favoriteKeys }) => {
  const [catalogReady, setCatalogReady] = useState(false);
  const [catalogError, setCatalogError] = useState(false);
  const [catalogItems, setCatalogItems] = useState<FavoriteTasteCatalogItem[]>([]);
  const shuffledFeedRef = useRef<FavoriteTasteFeedItem[] | null>(null);
  const shuffleRandomRef = useRef<(() => number) | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadPublicTastesCatalog()
      .then((items) => {
        if (cancelled) return;
        setCatalogItems(
          items.map((item) => ({
            mediaKey: item.mediaKey,
            nameRu: item.nameRu,
            sortOrder: item.sortOrder,
          })),
        );
        setCatalogReady(true);
        setCatalogError(false);
      })
      .catch(() => {
        if (!cancelled) {
          setCatalogError(true);
          setCatalogReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const catalogByKey = useMemo(
    () => new Map(catalogItems.map((item) => [item.mediaKey, item])),
    [catalogItems],
  );

  const feed = useMemo((): FavoriteTasteFeedItem[] => {
    const hasFavorites = favoriteKeys.length > 0;

    if (catalogError) {
      if (!hasFavorites) {
        return [];
      }
      return favoriteKeys.map((mediaKey, index) => ({
        mediaKey,
        nameRu: mediaKey,
        rank: index + 1,
      }));
    }

    if (!catalogReady) {
      if (hasFavorites) {
        return favoriteKeys.map((mediaKey, index) => ({
          mediaKey,
          nameRu: mediaKey,
          rank: index + 1,
        }));
      }
      return [];
    }

    if (!hasFavorites) {
      if (shuffledFeedRef.current === null) {
        if (shuffleRandomRef.current === null) {
          shuffleRandomRef.current = () => Math.random();
        }
        shuffledFeedRef.current = buildCabinetTastesFeed([], catalogItems, {
          random: shuffleRandomRef.current,
        });
      }
      return shuffledFeedRef.current;
    }

    return buildCabinetTastesFeed(favoriteKeys, catalogItems);
  }, [favoriteKeys, catalogItems, catalogReady, catalogError]);

  const showErrorOnly = catalogError && favoriteKeys.length === 0;

  return (
    <section className={styles.FavoriteTastesRow} aria-labelledby="favorite-tastes-title">
      <h2 id="favorite-tastes-title" className={styles.title}>
        {tSubscription('favoritesRowTitle')}
      </h2>

      {catalogError && (
        <p className={styles.statusError} role="status">
          {tSubscription('favoritesLoadError')}
        </p>
      )}

      {!showErrorOnly && feed.length > 0 && (
        <ul className={styles.row} aria-label={tSubscription('favoritesRowTitle')}>
          {feed.map((item) => (
            <TasteCircle
              key={item.mediaKey}
              nameRu={item.nameRu}
              mediaKey={item.mediaKey}
              rank={item.rank}
              catalogReady={catalogReady && !catalogError}
              isKnownInCatalog={catalogByKey.has(item.mediaKey)}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

export default FavoriteTastesRow;
