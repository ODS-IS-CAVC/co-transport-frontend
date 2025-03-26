import { Spinner } from '@nextui-org/react';

function Loading() {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]'>
      <Spinner color='primary' size='lg' />
    </div>
  );
}

export default Loading;
