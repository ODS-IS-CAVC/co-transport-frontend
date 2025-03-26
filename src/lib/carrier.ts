import { TEMPERATURE_RANGE_LIST } from '@/constants/common';
import { Matching } from '@/lib/matching';

export const isNotMatch = (status: number): boolean => {
  return status === Matching.NOT_MATCH;
};

export const isShipperMatch = (status: number): boolean => {
  return status === Matching.TRANSACTION_SHIPPER;
};

export const isMatched = (status: number): boolean => {
  return status === Matching.MATCH_OK;
};

export const isCarrierMatch = (status: number): boolean => {
  return status === Matching.MATCHING_CARRIER;
};

export const isCarrierApprove = (status: number): boolean => {
  return status === Matching.CARRIER_APPROVE;
};

export const isShipperApprove = (status: number): boolean => {
  return status === Matching.SHIPPER_APPROVE;
};

export const getCondition = (conditions: string[]) => {
  if (!conditions || typeof conditions === 'string') {
    return conditions || '';
  }
  return conditions
    .map((item) => {
      const condition = TEMPERATURE_RANGE_LIST.find((condition) => {
        return condition.key == String(item).trim();
      });
      return condition?.label;
    })
    .join(' ');
};

export const isView = (mode: string): boolean => {
  return mode === 'view';
};
export const isUpdate = (mode: string): boolean => {
  return mode === 'update';
};
export const isChat = (mode: string): boolean => {
  return mode === 'chat';
};

export default {
  isNotMatch,
  isShipperMatch,
  isMatched,
  isCarrierMatch,
  isCarrierApprove,
  isShipperApprove,
};
