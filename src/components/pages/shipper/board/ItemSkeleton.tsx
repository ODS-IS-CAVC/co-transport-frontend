import { Card, CardBody, CardHeader, Skeleton } from '@nextui-org/react';

export default function ItemSkeleton() {
  return (
    <Card className='w-full rounded-lg border border-gray-border' shadow='none'>
      <CardHeader className='flex items-center justify-between text-sm pb-0 p-2 gap-2}'>
        <Skeleton className='w-28 h-8 rounded-lg' />
        <div className='flex gap-2 text-foreground text-sm font-normal flex-wrap'>
          <div className='whitespace-nowrap'>
            <Skeleton className='w-24 h-6' />
          </div>
          <div className='whitespace-nowrap flex'>
            <Skeleton className='w-24 h-6' />
          </div>
          <div className='whitespace-nowrap flex'>
            <Skeleton className='w-24 h-6' />
          </div>
        </div>
      </CardHeader>

      <CardBody className='pb-2 pt-0 flex flex-col gap-2 px-2'>
        <div className='text-foreground tracking-wide flex items-center gap-2'>
          <Skeleton className='w-28 h-9' />
          <Skeleton className='w-24 h-9' />
        </div>

        <div className='flex flex-wrap items-center justify-between'>
          <div className='flex items-center gap-6'>
            <div className='border-default border rounded-lg flex flex-col justify-center items-center h-[4.5rem] px-4'>
              <Skeleton className='w-60 h-6 mt-1' />
            </div>

            <Skeleton className='w-6 h-6 rounded-full' />

            <div className='border-default border rounded-lg flex flex-col justify-center items-center h-[4.5rem] px-4'>
              <Skeleton className='w-60 h-6 mt-1' />
            </div>
            <Skeleton className='w-32 h-8' />
          </div>

          <Skeleton className='w-[7.1875rem] h-12 rounded-lg' />
        </div>
      </CardBody>
    </Card>
  );
}
