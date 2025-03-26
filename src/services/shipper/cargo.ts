import { TEMPLATE_CSV } from '@/constants/common';
import { CargoInfoForm, CargoInfoResponse } from '@/types/shipper/cargo';

import { ShipperApi } from './shipperApi';

const CARGO_URL = '/cargo-info';

export const cargoService = (token?: string) => {
  const cargoApi = new ShipperApi(token);
  return {
    cargoShipper: (search?: string) => {
      return cargoApi.get<CargoInfoResponse>(`${CARGO_URL}?${search}`);
    },
    cargoDetail: (id: number) => {
      return cargoApi.get<CargoInfoForm>(`${CARGO_URL}/${id}`);
    },
    deleteCargo: (id: number) => {
      return cargoApi.delete<CargoInfoForm>(`${CARGO_URL}/${id}`);
    },
    createCargo: (formValue: CargoInfoForm) => {
      return cargoApi.post<CargoInfoForm>(`${CARGO_URL}`, {
        cargo_info: formValue,
      });
    },
    updateCargo: (formValue: CargoInfoForm) => {
      return cargoApi.put<CargoInfoForm>(`${CARGO_URL}/${formValue.id}`, {
        cargo_info: formValue,
      });
    },
    createCargoCSV: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return cargoApi.post<any | null>(`${CARGO_URL}/import`, formData);
    },
    cargoDownloadCSV: () => {
      return cargoApi.get(`/download?fileName=${TEMPLATE_CSV.CARGO}`);
    },
  };
};
