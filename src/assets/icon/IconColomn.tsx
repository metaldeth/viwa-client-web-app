import { SVGProps } from 'react';
import { createIcon } from '@asnefedov/icons/Icon';

const IconColomnSizeXS = (props: SVGProps<SVGSVGElement>) => (
  <svg width="12" height="12" viewBox="0 0 12 12" {...props}>
    <path d="M14 5V3.5C14 2.67157 13.2837 2 12.4 2H3.6C2.71634 2 2 2.67157 2 3.5V5C2 5.82843 2.71634 6.5 3.6 6.5H12.4C13.2837 6.5 14 5.82843 14 5Z" />
    <path d="M14 12.5V11C14 10.1716 13.2837 9.5 12.4 9.5H3.6C2.71634 9.5 2 10.1716 2 11V12.5C2 13.3284 2.71634 14 3.6 14H12.4C13.2837 14 14 13.3284 14 12.5Z" />
  </svg>
);

const IconColomnSizeS = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" {...props}>
    <path d="M14 5V3.5C14 2.67157 13.2837 2 12.4 2H3.6C2.71634 2 2 2.67157 2 3.5V5C2 5.82843 2.71634 6.5 3.6 6.5H12.4C13.2837 6.5 14 5.82843 14 5Z" />
    <path d="M14 12.5V11C14 10.1716 13.2837 9.5 12.4 9.5H3.6C2.71634 9.5 2 10.1716 2 11V12.5C2 13.3284 2.71634 14 3.6 14H12.4C13.2837 14 14 13.3284 14 12.5Z" />
  </svg>
);

const IconColomnSizeM = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" {...props}>
    <path d="M14 5V3.5C14 2.67157 13.2837 2 12.4 2H3.6C2.71634 2 2 2.67157 2 3.5V5C2 5.82843 2.71634 6.5 3.6 6.5H12.4C13.2837 6.5 14 5.82843 14 5Z" />
    <path d="M14 12.5V11C14 10.1716 13.2837 9.5 12.4 9.5H3.6C2.71634 9.5 2 10.1716 2 11V12.5C2 13.3284 2.71634 14 3.6 14H12.4C13.2837 14 14 13.3284 14 12.5Z" />
  </svg>
);

const IconColomnSizeL = (props: SVGProps<SVGSVGElement>) => (
  <svg width="32" height="32" viewBox="0 0 32 32" {...props}>
    <path d="M14 5V3.5C14 2.67157 13.2837 2 12.4 2H3.6C2.71634 2 2 2.67157 2 3.5V5C2 5.82843 2.71634 6.5 3.6 6.5H12.4C13.2837 6.5 14 5.82843 14 5Z" />
    <path d="M14 12.5V11C14 10.1716 13.2837 9.5 12.4 9.5H3.6C2.71634 9.5 2 10.1716 2 11V12.5C2 13.3284 2.71634 14 3.6 14H12.4C13.2837 14 14 13.3284 14 12.5Z" />
  </svg>
);

export const IconColomn = createIcon({
  name: 'IconColomn',
  xs: IconColomnSizeXS,
  s: IconColomnSizeS,
  m: IconColomnSizeM,
  l: IconColomnSizeL,
});
