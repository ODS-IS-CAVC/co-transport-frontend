'use client';

import { FC, useState } from 'react';

import { CmnTabs } from '@/components/common/CmnTabs';
import { IDetailTransaction } from '@/types/carrier/transactionInfo';

import CompanyInfoBlock from './CompanyInfoBlock';
import ContractBlock from './ContractBlock';
import DecideTransactionBlock from './DecideTransactionBlock';
import DetailInformationTab from './DetailInformationTab';
import Footer from './Footer';
import TabChat from './TabChat';

interface DecideTransactionStepProps {
  data?: IDetailTransaction;
  eventCompanyInfo: () => void;
  onClose: () => void;
  eventDeny: (type: string) => void;
}

const DecideTransactionStep: FC<DecideTransactionStepProps> = ({ data, eventCompanyInfo, onClose, eventDeny }) => {
  const [tab, setTab] = useState<string>('1');
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

export default DecideTransactionStep;
