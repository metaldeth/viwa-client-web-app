import { SVGProps } from 'react';
import { createIcon } from '@asnefedov/icons/Icon';

const IconMixSizeM = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" {...props}>
    <g clipPath="url(#clip0_37789_325)">
      <path d="M6 0C2.68629 0 0 2.68629 0 6V20L20 0H6Z" fill="#F37B54" />
      <path d="M14 20C17.3137 20 20 17.3137 20 14V0L0 20H14Z" fill="#F2D432" />
    </g>
    <defs>
      <clipPath id="clip0_37789_325">
        <rect width="20" height="20" rx="6" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const IconMixSizeL = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" {...props}>
    <g clipPath="url(#clip0_37797_162)">
      <path d="M6 0C2.68629 0 0 2.68629 0 6V32L32 0H6Z" fill="#F37B54" />
      <path d="M26 32C29.3137 32 32 29.3137 32 26V0L0 32H26Z" fill="#F2D432" />
    </g>
    <defs>
      <clipPath id="clip0_37797_162">
        <rect width="32" height="32" rx="10" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const IconMix = createIcon({
  name: 'IconMix',
  xs: IconMixSizeM,
  s: IconMixSizeM,
  m: IconMixSizeM,
  l: IconMixSizeL,
});
