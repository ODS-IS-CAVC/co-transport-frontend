import { Card, CardBody, Skeleton } from '@nextui-org/react';

export const VehicleListSkeleton = () => {
  return (
    <div className='mt-2 space-y-2'>
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
            <div className='mt-2'>
              <Skeleton className='h-8 w-3/4 rounded-lg'></Skeleton>
            </div>
            <div className='mt-2'>
              <Skeleton className='h-12 w-24 rounded-lg'></Skeleton>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};
