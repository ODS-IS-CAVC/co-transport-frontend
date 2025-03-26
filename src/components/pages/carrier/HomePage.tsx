import dynamic from 'next/dynamic';
import { Suspense } from 'react';

import Loading from '@/components/common/Loading';

const TradingBoardPage = dynamic(() => import('@/components/pages/carrier/board/TradingBoard'));
const MatchingBoardPage = dynamic(() => import('@/components/pages/carrier/board/MatchingBoard'));
const TransactionBoardPage = dynamic(() => import('@/components/pages/carrier/board/TransactionBoard'));
const VehicleInfoListPage = dynamic(() => import('@/components/pages/carrier/vehicle/VehicleList'));
const ScheduleListPage = dynamic(() => import('@/components/pages/carrier/schedule-list/ScheduleListPage'));
const ShippingRequestPage = dynamic(() => import('@/components/pages/carrier/shipping-request/ShippingRequestPage'));

const Home = () => {
  return (
    <Suspense fallback={<Loading />}>
      <TradingBoardPage />
      <MatchingBoardPage />
      <TransactionBoardPage />
      <VehicleInfoListPage />
      <ScheduleListPage />
      <ShippingRequestPage />
    </Suspense>
  );
};

export default Home;
