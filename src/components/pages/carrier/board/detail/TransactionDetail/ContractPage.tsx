'use client';

import { FC } from 'react';

import CargoDetailBlock from '@/components/pages/carrier/board/detail/TransactionDetail/CargoDetailBlock';
import ChatBlock from '@/components/pages/carrier/board/detail/TransactionDetail/ChatBlock';
import CompanyInfoBlock from '@/components/pages/carrier/board/detail/TransactionDetail/CompanyInfoBlock';
import ContractBlock from '@/components/pages/carrier/board/detail/TransactionDetail/ContractBlock';
import DecideTransactionBlock from '@/components/pages/carrier/board/detail/TransactionDetail/DecideTransactionBlock';
import MatchingToCarrierCarrierBlock from '@/components/pages/carrier/board/detail/TransactionDetail/MatchingToCarrierCarrierBlock';
import MobilityHubBlock from '@/components/pages/carrier/board/detail/TransactionDetail/MobilityHubBlock';
import OperationalBlock from '@/components/pages/carrier/board/detail/TransactionDetail/OperationalBlock';
import { OrderStatus } from '@/constants/transaction';
import { isChat, isUpdate, isView } from '@/lib/carrier';
import { Matching } from '@/lib/matching';
import { IDetailTransaction, subTrailerType } from '@/types/carrier/transactionInfo';

interface ContractProps {
  parentId: number;
  data: IDetailTransaction;
  dataSubTrailer: subTrailerType;
  type: number;
  viewMode: string;
  eventCompanyInfo: (isCarrier: boolean) => void;
  eventAccept: (type: string) => void;
  eventDeny: (type: string) => void;
  handleDecideTransaction?: (id: number, type: 'carrier-carrier' | 'carrier-shipper') => void;
  hasMatchingCarrier: boolean;
  eventSale: (type: string) => void;
  eventMatchingCarrierAndCarrier: () => void;
}

const ContractPage: FC<ContractProps> = ({
  parentId,
  data,
  dataSubTrailer,
  type,
  viewMode,
  eventCompanyInfo,
  eventAccept,
  eventDeny,
  handleDecideTransaction,
  eventSale,
  eventMatchingCarrierAndCarrier,
  hasMatchingCarrier,
}) => {
  const isMatchingCarrier = type === Matching.MATCHING_CARRIER;
  const isShowMatching = data.status === OrderStatus.MAKE_CONTRACT && !isMatchingCarrier;
  const isShowBlock = parentId === data.id;

  return (
    <>
      {isUpdate(viewMode) && (
        <>
          <h3 className='my-2'>状況</h3>
          <CompanyInfoBlock data={data} type={type} eventCompanyInfo={eventCompanyInfo} eventAccept={eventAccept} />

          <ContractBlock data={data} type={type} eventAccept={eventAccept} eventDeny={eventDeny} />

          {isShowBlock && [OrderStatus.MAKE_CONTRACT, OrderStatus.CARRIER_MAKE_CONTRACT].includes(data.status) && (
            <DecideTransactionBlock data={data} type={type} handleDecideTransaction={handleDecideTransaction} />
          )}

          {isShowMatching && isShowBlock && (
            <MatchingToCarrierCarrierBlock
              eventSale={eventSale}
              eventMatchingCarrierAndCarrier={eventMatchingCarrierAndCarrier}
              hasMatchingCarrier={hasMatchingCarrier}
            />
          )}
        </>
      )}
      {isView(viewMode) && (
        <>
          <h3 className='my-2'>運行計画</h3>
          <CargoDetailBlock data={data} />
          <OperationalBlock data={data} dataSubTrailer={dataSubTrailer} isMatchingCarrier={isMatchingCarrier} />
          <MobilityHubBlock vehicleDiagramItemId={data?.vehicle_diagram_item_id} />
        </>
      )}
      {isChat(viewMode) && <ChatBlock data={data.latest_message} />}
    </>
  );
};

export default ContractPage;
