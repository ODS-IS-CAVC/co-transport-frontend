'use client';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import CmnCalendar from '@/components/common/CmnCalendar';
import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import CmnDropdown from '@/components/common/CmnDropdown';
import { CmnPagination } from '@/components/common/CmnPagination';
import MatchingItem from '@/components/pages/carrier/board/MatchingItem';
import MatchingItemSkeleton from '@/components/pages/carrier/board/MatchingItemSkeleton';
import {
  DEFAULT_CURRENT_PAGE,
  DEFAULT_TOTAL_PAGE,
  TEMPERATURE_RANGE_LIST,
  TRADING_VIEW_MODE,
} from '@/constants/common';
import { PAGE_SIZE } from '@/constants/constants';
import { ROUTER_ID } from '@/constants/router/router';
import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import { objectToQueryParamsNoEncode } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { RootState } from '@/redux/store';
import { priceService } from '@/services/transaction/price';
import { transportService } from '@/services/transaction/transport';
import { ENotificationType, IDataCalender } from '@/types/app';
import { ITransportMatching } from '@/types/carrier/transport';

const TradingBoard = () => {
  const [viewMode, setViewMode] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSales, setDataSales] = useState<ITransportMatching[]>([]);
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [totalPage, setTotalPage] = useState(DEFAULT_TOTAL_PAGE);
  const [selectedMonth, setSelectedMonth] = useState<string>(dayjs().format('YYYYMM'));
  const [dataCalendars, setDataCalendars] = useState<IDataCalender[]>([]);
  const [searchParams, setSearchParams] = useState({
    page: currentPage,
    limit: PAGE_SIZE,
    freeWord: '',
    temperatureRange: [] as string[],
    transType: [] as string[],
  });

  const dispatch = useAppDispatch();
  const priceApi = priceService();
  const transportApi = transportService();
  const reloadMenu = useAppSelector((state: RootState) => state.app.reloadMenu);

  useEffect(() => {
    Promise.all([
      fetchDataShipperMarket({ month: selectedMonth }),
      fetchDataTrading(objectToQueryParamsNoEncode(searchParams)),
    ]);
  }, []);

  useEffect(() => {
    reloadMenu &&
      reloadMenu == ROUTER_ID.CARRIER_DASHBOARD_TRADING &&
      Promise.all([
        fetchDataShipperMarket({ month: selectedMonth }),
        fetchDataTrading(objectToQueryParamsNoEncode(searchParams)),
      ]);
    dispatch(actions.appAction.setReloadMenu(''));
  }, [reloadMenu]);

  const fetchDataTrading = async (searchParams: string) => {
    setIsLoading(true);
    transportApi
      .apiAth031(searchParams)
      .then((response) => {
        setDataSales(response.data);
        setCurrentPage(response?.currentPage);
        setTotalPage(response?.totalPages);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        dispatch(
          actions.appAction.showNotification({
            type: ENotificationType.ERROR,
            title: gTxt('MESSAGES.FAILED'),
            content: gTxt('MESSAGES.FAILED'),
          }),
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchDataShipperMarket = async ({ month }: { month?: string }) => {
    setIsLoading(true);
    setDataCalendars([]);
    priceApi
      .shipperMarket(month ?? selectedMonth)
      .then((response) => {
        setDataCalendars(response?.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        dispatch(
          actions.appAction.showNotification({
            type: ENotificationType.ERROR,
            title: gTxt('MESSAGES.FAILED'),
            content: gTxt('MESSAGES.FAILED'),
          }),
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleChangeMonth = (month: string) => {
    fetchDataShipperMarket({ month });
    setSelectedMonth(month);
  };

  const onPageChange = (page: number) => {
    const newSearchParams = { ...searchParams, page: page };
    setSearchParams(newSearchParams);
    fetchDataTrading(objectToQueryParamsNoEncode(newSearchParams));
  };

  const handleTemperatureRange = (value: string[]) => {
    const newSearchParams = {
      ...searchParams,
      page: DEFAULT_CURRENT_PAGE,
      temperatureRange: [...value],
    };
    setSearchParams(newSearchParams);

    fetchDataTrading(objectToQueryParamsNoEncode(newSearchParams));
    fetchDataShipperMarket({ month: selectedMonth });
  };

  const handleSearchCarrier = (value: string[]) => {
    const newSearchParams = {
      ...searchParams,
      page: DEFAULT_CURRENT_PAGE,
      transType: [...value],
    };
    setSearchParams(newSearchParams);

    fetchDataTrading(objectToQueryParamsNoEncode(newSearchParams));
    fetchDataShipperMarket({ month: selectedMonth });
  };

  const viewList = () => {
    return (
      <div className='mt-4 space-y-2'>
        {isLoading &&
          Array(5)
            .fill(0)
            .map((_, _index) => <MatchingItemSkeleton key={_index} />)}
        {!isLoading &&
          dataSales?.length > 0 &&
          dataSales.map((item: ITransportMatching, index: number) => (
            <MatchingItem key={index} item={item} type='trading' />
          ))}
        <div className='mt-4'>
          {totalPage > 0 && (
            <CmnPagination totalPage={totalPage} currentPage={currentPage} onPageChange={onPageChange} />
          )}
        </div>
      </div>
    );
  };

  console.log('TradingBoard', dataSales);

  return (
    <>
      <div id={ROUTER_ID.CARRIER_DASHBOARD_TRADING} className='scroll-mt-20'>
        <div className='bg-white p-3'>
          <h1>{gTxt('MENU.CARRIER.TRADING')}</h1>
          <p className='mt-4 text-xs py-0.5'>キャリアの運送能力の市場情報が確認できます。</p>
          <div className='flex items-center my-2 gap-6'>
            <CmnDropdown
              title='ビュー選択'
              classNameWrap='w-[8.6875rem] min-w-[8.6875rem]'
              size='md'
              items={TRADING_VIEW_MODE}
              defaultSelectedKeys={String(viewMode)}
              onChange={(e) => setViewMode(Number(e.target.value))}
              color='warning'
            />
            <CmnCheckboxGroup
              classNameWrap='ml-3 mt-8'
              onChange={(value: string[]) => {
                handleTemperatureRange(value);
              }}
              option={TEMPERATURE_RANGE_LIST.slice(1, 2)}
            />
            <CmnCheckboxGroup
              classNameWrap='ml-3 mt-8'
              onChange={(value: string[]) => {
                handleSearchCarrier(value);
              }}
              option={[
                {
                  key: '1',
                  label: 'キャリア間',
                  value: '1',
                },
              ]}
            />
          </div>
          <div className='my-4 space-y-2'>
            {!dataCalendars && <div className='px-4 py-40 text-center'>{gTxt('COMMON.NO_RECORD_FOUND')}</div>}
            {dataCalendars && (
              <CmnCalendar
                isLoading={isLoading}
                data={dataCalendars}
                setMonthCalendar={handleChangeMonth}
                viewList={viewList()}
                viewMode={viewMode}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TradingBoard;
