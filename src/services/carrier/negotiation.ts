import { DeliveryAbility } from '@/types/schedule';

import { CarrierApi } from './carrierApi';

export const negotiationCarrierService = (token?: string) => {
  const carrierService = new CarrierApi(token);
  return {
    detailDeliveryAbilityTracking: (id: number) => {
      return carrierService.get<DeliveryAbility>(`/delivery-ability-item/${id}/tracking`);
    },
  };
};
