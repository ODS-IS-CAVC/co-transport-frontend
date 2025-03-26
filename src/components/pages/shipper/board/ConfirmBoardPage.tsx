'use client';

import { Button } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import CmnInput from '@/components/common/CmnInput';
import { CmnPagination } from '@/components/common/CmnPagination';
import CmnModal from '@/components/common/modal/CmnModal';
import ItemSkeleton from '@/components/pages/shipper/board/ItemSkeleton';
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
import { CombinedTransactionDetail, ITransactionShipper } from '@/types/shipper/transaction';

import Item from './Item';
import ModalDetail from './modal/confirmation/ModalDetail';
import ModalDetailTransaction from './modal/confirmation/ModalDetailTransaction';

interface ConfirmBoardPageProps {
  refreshData: boolean;
  reSetFreshData: () => void;
}

interface ReactHookForm {
  freeWord: string;
}

const ConfirmBoardPage = () => {
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [totalPage, setTotalPage] = useState(DEFAULT_TOTAL_PAGE);

  const [dataConfirms, setDataConfirms] = useState<ITransactionShipper[]>([]);

  const [isShowDetail, setIsShowDetail] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isShowModalDetailTransaction, setIsShowModalDetailTransaction] = useState(false);
  const [dataDetail, setDataDetail] = useState<CombinedTransactionDetail>();
  const transactionApi = transactionService();
  const reloadPage = useAppSelector((state: RootState) => state.app.reloadPage);
  const reloadMenu = useAppSelector((state: RootState) => state.app.reloadMenu);
  const dispatch = useAppDispatch();

  const [searchParams, setSearchParams] = useState({
    page: currentPage,
    limit: PAGE_SIZE,
    freeWord: '',
    temperatureRange: [] as string[],
    status: 'confirm',
    advanceStatus: [] as string[],
  });

  useEffect(() => {
    fetchDataShipperTransaction(objectToQueryParamsNoEncode(searchParams));
  }, []);

  const fetchDataShipperTransaction = async (searchParam: string) => {
    try {
      setIsLoading(true);
      const response = await transactionApi.apiAth007(searchParam);
      setDataConfirms(response?.data);
      setCurrentPage(response?.currentPage);
      setTotalPage(response?.totalPages);
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
    setIsLoading(false);
    dispatch(actions.appAction.resetReloadPage());
  };

  const fetchDataShipperTransactionDetail = async (id: number) => {
    try {
      const response = await transactionApi.apiAth023(id);
      setDataDetail(response.data);
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  };

  const onPageChange = (page: number) => {
    setSearchParams({
      ...searchParams,
      page: page,
    });

    fetchDataShipperTransaction(
      objectToQueryParamsNoEncode({
        ...searchParams,
        page: page,
      }),
    );
  };

  const handleTemperatureRange = (value: string[]) => {
    setSearchParams({
      ...searchParams,
      page: DEFAULT_CURRENT_PAGE,
      temperatureRange: [...value],
    });

    fetchDataShipperTransaction(
      objectToQueryParamsNoEncode({
        ...searchParams,
        page: DEFAULT_CURRENT_PAGE,
        temperatureRange: [...value],
      }),
    );
  };

  const handleAdvanceStatus = (value: string[]) => {
    setSearchParams({
      ...searchParams,
      page: DEFAULT_CURRENT_PAGE,
      advanceStatus: [...value],
    });
    fetchDataShipperTransaction(
      objectToQueryParamsNoEncode({
        ...searchParams,
        page: DEFAULT_CURRENT_PAGE,
        advanceStatus: [...value],
      }),
    );
  };

  const showDetail = (id: number) => {
    fetchDataShipperTransactionDetail(id);
    setIsShowDetail(true);
  };

  const showModalDetailTransaction = () => {
    setIsShowModalDetailTransaction(true);
    setIsShowDetail(false);
  };

  const handleOnEventInModalDetail = (id?: number) =>
    id
      ? fetchDataShipperTransactionDetail(id)
      : fetchDataShipperTransaction(objectToQueryParamsNoEncode({ ...searchParams, page: 1 }));

  //fetch data confirmation again when matching in negotiation page
  useEffect(() => {
    if (!reloadPage[ROUTER_ID.SHIPPER_DASHBOARD_CONFIRMATION]) return;
    fetchDataShipperTransaction(objectToQueryParamsNoEncode(searchParams));
  }, [reloadPage]);

  useEffect(() => {
    reloadMenu &&
      reloadMenu == ROUTER_ID.SHIPPER_DASHBOARD_CONFIRMATION &&
      fetchDataShipperTransaction(objectToQueryParamsNoEncode(searchParams));
    dispatch(actions.appAction.setReloadMenu(''));
  }, [reloadMenu]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ReactHookForm>({
    mode: 'all',
    defaultValues: {
      freeWord: '',
    },
  });
  const onSubmit = (data: ReactHookForm) => {
    const newSearchParams = {
      ...searchParams,
      page: DEFAULT_CURRENT_PAGE,
      freeWord: data.freeWord,
    };
    setSearchParams(newSearchParams);
    fetchDataShipperTransaction(objectToQueryParamsNoEncode(newSearchParams));
  };

  return (
    <>
      <div className='bg-white p-4' id={ROUTER_ID.SHIPPER_DASHBOARD_CONFIRMATION}>
        <h1>{gTxt('MENU.SHIPPER.CONFIRMATION')}</h1>
        <p className='mt-4 text-xs'>取引が確定した輸送計画の確認が行えます。</p>
        <form onSubmit={handleSubmit(onSubmit)} key={`form-search-matching`}>
          <div className='flex mt-4 w-[22.8125rem] relative'>
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
        </form>

        <CmnCheckboxGroup
          classNameWrap='ml-3 mt-4'
          onChange={(value: string[]) => {
            handleTemperatureRange(value);
          }}
          title=''
          option={TEMPERATURE_RANGE_LIST.filter((t) => t.key == '1')}
        />

        <CmnCheckboxGroup
          classNameWrap='ml-3 mt-4'
          onChange={(value: string[]) => {
            handleAdvanceStatus(value);
          }}
          title=''
          option={ADVANCE_STATUS_LIST}
        />

        <div className='mt-4 space-y-2 py-4'>
          {isLoading &&
            Array(5)
              .fill(0)
              .map((_, _index) => <ItemSkeleton key={_index} />)}
          {!isLoading &&
            dataConfirms &&
            dataConfirms.map((item, rowIndex) => <Item key={rowIndex} dataItem={item} showDetail={showDetail} />)}
          {totalPage > 0 && (
            <div className='mt-4'>
              <CmnPagination
                totalPage={totalPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
              ></CmnPagination>
            </div>
          )}
        </div>
      </div>
      <CmnModal isOpen={isShowDetail} onClose={() => setIsShowDetail(false)} size='4xl' placement='center'>
        <ModalDetail
          onClose={() => setIsShowDetail(false)}
          onSubmit={showModalDetailTransaction}
          dataItem={dataDetail}
        />
      </CmnModal>

      {isShowModalDetailTransaction && (
        <ModalDetailTransaction
          handleOnEvent={handleOnEventInModalDetail}
          data={dataDetail}
          open={isShowModalDetailTransaction}
          onClose={() => setIsShowModalDetailTransaction(false)}
        />
      )}
    </>
  );
};

export default ConfirmBoardPage;
