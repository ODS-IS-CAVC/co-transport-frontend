import { Chip, cn } from '@nextui-org/react';

import { Matching } from '@/lib/matching';

interface Props {
  data: {
    label: string;
    status: Matching;
    color: string;
  };
  type: boolean;
  className?: string;
}
const Status = (props: Props) => {
  const { label, color } = props.data;
  const { type, className } = props;
  return (
    <div className='flex items-center gap-1'>
      {type && (
        <Chip
          className={cn('h-8 px-0 rounded-lg text-white text-sm font-bold leading-3', color, className)}
          size='lg'
          radius='sm'
        >
          キャリア間
        </Chip>
      )}
      <Chip
        className={cn('h-8 px-0 rounded-lg text-white text-sm font-bold leading-3', color, className)}
        size='lg'
        radius='sm'
      >
        {label}
      </Chip>
    </div>
  );
};

export default Status;
