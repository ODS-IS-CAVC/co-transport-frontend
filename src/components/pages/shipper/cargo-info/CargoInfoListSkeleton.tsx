import { Card, CardBody, Skeleton } from '@nextui-org/react';

export const CargoInfoListSkeleton = () => {
  return (
    <div className='mt-4 space-y-2 bg-background p-4'>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className='w-full border border-gray-border rounded-lg' shadow='none'>
          <CardBody className='flex flex-col items-center p-2'>
            <div className='w-full flex items-center justify-between'>
              <Skeleton className='h-6 w-32 rounded-lg'></Skeleton>
              <div className='flex items-center space-x-3'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-5 w-12 rounded-lg'></Skeleton>
                  <Skeleton className='h-5 w-14 rounded-lg'></Skeleton>
                </div>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-5 w-12 rounded-lg'></Skeleton>
                  <Skeleton className='h-5 w-8 rounded-lg'></Skeleton>
                </div>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-5 w-12 rounded-lg'></Skeleton>
                  <Skeleton className='h-5 w-16 rounded-lg'></Skeleton>
                </div>
              </div>
            </div>
            <div className='mt-2 flex justify-between items-center w-full gap-2'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-5 w-12 rounded-lg'></Skeleton>
                  <Skeleton className='h-8 w-16 rounded-lg'></Skeleton>
                </div>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-5 w-12 rounded-lg'></Skeleton>
                  <Skeleton className='h-8 w-16 rounded-lg'></Skeleton>
                </div>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-5 w-12 rounded-lg'></Skeleton>
                  <Skeleton className='h-8 w-16 rounded-lg'></Skeleton>
                </div>
              </div>
              <Skeleton className='h-12 w-28 rounded-lg'></Skeleton>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};
