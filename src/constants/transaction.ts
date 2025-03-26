// import { OrderStatus } from "@/constants/carrier";

export enum OrderStatus {
  WAIT_CARRIER_APPROVE = 110,
  WAIT_CARRIER_APPROVE_2 = 111,
  WAIT_SHIPPER_APPROVE = 120,
  WAIT_SHIPPER_APPROVE_2 = 121,
  SHIPPER_APPROVED = 130,
  CARRIER_APPROVED = 131,
  SHIPPER_REJECTED = 132,
  CARRIER_REJECTED = 133,
  MAKE_CONTRACT = 140,
  SHIPPER_PAYMENT = 150,
  TRANSPORT_DECISION = 151,
  START_TRANSPORT = 160,
  COMPLETE_TRANSPORT = 161,
  WAIT_CARRIER_CONFIRM = 210,
  WAIT_CARRIER_CONFIRM_2 = 211,
  WAIT_CARRIER_CONFIRM_3 = 220,
  WAIT_CARRIER_CONFIRM_4 = 221,
  CARRIER_APPROVED_PROCESS = 230,
  CARRIER_APPROVED_PROCESS_2 = 231,
  CARRIER_SHIPPER_REJECTED = 232,
  CARRIER_CARRIER_REJECTED = 233,
  CARRIER_MAKE_CONTRACT = 240,
  // CARRIER_REJECT_CONTRACT = 241, // Not used
  CARRIER_PAYMENT = 250,
  TRANSPORT_DECIDED = 251,
  TRANSPORT_ONGOING = 260,
  TRANSPORT_COMPLETED = 261,
}

export const TRANS_STEP: { [key: number]: string } = {
  // Carrier - Shipper
  [OrderStatus.WAIT_CARRIER_APPROVE]: '予約',
  [OrderStatus.WAIT_CARRIER_APPROVE_2]: '予約',
  [OrderStatus.WAIT_SHIPPER_APPROVE]: '予約',
  [OrderStatus.WAIT_SHIPPER_APPROVE_2]: '予約',
  [OrderStatus.SHIPPER_APPROVED]: '契約',
  [OrderStatus.CARRIER_APPROVED]: '契約',
  [OrderStatus.SHIPPER_REJECTED]: '契約',
  [OrderStatus.CARRIER_REJECTED]: '契約',
  [OrderStatus.MAKE_CONTRACT]: '契約',
  [OrderStatus.TRANSPORT_DECISION]: '運行決定',
  [OrderStatus.START_TRANSPORT]: '運行',
  [OrderStatus.COMPLETE_TRANSPORT]: '決済',
  [OrderStatus.SHIPPER_PAYMENT]: '取引完了',

  // Carrier - Carrier
  [OrderStatus.WAIT_CARRIER_CONFIRM]: '予約',
  [OrderStatus.WAIT_CARRIER_CONFIRM_2]: '予約',
  [OrderStatus.WAIT_CARRIER_CONFIRM_3]: '予約',
  [OrderStatus.WAIT_CARRIER_CONFIRM_4]: '予約',
  [OrderStatus.CARRIER_APPROVED_PROCESS]: '契約',
  [OrderStatus.CARRIER_APPROVED_PROCESS_2]: '契約',
  [OrderStatus.CARRIER_SHIPPER_REJECTED]: '契約',
  [OrderStatus.CARRIER_CARRIER_REJECTED]: '契約',
  [OrderStatus.CARRIER_MAKE_CONTRACT]: '契約',
  [OrderStatus.TRANSPORT_DECIDED]: '運行決定',
  [OrderStatus.TRANSPORT_ONGOING]: '運行',
  [OrderStatus.TRANSPORT_COMPLETED]: '決済',
  [OrderStatus.CARRIER_PAYMENT]: '取引完了',
};

export const TRANS_STEP_SHIPPER: { [key: number]: string } = {
  [OrderStatus.WAIT_CARRIER_APPROVE]: '予約',
  [OrderStatus.WAIT_CARRIER_APPROVE_2]: '予約',
  [OrderStatus.SHIPPER_APPROVED]: '契約',
  [OrderStatus.CARRIER_APPROVED]: '契約',
  [OrderStatus.CARRIER_REJECTED]: '契約',
  [OrderStatus.SHIPPER_REJECTED]: '契約',
  [OrderStatus.MAKE_CONTRACT]: '契約',
  [OrderStatus.TRANSPORT_DECISION]: '運行決定',
  [OrderStatus.START_TRANSPORT]: '運行',
  [OrderStatus.COMPLETE_TRANSPORT]: '決済',
  [OrderStatus.SHIPPER_PAYMENT]: '取引完了',
  // default 予約
};

export const TRANS_EVENT = {
  // Carrier - Shipper
  ACCEPT: 'accept',
  REJECT: 'reject',
  CONTRACT_ACCEPT: 'contract_accept',
  CONTRACT_REJECT: 'contract_reject',
  CANCEL: 'cancel',
  PAYMENT: 'payment',
  MATCHING_SALE: 'matching_sale',
  RE_PROPOSAL: 're_proposal',
  // Carrier - Carrier

  CARRIER_CANCEL: 'carrier_cancel',
  CARRIER_REJECT: 'carrier_reject',
  CARRIER_APPROVE: 'carrier_approve',
  CARRIER_RE_PROPOSAL: 'carrier_re_proposal',
  CARRIER_CONTRACT_ACCEPT: 'carrier_contract_accept',
  CARRIER_CONTRACT_REJECT: 'carrier_contract_reject',
  CARRIER_PAYMENT: 'carrier_payment',
};
