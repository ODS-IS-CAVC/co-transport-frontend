'use client';

import { Button, Spinner } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { CmnTabs } from '@/components/common/CmnTabs';
import Stepper from '@/components/common/Stepper';
import CompletedPage from '@/components/pages/carrier/board/detail/TransactionDetail/CompletedPage';
import ContractPage from '@/components/pages/carrier/board/detail/TransactionDetail/ContractPage';
import ModalMatchingCarrier from '@/components/pages/carrier/board/detail/TransactionDetail/ModalMatchingCarrier';
import OperationPage from '@/components/pages/carrier/board/detail/TransactionDetail/OperationPage';
import ReservationProposalPage from '@/components/pages/carrier/board/detail/TransactionDetail/ReservationProposalPage';
import SettlementPage from '@/components/pages/carrier/board/detail/TransactionDetail/SettlementPage';
import ModalAccept from '@/components/pages/carrier/board/Modal/ModalAccept';
import ModalCompanyInfo from '@/components/pages/carrier/board/Modal/ModalCompanyInfo';
import ModalDeny from '@/components/pages/carrier/board/Modal/ModalDeny';
import ModalSale from '@/components/pages/carrier/board/Modal/ModalSale';
import { mockAccount } from '@/constants/auth';
import { TransType } from '@/constants/common';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { TRANS_EVENT, TRANS_STEP } from '@/constants/transaction';
import useModals from '@/hook/useModals';
import { useAppDispatch } from '@/hook/useRedux';
import { Matching } from '@/lib/matching';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { transactionService } from '@/services/transaction/transaction';
import { ENotificationType } from '@/types/app';
import { UserInfo } from '@/types/auth';
import { IDetailTransaction, MESSAGE_TRANSACTIONS, subTrailerType } from '@/types/carrier/transactionInfo';

import DecideTransactionPage from '../detail/TransactionDetail/DecideTransactionPage';

interface DetailTransactionProps {
  id: number;
  subId: { id: number | null; isFirstTrailer: boolean };
  type: number;
  setIsChanged: (value: boolean) => void;
}

const DetailTransaction = ({ id, type, setIsChanged, subId }: DetailTransactionProps) => {
  const { modals, toggleModal } = useModals({
    modalAccept: false,
    modalDeny: false,
    modalCompanyInfo: false,
    modalSale: false,
    modalMatchingCarrierAndCarrier: false,
  });

  const dispatch = useAppDispatch();

  const [idActive, setIdActive] = useState(id);
  const [typeMode, setTypeMode] = useState(type);
  const [dataMatchingCarrier, setDataMatchingCarrier] = useState([] as any[]);
  const [isLoading, setIsLoading] = useState(false);
  const [sale, setSale] = useState<boolean>(false);
  const [hasMatchingCarrier, setHasMatchingCarrier] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState('update');
  const [isStatusChange, setIsStatusChange] = useState<boolean>(false);
  const [dataSuggest, setDataSuggest] = useState('');

  const [data, setData] = useState<IDetailTransaction>({} as IDetailTransaction);
  const [dataSubTrailer, setDataSubTrailer] = useState<subTrailerType>({
    isFirstTrailer: subId.isFirstTrailer,
  } as subTrailerType);
  const [dataCompany, setDataCompany] = useState<UserInfo>();
  const [step, setStep] = useState<string | undefined>('予約');
  const [stepPrev, setStepPrev] = useState<string | undefined>('予約');
  const transactionApi = transactionService();
  const message = localStorage.getItem('messages');
  const messageJson = message ? JSON.parse(message)[id ?? 1] : {};
  const latestMessage = messageJson ? messageJson[messageJson.length - 1] : ({} as MESSAGE_TRANSACTIONS);

  const isMatchingCarrier = typeMode === Matching.MATCHING_CARRIER;

  const fetchTransactionEvent = async (event?: string) => {
    setIsLoading(true);
    try {
      if (typeMode && event) {
        const transactionEvent: Record<any, () => Promise<void>> = {
          // Carrier - Shipper
          [TRANS_EVENT.ACCEPT]: async () => {
            await Promise.all([
              // transactionApi.apiAth029(Number(id), true),
              transactionApi.apiAth013(Number(id), {
                approval: true,
                vehicle_avb_resource_id: data?.vehicle_avb_resource_id,
                isNotIX: process.env.NEXT_PUBLIC_IS_NOT_IX !== 'false' ? true : false,
              }),
            ]);
          },
          [TRANS_EVENT.REJECT]: async () => {
            await Promise.all([
              // transactionApi.apiAth029(Number(id), false),
              transactionApi.apiAth013(Number(id), {
                approval: false,
                vehicle_avb_resource_id: data?.vehicle_avb_resource_id,
                isNotIX: process.env.NEXT_PUBLIC_IS_NOT_IX !== 'false' ? true : false,
              }),
            ]);
          },
          [TRANS_EVENT.RE_PROPOSAL]: async () => {
            await transactionApi.apiAth033(Number(id));
          },
          [TRANS_EVENT.CONTRACT_ACCEPT]: async () => {
            await transactionApi.apiAth027(Number(id), true);
          },
          [TRANS_EVENT.CONTRACT_REJECT]: async () => {
            await transactionApi.apiAth027(Number(id), false);
          },
          [TRANS_EVENT.CANCEL]: async () => {
            await transactionApi.apiAth030(Number(id));
          },
          [TRANS_EVENT.PAYMENT]: async () => {
            await transactionApi.apiAth028(Number(id));
          },

          // Carrier - Carrier
          [TRANS_EVENT.CARRIER_APPROVE]: async () => {
            await Promise.all([
              transactionApi.apiAth3062(Number(id), {
                approval: true,
                vehicle_avb_resource_id: data?.vehicle_avb_resource_id,
                isNotIX: process.env.NEXT_PUBLIC_IS_NOT_IX !== 'false' ? true : false,
              }),
              transactionApi.apiAth310(Number(id), {
                approval: true,
              }),
            ]);
          },
          [TRANS_EVENT.CARRIER_REJECT]: async () => {
            await Promise.all([
              transactionApi.apiAth3062(Number(id), {
                approval: false,
                vehicle_avb_resource_id: data?.vehicle_avb_resource_id,
                isNotIX: process.env.NEXT_PUBLIC_IS_NOT_IX !== 'false' ? true : false,
              }),
              transactionApi.apiAth310(Number(id), {
                approval: false,
              }),
            ]);
          },
          [TRANS_EVENT.CARRIER_CANCEL]: async () => {
            await transactionApi.apiAth315(Number(id));
          },
          [TRANS_EVENT.CARRIER_RE_PROPOSAL]: async () => {
            await transactionApi.apiAth3063(Number(id), {
              cns_line_item_by_date_id: data?.request_snapshot?.id,
              vehicle_avb_resource_item_id: data?.propose_snapshot.id,
              service_no: data?.car_info?.[0]?.service_no,
              departure_date: dayjs(data.transport_date ?? dayjs()).format(DATE_FORMAT.YYYYMMDD),
              departure_time: dayjs(data.propose_departure_time ?? dayjs(), TIME_FORMAT.HH_MM_SS).format(
                TIME_FORMAT.HHMM,
              ),
              price: data?.request_price || 1,
              isNotIX: process.env.NEXT_PUBLIC_IS_NOT_IX !== 'false' ? true : false,
            });
          },
          [TRANS_EVENT.CARRIER_CONTRACT_ACCEPT]: async () => {
            await transactionApi.apiAth311(Number(id), true);
          },
          [TRANS_EVENT.CARRIER_CONTRACT_REJECT]: async () => {
            await transactionApi.apiAth311(Number(id), false);
          },
          [TRANS_EVENT.CARRIER_PAYMENT]: async () => {
            await transactionApi.apiAth312(Number(id));
          },
        };

        const action = transactionEvent[event];
        if (!action) return;
        return await action();
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  };

  const fetchDataMatchingSale = async () => {
    if (!data) return;
    setIsLoading(true);
    transactionApi
      .apiAth303(data.id)
      .then((res: any) => {
        if (!res.data) return;
        transactionApi.apiAth304(data.id).then((res2: any) => {
          if (!res2.data) return;
          fetchMatchingCarrier();
          toggleModal('modalSale');
        });
      })
      .catch((error) => {
        console.error('Error in useEffect:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchMatchingCarrier = async () => {
    transactionApi.apiAth301(data.id).then((resMatching: any) => {
      if (resMatching.data && resMatching.data.length > 0) {
        setHasMatchingCarrier(true);
        setDataMatchingCarrier(resMatching.data);
      } else {
        setHasMatchingCarrier(false);
        setDataMatchingCarrier([]);
      }
    });
  };

  const postTransactionSuggest = async (trailer: any, dataDetailTransaction: IDetailTransaction) => {
    const params = {
      cns_line_item_by_date_id: trailer?.cns_line_item_by_date_id || 1,
      vehicle_avb_resource_item_id: trailer.vehicle_avb_resource_item_id || 1,
      service_no: trailer.service_no,
      departure_date: dayjs(trailer.service_strt_date).format(DATE_FORMAT.YYYYMMDD),
      departure_time: dayjs(trailer.service_strt_time, TIME_FORMAT.HH_MM_SS).format(TIME_FORMAT.HHMM),
      arrival_date: dayjs(trailer.service_end_date).format(DATE_FORMAT.YYYYMMDD),
      arrival_time: dayjs(trailer.service_end_time, TIME_FORMAT.HH_MM_SS).format(TIME_FORMAT.HHMM),
      giai: dataDetailTransaction?.propose_snapshot.giai,
      price: dataDetailTransaction?.request_snapshot.price_per_unit,
      isNotIX: process.env.NEXT_PUBLIC_IS_NOT_IX !== 'false' ? true : false,
      matching_id: trailer.matching_id || 1,
    };
    setIsLoading(true);
    setDataSuggest(
      trailer.trans_type === TransType.CARRIER ? trailer.carrier2_operator_name : trailer.carrier_operator_name,
    );
    transactionApi
      .apiAth3061(params)
      .then((res: any) => {
        if (res.propose_id) {
          setSale(true);
          fetchMatchingCarrier();
          eventSale();
        }
      })
      .catch((error) => {
        console.error('Error in useEffect:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const currentStep = (item: any) => {
    return TRANS_STEP[item?.status || 0];
  };

  const prevStep = (item: any) => {
    const status = TRANS_STEP[item?.status];
    const index = steps.findIndex((s) => s.label === status);
    return steps[index - 1]?.label || status;
  };

  const tabViews = [
    {
      key: 'update',
      title: '状況',
    },
    {
      key: 'view',
      title: '運行計画',
    },
    {
      key: 'chat',
      title: '取引メッセージ',
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/socket');
        if (res.ok) {
          console.log('Starting Socket.IO server');
        }
      } catch (err) {
        console.error('Error starting Socket.IO server: ', err);
      }
    })();
  }, []);

  const eventCompanyInfo = (isCarrier: boolean, dataId?: string) => {
    if (modals.modalCompanyInfo) {
      setDataCompany(undefined);
    } else {
      const operatorId = isCarrier ? data.carrier2_operator_id : data.shipper_operator_id;
      const role = isCarrier ? 'carrier' : 'shipper';

      setDataCompany(mockAccount.find((item) => item.companyId === (dataId || operatorId) && item.role === role));
    }
    toggleModal('modalCompanyInfo');
  };

  const eventAccept = (event?: string) => {
    if (event) {
      fetchTransactionEvent(event).then(() => {
        setIsLoading(false);
        setIsStatusChange(true);
        toggleModal('modalAccept');
      });
    }
  };

  const eventDeny = (event?: string) => {
    if (event) {
      fetchTransactionEvent(event).then(() => {
        setIsLoading(false);
        setIsStatusChange(true);
        toggleModal('modalDeny');
      });
    }
  };

  const eventSale = (event?: string) => {
    if (event) {
      fetchDataMatchingSale().then((res) => {
        setIsLoading(false);
      });
    } else {
      toggleModal('modalSale');
    }
  };

  const eventMatchingCarrierAndCarrier = () => {
    toggleModal('modalMatchingCarrierAndCarrier');
  };

  const renderModalResult = (response: any, type: 'carrier-carrier' | 'carrier-shipper') => {
    return (
      <div>
        <p className='text-base font-normal text-center'>{response?.message || gTxt('MESSAGES.FAILED')}</p>

        <div className='flex items-center justify-between'>
          <Button
            radius='sm'
            color='primary'
            onPress={() => dispatch(actions.appAction.hideModalResult())}
            className='border-none font-bold h-12 w-[6rem] text-base leading-normal mt-6'
          >
            閉じる
          </Button>
          <Button
            radius='sm'
            color='primary'
            onPress={() => handleTrackingDecideTransaction(id, true, type)}
            className='border-none font-bold h-12 w-[6rem] text-base leading-normal mt-6'
          >
            運行決定
          </Button>
        </div>
      </div>
    );
  };

  const handleTrackingDecideTransaction = (
    id: number,
    ignore: boolean,
    type: 'carrier-carrier' | 'carrier-shipper',
  ) => {
    setIsLoading(true);
    transactionApi
      .trackingTransOrder(id, {
        ignore: ignore,
      })
      .then((response) => {
        console.log('response:', response);
        if (response?.status === ENotificationType.SUCCESS) {
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.INFO,
              title: '運行決定',
              content: response?.message || gTxt('MESSAGES.SUCCESS'),
            }),
          );
          decideTransaction(id, type);
        } else {
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.ERROR,
              title: '運行決定',
              content: renderModalResult(response, type),
            }),
          );
        }
      })
      .catch((error) => {
        console.error('Error in useEffect:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const decideTransaction = async (id: number, type: 'carrier-carrier' | 'carrier-shipper') => {
    try {
      setIsLoading(true);
      const transportDecision = type === 'carrier-shipper' ? transactionApi.apiAth032 : transactionApi.apiAth316;

      await transportDecision(id);
      setIsStatusChange(true);
    } catch (error) {
      console.error('transportDecision: ', error);
    }
    setIsLoading(false);
  };

  const handleDecideTransaction = (id: number, type: 'carrier-carrier' | 'carrier-shipper') => {
    handleTrackingDecideTransaction(id, false, type);
  };

  useEffect(() => {
    setIsLoading(true);
    const apiCall = isMatchingCarrier ? transactionApi.apiAth308(idActive) : transactionApi.apiAth023(idActive);

    apiCall
      .then((res) => {
        if (!res.data) {
          setData({} as any);
        }
        const item = res.data;
        item.latest_message = latestMessage;
        setData(item);
        setStep(() => currentStep(item));
        setStepPrev(() => prevStep(item));
      })
      .catch((error) => {
        console.error('Error in useEffect:', error);
      })
      .finally(() => {
        setIsLoading(false);
        setIsStatusChange(false);
      });
  }, [isStatusChange, idActive]);

  useEffect(() => {
    setDataSubTrailer({ isFirstTrailer: subId.isFirstTrailer } as subTrailerType);
    if (!subId.id || subId.id === idActive) return;
    const apiCallSubId = isMatchingCarrier ? transactionApi.apiAth308(subId.id) : transactionApi.apiAth023(subId.id);
    apiCallSubId
      .then((res) => {
        if (!res.data) return;
        setDataSubTrailer({
          carrier2_operator_name: res.data.carrier2_operator_name,
          carrier_operator_name: res.data.carrier_operator_name,
          shipper_operator_name: res.data.shipper_operator_name,
          isFirstTrailer: subId.isFirstTrailer,
        });
      })
      .catch((error) => {
        console.error('Error in useEffect:', error);
      });
  }, [isStatusChange, subId]);

  const steps = [
    {
      label: '予約',
      content: (
        <>
          <div className='space-y-2 my-4'>
            <CmnTabs items={tabViews} onSelectionChange={(key) => setViewMode(key)}></CmnTabs>
          </div>
          <ReservationProposalPage
            parentId={id}
            data={data}
            dataSubTrailer={dataSubTrailer}
            type={typeMode}
            eventCompanyInfo={eventCompanyInfo}
            eventAccept={eventAccept}
            eventDeny={eventDeny}
            viewMode={viewMode}
          />
        </>
      ),
    },
    {
      label: '契約',
      content: (
        <>
          <div className='space-y-2 my-4'>
            <CmnTabs items={tabViews} onSelectionChange={(key) => setViewMode(key)}></CmnTabs>
          </div>
          <ContractPage
            parentId={id}
            data={data}
            dataSubTrailer={dataSubTrailer}
            type={typeMode}
            eventCompanyInfo={eventCompanyInfo}
            eventAccept={eventAccept}
            eventDeny={eventDeny}
            handleDecideTransaction={handleDecideTransaction}
            eventSale={eventSale}
            eventMatchingCarrierAndCarrier={eventMatchingCarrierAndCarrier}
            hasMatchingCarrier={hasMatchingCarrier}
            viewMode={viewMode}
          />
        </>
      ),
    },
    {
      label: '運行決定',
      content: (
        <>
          <div className='space-y-2 my-4'>
            <CmnTabs items={tabViews} onSelectionChange={(key) => setViewMode(key)}></CmnTabs>
          </div>
          <DecideTransactionPage
            parentId={id}
            data={data}
            dataSubTrailer={dataSubTrailer}
            type={typeMode}
            eventCompanyInfo={eventCompanyInfo}
            eventAccept={eventAccept}
            eventDeny={eventDeny}
            eventSale={eventSale}
            eventMatchingCarrierAndCarrier={eventMatchingCarrierAndCarrier}
            hasMatchingCarrier={hasMatchingCarrier}
            viewMode={viewMode}
          />
        </>
      ),
    },
    {
      label: '運行',
      content: (
        <>
          <div className='space-y-2 my-4'>
            <CmnTabs items={tabViews} onSelectionChange={(key) => setViewMode(key)}></CmnTabs>
          </div>
          <OperationPage
            parentId={id}
            data={data}
            dataSubTrailer={dataSubTrailer}
            type={typeMode}
            eventCompanyInfo={eventCompanyInfo}
            eventSale={eventSale}
            eventMatchingCarrierAndCarrier={eventMatchingCarrierAndCarrier}
            hasMatchingCarrier={hasMatchingCarrier}
            viewMode={viewMode}
          />
        </>
      ),
    },
    {
      label: '決済',
      content: (
        <>
          <div className='space-y-2 my-4'>
            <CmnTabs items={tabViews} onSelectionChange={(key) => setViewMode(key)}></CmnTabs>
          </div>
          <SettlementPage
            parentId={id}
            data={data}
            dataSubTrailer={dataSubTrailer}
            type={typeMode}
            eventCompanyInfo={eventCompanyInfo}
            eventAccept={eventAccept}
            eventSale={eventSale}
            eventMatchingCarrierAndCarrier={eventMatchingCarrierAndCarrier}
            hasMatchingCarrier={hasMatchingCarrier}
            viewMode={viewMode}
          />
        </>
      ),
    },
    {
      label: '取引完了',
      content: (
        <>
          <div className='space-y-2 my-4'>
            <CmnTabs items={tabViews} onSelectionChange={(key) => setViewMode(key)}></CmnTabs>
          </div>
          <CompletedPage
            parentId={id}
            data={data}
            dataSubTrailer={dataSubTrailer}
            type={typeMode}
            eventCompanyInfo={eventCompanyInfo}
            eventSale={eventSale}
            eventMatchingCarrierAndCarrier={eventMatchingCarrierAndCarrier}
            hasMatchingCarrier={hasMatchingCarrier}
            viewMode={viewMode}
          />
        </>
      ),
    },
  ];

  return (
    <>
      {data && Object.keys(data).length > 0 ? (
        <>
          <div className='space-y-2 px-1'>
            <CmnTabs
              value={String(typeMode)}
              items={[
                {
                  key: String(Matching.TRANSACTION_SHIPPER),
                  title: '荷主取引詳細',
                  content: isLoading ? (
                    <div className='px-4 py-60 text-center'>
                      <Spinner />
                    </div>
                  ) : (
                    <Stepper steps={steps} activeStep={step} />
                  ),
                },
                {
                  key: String(Matching.MATCHING_CARRIER),
                  title: 'キャリア間マッチング取引詳細',
                  content: isLoading ? (
                    <div className='px-4 py-60 text-center'>
                      <Spinner />
                    </div>
                  ) : (
                    <Stepper steps={steps} activeStep={step} />
                  ),
                },
              ]}
              onSelectionChange={(key) => {
                if (type !== Matching.MATCHING_CARRIER) {
                  return;
                }
                setTypeMode(Number(key));
                if (data.parent_order_id) {
                  setIdActive(Number(data.parent_order_id));
                } else {
                  setIdActive(id);
                }
              }}
            />
          </div>

          {/*Modal Accept Transaction*/}
          <ModalAccept
            step={stepPrev}
            modals={modals.modalAccept}
            toggleModal={() => {
              toggleModal('modalAccept');
              setIsChanged(true);
            }}
          />

          {/*Modal Deny Transaction*/}
          <ModalDeny
            step={stepPrev}
            modals={modals.modalDeny}
            toggleModal={() => {
              toggleModal('modalDeny');
              setIsChanged(true);
            }}
          />

          {/*Modal Sale Transaction*/}
          <ModalSale
            step={stepPrev}
            saleStatus={sale}
            data={dataSuggest}
            modals={modals.modalSale}
            toggleModal={() => {
              toggleModal('modalSale');
              if (sale) {
                toggleModal('modalMatchingCarrierAndCarrier');
                fetchMatchingCarrier();
              }
              // setIsStatusChange(true);
            }}
          />

          {/*Modal Matching Carrier Transaction*/}
          {dataMatchingCarrier && (
            <ModalMatchingCarrier
              isOpen={modals.modalMatchingCarrierAndCarrier}
              data={dataMatchingCarrier}
              parent={data}
              // parent={trailerActive}
              onClose={eventMatchingCarrierAndCarrier}
              onViewCompanyInfo={eventCompanyInfo}
              onClickProposal={postTransactionSuggest}
            />
          )}

          {modals.modalCompanyInfo && dataCompany && (
            <ModalCompanyInfo
              isOpen={modals.modalCompanyInfo}
              onClose={() => {
                eventCompanyInfo(true);
              }}
              data={dataCompany}
            />
          )}
        </>
      ) : (
        <div className='px-4 py-80 text-center'>
          <Spinner />
        </div>
      )}
    </>
  );
};

export default DetailTransaction;
