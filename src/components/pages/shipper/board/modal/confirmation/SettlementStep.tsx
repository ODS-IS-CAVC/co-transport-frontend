'use client';

import { FC, useState } from 'react';

import { CmnTabs } from '@/components/common/CmnTabs';
import { IDetailTransaction } from '@/types/carrier/transactionInfo';

import CompanyInfoBlock from './CompanyInfoBlock';
import ContractBlock from './ContractBlock';
import DecideTransactionBlock from './DecideTransactionBlock';
import DetailInformationTab from './DetailInformationTab';
import Footer from './Footer';
import OperationStatusBlock from './OperationStatusBlock';
import SettlementBlock from './SettlementBlock';
import TabChat from './TabChat';

interface SettlementProps {
  data?: IDetailTransaction;
  eventCompanyInfo: () => void;
  onClose: () => void;
  eventAccept: (type: string) => void;
}

const SettlementStep: FC<SettlementProps> = ({ data, eventCompanyInfo, eventAccept, onClose }) => {
  const [tab, setTab] = useState<string>('1');
  if (!data) return;

  return (
    <CmnTabs
      value={tab}
      onSelectionChange={(key) => setTab(String(key))}
      items={[
        {
          key: '1',
          title: '状況',
          content: (
            <>
              <CompanyInfoBlock data={data} eventCompanyInfo={eventCompanyInfo} />

              <ContractBlock data={data} />

              <DecideTransactionBlock />

              <OperationStatusBlock data={data} />

              <SettlementBlock data={data} eventAccept={eventAccept} />

              <Footer data={data} onClose={onClose} />
            </>
          ),
        },
        {
          key: '2',
          title: '運行計画',
          content: (
            <>
              <DetailInformationTab data={data} />
              <Footer data={data} onClose={onClose} />
            </>
          ),
        },
        {
          key: '3',
          title: '取引メッセージ',
          content: (
            <>
              <TabChat data={data} />
              <Footer data={data} onClose={onClose} />
            </>
          ),
        },
      ]}
    />
  );
};

export default SettlementStep;
