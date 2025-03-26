import { Card, CardBody, CardHeader, Skeleton } from '@nextui-org/react';

export default function MatchingItemSkeleton() {
  return (
    <Card className='w-full border border-gray-border rounded-lg' shadow='none'>
      {/* Header Skeleton */}
      <CardHeader className='text-sm pb-0 p-2 gap-2 flex justify-between'>
        <div className='flex text-foreground text-sm items-center'>
          <Skeleton className='w-44 h-8 rounded-md' />
        </div>
        <div className='flex gap-4'>
          <Skeleton className='w-44 h-6 rounded-md' />
          <Skeleton className='w-44 h-6 rounded-md' />
        </div>
      </CardHeader>

      {/* Body Skeleton */}
      <CardBody className='pb-2 pt-0 flex flex-col gap-3 px-2'>
        <div className='flex gap-2'>
          <div className='flex items-center px-2 py-1 gap-3 border border-default rounded-lg'>
            <Skeleton className='w-96 h-8 rounded-md' />
          </div>
        </div>
        <div className='grid grid-cols-6 gap-[0.375rem] text-base'>
          <div className='col-span-1'>
            <Skeleton className='col-span-1 w-32 h-6 rounded-md' />
          </div>
          <div className='col-span-5'>
            <Skeleton className='col-span-1 w-32 h-6 rounded-md' />
          </div>
        </div>
        <div className='grid grid-cols-6 gap-[0.375rem] text-base'>
          <div className='col-span-1 space-y-1 py-[0.375rem] px-[0.625rem] flex flex-col justify-center border-default border rounded-lg max-w-40'>
            <div className='flex flex-col justify-center gap-1 mb-1'>
              <Skeleton className='w-32 h-6 rounded-md' />
              <Skeleton className='w-32 h-6 rounded-md' />
            </div>
          </div>
          <div className='col-span-5 flex gap-1'>
            <div className='w-5/12 flex justify-between space-y-1 border border-default rounded-lg p-2'>
              <div className='flex flex-col items-start gap-0.5'>
                <Skeleton className='w-24 h-8 px-2 rounded-lg' />
                <Skeleton className='w-40 h-6 rounded-md' />
                <Skeleton className='w-40 h-6 rounded-md' />
              </div>
              <div className='flex items-center flex-col justify-end gap-2'>
                <Skeleton className='w-32 h-6 rounded-md' />
                <Skeleton className='w-32 h-6 rounded-md' />
              </div>
            </div>
            <div className='w-5/12 flex justify-between space-y-2 border border-default rounded-lg p-2'>
              <div className='flex flex-col items-start gap-0.5'>
                <Skeleton className='w-24 h-8 px-2 rounded-lg text-white text-sm leading-3 mb-1' />
                <Skeleton className='w-40 h-6 rounded-md' />
                <Skeleton className='w-40 h-6 rounded-md' />
              </div>
              <div className='flex items-center flex-col justify-end gap-2'>
                <Skeleton className='w-32 h-6 rounded-md' />
                <Skeleton className='w-32 h-6 rounded-md' />
              </div>
            </div>
            <div className='w-2/12 flex flex-col justify-end items-end space-y-2'>
              <Skeleton className='w-11/12 h-12 rounded-md' />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
