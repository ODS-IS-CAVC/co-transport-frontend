import { SVGProps } from 'react';

interface ArrowDownProps extends SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
}

const ArrowDown = (props: ArrowDownProps) => {
  const { size = '1em', color = '#1A1A1A' } = props;
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} fill='none' {...props}>
      <g clipPath='url(#a)'>
        <path fill={color} d='m13.334 4.9-5.333 5.333L2.668 4.9l-.934.933L8.001 12.1l6.267-6.267-.934-.933Z' />
      </g>
      <defs>
        <clipPath id='a'>
          <path fill='#fff' d='M0 .5h16v16H0z' />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ArrowDown;
