import { TEMPLATE_CSV } from '@/constants/common';
import { TransportInfo, TransportInfoResponse, TransportPlanInfoRequest } from '@/types/shipper/transportList';

import { ShipperApi } from './shipperApi';

const TRANSPORT_URL = '/transport-plan';

export const transportService = (token?: string) => {
  const transportApi = new ShipperApi(token);
  return {
    getLstTransport: (search?: string) => {
      return transportApi.get<TransportInfoResponse>(`${TRANSPORT_URL}?${search}`);
    },
    transportPlanDetails: (id: number) => {
      return transportApi.get<TransportInfo>(`${TRANSPORT_URL}/${id}`);
    },
    createTransportPlan: (value: TransportPlanInfoRequest) => {
      return transportApi.post<any>(`${TRANSPORT_URL}`, value);
    },
    updateTransportPlan: (id: number, value: TransportPlanInfoRequest) => {
      return transportApi.put<any>(`${TRANSPORT_URL}/${id}`, value);
    },
    createTransportPlanCSV: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return transportApi.post<any | null>(`transport-plan-bulk`, formData);
    },

    transportPlanDownloadCSV: () => {
      return transportApi.get(`/download?fileName=${TEMPLATE_CSV.TRANSPORT_PLAN}`);
    },
  };
};
