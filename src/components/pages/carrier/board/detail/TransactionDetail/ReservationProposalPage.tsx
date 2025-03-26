'use client';

import { FC } from 'react';

import CargoDetailBlock from '@/components/pages/carrier/board/detail/TransactionDetail/CargoDetailBlock';
import ChatBlock from '@/components/pages/carrier/board/detail/TransactionDetail/ChatBlock';
import CompanyInfoBlock from '@/components/pages/carrier/board/detail/TransactionDetail/CompanyInfoBlock';
import MobilityHubBlock from '@/components/pages/carrier/board/detail/TransactionDetail/MobilityHubBlock';
import OperationalBlock from '@/components/pages/carrier/board/detail/TransactionDetail/OperationalBlock';
import { isChat, isUpdate, isView } from '@/lib/carrier';
import { Matching } from '@/lib/matching';
import { IDetailTransaction, subTrailerType } from '@/types/carrier/transactionInfo';

interface ReservationProposalProps {
  parentId: number;
  data: IDetailTransaction;
  dataSubTrailer: subTrailerType;
  type: number;
  viewMode: string;
  eventCompanyInfo: (isCarrier: boolean) => void;
  eventAccept: (type: string) => void;
  eventDeny: (type: string) => void;
}

const ReservationProposalPage: FC<ReservationProposalProps> = ({
  parentId,
  data,
  dataSubTrailer,
  type,
  viewMode,
  eventCompanyInfo,
  eventAccept,
  eventDeny,
}) => {
  const isMatchingCarrier = type === Matching.MATCHING_CARRIER;
  const isShowBlock = parentId === data.id;

  return (
    <>
      {isUpdate(viewMode) && (
        <>
          <h3 className='my-2'>状況</h3>
          <CompanyInfoBlock
            data={data}
            type={type}
            eventCompanyInfo={eventCompanyInfo}
            eventAccept={eventAccept}
            eventDeny={eventDeny}
          />
          {/* {isMatchingCarrier && <BaggageInformationBlock data={data} />} */}
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

export default ReservationProposalPage;
