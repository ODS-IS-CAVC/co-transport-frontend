'use client';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import CmnCalendar from '@/components/common/CmnCalendar';
import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import CmnDropdown from '@/components/common/CmnDropdown';
import { CmnPagination } from '@/components/common/CmnPagination';
import CmnModal from '@/components/common/modal/CmnModal';
import ItemSkeleton from '@/components/pages/shipper/board/ItemSkeleton';
import {
  DEFAULT_CURRENT_PAGE,
  DEFAULT_TOTAL_PAGE,
  TEMPERATURE_RANGE_LIST,
  TRADING_VIEW_MODE,
  TransType,
} from '@/constants/common';
import { DATE_FORMAT, PAGE_SIZE } from '@/constants/constants';
import { KEY_COOKIE_USER_ID } from '@/constants/keyStorage';
import { ROUTER_ID } from '@/constants/router/router';
import useModals from '@/hook/useModals';
import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import { formatTimeHHMM, getCookie, objectToQueryParamsNoEncode, subtractHours } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { RootState } from '@/redux/store';
import { priceService } from '@/services/transaction/price';
import { transactionService } from '@/services/transaction/transaction';
import { transportService } from '@/services/transaction/transport';
import { ENotificationType, IDataCalender } from '@/types/app';
import { CutOffInfoType } from '@/types/shipper/transaction';
import { ITransportPlanSale, ITransportShipperSearch } from '@/types/shipper/transport';

import { KEY_COOKIE_COMPANY_CODE } from '../../../../constants/keyStorage';
import ItemTrading from './ItemTrading';
import ModalConfirmRequest from './modal/trading/ModalConfirmRequest';
import ModalDataPropose from './modal/trading/ModalDataPropose';
import ModalDetail from './modal/trading/ModalDetail';
import ModalDetailMatchingTransport from './modal/trading/ModalDetaiMatchingTransport';
import ModalRequestComplete from './modal/trading/ModalRequestComplete';

const TradingBoardPage = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
  );
  const [viewMode, setViewMode] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [totalPage, setTotalPage] = useState(DEFAULT_TOTAL_PAGE);
  const [dataCalendars, setDataCalendars] = useState<IDataCalender[]>([]);
  const [dataTransportSale, setDataTransportPlan] = useState<ITransportPlanSale[]>([]);
  const [dataTransportSaleDetail, setDataTransportPlanDetail] = useState<ITransportPlanSale>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataPropose, setDataPropose] = useState<ITransportShipperSearch[]>([]);
  const [cutOffInfos, setCutOffInfos] = useState<CutOffInfoType[]>();
  const [dataDetailMatchingTransport, setDataDetailMatchingTransport] = useState<ITransportShipperSearch>();

  const reloadMenu = useAppSelector((state: RootState) => state.app.reloadMenu);

  const transactionApi = transactionService();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useState({
    page: currentPage,
    limit: PAGE_SIZE,
    temperatureRange: [] as string[],
  });

  const { modals, openModal, closeModal } = useModals({
    modalDetail: false,
    modalDetailMatching: false,
    modalDetailMatchingTransport: false,
    modalConfirmRequest: false,
    modalRequestComplete: false,
  });

  useEffect(() => {
    const currentMonth = `${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}`;
    Promise.all([
      fetchDataShipperMarket({ month: currentMonth }),
      fetchDataShipperSale(objectToQueryParamsNoEncode(searchParams)),
    ]);
  }, []);

  const fetchDataShipperMarket = async ({ month }: { month?: string }) => {
    try {
      setIsLoading(true);
      setDataCalendars([]);
      const priceApi = priceService();
      const response = await priceApi.shipperMarket(month ?? selectedMonth);
      setDataCalendars(response?.data);
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
    setIsLoading(false);
  };

  const fetchDataShipperSale = async (searchParams: string) => {
    try {
      setIsLoading(true);
      const transportApi = transportService();
      const response = await transportApi.apiAth113(searchParams);
      setDataTransportPlan(response?.data);
      setCurrentPage(response.currentPage);
      setTotalPage(response.totalPages);
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
    setIsLoading(false);
  };

  const fetchCutOffInfos = async (id: number) => {
    try {
      const response = await transactionApi.apiAth114(id);
      setCutOffInfos(response.data);
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  };

  const onPageChange = (page: number) => {
    setSearchParams({
      ...searchParams,
      page: page,
    });

    fetchDataShipperSale(
      objectToQueryParamsNoEncode({
        ...searchParams,
        page: page,
      }),
    );
  };

  const handleChangeMonth = (month: string) => {
    fetchDataShipperMarket({ month });
    setSelectedMonth(month);
  };

  const handleTemperatureRange = (value: string[]) => {
    setSearchParams({
      ...searchParams,
      page: DEFAULT_CURRENT_PAGE,
      temperatureRange: [...value],
    });

    fetchDataShipperSale(
      objectToQueryParamsNoEncode({
        ...searchParams,
        page: DEFAULT_CURRENT_PAGE,
        temperatureRange: [...value],
      }),
    );
    viewMode === 1 && fetchDataShipperMarket({ month: selectedMonth });
  };

  const showDetail = (id: number) => {
    setDataTransportPlanDetail(dataTransportSale.find((i) => i.id === id));
    openModal('modalDetail');
  };

  const fetchDataPropose = async (item: ITransportPlanSale | undefined) => {
    const cid = getCookie(KEY_COOKIE_COMPANY_CODE) as string;
    const collectionDate = item?.trans_type === TransType.CARRIER ? item?.transport_date : item?.collection_date;
    const price = item?.trans_type === TransType.CARRIER ? item?.propose_price : item?.price_per_unit;
    const _queryString = objectToQueryParamsNoEncode({
      depId: item?.departure_from + '',
      arrId: item?.arrival_to + '',
      // depDate: collectionDate && dayjs(collectionDate).subtract(7, 'day').format(DATE_FORMAT.YYYYMMDD),
      // arrDate: collectionDate && dayjs(collectionDate).add(7, 'day').format(DATE_FORMAT.YYYYMMDD),
      isNotIX: process.env.NEXT_PUBLIC_IS_NOT_IX !== 'false' ? true : false,
      // cid: cid,
      collectionDate: dayjs(collectionDate).format(DATE_FORMAT.YYYYMMDD),
      pricePerUnit: price,
      page: 1,
      limit: 20,
    });

    const transportApi = transportService();
    const result = await transportApi.apiAth0191(_queryString);
    setDataPropose(result?.data);
    openModal('modalDetailMatching');
    closeModal('modalDetail');
  };

  const showModalDetailMatchingTransport = (id: number) => {
    setDataDetailMatchingTransport(dataPropose?.find((d) => d.id === id));
    closeModal('modalDetailMatching');
    openModal('modalDetailMatchingTransport');
  };

  const showModalConfirmRequest = (id: number) => {
    fetchCutOffInfos(id);
    openModal('modalConfirmRequest');
    closeModal('modalDetailMatchingTransport');
  };

  const handleConfirmMatching = async (paramTransactionsCarrier: any) => {
    if (!paramTransactionsCarrier) return;
    const cid = getCookie(KEY_COOKIE_COMPANY_CODE) as string;
    const shipperCode = getCookie(KEY_COOKIE_USER_ID) as string;
    const params = {
      cns_line_item_by_date_id: dataTransportSaleDetail?.id,
      vehicle_avb_resource_item_id: paramTransactionsCarrier.id,
      service_no: paramTransactionsCarrier.service_no || 'N/A',
      departure_date: dayjs(paramTransactionsCarrier.day).format(DATE_FORMAT.YYYYMMDD),
      giai: paramTransactionsCarrier.giai,
      departure_time: formatTimeHHMM(paramTransactionsCarrier.departure_time_min),
      collection_time_from: subtractHours(
        paramTransactionsCarrier.departure_time_min,
        paramTransactionsCarrier.cut_off_time || 1,
      ),
      collection_time_to: formatTimeHHMM(paramTransactionsCarrier.departure_time_min),
      price: paramTransactionsCarrier.price,
      cid: cid,
      carrier_code: paramTransactionsCarrier.operator_code,
      shipper_code: shipperCode,
      isNotIX: process.env.NEXT_PUBLIC_IS_NOT_IX !== 'false' ? true : false,
      negotiation: {
        arrival_date: paramTransactionsCarrier.arrival_date
          ? dayjs(paramTransactionsCarrier.arrival_date).format(DATE_FORMAT.YYYYMMDD)
          : dayjs(paramTransactionsCarrier.day).format(DATE_FORMAT.YYYYMMDD),
        departure_date: paramTransactionsCarrier.departure_date
          ? dayjs(paramTransactionsCarrier.departure_date).format(DATE_FORMAT.YYYYMMDD)
          : dayjs(paramTransactionsCarrier.day).format(DATE_FORMAT.YYYYMMDD),
        cut_off_time: paramTransactionsCarrier.cut_off_time || 0,
        cut_off_fee: paramTransactionsCarrier.cut_off_fee || 0,
        price: paramTransactionsCarrier.price,
        collection_time_from: subtractHours(
          paramTransactionsCarrier.departure_time_min,
          paramTransactionsCarrier.cut_off_time || 1,
        ),
        collection_time_to: formatTimeHHMM(paramTransactionsCarrier.departure_time_min),
      },
    };
    try {
      const response = await transactionApi.apiAth0211(params);
      if (!response?.data?.id) {
        dispatch(
          actions.appAction.showNotification({
            type: ENotificationType.ERROR,
            title: gTxt('MESSAGES.FAILED'),
            content: gTxt('MESSAGES.FAILED'),
          }),
        );
        return;
      }
      openModal('modalRequestComplete');
      dispatch(actions.appAction.setReloadPage({ key: ROUTER_ID.SHIPPER_DASHBOARD_CONFIRMATION, value: true }));
      dispatch(actions.appAction.setReloadPage({ key: ROUTER_ID.SHIPPER_DASHBOARD_NEGOTIATION, value: true }));
      Promise.all([
        fetchDataShipperMarket({ month: selectedMonth }),
        fetchDataShipperSale(objectToQueryParamsNoEncode(searchParams)),
      ]);
    } catch (error) {
      console.error('Error in useEffect:', error);
    } finally {
      closeModal('modalConfirmRequest');
    }
  };

  useEffect(() => {
    reloadMenu &&
      reloadMenu == ROUTER_ID.SHIPPER_DASHBOARD_TRADING &&
      Promise.all([
        fetchDataShipperMarket({ month: selectedMonth }),
        fetchDataShipperSale(objectToQueryParamsNoEncode(searchParams)),
      ]);
    dispatch(actions.appAction.setReloadMenu(''));
  }, [reloadMenu]);

  const viewList = () => {
    return (
      <div className='space-y-2 py-4'>
        {isLoading && Array.from({ length: PAGE_SIZE }).map((_, index) => <ItemSkeleton key={index} />)}
        {!isLoading &&
          dataTransportSale &&
          dataTransportSale.map((item, rowIndex) => (
            <ItemTrading key={rowIndex} dataItem={item} showDetail={showDetail} />
          ))}
        {totalPage > 0 && (
          <div className='mt-4'>
            <CmnPagination totalPage={totalPage} currentPage={currentPage} onPageChange={onPageChange} />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className='bg-white p-4' id={ROUTER_ID.SHIPPER_DASHBOARD_TRADING}>
        <h1>{gTxt('MENU.SHIPPER.TRADING')}</h1>
        <p className='text-xs py-0.5'>キャリアの運送能力の市場情報が確認できます。</p>
        <div className='flex items-center my-2 gap-6'>
          <CmnDropdown
            title='ビュー選択'
            classNameWrap='w-[8.6875rem] min-w-[8.6875rem]'
            size='md'
            items={TRADING_VIEW_MODE}
            defaultSelectedKeys={String(viewMode)}
            onChange={(e) => setViewMode(Number(e.target.value))}
            color='warning'
          ></CmnDropdown>

          <CmnCheckboxGroup
            classNameWrap='ml-3 mt-8'
            onChange={(value: string[]) => {
              handleTemperatureRange(value);
            }}
            title=''
            option={TEMPERATURE_RANGE_LIST.filter((t) => t.key == '1')}
          />
        </div>

        <div className='mt-8 py-4'>
          <CmnCalendar
            isLoading={isLoading}
            data={dataCalendars}
            setMonthCalendar={handleChangeMonth}
            viewList={viewList()}
            viewMode={viewMode}
          />
        </div>
      </div>
      {/* modal detail in view list */}
      <CmnModal isOpen={modals.modalDetail} onClose={() => closeModal('modalDetail')} size='4xl' placement='center'>
        <ModalDetail
          onClose={() => closeModal('modalDetail')}
          onSubmit={() => fetchDataPropose(dataTransportSaleDetail)}
          dataItem={dataTransportSaleDetail}
        />
      </CmnModal>

      {/* modal detail matching */}
      <CmnModal
        isOpen={modals.modalDetailMatching}
        onClose={() => closeModal('modalDetailMatching')}
        customSize={{ width: '1261px', marginTop: '0px' }}
        size='custom'
        placement='center'
      >
        <ModalDataPropose
          onClose={() => closeModal('modalDetailMatching')}
          onSubmit={() => {
            closeModal('modalDetailMatching');
            openModal('modalDetail');
          }}
          checkDetailMatching={showModalDetailMatchingTransport}
          dataItem={dataPropose}
          dataTransportSaleDetail={dataTransportSaleDetail}
        />
      </CmnModal>

      {/* modal detail matching transport */}
      <CmnModal
        isOpen={modals.modalDetailMatchingTransport}
        onClose={() => closeModal('modalDetailMatchingTransport')}
        size='4xl'
        placement='center'
      >
        <ModalDetailMatchingTransport
          onClose={() => closeModal('modalDetailMatchingTransport')}
          onSubmit={showModalConfirmRequest}
          dataItem={dataDetailMatchingTransport}
        />
      </CmnModal>

      {/* modal confirm request */}
      <CmnModal
        isOpen={modals.modalConfirmRequest}
        onClose={() => closeModal('modalConfirmRequest')}
        size='custom'
        customSize={{ width: '734px', marginTop: '0px' }}
        placement='center'
      >
        <ModalConfirmRequest
          onClose={() => closeModal('modalConfirmRequest')}
          onSubmit={handleConfirmMatching}
          dataItem={dataDetailMatchingTransport}
          cutOffInfos={cutOffInfos}
          dataTransportSaleDetail={dataTransportSaleDetail}
        />
      </CmnModal>

      {/* modal request success */}
      <CmnModal
        isOpen={modals.modalRequestComplete}
        onClose={() => closeModal('modalRequestComplete')}
        size='custom'
        customSize={{ width: '475px', marginTop: '0px' }}
        placement='center'
      >
        <ModalRequestComplete
          onClose={() => closeModal('modalRequestComplete')}
          dataItem={dataDetailMatchingTransport}
        />
      </CmnModal>
    </>
  );
};

export default TradingBoardPage;
