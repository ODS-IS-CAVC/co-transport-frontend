'use client';

import { useState } from 'react';

import CmnCalendar from '@/components/common/CmnCalendar';
import { CmnPagination } from '@/components/common/CmnPagination';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { PAGE_SIZE } from '@/constants/constants';
import { useAppDispatch } from '@/hook/useRedux';
import { objectToQueryParamsNoEncode } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { priceService } from '@/services/transaction/price';
import { transportService } from '@/services/transaction/transport';
import { ENotificationType, IDataCalender } from '@/types/app';
import { ITransportMatching } from '@/types/carrier/transport';

import MatchingItem from '../board/MatchingItem';

interface MarketPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MarketPriceModal = (props: MarketPriceModalProps) => {
  const { isOpen, onClose } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataCalendars, setDataCalendars] = useState<IDataCalender[]>([]);
  const [dataSales, setDataSales] = useState<ITransportMatching[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const [viewMode, setViewMode] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const [searchParams, setSearchParams] = useState({
    page: currentPage,
    limit: PAGE_SIZE,
    freeWord: '',
    temperatureRange: '',
  });

  const currentMonth = `${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}`;

  const dispatch = useAppDispatch();
  const priceApi = priceService();
  const transportApi = transportService();

  const fetchTransportSale = async ({ search }: { search: string }) => {
    return await transportApi.apiAth031(search);
  };

  // useEffect(() => {
  //   fetchTransportSale({ search: '' }).then((response) => {
  //     setDataSales(response.data);
  //     setCurrentPage(response?.currentPage || 1);
  //     setTotalPage(response?.totalPages || 1);
  //   });
  //   fetchDataShipperMarket({ month: currentMonth });
  // }, []);

  const fetchMatching = async (searchParams: string) => {
    setIsLoading(true);
    transportApi
      .apiAth031(searchParams)
      .then((response) => {
        setDataSales(response.data);
        setCurrentPage(response?.currentPage || 1);
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
    try {
      const response = await priceApi.shipperMarket(month ?? selectedMonth);
      setDataCalendars(response?.data);
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
    setIsLoading(false);
  };

  const handleChangeMonth = (month: string) => {
    fetchDataShipperMarket({ month });
    setSelectedMonth(month);
  };

  const onPageChange = (page: number) => {
    const newSearchParams = { ...searchParams, page: page };
    setSearchParams(newSearchParams);
    fetchMatching(objectToQueryParamsNoEncode(newSearchParams));
  };

  const viewList = () => {
    return (
      <div className='mt-4 space-y-2'>
        {dataSales?.length > 0 &&
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

  return (
    <CmnModal isOpen={isOpen} placement='top' size='5xl' className='max-w-[1280px]  min-h-[700px]' onClose={onClose}>
      <CmnModalHeader title='市場価格' description='市場価格カレンダーを表示' className='flex flex-col p-8 gap-4' />
      <CmnModalBody className='flex flex-col text-xs p-8'>
        <CmnCalendar
          isLoading={isLoading}
          data={dataCalendars}
          setMonthCalendar={handleChangeMonth}
          viewList={viewList()}
          viewMode={viewMode}
        />
      </CmnModalBody>
      <CmnModalFooter
        buttonLeftFirst={{
          children: '閉じる',
          color: 'primary',
          variant: 'light',
          onPress: onClose,
          className: 'bg-[#e8f1fe] text-base font-bold text-primary border-none mt-6',
        }}
      ></CmnModalFooter>
    </CmnModal>
  );
};

export default MarketPriceModal;
