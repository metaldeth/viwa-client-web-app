import { SVGProps } from 'react';
import { createIcon } from '@asnefedov/icons/Icon';

const IconBrilliantSizeXS = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" {...props}>
    <path d="M8.83173 3.88916L5.99988 12L12 3.88916H8.83173Z" />
    <path d="M1.74227 1.17722L0.0253597 3.40766H2.94411L1.74227 1.17722Z" />
    <path d="M10.2581 1.17722L9.05626 3.40766H11.975L10.2581 1.17722Z" />
    <path d="M3.16827 3.88917H0L5.99988 12L3.16827 3.88917Z" />
    <path d="M6.5367 1L8.62191 3.25741L9.83819 1H6.5367Z" />
    <path d="M2.16171 1.00001L3.37799 3.25742L5.46321 1.00001H2.16171Z" />
    <path d="M3.63481 3.88916L6.00025 11.9979L8.36568 3.88916H3.63481Z" />
    <path d="M6.00007 1.0997L3.86817 3.40766H8.13197L6.00007 1.0997Z" />
  </svg>
);

const IconBrilliantSizeS = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" {...props}>
    <path d="M11.7756 4.93976L7.99984 16L16 4.93976H11.7756Z" />
    <path d="M2.32303 1.24166L0.0338129 4.28317H3.92549L2.32303 1.24166Z" />
    <path d="M13.6775 1.24166L12.075 4.28317H15.9667L13.6775 1.24166Z" />
    <path d="M4.22436 4.93978H0L7.99984 16L4.22436 4.93978Z" />
    <path d="M8.7156 1L11.4959 4.07829L13.1176 1H8.7156Z" />
    <path d="M2.88229 1.00001L4.50399 4.0783L7.28428 1.00001H2.88229Z" />
    <path d="M4.84641 4.93976L8.00033 15.9971L11.1542 4.93976H4.84641Z" />
    <path d="M8.0001 1.13596L5.15756 4.28317H10.8426L8.0001 1.13596Z" />
  </svg>
);

const IconBrilliantSizeM = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
    <g clipPath="url(#clip0_37999_247)">
      <path d="M17.6637 7.77516L12 24L24.0002 7.77516H17.6637Z" />
      <path d="M3.48479 2.35023L0.0509635 6.81198H5.88847L3.48479 2.35023Z" />
      <path d="M20.5165 2.35023L18.1128 6.81198H23.9503L20.5165 2.35023Z" />
      <path d="M6.33679 7.77519H0.000244141L12 24L6.33679 7.77519Z" />
      <path d="M13.0736 1.99573L17.2441 6.51143L19.6766 1.99573H13.0736Z" />
      <path d="M4.32367 1.99575L6.75623 6.51145L10.9267 1.99575H4.32367Z" />
      <path d="M7.26986 7.77516L12.0007 23.9957L16.7316 7.77516H7.26986Z" />
      <path d="M12.0004 2.19517L7.73659 6.81198H16.2642L12.0004 2.19517Z" />
    </g>
    <defs>
      <clipPath id="clip0_37999_247">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
);

export const IconBrilliant = createIcon({
  name: 'IconBrilliant',
  xs: IconBrilliantSizeXS,
  s: IconBrilliantSizeS,
  m: IconBrilliantSizeM,
  l: IconBrilliantSizeM,
});
