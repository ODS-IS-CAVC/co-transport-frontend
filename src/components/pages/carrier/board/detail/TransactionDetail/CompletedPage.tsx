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
import OperationStatusBlock from '@/components/pages/carrier/board/detail/TransactionDetail/OperationStatusBlock';
import SettlementBlock from '@/components/pages/carrier/board/detail/TransactionDetail/SettlementBlock';
import { isChat, isUpdate, isView } from '@/lib/carrier';
import { Matching } from '@/lib/matching';
import { IDetailTransaction, subTrailerType } from '@/types/carrier/transactionInfo';

interface CompletedProps {
  parentId: number;
  data: IDetailTransaction;
  dataSubTrailer: subTrailerType;
  type: number;
  viewMode: string;
  eventCompanyInfo: (isCarrier: boolean) => void;
  hasMatchingCarrier: boolean;
  eventSale: (type: string) => void;
  eventMatchingCarrierAndCarrier: () => void;
}

const CompletedPage: FC<CompletedProps> = ({
  parentId,
  data,
  dataSubTrailer,
  type,
  viewMode,
  eventCompanyInfo,
  hasMatchingCarrier,
  eventSale,
  eventMatchingCarrierAndCarrier,
}) => {
  const isMatchingCarrier = type === Matching.MATCHING_CARRIER;
  const isShowBlock = parentId === data.id;

  return (
    <>
      {isUpdate(viewMode) && (
        <>
          <h3 className='my-2'>状況</h3>
          <CompanyInfoBlock data={data} type={type} eventCompanyInfo={eventCompanyInfo} />

          <ContractBlock data={data} type={type} />

          {isShowBlock && <DecideTransactionBlock data={data} type={type} />}

          {/* {isMatchingCarrier && <BaggageInformationBlock data={data} />} */}
          {isShowBlock && !isMatchingCarrier && (
            <MatchingToCarrierCarrierBlock
              eventSale={eventSale}
              eventMatchingCarrierAndCarrier={eventMatchingCarrierAndCarrier}
              hasMatchingCarrier={hasMatchingCarrier}
            />
          )}

          <OperationStatusBlock data={data} type={type} />

          <SettlementBlock
            price={data.propose_price || data.propose_snapshot.price || 0}
            status={data.status}
            type={type}
          />
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

export default CompletedPage;
