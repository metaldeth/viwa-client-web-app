import { useState } from 'react';
import { getCabinetHeaderLogoImagePaths, getLogoImagePaths } from '../../utils/viwaAssets';
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

export function ViwaBrandLogo({ className, size = 'md' }: ViwaBrandLogoProps) {
  const isHeader = size === 'header';
  const paths = isHeader ? getCabinetHeaderLogoImagePaths() : getLogoImagePaths();
  const { svg, webp, png, altRu, width, height } = paths;
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
      {isHeader && webp ? <source srcSet={webp} type="image/webp" /> : null}
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
