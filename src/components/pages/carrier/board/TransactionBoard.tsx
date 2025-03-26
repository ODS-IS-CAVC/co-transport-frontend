'use client';

import { Button } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import CmnInput from '@/components/common/CmnInput';
import { CmnPagination } from '@/components/common/CmnPagination';
import MatchingItem from '@/components/pages/carrier/board/MatchingItem';
import MatchingItemSkeleton from '@/components/pages/carrier/board/MatchingItemSkeleton';
import {
  ADVANCE_STATUS_LIST,
  DEFAULT_CURRENT_PAGE,
  DEFAULT_TOTAL_PAGE,
  TEMPERATURE_RANGE_LIST,
} from '@/constants/common';
import { PAGE_SIZE } from '@/constants/constants';
import { ROUTER_ID } from '@/constants/router/router';
import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import { objectToQueryParamsNoEncode } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { RootState } from '@/redux/store';
import { transactionService } from '@/services/transaction/transaction';
import { ENotificationType } from '@/types/app';
import { ITransportMatching } from '@/types/carrier/transport';

interface ReactHookForm {
  freeWord: string;
  temperatureRange: number[];
  advanceStatus: string[];
  transType: string[];
  isEmergency: string[];
}

const TransactionBoard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dataMatching, setDataMatching] = useState<ITransportMatching[]>([]);
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [totalPages, setTotalPages] = useState(DEFAULT_TOTAL_PAGE);

  const dispatch = useAppDispatch();
  const transactionApi = transactionService();
  const [searchParams, setSearchParams] = useState({
    status: 'confirm',
    page: currentPage,
    limit: PAGE_SIZE,
    freeWord: '',
    temperatureRange: [] as number[],
    advanceStatus: [] as string[],
    transType: [] as string[],
    isEmergency: [] as string[],
  });
  const reloadMenu = useAppSelector((state: RootState) => state.app.reloadMenu);

  useEffect(() => {
    fetchTransaction(objectToQueryParamsNoEncode(searchParams));
  }, []);

  useEffect(() => {
    reloadMenu &&
      reloadMenu == ROUTER_ID.CARRIER_DASHBOARD_CONFIRMATION &&
      fetchTransaction(objectToQueryParamsNoEncode(searchParams));
    dispatch(actions.appAction.setReloadMenu(''));
  }, [reloadMenu]);

  const fetchTransaction = async (searchParams: string) => {
    setIsLoading(true);
    transactionApi
      .apiAth018(searchParams)
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

    fetchTransaction(objectToQueryParamsNoEncode(newSearchParams));
  };

  const handleSearch = () => {
    fetchTransaction(objectToQueryParamsNoEncode(searchParams));
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
      advanceStatus: [],
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
      advanceStatus: data.advanceStatus,
      transType: data.transType,
      isEmergency: data.isEmergency,
    };

    setSearchParams(newSearchParams);
    fetchTransaction(objectToQueryParamsNoEncode(newSearchParams));
  };
  const handleEmergency = async (ids: number[], remove: boolean) => {
    try {
      const res = await transactionApi.apiAth034(ids, remove);
      if (!res || !res.data) {
        dispatch(
          actions.appAction.showNotification({
            type: ENotificationType.ERROR,
            title: gTxt('MESSAGES.FAILED'),
            content: gTxt('MESSAGES.FAILED'),
          }),
        );
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      dispatch(
        actions.appAction.showNotification({
          type: ENotificationType.ERROR,
          title: gTxt('MESSAGES.FAILED'),
          content: gTxt('MESSAGES.FAILED'),
        }),
      );
    }
  };

  console.log('TransactionBoard', dataMatching);

  return (
    <>
      <div id={ROUTER_ID.CARRIER_DASHBOARD_CONFIRMATION}>
        <div className='bg-white p-3'>
          <h1>{gTxt('MENU.CARRIER.CONFIRMATION')}</h1>
          <p className='text-xs mt-8'>契約が確定した運送能力です。</p>
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
                  setValue('temperatureRange', value.map(Number));
                  onSubmit({ ...searchParams, temperatureRange: value.map(Number) });
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
              <CmnCheckboxGroup
                name='transType'
                onChange={(value: string[]) => {
                  setValue('isEmergency', value);
                  onSubmit({ ...searchParams, isEmergency: value });
                }}
                title=''
                option={[
                  {
                    key: '1',
                    label: '緊急',
                    value: '1',
                  },
                ]}
              />
            </div>
            <CmnCheckboxGroup
              classNameWrap='ml-3 mt-4'
              onChange={(value: string[]) => {
                setValue('advanceStatus', value.map(String));
                onSubmit({ ...searchParams, advanceStatus: value });
              }}
              title=''
              option={ADVANCE_STATUS_LIST}
            />
          </form>

          <div className='mt-8 space-y-4'>
            {isLoading &&
              Array(5)
                .fill(0)
                .map((_, _index) => <MatchingItemSkeleton key={_index} />)}
            {!isLoading &&
              dataMatching &&
              dataMatching.map((item: ITransportMatching, index: number) => (
                <MatchingItem
                  key={index}
                  item={item}
                  type={'transaction'}
                  onRefetch={handleSearch}
                  handleEmergency={handleEmergency}
                />
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

export default TransactionBoard;
