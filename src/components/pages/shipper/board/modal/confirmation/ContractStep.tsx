'use client';

import { FC, useState } from 'react';

import { CmnTabs } from '@/components/common/CmnTabs';
import { IDetailTransaction } from '@/types/carrier/transactionInfo';

import CompanyInfoBlock from './CompanyInfoBlock';
import ContractBlock from './ContractBlock';
import DetailInformationTab from './DetailInformationTab';
import Footer from './Footer';
import TabChat from './TabChat';

interface ContractProps {
  data?: IDetailTransaction;
  eventCompanyInfo: () => void;
  onClose: () => void;
  eventAccept: (type: string) => void;
  eventDeny: (type: string) => void;
}

const ContractStep: FC<ContractProps> = ({ data, eventCompanyInfo, eventAccept, eventDeny, onClose }) => {
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
              <CompanyInfoBlock data={data} eventCompanyInfo={eventCompanyInfo} eventAccept={eventAccept} />

              <ContractBlock data={data} eventAccept={eventAccept} eventDeny={eventDeny} />

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

export default ContractStep;
