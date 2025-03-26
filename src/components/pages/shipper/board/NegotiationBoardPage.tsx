'use client';

import { Button } from '@nextui-org/react';
import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import CmnInput from '@/components/common/CmnInput';
import { CmnPagination } from '@/components/common/CmnPagination';
import Loading from '@/components/common/Loading';
import CmnModal from '@/components/common/modal/CmnModal';
import ItemSkeleton from '@/components/pages/shipper/board/ItemSkeleton';
import { DEFAULT_CURRENT_PAGE, DEFAULT_TOTAL_PAGE, TEMPERATURE_RANGE_LIST } from '@/constants/common';
import { DATE_FORMAT, PAGE_SIZE } from '@/constants/constants';
import { KEY_COOKIE_COMPANY_CODE, KEY_COOKIE_USER_ID } from '@/constants/keyStorage';
import { ROUTER, ROUTER_ID } from '@/constants/router/router';
import useModals from '@/hook/useModals';
import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import { objectToQueryParamsNoEncode } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { RootState } from '@/redux/store';
import { transactionService } from '@/services/transaction/transaction';
import { transportService } from '@/services/transaction/transport';
import { ENotificationType } from '@/types/app';
import { CutOffInfoType, ParamTransactionMatching } from '@/types/shipper/transaction';
import { ITransportMatching } from '@/types/shipper/transport';

import Item from './Item';
import ModalConfirmRequest from './modal/negotiation/ModalConfirmRequest';
import ModalDetail from './modal/negotiation/ModalDetail';
import ModalDetailMatching from './modal/negotiation/ModalDetailMatching';
import ModalDetailMatchingTransport from './modal/negotiation/ModalDetaiMatchingTransport';
import ModalRequestComplete from './modal/negotiation/ModalRequestComplete';

interface ReactHookForm {
  freeWord: string;
}

const NegotiationBoardPage = () => {
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [totalPage, setTotalPage] = useState(DEFAULT_TOTAL_PAGE);

  const [dataNegotiations, setDataNegotiations] = useState<ITransportMatching[]>([]);
  const [dataDetail, setDataDetail] = useState<ITransportMatching[]>();
  const [dataDetailMatchingTransport, setDataDetailMatchingTransport] = useState<ITransportMatching>();
  const [cutOffInfos, setCutOffInfos] = useState<CutOffInfoType[]>();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  const [idConfirmMatching, setIdConfirmMatching] = useState<number>(0);
  const dispatch = useAppDispatch();
  const reloadPage = useAppSelector((state: RootState) => state.app.reloadPage);
  const reloadMenu = useAppSelector((state: RootState) => state.app.reloadMenu);

  const { modals, openModal, closeModal } = useModals({
    modalDetail: false,
    modalDetailMatching: false,
    modalDetailMatchingTransport: false,
    modalConfirmRequest: false,
    modalRequestComplete: false,
  });

  const transportApi = transportService();
  const transactionApi = transactionService();
  const router = useRouter();

  const [searchParams, setSearchParams] = useState({
    page: currentPage,
    limit: PAGE_SIZE,
    freeWord: '',
    temperatureRange: [] as string[],
  });

  useEffect(() => {
    fetchDataShipperTransportPlan(objectToQueryParamsNoEncode(searchParams));
  }, []);

  useEffect(() => {
    reloadMenu &&
      reloadMenu == ROUTER_ID.SHIPPER_DASHBOARD_NEGOTIATION &&
      fetchDataShipperTransportPlan(objectToQueryParamsNoEncode(searchParams));
    dispatch(actions.appAction.setReloadMenu(''));
  }, [reloadMenu]);

  const fetchDataShipperTransportPlan = async (searchParams: string) => {
    try {
      setIsLoading(true);
      const response = await transportApi.apiAth001(searchParams);
      setDataNegotiations(response?.data);
      setCurrentPage(response?.currentPage);
      setTotalPage(response?.totalPages);
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
    setIsLoading(false);
    dispatch(actions.appAction.resetReloadPage());
  };

  const fetchDataShipperTransportPlanDetail = async (id: number) => {
    try {
      const response = await transportApi.apiAth002(id);
      setDataDetail(response.data);
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
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

    fetchDataShipperTransportPlan(
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

    fetchDataShipperTransportPlan(
      objectToQueryParamsNoEncode({
        ...searchParams,
        page: DEFAULT_CURRENT_PAGE,
        temperatureRange: [...value],
      }),
    );
  };

  const showDetail = (id: number) => {
    setIdConfirmMatching(id);
    fetchDataShipperTransportPlanDetail(id);
    openModal('modalDetail');
  };

  const showModalDetailMatching = (id?: number) => {
    if (typeof id === 'number' && !isNaN(id)) {
      fetchDataShipperTransportPlanDetail(id);
      setIdConfirmMatching(id);
    }
    closeModal('modalDetail');
    openModal('modalDetailMatching');
  };

  const showModalDetailMatchingTransport = (id: number) => {
    setDataDetailMatchingTransport(dataDetail?.find((d) => d.id === id));
    closeModal('modalDetailMatching');
    openModal('modalDetailMatchingTransport');
  };

  const showModalConfirmRequest = (id: number) => {
    fetchCutOffInfos(id);
    openModal('modalConfirmRequest');
    closeModal('modalDetailMatchingTransport');
  };

  const handleConfirmMatching = async (data: ITransportMatching | undefined) => {
    if (!idConfirmMatching || !data) return;
    const cid = getCookie(KEY_COOKIE_COMPANY_CODE) as string;
    const shipperCode = getCookie(KEY_COOKIE_USER_ID) as string;
    const params: ParamTransactionMatching = {
      id: data.id,
      negotiation: {
        arrival_date: data.propose_snapshot.arrival_date
          ? dayjs(data.propose_snapshot.arrival_date).format(DATE_FORMAT.YYYYMMDD)
          : dayjs(data.propose_snapshot.day).format(DATE_FORMAT.YYYYMMDD),
        departure_date: data.propose_snapshot.departure_date
          ? dayjs(data.propose_snapshot.departure_date).format(DATE_FORMAT.YYYYMMDD)
          : dayjs(data.propose_snapshot.day).format(DATE_FORMAT.YYYYMMDD),
        cut_off_time: data.propose_snapshot.cut_off_time,
        cut_off_fee: data.propose_snapshot.cut_off_fee,
        price: data.propose_snapshot.price,
      },
      cid: cid,
      carrier_code: data.carrier_operator_code,
      shipper_code: shipperCode,
      isNotIX: process.env.NEXT_PUBLIC_IS_NOT_IX !== 'false' ? true : false,
    };

    try {
      const response = await transactionApi.apiAth008(params);
      if (!response.data) {
        dispatch(
          actions.appAction.showNotification({
            type: ENotificationType.ERROR,
            title: gTxt('MESSAGES.FAILED'),
            content: gTxt('MESSAGES.FAILED'),
          }),
        );
        return;
      }
      // refresh list data
      fetchDataShipperTransportPlan(objectToQueryParamsNoEncode(searchParams));
      openModal('modalRequestComplete');
      dispatch(actions.appAction.setReloadPage({ key: ROUTER_ID.SHIPPER_DASHBOARD_CONFIRMATION, value: true }));
    } catch (error) {
      console.error('Error in useEffect:', error);
      dispatch(
        actions.appAction.showNotification({
          type: ENotificationType.ERROR,
          title: gTxt('MESSAGES.FAILED'),
          content: gTxt('MESSAGES.FAILED'),
        }),
      );
    } finally {
      closeModal('modalConfirmRequest');
    }
  };

  const returnPageConfirm = () => {
    closeModal('modalRequestComplete');
    router.push(ROUTER.SHIPPER);
  };

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
    fetchDataShipperTransportPlan(objectToQueryParamsNoEncode(newSearchParams));
  };

  useEffect(() => {
    if (!reloadPage[ROUTER_ID.SHIPPER_DASHBOARD_CONFIRMATION]) return;
    fetchDataShipperTransportPlan(objectToQueryParamsNoEncode(searchParams));
  }, [reloadPage]);

  return (
    <>
      {isLoadingDetail && <Loading />}
      <div className='bg-white p-4 scroll-mt-20' id={ROUTER_ID.SHIPPER_DASHBOARD_NEGOTIATION}>
        <h1>{gTxt('MENU.SHIPPER.NEGOTIATION')}</h1>
        <p className='mt-4 text-xs'>交渉中の輸送計画の確認が行えます。</p>
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

        <div className='mt-4 space-y-2 py-4'>
          {isLoading &&
            Array(5)
              .fill(0)
              .map((_, _index) => <ItemSkeleton key={_index} />)}
          {!isLoading &&
            dataNegotiations &&
            dataNegotiations.map((item, rowIndex) => (
              <Item
                key={rowIndex}
                dataItem={item}
                showDetail={showDetail}
                showDetailMatching={showModalDetailMatching}
                isNegotiationPage
              />
            ))}
          <div className='mt-4'>
            {totalPage > 0 && (
              <CmnPagination
                totalPage={totalPage}
                currentPage={currentPage}
                onPageChange={onPageChange}
              ></CmnPagination>
            )}
          </div>
        </div>
      </div>

      {/* modal detail */}
      <CmnModal isOpen={modals.modalDetail} onClose={() => closeModal('modalDetail')} size='4xl' placement='center'>
        <ModalDetail
          onClose={() => closeModal('modalDetail')}
          onSubmit={showModalDetailMatching}
          dataItem={dataDetail}
        />
      </CmnModal>

      {/* modal detail matching */}
      <CmnModal
        isOpen={modals.modalDetailMatching}
        onClose={() => {
          closeModal('modalDetailMatching');
        }}
        customSize={{ width: '1261px', marginTop: '0px' }}
        size='custom'
        placement='center'
      >
        <ModalDetailMatching
          onClose={() => {
            closeModal('modalDetailMatching');
          }}
          onSubmit={() => {
            closeModal('modalDetailMatching');
            openModal('modalDetail');
          }}
          checkDetailMatching={showModalDetailMatchingTransport}
          dataItem={dataDetail}
          setIsLoadingDetail={setIsLoadingDetail}
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
        <ModalRequestComplete onClose={returnPageConfirm} dataItem={dataDetailMatchingTransport} />
      </CmnModal>
    </>
  );
};

export default NegotiationBoardPage;
