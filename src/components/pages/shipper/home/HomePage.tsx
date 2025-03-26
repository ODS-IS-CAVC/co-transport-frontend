// 'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

import Loading from '@/components/common/Loading';

const NegotiationBoardPage = dynamic(() => import('@/components/pages/shipper/board/NegotiationBoardPage'));
const ConfirmBoardPage = dynamic(() => import('@/components/pages/shipper/board/ConfirmBoardPage'));
const TradingBoardPage = dynamic(() => import('@/components/pages/shipper/board/TradingBoardPage'));
const CargoInfoListPage = dynamic(() => import('@/components/pages/shipper/cargo-info/CargoInfoListPage'));
const TransportInfoListPage = dynamic(() => import('@/components/pages/shipper/transport-info/TransportInfoListPage'));
const CarrierTransportSearch = dynamic(
  () => import('@/components/pages/shipper/carrier-transport/CarrierTransportSearch'),
);

const Home = () => {
  // const [refreshData, setRefreshData] = useState<boolean>(false);
  return (
    <Suspense fallback={<Loading />}>
      <NegotiationBoardPage />
      <ConfirmBoardPage />
      <TradingBoardPage />
      <CargoInfoListPage />
      <TransportInfoListPage />
      <CarrierTransportSearch />
    </Suspense>
  );
};

export default Home;
