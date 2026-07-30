import { useState } from 'react';
import { getLogoImagePaths } from '../../utils/viwaAssets';
import styles from './ViwaBrandLogo.module.scss';

type ViwaBrandLogoProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'header';
};

const SIZE_CLASS = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  header: styles.sizeHeader,
} as const;

/** Brand mark — SVG first (corrected proportions). Raster only as img fallback. */
export function ViwaBrandLogo({ className, size = 'md' }: ViwaBrandLogoProps) {
  const paths = getLogoImagePaths();
  const { svg, png, altRu, width, height } = paths;
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    return (
      <span
        className={[styles.textFallback, SIZE_CLASS[size], className].filter(Boolean).join(' ')}
        aria-label={altRu}
      >
        VIWA
      </span>
    );
  }

  return (
    <picture className={[styles.logo, SIZE_CLASS[size], className].filter(Boolean).join(' ')}>
      <source srcSet={svg} type="image/svg+xml" />
      <img
        className={styles.logoImg}
        src={png}
        alt={altRu}
        width={width}
        height={height}
        decoding="async"
        onError={() => setImgFailed(true)}
      />
    </picture>
  );
}
