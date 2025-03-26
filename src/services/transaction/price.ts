import { IDetailResponse } from '@/types/response';
import { IMarketPrice } from '@/types/shipper/price';

import { TransactionApi } from './transactionApi';

export const priceService = (token?: string) => {
  const transactionService = new TransactionApi(token);
  return {
    shipperMarket: (month?: string) =>
      transactionService.get<IDetailResponse<IMarketPrice>>(`/market_price/shipper?month=${month}`),
  };
};
