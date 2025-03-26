import { CarrierApi } from './carrierApi';

export const commonCarrierService = (token?: string) => {
  const carrierService = new CarrierApi(token);
  return {
    getPrefectures: () => {
      return carrierService.get<any>(`/locations`);
    },
  };
};
