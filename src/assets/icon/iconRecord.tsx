import { SVGProps } from 'react';
import { createIcon } from '@asnefedov/icons/Icon';

const IconRecordSizeXS = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" {...props}>
    <g clipPath="url(#clip0_385_477)">
      <path d="M6 0.625C3.03147 0.625 0.625 3.03147 0.625 6C0.625 8.96853 3.03147 11.375 6 11.375C8.96853 11.375 11.375 8.96853 11.375 6C11.375 3.03147 8.96853 0.625 6 0.625Z" />
    </g>
    <defs>
      <clipPath id="clip0_385_477">
        <rect width="12" height="12" />
      </clipPath>
    </defs>
  </svg>
);

const IconRecordSizeS = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" {...props}>
    <g clipPath="url(#clip0_385_472)">
      <path d="M8.00016 0.833374C4.04212 0.833374 0.833496 4.042 0.833496 8.00004C0.833496 11.9581 4.04212 15.1667 8.00016 15.1667C11.9582 15.1667 15.1668 11.9581 15.1668 8.00004C15.1668 4.042 11.9582 0.833374 8.00016 0.833374Z" />
    </g>
    <defs>
      <clipPath id="clip0_385_472">
        <rect width="16" height="16" />
      </clipPath>
    </defs>
  </svg>
);

const IconRecordSizeM = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
    <path d="M12 1.25C6.06294 1.25 1.25 6.06294 1.25 12C1.25 17.9371 6.06294 22.75 12 22.75C17.9371 22.75 22.75 17.9371 22.75 12C22.75 6.06294 17.9371 1.25 12 1.25Z" />
  </svg>
);

export const IconRecord = createIcon({
  name: 'IconRecord',
  xs: IconRecordSizeXS,
  s: IconRecordSizeS,
  m: IconRecordSizeM,
  l: IconRecordSizeM,
});
