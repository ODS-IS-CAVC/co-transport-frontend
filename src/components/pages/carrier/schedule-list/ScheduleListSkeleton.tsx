import { Card, CardBody, Skeleton } from '@nextui-org/react';

export const ScheduleListSkeleton = () => {
  return (
    <div className='mt-4 space-y-2 bg-background p-2'>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className='w-full border border-gray-border rounded-lg' shadow='none'>
          <CardBody className='flex flex-col p-2'>
            <div className='w-full flex items-center justify-between'>
              <Skeleton className='h-5 w-20 rounded-lg'></Skeleton>
              <div className='flex items-center space-x-3'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-5 w-9 rounded-lg'></Skeleton>
                  <Skeleton className='h-5 w-20 rounded-lg'></Skeleton>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2 mt-2'>
              <Skeleton className='h-8 w-1/2 rounded-lg'></Skeleton>
              <div className='flex-1 flex items-center justify-between'>
                <Skeleton className='h-8 w-28 rounded-lg'></Skeleton>
                <Skeleton className='h-8 w-28 rounded-lg'></Skeleton>
              </div>
            </div>
            <div className='flex items-center justify-between space-x-4 mt-2'>
              <div className='flex items-start gap-2'>
                <Skeleton className='h-5 w-16 rounded-lg'></Skeleton>
                <Skeleton className='h-10 w-28 rounded-lg'></Skeleton>
                <Skeleton className='h-5 w-16 rounded-lg'></Skeleton>
                <Skeleton className='h-10 w-28 rounded-lg'></Skeleton>
                <Skeleton className='h-10 w-28 rounded-lg'></Skeleton>
              </div>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-9 w-28 rounded-lg'></Skeleton>
                <Skeleton className='h-9 w-28 rounded-lg'></Skeleton>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};
