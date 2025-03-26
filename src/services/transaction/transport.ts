import { IMatchingShipperItem, ITransportMatching as ITransportMatchingCarrier } from '@/types/carrier/transport';
import { IDetailResponse, IListResponse } from '@/types/response';
import {
  ITransportMatching,
  ITransportMatching as ITransportMatchingShipper,
  ITransportPlanSale,
} from '@/types/shipper/transport';

import { TransactionApi } from './transactionApi';

export const transportService = (token?: string) => {
  const transportApi = new TransactionApi(token);

  return {
    // ATH-0191
    apiAth0191: (search?: string) => {
      return transportApi.get<IListResponse<any>>(`/transport_ability/shipper/search?${search}`);
    },
    // ATH-009
    apiAth009: (search?: string) => {
      return transportApi.get<IListResponse<any>>(`/transport_plan/public?${search}`);
    },
    // ATH-3051
    apiAth3051: (search?: string) => {
      return transportApi.get<IListResponse<any>>(`/carrier_transport_plan/search?${search}`);
    },
    // API ATH-012
    apiAth012: (search?: string) => {
      return transportApi.get<IListResponse<ITransportMatchingCarrier>>(`/transport_ability/matching?${search}`);
    },
    // API ATH-013
    apiAth013: (id: string) => {
      return transportApi.get<IMatchingShipperItem>(`/transport_ability/matching/${id}`);
    },
    // API ATH-001
    apiAth001: (search?: string) => {
      return transportApi.get<IListResponse<ITransportMatchingShipper>>(`/transport_plan/matching?${search}`);
    },
    // API ATH-002
    apiAth002: (id: number) => {
      return transportApi.get<IDetailResponse<ITransportMatching>>(`/transport_plan/matching/${id}`);
    },
    // API ATH-031
    apiAth031: (search?: string) => {
      return transportApi.get<IListResponse<any>>(`/transport_ability/sale?${search}`);
    },
    // API ATH-113
    apiAth113: (search?: string) => {
      return transportApi.get<IListResponse<ITransportPlanSale>>(`/transport_plan/sale?${search}`);
    },
  };
};
