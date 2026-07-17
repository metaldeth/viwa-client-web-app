import { createIcon } from '@asnefedov/icons/Icon';
import { SVGProps } from 'react';

const IconChatFilledSizeXS = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.46895 1C8.91428 1.14286 10.8562 3.07143 11 5.5V5.78571C11 6.5 10.8562 7.28571 10.4965 7.92857C9.70541 9.57143 8.05122 10.5714 6.18126 10.5714C5.53397 10.5714 4.88667 10.4286 4.3113 10.2143L1.86597 11H1.72213C1.50636 11 1.36252 10.9286 1.21868 10.7857C1.00291 10.5714 0.930993 10.2857 1.07484 10.0714L1.86597 7.64286C1.57829 7 1.50636 6.42857 1.50636 5.78571C1.50636 4 2.51327 2.35714 4.16746 1.5C4.81475 1.14286 5.53397 1 6.25318 1H6.46895Z"
    />
  </svg>
);

export const IconChatFilledSizeS = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" {...props}>
    <path d="M2.00683 15C1.70476 15 1.50338 14.9 1.302 14.7C0.999929 14.4 0.899239 14 1.10062 13.7L2.20821 10.3C1.80545 9.4 1.70476 8.6 1.70476 7.7C1.70476 5.2 3.11442 2.9 5.43029 1.7C6.3365 1.2 7.3434 1 8.35031 1H8.65238C12.0758 1.2 14.7945 3.9 14.9959 7.3V7.7C14.9959 8.7 14.7945 9.8 14.291 10.7C13.1834 13 10.8676 14.4 8.24961 14.4C7.3434 14.4 6.43719 14.2 5.63167 13.9L2.20821 15C2.20821 15 2.10752 15 2.00683 15Z" />
  </svg>
);

export const IconChatFilledSizeM = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
    <path d="M2.9999 22C2.6999 22 2.4999 21.9 2.2999 21.7C1.9999 21.4 1.8999 21 2.0999 20.7L3.8999 15.4C3.2999 14.2 2.9999 12.8 2.9999 11.5C2.9999 7.9 4.9999 4.6 8.2999 3C9.5999 2.3 11.0999 2 12.4999 2H12.9999C17.8999 2.3 21.6999 6.1 21.9999 10.9V11.5C21.9999 13 21.6999 14.4 20.9999 15.8C19.3999 19 16.0999 21 12.4999 21C11.1999 21 9.8999 20.7 8.6999 20.2L3.3999 22C3.1999 22 3.0999 22 2.9999 22Z" />
  </svg>
);

export const IconChatFilledSizeL = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" {...props}>
    <path d="M14.5 25C20.8513 25 26 19.8513 26 13.5C26 7.14873 20.8513 2 14.5 2C8.14873 2 3 7.14873 3 13.5C3 15.1627 3.35286 16.743 3.98779 18.1701L2.03939 24.7946C1.82964 25.5078 2.49224 26.1704 3.2054 25.9606L9.82995 24.0122C11.257 24.6471 12.8373 25 14.5 25Z" />
  </svg>
);

export const IconChatFilled = createIcon({
  name: 'IconChatFilled',
  xs: IconChatFilledSizeXS,
  s: IconChatFilledSizeS,
  m: IconChatFilledSizeM,
  l: IconChatFilledSizeL,
});
