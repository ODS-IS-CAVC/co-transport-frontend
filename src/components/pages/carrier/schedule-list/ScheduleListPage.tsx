'use client';

import { Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { CmnPagination } from '@/components/common/CmnPagination';
import Loading from '@/components/common/Loading';
import { SearchSection } from '@/components/common/SearchSection';
import { DEFAULT_CURRENT_PAGE, DEFAULT_PAGE_SIZE, DEFAULT_TOTAL_PAGE } from '@/constants/common';
import { ROUTER, ROUTER_ID } from '@/constants/router/router';
import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import { objectToQueryParamsNoEncode } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { RootState } from '@/redux/store';
import { scheduleCarrierService } from '@/services/carrier/schedule';
import { ENotificationType } from '@/types/app';
import { DeliveryAbility } from '@/types/schedule';

import PostCSV from './PostCSV';
import ScheduleDetailModal from './ScheduleDetailModal';
import ScheduleItem from './ScheduleItem';
import { ScheduleListSkeleton } from './ScheduleListSkeleton';

export default function ScheduleListPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const scheduleCarrierApi = scheduleCarrierService();

  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [dataList, setDataList] = useState<DeliveryAbility[]>([]);
  const [searchParams, setSearchParams] = useState<Record<string, any>>({
    page: DEFAULT_CURRENT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [totalPage, setTotalPage] = useState<number>(DEFAULT_TOTAL_PAGE);

  const [modeUpdated, setModeUpdated] = useState<boolean>(false);
  const [detailDeliveryAbility, setDetailDeliveryAbility] = useState<DeliveryAbility | null>(null);
  const [isOpenModalDetail, setIsOpenModalDetail] = useState<boolean>(false);
  const [isOpenModalCSV, setIsOpenModalCSV] = useState<boolean>(false);
  const reloadMenu = useAppSelector((state: RootState) => state.app.reloadMenu);

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  useEffect(() => {
    reloadMenu && reloadMenu == ROUTER_ID.CARRIER_SCHEDULE_LIST && fetchData();
    dispatch(actions.appAction.setReloadMenu(''));
  }, [reloadMenu]);

  const fetchData = useCallback(() => {
    setLoadingList(true);
    scheduleCarrierApi
      .deliveryAbility(objectToQueryParamsNoEncode(searchParams))
      .then((response) => {
        setDataList(response.dataList || []);
        setTotalPage(response.totalPage || DEFAULT_TOTAL_PAGE);
      })
      .catch((error) => {
        console.log('error', error);
        dispatch(
          actions.appAction.showNotification({
            type: ENotificationType.ERROR,
            title: gTxt('MENU.CARRIER.SCHEDULE_LIST_BREADCRUMBS'),
            content: gTxt('MESSAGES.SERVER_ERROR'),
          }),
        );
      })
      .finally(() => {
        setLoadingList(false);
      });
  }, [searchParams]);

  const getDetailDeliveryAbility = (id: string) => {
    setLoadingDetail(true);
    scheduleCarrierApi
      .detailDeliveryAbility(id.toString())
      .then((response) => {
        setDetailDeliveryAbility(response);
      })
      .finally(() => {
        setLoadingDetail(false);
      });
  };
  const showModalDetail = (id?: number) => {
    if (id) {
      setLoadingDetail(true);
      getDetailDeliveryAbility(id.toString());
    }
    setModeUpdated(Boolean(id));
    setIsOpenModalDetail(true);
  };

  //TODO: FlightList page
  const redirectFlightListPage = (id: number) => {
    const params = new URLSearchParams();
    params.set('schedule', id.toString());
    router.push(`${ROUTER.CARRIER_FLIGHT_LIST}?${params.toString()}`);
  };

  const handleCloseModalDetail = () => {
    setIsOpenModalDetail(false);
    setDetailDeliveryAbility(null);
    setModeUpdated(false);
  };

  const handleSubmitModal = () => {
    setSearchParams({ ...searchParams, page: DEFAULT_CURRENT_PAGE });
    handleCloseModalDetail();
  };

  return (
    <>
      {loadingDetail && <Loading />}
      <div className='p-2 bg-white' id={ROUTER_ID.CARRIER_SCHEDULE_LIST}>
        <div className='flex items-center justify-between'>
          <h1>{gTxt('MENU.CARRIER.SCHEDULE_LIST_BREADCRUMBS')}</h1>
          <div className='space-x-3'>
            <Button
              radius='sm'
              size='lg'
              color='primary'
              variant='bordered'
              onPress={() => showModalDetail()}
              className='text-center text-primary text-base leading-normal border-1 font-bold'
            >
              個別登録
            </Button>
            <Button
              radius='sm'
              size='lg'
              color='primary'
              variant='bordered'
              onPress={() => setIsOpenModalCSV(true)}
              className='text-center text-primary text-base leading-normal border-1 font-bold'
            >
              CSV登録
            </Button>
          </div>
        </div>
        <p className='mt-6 text-xs'>登録されている運行スケジュールの一覧です。</p>
        <SearchSection
          className='mt-6'
          searchName={searchParams.tripName}
          departureFrom={searchParams.departureFrom}
          arrivalTo={searchParams.arrivalTo}
          startDate={searchParams.startDate}
          endDate={searchParams.endDate}
          onChangeLocation={(departureFrom, arrivalTo) => {
            setSearchParams({ ...searchParams, departureFrom: departureFrom, arrivalTo: arrivalTo });
          }}
          onChangeDate={(startDate, endDate) => {
            setSearchParams({ ...searchParams, startDate: startDate, endDate: endDate });
          }}
          onSearch={(searchName) => {
            setSearchParams({ ...searchParams, tripName: searchName });
          }}
        />

        {loadingList ? (
          <ScheduleListSkeleton />
        ) : (
          <>
            <div className='mt-4 p-2'>
              {dataList?.length > 0 ? (
                <div className=''>
                  <div className='space-y-3'>
                    {dataList.map((item, index) => (
                      <ScheduleItem
                        key={`schedule-${item.id || index}`}
                        item={item}
                        redirectDetailPage={() => showModalDetail(item.id)}
                        redirectFlightListPage={() => redirectFlightListPage(item.id)}
                      />
                    ))}
                  </div>
                  {totalPage > 0 && (
                    <CmnPagination
                      className='pt-4'
                      totalPage={totalPage}
                      currentPage={searchParams.page}
                      onPageChange={(page) => setSearchParams({ ...searchParams, page })}
                    />
                  )}
                </div>
              ) : (
                <div className='mt-8 bg-background px-4 py-40 text-center'>{gTxt('COMMON.NO_RECORD_FOUND')}</div>
              )}
            </div>
          </>
        )}
        {isOpenModalDetail && (
          <ScheduleDetailModal
            isOpen={isOpenModalDetail}
            modeUpdate={modeUpdated}
            detailData={detailDeliveryAbility}
            getDetailDeliveryAbility={getDetailDeliveryAbility}
            updateModeDetail={() => setModeUpdated(true)}
            onClose={handleCloseModalDetail}
            onSubmit={handleSubmitModal}
            setLoading={setLoadingDetail}
          />
        )}
        <PostCSV isOpen={isOpenModalCSV} onClose={() => setIsOpenModalCSV(false)} />
      </div>
    </>
  );
}
