import { TEMPLATE_CSV } from '@/constants/common';
import { VehicleData } from '@/types/carrier/vehicle';

import { CarrierApi } from './carrierApi';

export const vehicleCarrierService = (token?: string) => {
  const carrierService = new CarrierApi(token);
  return {
    vehicle: (search?: string) => {
      return carrierService.get<any | null>(`/vehicle${search ? `?${search}` : ''}`);
    },
    vehicleDetail: (id: number) => {
      return carrierService.get<any | null>(`/vehicle/${id}`);
    },
    vehicleUpdate: (id: number, data: VehicleData, files: File[] = []) => {
      const formData = new FormData();
      formData.append('data', JSON.stringify(data));

      if (files.length > 0) {
        files.forEach((file) => {
          formData.append('files', file);
        });
      }
      return carrierService.put<any | null>(`/vehicle/${id}`, formData);
    },
    vehicleAdd: (data: VehicleData, files: File[] = []) => {
      const formData = new FormData();
      formData.append('data', JSON.stringify(data));

      if (files.length > 0) {
        files.forEach((file) => {
          formData.append('files', file);
        });
      }
      return carrierService.post<any | null>('/vehicle', formData);
    },
    vehicleAddCSV: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      return carrierService.post<any | null>('/vehicle/import', formData);
    },
    vehicleDelete: (id: number) => {
      return carrierService.delete<any | null>(`/vehicle/${id}`);
    },
    vehicleDownloadCSV: () => {
      return carrierService.get(`/download?fileName=${TEMPLATE_CSV.VEHICLE}`);
    },
  };
};
