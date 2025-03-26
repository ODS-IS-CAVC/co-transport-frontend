import { TEMPLATE_CSV } from '@/constants/common';
import {
  DataFlightListItem,
  dataPrivate,
  DeliveryAbility,
  DeliveryAbilityRequest,
  DeliveryAbilityResponse,
  DeliveryAbilityVehicleRequest,
  VehicleDiagramTrailerRequest,
} from '@/types/schedule';

import { CarrierApi } from './carrierApi';

export const scheduleCarrierService = (token?: string) => {
  const carrierService = new CarrierApi(token);
  return {
    deliveryAbility: (search?: string) => {
      return carrierService.get<DeliveryAbilityResponse>(`/delivery-ability${search ? `?${search}` : ''}`);
    },
    detailDeliveryAbility: (id: string) => {
      return carrierService.get<DeliveryAbility>(`/delivery-ability/${id}`);
    },
    createDeliveryAbility: (data: DeliveryAbilityRequest) => {
      return carrierService.post<any>(`/delivery-ability`, data);
    },
    updateDeliveryAbility: (id: number, data: DeliveryAbilityRequest) => {
      return carrierService.put<any>(`/delivery-ability/${id}`, data);
    },
    createDeliveryAbilityCSV: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      return carrierService.post<any | null>('/delivery-ability/delivery-ability-bulk', formData);
    },
    updateDeliveryAbilityVehicle: (id: number, data: DeliveryAbilityVehicleRequest[]) => {
      return carrierService.post<any>(`/delivery-ability/${id}/vehicle`, data);
    },
    updateDeliveryAbilityVehiclePrice: (id: number, data: VehicleDiagramTrailerRequest) => {
      return carrierService.post<any>(`/delivery-ability/${id}/price`, data);
    },
    getFlightList: (id: number, search?: string) => {
      return carrierService.get<any>(`/delivery-ability/${id}/items${search ? `?${search}` : ''}`);
    },
    getDetailFlight: (id: number, binName?: string, transportDate?: string) => {
      const search = new URLSearchParams();
      if (binName) search.append('binName', binName);
      if (transportDate) search.append('transportDate', transportDate);
      const searchString = id === 99999 ? search.toString() : '';
      return carrierService.get<any>(`/delivery-ability/item/${id}${searchString ? `?${searchString}` : ''}`);
    },
    deleteItemFlight: (id: number) => {
      return carrierService.delete<any>(`/delivery-ability/item/${id}`);
    },
    updateDetailFlight: (id: number, data: DataFlightListItem) => {
      return carrierService.put<any>(`/delivery-ability/item/${id}`, data);
    },
    updatePrivate: (id: number, data: dataPrivate) => {
      return carrierService.put<any>(`/item/${id}/private`, data);
    },
    scheduleDownloadCSV: () => {
      return carrierService.get(`/download?fileName=${TEMPLATE_CSV.DIAGRAM}`);
    },
  };
};
