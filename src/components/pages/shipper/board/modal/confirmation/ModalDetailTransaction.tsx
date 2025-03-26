'use client';

import { Button } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import Loading from '@/components/common/Loading';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import Stepper from '@/components/common/Stepper';
import ModalCompanyInfo from '@/components/pages/carrier/board/Modal/ModalCompanyInfo';
import { mockAccount } from '@/constants/auth';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { TRANS_EVENT, TRANS_STEP_SHIPPER } from '@/constants/transaction';
import useModals from '@/hook/useModals';
import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import { formatDateWithWeekDayJapanese } from '@/lib/helper';
import { MatchingHelper } from '@/lib/matching';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { RootState } from '@/redux/store';
import { transactionService } from '@/services/transaction/transaction';
import { ENotificationType } from '@/types/app';
import { UserInfo } from '@/types/auth';
import { IDetailTransaction } from '@/types/carrier/transactionInfo';

import CompletedPage from './CompletedStep';
import ContractPage from './ContractStep';
import DecideTransactionStep from './DecideTransactionStep';
import ModalAccept from './ModalAccept';
import ModalDeny from './ModalDeny';
import OperationPage from './OperationStep';
import ReservationProposalPage from './ReservationProposalStep';
import SettlementPage from './SettlementStep';

interface ModalDetailTransactionProps {
  open: boolean;
  onClose: () => void;
  data?: IDetailTransaction;
  handleOnEvent: (id?: number) => void;
}

const ModalDetailTransaction = ({
  open = false,
  onClose = () => null,
  data,
  handleOnEvent,
}: ModalDetailTransactionProps) => {
  const [step, setStep] = useState('予約');
  const { modals, toggleModal, closeModal } = useModals({
    modalAccept: false,
    modalDeny: false,
    modalCompanyInfo: false,
    modalChat: false,
  });

  const transactionApi = transactionService();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [dataCompany, setDataCompany] = useState<UserInfo>();

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

  console.log('TransactionDetail', data);
  const fetchTransactionShipperEvent = async (type?: string) => {
    if (!data) return;
    setIsLoading(true);
    try {
      if (type) {
        const transactionEvent: Record<any, () => Promise<{}>> = {
          [TRANS_EVENT.ACCEPT]: () => transactionApi.apiAth029(Number(data.id), true),
          // transactionApi.apiAth013(data.id, {
          //   approval: true,
          //   vehicle_avb_resource_id: data.vehicle_avb_resource_id,
          //   isNotIX: process.env.NEXT_PUBLIC_IS_NOT_IX !== 'false' ? true : false,
          // }),
          [TRANS_EVENT.REJECT]: () =>
            // transactionApi.apiAth013(data.id, {
            //   approval: false,
            //   vehicle_avb_resource_id: data.vehicle_avb_resource_id,
            //   isNotIX: process.env.NEXT_PUBLIC_IS_NOT_IX !== 'false' ? true : false,
            // }),
            transactionApi.apiAth029(Number(data.id), false),
          [TRANS_EVENT.CONTRACT_ACCEPT]: () => transactionApi.apiAth0081(Number(data.id), true),
          [TRANS_EVENT.CONTRACT_REJECT]: () => transactionApi.apiAth0081(Number(data.id), false),
          [TRANS_EVENT.CANCEL]: () => transactionApi.apiAth0083(Number(data.id)),
          [TRANS_EVENT.PAYMENT]: () => transactionApi.apiAth0082(Number(data.id)),
          [TRANS_EVENT.RE_PROPOSAL]: () =>
            transactionApi.apiAth014(Number(data.id), {
              cns_line_item_by_date_id: data?.request_snapshot?.id,
              vehicle_avb_resource_item_id: data?.propose_snapshot?.id,
              service_no: data?.car_info?.[0]?.service_no,
              departure_date: dayjs(data.transport_date || '').format(DATE_FORMAT.YYYYMMDD),
              departure_time: (
                (data.propose_departure_time && dayjs(data.propose_departure_time, TIME_FORMAT.HHMM)) ||
                dayjs()
              ).format(TIME_FORMAT.HHMM),
              isNotIX: process.env.NEXT_PUBLIC_IS_NOT_IX !== 'false' ? true : false,
            }),
        };
        const action = transactionEvent[type];
        if (!action) return;
        return await action();
      }
    } catch (error) {
      console.error('Error transaction shipper:', error);
    }
  };
  useEffect(() => {
    setStep((data && TRANS_STEP_SHIPPER[data.status]) || '予約');
  }, [data]);

  const toggleStep = (type: string) => {
    const steps = getSteps(type);
    setStep((prevStep) => steps[(steps.findIndex((step) => step.label === prevStep) + 1) % steps.length].label);
  };

  const eventCompanyInfo = () => {
    if (modals.modalCompanyInfo) {
      setDataCompany(undefined);
    } else {
      setDataCompany(mockAccount.find((item) => item.companyId === data?.carrier_operator_id));
    }
    toggleModal('modalCompanyInfo');
  };

  const eventChat = () => {
    toggleModal('modalChat');
  };

  const eventAccept = (type?: string) => {
    if (type && Object.values(TRANS_EVENT).includes(type)) {
      fetchTransactionShipperEvent(type).then((response: any) => {
        if (response?.data) {
          toggleModal('modalAccept');
          return;
        }
        dispatch(
          actions.appAction.showNotification({
            type: ENotificationType.ERROR,
            title: gTxt('MESSAGES.FAILED'),
            content: gTxt('MESSAGES.FAILED'),
          }),
        );
      });
    } else {
      toggleModal('modalAccept');
    }
    setIsLoading(false);
  };

  const eventDeny = (type?: string) => {
    if (type && Object.values(TRANS_EVENT).includes(type)) {
      fetchTransactionShipperEvent(type).then((response: any) => {
        if (response?.data) {
          toggleModal('modalDeny');
          handleOnEvent();
          return;
        }
        dispatch(
          actions.appAction.showNotification({
            type: ENotificationType.ERROR,
            title: gTxt('MESSAGES.FAILED'),
            content: gTxt('MESSAGES.FAILED'),
          }),
        );
      });
    } else {
      onClose();
    }
    setIsLoading(false);
  };

  const eventCompleted = () => {
    setStep('取引完了');
    scrollToTop();
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const getSteps = (_type: string) => {
    return [
      {
        label: '予約',
        content: (
          <ReservationProposalPage
            data={data}
            onClose={onClose}
            eventCompanyInfo={eventCompanyInfo}
            eventAccept={eventAccept}
            eventDeny={eventDeny}
          />
        ),
      },
      {
        label: '契約',
        content: (
          <ContractPage
            data={data}
            onClose={onClose}
            eventCompanyInfo={eventCompanyInfo}
            eventAccept={eventAccept}
            eventDeny={eventDeny}
          />
        ),
      },
      {
        label: '運行決定',
        content: (
          <DecideTransactionStep
            eventDeny={eventDeny}
            data={data}
            onClose={onClose}
            eventCompanyInfo={eventCompanyInfo}
          />
        ),
      },
      {
        label: '運行',
        content: <OperationPage data={data} onClose={onClose} eventCompanyInfo={eventCompanyInfo} />,
      },
      {
        label: '決済',
        content: (
          <SettlementPage data={data} onClose={onClose} eventCompanyInfo={eventCompanyInfo} eventAccept={eventAccept} />
        ),
      },
      {
        label: '取引完了',
        content: <CompletedPage onClose={onClose} data={data} eventCompanyInfo={eventCompanyInfo} />,
      },
    ];
  };

  const matchingStatus = data && MatchingHelper.getOrderStatus(data.status, 'shipper');
  const regions = useAppSelector((state: RootState) => state.app.locations);

  return (
    <>
      {isLoading && <Loading />}
      <CmnModal isOpen={open} onClose={onClose}>
        <CmnModalHeader
          title={`詳細情報 ${data && data.transport_date && formatDateWithWeekDayJapanese(new Date(data.transport_date))}`}
          description='輸送計画の詳細や進行状況が確認できます。'
        />
        <CmnModalBody>
          <div className='space-y-2'>
            <Button
              className={`text-base text-neutral font-bold h-8 rounded-lg leading-normal tracking-wide flex-shrink-0 ${matchingStatus?.color}`}
            >
              {matchingStatus?.label}
            </Button>
            <Stepper steps={getSteps('carrier_shipper')} activeStep={step} />
          </div>
        </CmnModalBody>
      </CmnModal>

      {/*Modal Accept Transaction*/}
      <ModalAccept
        step={step}
        modals={modals.modalAccept}
        toggleModal={() => {
          toggleModal('modalAccept');
          handleOnEvent(data?.id);
        }}
        toggleStep={() => toggleStep('carrier_shipper')}
        scrollable={scrollToTop}
      />

      {/*Modal Deny Transaction*/}
      <ModalDeny step={step} modals={modals.modalDeny} toggleModal={eventDeny} />

      {/*Modal Chat*/}
      {/* <ModalChat data={data} step={step} modals={modals.modalChat} toggleModal={eventChat} /> */}

      {/*Modal Company Info*/}
      {modals.modalCompanyInfo && dataCompany && (
        <ModalCompanyInfo
          isOpen={modals.modalCompanyInfo}
          onClose={() => {
            closeModal('modalCompanyInfo');
          }}
          data={dataCompany}
        />
      )}
    </>
  );
};

export default ModalDetailTransaction;
