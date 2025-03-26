import { SVGProps } from 'react';

interface VectorProps extends SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
}

const Vector = (props: VectorProps) => {
  const { size = '1em', color = '#59587E' } = props;
  const sizeValue = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={sizeValue}
      height={sizeValue}
      viewBox='0 0 20 20'
      fill='none'
      {...props}
    >
      <path
        stroke={color}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M6 5V1m8 4V1M5 9h10M3 19h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z'
      />
    </svg>
  );
};

export default Vector;
