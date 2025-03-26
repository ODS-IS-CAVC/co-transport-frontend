import { Card, CardBody, Skeleton } from '@nextui-org/react';

const ShippingResultItemSkeleton = ({ tab }: { tab: string }) => {
  return (
    <Card className='bg-white shadow-none border border-other-gray rounded-lg text-sm mt-2'>
      <CardBody className='px-2 py-2'>
        {tab === 'flight_search' ? (
          <>
            <div className='h-8 justify-between items-center inline-flex'>
              <div className='justify-start items-center gap-2 flex'>
                <Skeleton className='w-28 h-8 rounded-md' />
              </div>
            </div>
            <div className='py-2 justify-start items-center gap-4 flex flex-wrap flex-row'>
              <div className='justify-start items-center gap-2 flex'>
                <Skeleton className='w-28 h-8 rounded-md' />
              </div>
              <div className='h-9 px-3 py-1 rounded-lg justify-start items-center gap-6 flex'>
                <div className='justify-start items-center gap-2 flex'>
                  <Skeleton className='w-96 h-10 rounded-md' />
                </div>
              </div>
              <div className='justify-start items-center gap-2 flex'>
                <Skeleton className='w-28 h-8 rounded-md' />
              </div>
            </div>
            <div className='py-2 justify-start items-center gap-4 flex flex-wrap flex-row'>
              <div className='justify-start items-center gap-2 flex'>
                <Skeleton className='w-28 h-8 rounded-md' />
              </div>
              <div className='h-9 px-3 py-1 rounded-lg justify-start items-center gap-6 flex'>
                <div className='justify-start items-center gap-2 flex'>
                  <Skeleton className='w-96 h-10 rounded-md' />
                </div>
                <div className='justify-start items-center gap-2 flex'>
                  <Skeleton className='w-28 h-8 rounded-md' />
                </div>
              </div>
            </div>
            <div className='h-12 justify-end items-center gap-8 flex flex-wrap flex-row'>
              <Skeleton className='w-48 h-10 rounded-md' />
              <Skeleton className='w-48 h-10 rounded-md' />
            </div>
          </>
        ) : (
          <>
            <div className='h-7 justify-between items-center gap-2 inline-flex'>
              <div className='flex items-center'>
                <div className='text-[#1e1e1e] text-sm font-normal leading-tight'>
                  <Skeleton className='w-28 h-8 rounded-md' />
                </div>
              </div>
            </div>
            <div className='py-2 justify-start items-center gap-4 flex flex-row flex-wrap'>
              <div className='justify-start items-center gap-2 flex'>
                <div className='text-2xl font-medium leading-9'>
                  <Skeleton className='w-32 h-8 rounded-md' />
                </div>
              </div>
              <div className='h-10 px-3 rounded-lg justify-start items-center gap-6 flex'>
                <div className='justify-start items-center gap-2 flex'>
                  <Skeleton className='w-96 h-10 rounded-md' />
                </div>
              </div>
              <div className='justify-start items-center gap-2 flex'>
                <div className='text-center text-[#1e1e1e] text-2xl font-medium  leading-9'>
                  <Skeleton className='w-32 h-8 rounded-md' />
                </div>
              </div>
            </div>
            <div className='py-2 justify-start items-center gap-4 flex flex-wrap flex-row'>
              <div className='justify-start items-center gap-2 flex'>
                <div className='text-2xl font-medium leading-9'>
                  <Skeleton className='w-32 h-8 rounded-md' />
                </div>
              </div>
              <div className='h-10 py-1 rounded-lg justify-start items-center gap-6 flex'>
                <div className='justify-start items-center gap-2 flex'>
                  <div className='text-2xl font-medium leading-9'>
                    <Skeleton className='w-96 h-10 rounded-md' />
                  </div>
                </div>
              </div>
            </div>
            <div className='flex-col justify-start items-start gap-[15px] inline-flex'>
              <div className='self-stretch justify-end items-center inline-flex'>
                <div className='h-12 flex-col justify-end items-end gap-2.5 inline-flex'>
                  <div className='justify-end items-end gap-2 inline-flex'>
                    <Skeleton className='w-48 h-10 rounded-md' />
                    <Skeleton className='w-48 h-10 rounded-md' />
                  </div>
                </div>
              </div>
            </div>
            <div className='py-2justify-start items-center gap-4 flex flex-wrap flex-row'>
              <div className='py-1 rounded-lg justify-start items-center gap-6 flex'>
                <div className='justify-start items-center gap-2 flex'>
                  <div className='text-2xl font-medium leading-9'>
                    <Skeleton className='w-72 h-10 rounded-md' />
                  </div>
                </div>
              </div>
              <div className='justify-start items-center gap-2 flex'>
                <div className='text-2xl font-medium leading-9'>
                  <Skeleton className='w-72 h-8 rounded-md' />
                </div>
              </div>
            </div>
            <div className='flex-col justify-start items-start gap-[15px] inline-flex'>
              <div className='self-stretch justify-between items-center inline-flex '>
                <div className='justify-start items-center gap-8 flex'>
                  <div className='justify-start items-center gap-2 flex'>
                    <div className='text-2xl font-medium leading-9'>
                      <Skeleton className='w-32 h-8 rounded-md' />
                    </div>
                  </div>
                  <div className='justify-start items-center gap-2 flex'>
                    <div className='text-2xl font-medium leading-9'>
                      <Skeleton className='w-32 h-8 rounded-md' />
                    </div>
                  </div>
                  <div className='justify-start items-center gap-2 flex'>
                    <div className='text-2xl font-medium leading-9'>
                      <Skeleton className='w-32 h-8 rounded-md' />
                    </div>
                  </div>
                  <div className='justify-start items-center gap-2 flex'>
                    <div className='text-2xl font-medium leading-9'>
                      <Skeleton className='w-32 h-8 rounded-md' />
                    </div>
                  </div>
                </div>
                <div className='h-12 flex-col justify-end items-end gap-2.5 inline-flex'>
                  <div className='justify-end items-end gap-2 inline-flex'>
                    <Skeleton className='w-48 h-10 rounded-md' />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default ShippingResultItemSkeleton;
