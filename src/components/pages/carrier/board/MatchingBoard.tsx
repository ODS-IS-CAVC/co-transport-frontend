'use client';

import { Button } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import CmnInput from '@/components/common/CmnInput';
import { CmnPagination } from '@/components/common/CmnPagination';
import MatchingItem from '@/components/pages/carrier/board/MatchingItem';
import MatchingItemSkeleton from '@/components/pages/carrier/board/MatchingItemSkeleton';
import { DEFAULT_CURRENT_PAGE, DEFAULT_TOTAL_PAGE, TEMPERATURE_RANGE_LIST } from '@/constants/common';
import { PAGE_SIZE } from '@/constants/constants';
import { ROUTER_ID } from '@/constants/router/router';
import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import { objectToQueryParamsNoEncode } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { RootState } from '@/redux/store';
import { transportService } from '@/services/transaction/transport';
import { ENotificationType } from '@/types/app';
import { ITransportMatching } from '@/types/carrier/transport';

interface ReactHookForm {
  freeWord: string;
  temperatureRange: string[];
  transType: string[];
  isEmergency: string[];
}

const MatchingBoard = () => {
  const transportApi = transportService();
  const [isLoading, setIsLoading] = useState(false);
  const [dataMatching, setDataMatching] = useState<ITransportMatching[]>([]);
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [totalPages, setTotalPages] = useState(DEFAULT_TOTAL_PAGE);
  const [searchParams, setSearchParams] = useState({
    page: currentPage,
    limit: PAGE_SIZE,
    freeWord: '',
    temperatureRange: [] as string[],
    transType: [] as string[],
    isEmergency: [] as string[],
  });

  const dispatch = useAppDispatch();
  const reloadMenu = useAppSelector((state: RootState) => state.app.reloadMenu);

  useEffect(() => {
    fetchMatchingData(objectToQueryParamsNoEncode(searchParams));
  }, []);

  useEffect(() => {
    reloadMenu &&
      reloadMenu == ROUTER_ID.CARRIER_DASHBOARD_NEGOTIATION &&
      fetchMatchingData(objectToQueryParamsNoEncode(searchParams));
    dispatch(actions.appAction.setReloadMenu(''));
  }, [reloadMenu]);

  const fetchMatchingData = async (searchParams: string) => {
    setIsLoading(true);
    transportApi
      .apiAth012(searchParams)
      .then((response) => {
        setDataMatching(response.data);
        setCurrentPage(response.currentPage);
        setTotalPages(response.totalPages);
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

  const onPageChange = (page: number) => {
    const newSearchParams = {
      ...searchParams,
      page: page,
    };
    setSearchParams(newSearchParams);

    fetchMatchingData(objectToQueryParamsNoEncode(newSearchParams));
  };

  const handleSearch = () => {
    fetchMatchingData(objectToQueryParamsNoEncode(searchParams));
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<ReactHookForm>({
    mode: 'all',
    defaultValues: {
      freeWord: '',
      temperatureRange: [],
      transType: [],
      isEmergency: [],
    },
  });

  const onSubmit = (data: ReactHookForm) => {
    const newSearchParams = {
      ...searchParams,
      page: DEFAULT_CURRENT_PAGE,
      freeWord: data.freeWord,
      temperatureRange: data.temperatureRange,
      transType: data.transType,
      isEmergency: data.isEmergency,
    };

    setSearchParams(newSearchParams);
    fetchMatchingData(objectToQueryParamsNoEncode(newSearchParams));
  };
  console.log('MatchingBoard', dataMatching);

  return (
    <>
      <div id={ROUTER_ID.CARRIER_DASHBOARD_NEGOTIATION}>
        <div className='bg-white p-3'>
          <h1>{gTxt('MENU.CARRIER.NEGOTIATION')}</h1>
          <p className='text-xs mt-3'>シッパーと交渉中の運送能力です。</p>
          <form onSubmit={handleSubmit(onSubmit)} key={`form-search-matching`}>
            <div className='flex mt-8 w-[22.8125rem] relative'>
              <CmnInput classNameWrap='w-full [&>div>div>div]:h-8' size='sm' name='freeWord' register={register} />
              <Button
                size='sm'
                className='font-medium h-8 w-[4.0625rem] text-center text-neutral text-base leading-normal rounded-l-none absolute right-0'
                color='primary'
                radius='sm'
                type='submit'
              >
                検索
              </Button>
            </div>
            <div className='flex items-center ml-3 mt-8'>
              <CmnCheckboxGroup
                name='temperatureRange'
                onChange={(value: string[]) => {
                  setValue('temperatureRange', value);
                  onSubmit({ ...searchParams, temperatureRange: value });
                }}
                title=''
                option={TEMPERATURE_RANGE_LIST.slice(1, 2)}
              />
              <CmnCheckboxGroup
                name='transType'
                onChange={(value: string[]) => {
                  setValue('transType', value);
                  onSubmit({ ...searchParams, transType: value });
                }}
                title=''
                option={[
                  {
                    key: '1',
                    label: 'キャリア間',
                    value: '1',
                  },
                ]}
              />
            </div>
          </form>

          <div className='mt-4 space-y-2'>
            {isLoading &&
              Array(5)
                .fill(0)
                .map((_, _index) => <MatchingItemSkeleton key={_index} />)}
            {!isLoading &&
              dataMatching &&
              dataMatching.map((item: ITransportMatching, index: number) => (
                <MatchingItem key={index} item={item} onRefetch={handleSearch} type='matching' />
              ))}
            {!dataMatching && <div className='px-4 py-40 text-center'>{gTxt('COMMON.NO_RECORD_FOUND')}</div>}
            <div className='mt-4'>
              {totalPages > 0 && (
                <CmnPagination totalPage={totalPages} currentPage={currentPage} onPageChange={onPageChange} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MatchingBoard;
