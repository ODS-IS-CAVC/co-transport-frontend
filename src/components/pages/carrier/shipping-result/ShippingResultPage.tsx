'use client';

import { CmnPagination } from '@/components/common/CmnPagination';
import ShippingResultItem from '@/components/pages/carrier/shipping-result/ShippingResultItem';
import ShippingResultItemSkeleton from '@/components/pages/carrier/shipping-result/ShippingResultItemSkeleton';
import { PAGE_SIZE } from '@/constants/constants';
import { gTxt } from '@/messages/gTxt';
import { SearchParamAbilityPublic } from '@/types/carrier/matchingShipper';
import { PackageCNSLine, VehicleAVBResource } from '@/types/carrier/transport';
import { IListResponse } from '@/types/response';

interface ShippingResultPageProps {
  isLoading: boolean;
  data: IListResponse<VehicleAVBResource[] | PackageCNSLine[]>;
  param: SearchParamAbilityPublic;
  screen: string;
  search: (param: SearchParamAbilityPublic) => void;
}

const ShippingResultPage = (props: ShippingResultPageProps) => {
  const { isLoading, data: dataProps, param, screen, search } = props;

  const { data } = dataProps;

  const onPageChange = (page: number) => {
    search({ ...param, page: page });
  };

  const onReloadPage = () => {
    search({ ...param, page: 1 });
  };

  return (
    <>
      {isLoading ? (
        Array.from({ length: PAGE_SIZE }).map((_, index) => <ShippingResultItemSkeleton key={index} tab={screen} />)
      ) : (
        <>
          {data?.length === 0 ? (
            <div className='border border-other-gray rounded-lg text-sm py-40 text-center'>
              {gTxt('COMMON.NO_RECORD_FOUND')}
            </div>
          ) : (
            data?.map((item: any, index: number) => {
              return <ShippingResultItem key={index} record={item} screen={screen} onReloadPage={onReloadPage} />;
            })
          )}
        </>
      )}
      <div className='my-4'>
        {!isLoading && dataProps.totalPages > 0 && dataProps.totalElements > 0 && (
          <CmnPagination
            totalPage={dataProps.totalPages}
            currentPage={dataProps.currentPage}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </>
  );
};

export default ShippingResultPage;
