import { Card, CardBody, Skeleton } from '@nextui-org/react';

export const TransportPlanInfoListSkeleton = () => {
  return (
    <div className='mt-4 space-y-2 bg-background p-4'>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className='w-full border border-gray-border rounded-lg' shadow='none'>
          <CardBody className='flex flex-col p-2'>
            <div className='w-full flex items-center justify-between'>
              <Skeleton className='h-6 w-11 rounded-lg'></Skeleton>
              <div className='flex items-center space-x-3'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-5 w-9 rounded-lg'></Skeleton>
                  <Skeleton className='h-5 w-24 rounded-lg'></Skeleton>
                </div>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-5 w-9 rounded-lg'></Skeleton>
                  <Skeleton className='h-5 w-20 rounded-lg'></Skeleton>
                </div>
              </div>
            </div>
            <div className='mt-2 space-y-2'>
              <Skeleton className='h-5 w-96 rounded-lg'></Skeleton>
              <Skeleton className='h-5 w-96 rounded-lg'></Skeleton>
              <Skeleton className='h-5 w-96 rounded-lg'></Skeleton>
            </div>
            <div className='mt-2 flex justify-between items-center w-full gap-2'>
              <div className='flex items-center space-x-3'>
                <Skeleton className='h-12 w-40 rounded-lg'></Skeleton>
                <Skeleton className='h-6 w-8 rounded-lg'></Skeleton>
                <Skeleton className='h-12 w-40 rounded-lg'></Skeleton>
              </div>
              <div className='flex-1 flex items-center justify-between'>
                <div className='space-y-2'>
                  <Skeleton className='h-5 w-32 rounded-lg'></Skeleton>
                  <Skeleton className='h-5 w-40 rounded-lg'></Skeleton>
                </div>
                <Skeleton className='h-12 w-24 rounded-lg'></Skeleton>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};
