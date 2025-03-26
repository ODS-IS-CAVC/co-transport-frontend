import { IDetailTransaction } from '@/types/carrier/transactionInfo';
import { ITransportMatching as ITransactionCarrier } from '@/types/carrier/transport';
import { IDetailResponse, IListResponse, IProposeResponse, IUpdateResponse } from '@/types/response';
import {
  CombinedTransactionDetail,
  CutOffInfoType,
  ITransactionShipper,
  ITransactionShipperOrder,
  ParamTransactionMatching,
} from '@/types/shipper/transaction';

import { TransactionApi } from './transactionApi';

export const transactionService = (token?: string) => {
  const transactionApi = new TransactionApi(token);
  return {
    // API ATH-018
    apiAth018: (search?: string) => {
      return transactionApi.get<IListResponse<ITransactionCarrier>>(`/transaction/carrier?${search}`);
    },
    // API ATH-007
    apiAth007: (search?: string) => {
      return transactionApi.get<IListResponse<ITransactionShipper>>(`/transaction/shipper?${search}`);
    },
    // API ATH-023
    apiAth023: (id: number) => {
      return transactionApi.get<{ data: CombinedTransactionDetail }>(`/transaction/${id}`);
    },
    // API ATH-308
    apiAth308: (id: number) => {
      return transactionApi.get<{ data: IDetailTransaction }>(`/transaction/carrier/${id}/carrier/${id}`);
    },
    // API ATH-301
    apiAth301: (id: number) => {
      return transactionApi.get<any>(`/transport_ability/carrier/${id}/matching`);
    },
    // API ATH-303
    apiAth303: (id: number) => {
      return transactionApi.post<any>(`/transport_ability/carrier/${id}/sale`);
    },
    // API ATH-304
    apiAth304: (id: number) => {
      return transactionApi.post<IDetailTransaction>(`/transport_ability/carrier/${id}/matching`);
    },
    // API ATH-306
    apiAth306: (id: number, matchingId: number) => {
      return transactionApi.post<IDetailTransaction>(`/transaction/carrier/${id}/carrier`, {
        id: matchingId,
      });
    },
    // API ATH-008
    apiAth008: (params: ParamTransactionMatching) => {
      return transactionApi.post<ITransactionShipperOrder>(`/transaction/shipper`, params);
    },
    // API ATH-0211
    apiAth0211: (data: any) => {
      return transactionApi.post<IUpdateResponse<{ id: number }>>(`/transaction/carrier_ix`, data);
    },
    // API ATH-0212
    apiAth0212: (data: any) => {
      return transactionApi.post<IUpdateResponse<{ id: number }>>(`/transaction/carrier_fe`, data);
    },
    // API ATH-0213
    apiAth0213: (data: any) => {
      return transactionApi.post<IUpdateResponse<{ id: number }>>(`/transaction/carrier2`, data);
    },
    // API ATH-021
    apiAth021: (data: any) => {
      return transactionApi.post<IUpdateResponse<{ id: number }>>(`/transaction/carrier`, data);
    },
    // API ATH-3061
    apiAth3061: (data: any) => {
      return transactionApi.post<IProposeResponse>(`/carrier_transaction/shipper`, data);
    },
    // API ATH-029
    apiAth029: (id: number, status: boolean) => {
      return transactionApi.put<IDetailTransaction>(`/transaction/approval/${id}`, {
        approval: status,
      });
    },
    // API ATH-030
    apiAth030: (id: number) => {
      return transactionApi.put<Response>(`/transaction/cancel/${id}`);
    },
    // API ATH-027
    apiAth027: (id: number, status: boolean) => {
      return transactionApi.put<IDetailTransaction>(`/transaction/contract/${id}`, {
        approval: status,
      });
    },
    // API ATH-028
    apiAth028: (id: number) => {
      return transactionApi.put<Response>(`/transaction/payment/${id}`);
    },
    // API ATH-315
    apiAth315: (id: number) => {
      return transactionApi.put<Response>(`/transaction/carrier2/${id}/cancel`);
    },
    // API ATH-3063
    apiAth3063: (id: number, payload: Record<string, any>) => {
      return transactionApi.put<Response>(`/carrier_transaction/shipper/${id}`, payload);
    },
    // API ATH-033
    apiAth033: (id: number) => {
      return transactionApi.put<Response>(`/transaction/re_propose/${id}`);
    },
    // API ATH-3062
    apiAth3062: (id: number, payload: Record<string, any>) => {
      return transactionApi.post<Response>(`/carrier_transaction/shipper/${id}/approval`, payload);
    },
    // API ATH-311
    apiAth311: (id: number, status: boolean) => {
      return transactionApi.put<Response>(`/transaction/carrier2/${id}/contract`, {
        approval: status,
      });
    },
    // API ATH-013
    apiAth013: (id: number, payload: Record<string, any>) => {
      return transactionApi.post<{ data: number }>(`/transaction/shipper/${id}/approval`, payload);
    },
    // API ATH-014
    apiAth014: (id: number, payload: Record<string, any>) => {
      return transactionApi.put<{ data: number }>(`/transaction/shipper/${id}`, payload);
    },
    // API ATH-0083
    apiAth0083: (id: number) => {
      return transactionApi.put<{ data: number }>(`/transaction/shipper/${id}/cancel`);
    },
    // API ATH-0081
    apiAth0081: (id: number, status: boolean) => {
      return transactionApi.put<{ data: number }>(`/transaction/shipper/${id}/contract`, {
        approval: status,
      });
    },
    // API ATH-0082
    apiAth0082: (id: number) => {
      return transactionApi.put<{ data: number }>(`/transaction/shipper/${id}/payment`);
    },
    // API ATH-312
    apiAth312: (id: number) => {
      return transactionApi.put<{ data: number }>(`/transaction/carrier2/${id}/payment`);
    },
    // API ATH-114
    apiAth114: (id: number) => {
      return transactionApi.get<IDetailResponse<CutOffInfoType>>(`/cut_off_info/${id}`);
    },
    trackingTransOrder: (id: number, body: { ignore: boolean }) => {
      return transactionApi.post<any>(`/trip/trans_order/${id}/tracking`, body);
    },
    // API ATH-316
    apiAth316: (id: number) => {
      return transactionApi.put<any>(`/transaction/carrier2/${id}/transport_decision`);
    },
    // API ATH-032
    apiAth032: (id: number) => {
      return transactionApi.put<any>(`/transaction/transport_decision/${id}`);
    },
    // API ATH-310
    apiAth310: (id: number, payload: Record<string, any>) => {
      return transactionApi.put<any>(`/transaction/carrier2/${id}/approval`, payload);
    },
    // API ATH-034
    apiAth034: (ids: number[], remove: boolean) => {
      return transactionApi.post<any>(`/transaction/emergency`, { id: ids, remove: remove });
    },

    matchingShipper: () => {
      return transactionApi.get<any>('/matching/shipper/1000');
    },
    matchingCarrier: () => {
      return transactionApi.get<any>('/matching/carrier/1000');
    },
    matchingCarrierBetween: () => {
      return transactionApi.get<any>('/matching/carrier2/1000');
    },
    emergencyMatching: async () => {
      const transactionApi1 = new TransactionApi();

      return transactionApi1.get<any>(`/matching/carrier2_emergency/1000`);
    },
  };
};
