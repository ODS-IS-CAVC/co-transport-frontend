'use client';

import { getCookie } from 'cookies-next';
import { useRef, useState } from 'react';

import { CmnTabs } from '@/components/common/CmnTabs';
import { KEY_COOKIE_COMPANY_CODE } from '@/constants/keyStorage';
import { ROUTER_ID } from '@/constants/router/router';
import { useAppDispatch } from '@/hook/useRedux';
import { objectToQueryParamsNoEncode } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { transportService } from '@/services/transaction/transport';
import { ENotificationType } from '@/types/app';
import { SearchParamAbilityPublic } from '@/types/carrier/matchingShipper';

import ShippingResultPage from '../shipping-result/ShippingResultPage';
import ShippingRequestSearchForm from './ShippingRequestSearchForm';

const ShippingRequestPage = () => {
  const resultRef = useRef<HTMLDivElement>(null);
  const cid = getCookie(KEY_COOKIE_COMPANY_CODE) as string | undefined;

  const [tab, setTab] = useState('baggage_search');
  const [param, setParam] = useState<SearchParamAbilityPublic>();
  const [data, setData] = useState<any>({} as any);
  const [loading, setLoading] = useState(false);
  const [apiSearch, setApiSearch] = useState<string[]>(['1']);
  const transportApi = transportService();

  const dispatch = useAppDispatch();

  const fetchSearchResult = async ({
    search,
    search2,
    apiParam,
  }: {
    search?: string;
    search2?: string;
    apiParam?: string[];
  }) => {
    setLoading(true);
    let result;
    if (tab === 'baggage_search') {
      if ((apiParam?.includes('1') && apiParam?.includes('2')) || apiParam?.length === 0) {
        result = await Promise.all([
          transportApi.apiAth009(`${search}`),
          transportApi.apiAth3051(`${search2}&isNotIX=${process.env.NEXT_PUBLIC_IS_NOT_IX}`),
        ])
          .then(([result, result2]) => {
            result.data = result2 && result2.data ? [...result.data, ...result2.data] : result.data;
            result.data = result.data.sort((a, b) => {
              return a.id - b.id;
            });

            return {
              data: result.data,
              currentPage: result.currentPage,
              totalPages: result.totalPages,
              totalElements: result.totalElements + result2.totalElements,
            };
          })
          .catch((error) => {
            dispatch(
              actions.appAction.showNotification({
                type: ENotificationType.ERROR,
                title: gTxt('MESSAGES.FAILED'),
                content: gTxt('MESSAGES.FAILED'),
              }),
            );
          })
          .finally(() => {
            setLoading(false);
          });
      } else if (apiParam?.includes('2')) {
        result = await transportApi.apiAth009(`${search}`).finally(() => {
          setLoading(false);
        });
      } else if (apiParam?.includes('1')) {
        result = await transportApi
          .apiAth3051(`${search2}&isNotIX=${process.env.NEXT_PUBLIC_IS_NOT_IX}`)
          .finally(() => {
            setLoading(false);
          });
      }
    } else if (tab === 'flight_search') {
      result = await transportApi.apiAth0191(`${search}&isNotIX=${process.env.NEXT_PUBLIC_IS_NOT_IX}`).finally(() => {
        setLoading(false);
      });
    }

    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return result;
  };

  const handleSubmit = async (param: SearchParamAbilityPublic, apiChoose?: string[]) => {
    if (apiChoose) {
      setApiSearch(apiChoose);
    }
    setParam(param);
    const _queryString = objectToQueryParamsNoEncode(param);
    const _param = { ...param };
    _param.collectTimeFrom = param.depTime;
    _param.collectTimeTo = param.arrTime;
    delete _param.depTime;
    delete _param.arrTime;
    const _queryString2 = objectToQueryParamsNoEncode(_param);

    let response = await fetchSearchResult({
      search: _queryString,
      search2: _queryString2,
      apiParam: apiChoose ?? apiSearch,
    });
    setData(response);
  };

  const search = (param: SearchParamAbilityPublic) => {
    handleSubmit(param);
  };

  const onChangeTab = (tab: string) => {
    setTab(tab);
    setData({} as any);
  };

  const tabsSearch = [
    {
      key: 'baggage_search',
      title: '荷物情報(マッチングしていない荷物)',
      content: <ShippingRequestSearchForm tab='baggage_search' search={handleSubmit} isLoading={loading} />,
    },
    {
      key: 'flight_search',
      title: '空便情報(マッチングしていない便)',
      content: <ShippingRequestSearchForm tab='flight_search' search={handleSubmit} isLoading={loading} />,
    },
  ];

  return (
    <div id={ROUTER_ID.CARRIER_SHIPPING_REQUEST}>
      <div className='bg-white p-4'>
        <h2>リクエスト検索</h2>
        <CmnTabs className='mt-6' items={tabsSearch} value={tab} onSelectionChange={onChangeTab} />
        <div ref={resultRef}>
          {data && <ShippingResultPage isLoading={loading} data={data} param={param!} screen={tab} search={search} />}
        </div>
      </div>
    </div>
  );
};

export default ShippingRequestPage;
