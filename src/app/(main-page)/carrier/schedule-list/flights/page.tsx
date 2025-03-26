import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import Loading from '@/components/common/Loading';
import FlightListPage from '@/components/pages/carrier/schedule-list/flight-list';
import { KEY_COOKIE_TOKEN } from '@/constants/keyStorage';
import { ROUTER, ROUTER_ID } from '@/constants/router/router';
import { getSearchString } from '@/lib/utils';
import { scheduleCarrierService } from '@/services/carrier/schedule';

const fetchData = async ({ scheduleId, search }: { scheduleId: string; search?: string }) => {
  const cookieStore = cookies();
  const userToken = cookieStore.get(KEY_COOKIE_TOKEN)?.value;
  const scheduleApi = scheduleCarrierService(userToken);
  return await scheduleApi.getFlightList(Number(scheduleId), search);
};

export default async function FlightList({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const filter = await searchParams;
  const scheduleId = filter.schedule;
  if (typeof scheduleId !== 'string') {
    redirect(`${ROUTER.CARRIER}#${ROUTER_ID.CARRIER_SCHEDULE_LIST}`);
  }
  const result = await fetchData({ scheduleId, search: getSearchString(filter) });
  return (
    <Suspense fallback={<Loading />}>
      <FlightListPage data={result} />
    </Suspense>
  );
}
