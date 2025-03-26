'use client';

import 'dayjs/locale/ja';

import { Button } from '@nextui-org/react';
import dayjs from 'dayjs';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import CmnDropdown from '@/components/common/CmnDropdown';
import CmnInput from '@/components/common/CmnInput';
import { CmnPagination } from '@/components/common/CmnPagination';
import DialogMonthPicker from '@/components/common/dialog/DialogMonthPicker';
import ModalCompanyInfo from '@/components/pages/carrier/board/Modal/ModalCompanyInfo';
import ModalTransaction from '@/components/pages/carrier/board/Modal/ModalDetailTransaction';
import { mockAccount } from '@/constants/auth';
import { FILTER_FLIGHT_LIST } from '@/constants/carrier';
import {
  DEFAULT_CURRENT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_TOTAL_PAGE,
  PAGE_LIST_SIZE,
  TEMPERATURE_RANGE_LIST,
} from '@/constants/common';
import * as CarrierHelper from '@/lib/carrier';
import { gTxt } from '@/messages/gTxt';
import { scheduleCarrierService } from '@/services/carrier/schedule';
import { ITrailer, ITransportMatching } from '@/types/carrier/transport';
import { DataFlightListItem, DeliveryAbility, FlightListResponse, VehicleTripItemTrailer } from '@/types/schedule';

import ModalCreateMatchingSuccess from '../../board/Modal/ModalCreateMatchingSuccess';
import ModalMatching from '../../board/Modal/ModalMatching';
import PostCSV from '../PostCSV';
import ScheduleDetailModal from '../ScheduleDetailModal';
import FlightDetail from './FlightDetail';
import FlightItem from './FlightItem';
interface FlightListPageProps {
  data: FlightListResponse;
}

const FlightListPage = (props: FlightListPageProps) => {
  const { data } = props;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduleCarrierApi = scheduleCarrierService();

  const [idSearch, setIdSearch] = useState<string>('');
  const [textSearch, setTextSearch] = useState<string>('');
  const [dateSearch, setDateSearch] = useState<{
    start_date: string | null;
    end_date: string | null;
  }>({
    start_date: '',
    end_date: '',
  });

  const [isOpenModalCSV, setIsOpenModalCSV] = useState<boolean>(false);
  const [isOpenModalAdd, setIsOpenModalAdd] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<string>(`${DEFAULT_PAGE_SIZE}`);
  const [currentPage, setCurrentPage] = useState<number>(DEFAULT_CURRENT_PAGE);
  const [openDetail, setOpenDetail] = useState<{ open: boolean; id: number }>({ open: false, id: -1 });
  const [detailDeliveryAbility, setDetailDeliveryAbility] = useState<DeliveryAbility | null>(null);

  const [trailerActive, setTrailerActive] = useState<VehicleTripItemTrailer>();
  const [dataItemActive, setDataItemActive] = useState<DataFlightListItem | null>();

  const [isShowModalMatching, setIsShowModalMatching] = useState<boolean>(false);

  const [dataCompany, setDataCompany] = useState<any>();
  const [isShowModalCompanyInfo, setIsShowModalCompanyInfo] = useState<boolean>(false);

  const [isShowModalCreateMatchingSuccess, setIsShowModalCreateMatchingSuccess] = useState<boolean>(false);
  const [isShowModalTransaction, setIsShowModalTransaction] = useState<boolean>(false);

  const [dataCreate, setDataCreate] = useState<any>(null);

  useEffect(() => {
    const pageSize = searchParams?.get('pageSize');
    const currentPage = searchParams?.get('page');
    setCurrentPage(Number(currentPage) || DEFAULT_CURRENT_PAGE);
    setPageSize(pageSize || `${DEFAULT_PAGE_SIZE}`);
  }, [searchParams]);

  const getDetailDeliveryAbility = (id: string) => {
    scheduleCarrierApi.detailDeliveryAbility(id.toString()).then((response) => {
      setDetailDeliveryAbility(response);
    });
  };

  const handleChangeRouter = (type: string, value: string) => {
    router.push(pathname + '?' + createQueryString(type, value));
  };

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      name === 'pageSize' && currentPage !== 1 && params.set('page', '1');
      !value ? params.delete(name) : params.set(name, value);
      return params.toString();
    },
    [searchParams, currentPage],
  );

  const handleChangePageSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pageSize = e.target.value ?? '';
    router.push(pathname + '?' + createQueryString('pageSize', pageSize));
  };

  const handleUpdateOpenDetail = (status: boolean, id: number) => {
    setOpenDetail({ open: status, id });
  };

  const handleSearchId = () => {
    idSearch && handleUpdateOpenDetail(true, Number(idSearch));
  };

  const handleSearchDate = () => {
    if (dateSearch?.start_date && dateSearch?.end_date) {
      const params = new URLSearchParams(searchParams?.toString() || '');
      if (!params.has('schedule')) {
        params.set('schedule', idSearch);
      }
      params.set('start_date', dateSearch.start_date);
      params.set('end_date', dateSearch.end_date);
      router.push(pathname + '?' + params.toString());
    } else {
      const params = new URLSearchParams(searchParams?.toString() || '');
      if (params.has('start_date')) {
        params.delete('start_date');
      }
      if (params.has('end_date')) {
        params.delete('end_date');
      }
      router.push(pathname + '?' + params.toString());
    }
  };

  const handleRequest = (dataItem: any, trailer?: VehicleTripItemTrailer) => {
    if (!trailer) {
      return;
    }
    if (CarrierHelper.isNotMatch(trailer.status)) {
      return;
    }
    setTrailerActive(trailer);
    if (CarrierHelper.isMatched(trailer.status)) {
      setIsShowModalMatching(true);
    }

    if (
      CarrierHelper.isShipperApprove(trailer.status) ||
      CarrierHelper.isCarrierApprove(trailer.status) ||
      CarrierHelper.isShipperMatch(trailer.status) ||
      CarrierHelper.isCarrierMatch(trailer.status)
    ) {
      setTrailerActive({
        ...trailer,
        order_id: trailer.trans_order_id,
      } as VehicleTripItemTrailer);
      setDataItemActive(dataItem);
      setIsShowModalTransaction(true);
    }
  };

  const option =
    (data?.dataList || [])
      .sort((a, b) => a?.id - b?.id)
      .map((itemValue) => {
        return {
          key: `${itemValue?.id}`,
          label: `${itemValue?.id}`,
        };
      }) || [];

  return (
    <>
      <div className='bg-white p-2'>
        <div className='flex items-center justify-between'>
          <h3>運行便</h3>
          <div className='space-x-3'>
            <Button
              radius='sm'
              size='lg'
              color='primary'
              variant='bordered'
              onPress={() => setIsOpenModalAdd(true)}
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

        <div className='flex items-center mt-4'>
          <p className='w-36 text-base leading-7 font-bold'>表示する運行日時</p>
          <DialogMonthPicker
            size='md'
            onSelect={(startDate, endDate) => {
              setDateSearch({
                start_date: startDate ? dayjs(startDate).format('YYYYMMDD') : null,
                end_date: endDate ? dayjs(endDate).format('YYYYMMDD') : null,
              });
            }}
          />
          <Button
            radius='sm'
            color='primary'
            onPress={handleSearchDate}
            className='h-12 w-[9.25rem] font-bold left-6 text-base'
          >
            この期間を表示
          </Button>
        </div>
        <div className='flex items-center mt-6'>
          <p className='w-36 text-base leading-7 font-bold'>運行便指定</p>
          <CmnDropdown
            size='md'
            items={option as any}
            disallowEmptySelection
            selectedKeys={[idSearch]}
            classNameWrap='w-[15.25rem]'
            placeholder={gTxt('COMMON.LABEL_PLEASE_SELECT_VEHICLE')}
            onChange={(e) => setIdSearch(e?.target?.value)}
          />
          <Button
            radius='sm'
            color='primary'
            onPress={handleSearchId}
            className='h-12 w-[8.25rem] font-bold left-6 text-base'
          >
            この運行表示
          </Button>
        </div>
        <div className='flex items-center mt-6'>
          <p className='w-36 text-base leading-7 font-bold'>フリーワード検索</p>
          <CmnInput
            classNameWrap='w-[15.25rem]'
            onChange={(event) => setTextSearch(event?.target?.value?.trim() || '')}
          />
          <Button
            radius='sm'
            color='primary'
            onPress={() => handleChangeRouter('trip_name', textSearch)}
            className='h-12 w-[6.125rem] font-bold left-6 text-base'
          >
            検索
          </Button>
        </div>

        <div className='flex items-center mt-6'>
          <p className='text-base leading-7 font-bold min-w-fit'>条件指定</p>
          <CmnCheckboxGroup
            size='sm'
            option={FILTER_FLIGHT_LIST}
            onChange={(value) => handleChangeRouter('status', value.join(','))}
            classNames={{
              wrapper: 'pl-4 py-2',
            }}
          />
          <CmnCheckboxGroup
            size='sm'
            option={[...TEMPERATURE_RANGE_LIST.slice(1)]}
            onChange={(value) => handleChangeRouter('temperature_range', value.join(','))}
            classNames={{
              wrapper: 'pl-0 py-2',
            }}
          />
        </div>

        {(data?.dataList || []).length > 0 ? (
          <div className='mt-2 p-2'>
            <div className='flex items-center justify-end'>
              <CmnDropdown
                size='sm'
                title='表示件数'
                items={PAGE_LIST_SIZE}
                disallowEmptySelection
                selectedKeys={[pageSize]}
                classNameWrap='min-w-20 w-20'
                onChange={handleChangePageSize}
              />
            </div>
            {(data?.dataList || []).map((item) => (
              <FlightItem key={item.id} dataItem={item} onUpdateOpenDetail={handleUpdateOpenDetail} />
            ))}
            <CmnPagination
              className='pt-2'
              currentPage={currentPage}
              totalPage={data?.totalPage || DEFAULT_TOTAL_PAGE}
              onPageChange={(page) => handleChangeRouter('page', `${page}`)}
            />
          </div>
        ) : (
          <div className='mt-3 bg-background px-4 py-40 text-center'>{gTxt('COMMON.NO_RECORD_FOUND')}</div>
        )}
      </div>

      {isOpenModalAdd && (
        <ScheduleDetailModal
          detailData={detailDeliveryAbility}
          modeUpdate={false}
          setLoading={() => null}
          isOpen={isOpenModalAdd}
          getDetailDeliveryAbility={getDetailDeliveryAbility}
          updateModeDetail={() => null}
          onClose={() => setIsOpenModalAdd(false)}
          onSubmit={() => setIsOpenModalAdd(false)}
        />
      )}

      <PostCSV isOpen={isOpenModalCSV} onClose={() => setIsOpenModalCSV(false)} />

      {openDetail?.open && openDetail?.id !== -1 && (
        <FlightDetail
          isSchedule
          id={openDetail.id}
          isOpen={openDetail.open}
          onClose={() => handleUpdateOpenDetail(false, -1)}
          onRequest={(dataItem, trailer) => handleRequest(dataItem, trailer)}
        />
      )}

      {isShowModalMatching && trailerActive && (
        <ModalMatching
          isOpen={isShowModalMatching}
          trailer={trailerActive as unknown as ITrailer}
          onClose={() => setIsShowModalMatching(false)}
          onViewCompanyInfo={(id) => {
            setDataCompany(mockAccount.find((account) => account.companyId === id));
            setIsShowModalCompanyInfo(true);
          }}
          onSubmit={(dt) => {
            setDataCreate(dt);
            setIsShowModalCreateMatchingSuccess(true);
          }}
        />
      )}

      {isShowModalTransaction && trailerActive && (
        <ModalTransaction
          open={isShowModalTransaction}
          active={trailerActive as unknown as ITrailer}
          item={dataItemActive as unknown as ITransportMatching}
          onClose={() => {
            setIsShowModalTransaction(false);
          }}
          // onRefetch={onRefetch}
        />
      )}

      {isShowModalCompanyInfo && dataCompany && (
        <ModalCompanyInfo
          isOpen={isShowModalCompanyInfo}
          onClose={() => {
            setIsShowModalCompanyInfo(false);
          }}
          data={dataCompany}
        />
      )}

      {isShowModalCreateMatchingSuccess && dataCreate && (
        <ModalCreateMatchingSuccess
          data={dataCreate?.shipper_operator_name}
          isOpen={isShowModalCreateMatchingSuccess}
          onClose={() => {
            setIsShowModalCreateMatchingSuccess(false);
          }}
        />
      )}
    </>
  );
};

export default FlightListPage;
