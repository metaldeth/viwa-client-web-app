import { FC, useEffect, useMemo, useState } from 'react';
import { tSubscription } from '../../locale/subscriptionLocale';
import {
  buildFavoriteTasteSlots,
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
  rank: number;
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
      <span className={styles.rankLabel}>{tSubscription('favoritesDoseRank', { rank })}</span>
    </li>
  );
};

const PlaceholderCircle: FC<{ rank: number }> = ({ rank }) => (
  <li className={styles.slot}>
    <div className={`${styles.circle} ${styles.circlePlaceholder}`} aria-hidden="true">
      <span className={styles.placeholderGlyph}>+</span>
    </div>
    <span className={styles.tasteName}>{tSubscription('favoritesTryTaste')}</span>
    <span className={styles.rankLabel}>{tSubscription('favoritesDoseRank', { rank })}</span>
  </li>
);

/** Read-only TOP-3 favorite tastes row for the cabinet page. */
const FavoriteTastesRow: FC<FavoriteTastesRowProps> = ({ favoriteKeys }) => {
  const [catalogReady, setCatalogReady] = useState(false);
  const [catalogError, setCatalogError] = useState(false);
  const [catalogByKey, setCatalogByKey] = useState(() => new Map<string, { nameRu: string }>());

  useEffect(() => {
    let cancelled = false;

    loadPublicTastesCatalog()
      .then((items) => {
        if (cancelled) return;
        const map = new Map<string, { nameRu: string }>();
        items.forEach((item) => map.set(item.mediaKey, { nameRu: item.nameRu }));
        setCatalogByKey(map);
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

  const slots = useMemo(
    () => buildFavoriteTasteSlots(favoriteKeys, catalogByKey),
    [favoriteKeys, catalogByKey],
  );

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

      <ul className={styles.row} aria-label={tSubscription('favoritesRowTitle')}>
        {slots.map((slot) =>
          slot.kind === 'filled' ? (
            <TasteCircle
              key={`filled-${slot.rank}-${slot.mediaKey}`}
              nameRu={slot.nameRu}
              mediaKey={slot.mediaKey}
              rank={slot.rank}
              catalogReady={catalogReady}
              isKnownInCatalog={catalogByKey.has(slot.mediaKey)}
            />
          ) : (
            <PlaceholderCircle key={`placeholder-${slot.rank}`} rank={slot.rank} />
          ),
        )}
      </ul>
    </section>
  );
};

export default FavoriteTastesRow;
