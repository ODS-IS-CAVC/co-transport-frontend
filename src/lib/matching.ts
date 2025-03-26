import { TransType } from '@/constants/common';
import { KEY_COOKIE_COMPANY_ID } from '@/constants/keyStorage';
import { OrderStatus } from '@/constants/transaction';
import { getCookie } from '@/lib/utils';
import { ITrailer } from '@/types/carrier/transport';

export enum Matching {
  NOT_MATCH = 0,
  MATCH_OK = 1,
  TRANSACTION_SHIPPER = 2,
  MATCHING_CARRIER = 3,
  SHIPPER_APPROVE = 4,
  CARRIER_APPROVE = 5,
  COMPLETE = 6,
}

export enum MatchingStatus {
  NO_MATCH = 0,
  MATCH_FOUND = 1,
  PICKED_UP = 3,
  NO_MATCH_EXCEPTION = 9,
}

export class MatchingHelper {
  private static matchingStatusMap: Record<MatchingStatus, string> = {
    [MatchingStatus.NO_MATCH]: 'マッチなし',
    [MatchingStatus.MATCH_FOUND]: 'マッチ{x}件',
    [MatchingStatus.PICKED_UP]: 'マッチなし',
    [MatchingStatus.NO_MATCH_EXCEPTION]: 'マッチなし',
  };

  private static orderStatusMap: Record<OrderStatus, { label: string; status: Matching; color: string }> = {
    [OrderStatus.WAIT_SHIPPER_APPROVE]: {
      // 120
      label: 'シッパー提案確認中',
      status: Matching.TRANSACTION_SHIPPER,
      color: 'bg-warning',
    },
    [OrderStatus.WAIT_SHIPPER_APPROVE_2]: {
      // 121
      label: 'シッパー提案確認中',
      status: Matching.TRANSACTION_SHIPPER,
      color: 'bg-warning',
    },
    [OrderStatus.WAIT_CARRIER_APPROVE]: {
      // 110
      label: '予約',
      status: Matching.TRANSACTION_SHIPPER,
      color: 'bg-warning',
    },
    [OrderStatus.WAIT_CARRIER_APPROVE_2]: {
      // 111
      label: '予約',
      status: Matching.TRANSACTION_SHIPPER,
      color: 'bg-warning',
    },
    [OrderStatus.SHIPPER_APPROVED]: {
      // 130
      label: '契約',
      status: Matching.TRANSACTION_SHIPPER,
      color: 'bg-warning',
    },
    [OrderStatus.CARRIER_APPROVED]: {
      // 131
      label: '契約',
      status: Matching.TRANSACTION_SHIPPER,
      color: 'bg-warning',
    },
    [OrderStatus.SHIPPER_REJECTED]: {
      // 132
      label: '予約',
      status: Matching.TRANSACTION_SHIPPER,
      color: 'bg-warning',
    },
    [OrderStatus.CARRIER_REJECTED]: {
      // 133
      label: '再依頼待ち',
      status: Matching.TRANSACTION_SHIPPER,
      color: 'bg-warning',
    },
    [OrderStatus.MAKE_CONTRACT]: {
      // 140
      label: '契約',
      status: Matching.TRANSACTION_SHIPPER,
      color: 'bg-warning',
    },
    [OrderStatus.TRANSPORT_DECISION]: {
      // 151
      label: '運行決定',
      status: Matching.TRANSACTION_SHIPPER,
      color: 'bg-warning',
    },
    [OrderStatus.START_TRANSPORT]: {
      // 160
      label: '運行',
      status: Matching.TRANSACTION_SHIPPER,
      color: 'bg-warning',
    },
    [OrderStatus.COMPLETE_TRANSPORT]: {
      // 161
      label: '取引完了',
      status: Matching.TRANSACTION_SHIPPER,
      color: 'bg-warning',
    },
    [OrderStatus.SHIPPER_PAYMENT]: {
      // 150
      label: '決済',
      status: Matching.TRANSACTION_SHIPPER,
      color: 'bg-other-gray',
    },
    [OrderStatus.WAIT_CARRIER_CONFIRM]: {
      // 210
      label: 'キャリア予約確認中',
      status: Matching.MATCHING_CARRIER,
      color: 'bg-warning',
    },
    [OrderStatus.WAIT_CARRIER_CONFIRM_2]: {
      // 211
      label: 'キャリア予約確認中',
      status: Matching.MATCHING_CARRIER,
      color: 'bg-warning',
    },
    [OrderStatus.WAIT_CARRIER_CONFIRM_3]: {
      // 220
      label: '予約',
      status: Matching.MATCHING_CARRIER,
      color: 'bg-warning',
    },
    [OrderStatus.WAIT_CARRIER_CONFIRM_4]: {
      // 221
      label: '予約',
      status: Matching.MATCHING_CARRIER,
      color: 'bg-warning',
    },
    [OrderStatus.CARRIER_APPROVED_PROCESS]: {
      // 230
      label: '契約',
      status: Matching.MATCHING_CARRIER,
      color: 'bg-warning',
    },
    [OrderStatus.CARRIER_APPROVED_PROCESS_2]: {
      // 231
      label: '契約',
      status: Matching.MATCHING_CARRIER,
      color: 'bg-warning',
    },
    [OrderStatus.CARRIER_CARRIER_REJECTED]: {
      // 233
      label: '再依頼待ち',
      status: Matching.MATCHING_CARRIER,
      color: 'bg-warning',
    },
    [OrderStatus.CARRIER_SHIPPER_REJECTED]: {
      // 232
      label: '予約',
      status: Matching.MATCHING_CARRIER,
      color: 'bg-warning',
    },
    [OrderStatus.CARRIER_MAKE_CONTRACT]: {
      // 240
      label: '契約',
      status: Matching.MATCHING_CARRIER,
      color: 'bg-warning',
    },
    [OrderStatus.TRANSPORT_DECIDED]: {
      // 251
      label: '運行決定',
      status: Matching.MATCHING_CARRIER,
      color: 'bg-warning',
    },
    [OrderStatus.TRANSPORT_ONGOING]: {
      // 260
      label: '運行',
      status: Matching.MATCHING_CARRIER,
      color: 'bg-warning',
    },
    [OrderStatus.TRANSPORT_COMPLETED]: {
      // 261
      label: '取引完了',
      status: Matching.MATCHING_CARRIER,
      color: 'bg-warning',
    },
    [OrderStatus.CARRIER_PAYMENT]: {
      // 250
      label: '決済',
      status: Matching.MATCHING_CARRIER,
      color: 'bg-other-gray',
    },
  };

  // Get by matching status
  public static getMatchingStatus(
    stt: MatchingStatus,
    matchCount?: number,
  ): { label: string; status: Matching; color: string } {
    let label = this.matchingStatusMap[stt] || 'マッチなし';
    let status = Matching.NOT_MATCH;
    let color = 'bg-other-gray';
    if ([MatchingStatus.MATCH_FOUND].includes(stt) && matchCount) {
      label = label.replace('{x}', String(matchCount));
      status = Matching.MATCH_OK;
      color = 'bg-success';
    }

    return { label, color, status };
  }

  // Get by order status
  public static getOrderStatus(status: OrderStatus, role?: string): { label: string; status: Matching; color: string } {
    if (role !== 'shipper') {
      return this.orderStatusMap[status] || { label: 'マッチなし', status: Matching.NOT_MATCH, color: 'bg-other-gray' };
    }

    const shipperStatusMap: Record<number, { label: string; status: Matching; color: string }> = {
      [OrderStatus.WAIT_CARRIER_CONFIRM]: { label: '予約', status: Matching.TRANSACTION_SHIPPER, color: 'bg-warning' },
      [OrderStatus.WAIT_CARRIER_CONFIRM_2]: {
        label: '予約',
        status: Matching.TRANSACTION_SHIPPER,
        color: 'bg-warning',
      },
      [OrderStatus.WAIT_CARRIER_CONFIRM_3]: {
        label: 'キャリア予約確認中',
        status: Matching.TRANSACTION_SHIPPER,
        color: 'bg-warning',
      },
      [OrderStatus.WAIT_SHIPPER_APPROVE]: { label: '予約', status: Matching.TRANSACTION_SHIPPER, color: 'bg-warning' },
      [OrderStatus.WAIT_SHIPPER_APPROVE_2]: {
        label: '予約',
        status: Matching.TRANSACTION_SHIPPER,
        color: 'bg-warning',
      },
      [OrderStatus.WAIT_CARRIER_APPROVE]: {
        label: 'キャリア予約確認中',
        status: Matching.TRANSACTION_SHIPPER,
        color: 'bg-warning',
      },
      [OrderStatus.WAIT_CARRIER_APPROVE_2]: {
        label: 'キャリア予約確認中',
        status: Matching.TRANSACTION_SHIPPER,
        color: 'bg-warning',
      },
      [OrderStatus.SHIPPER_REJECTED]: {
        label: '再提案待ち',
        status: Matching.TRANSACTION_SHIPPER,
        color: 'bg-warning',
      },
      [OrderStatus.CARRIER_REJECTED]: {
        label: '予約',
        status: Matching.TRANSACTION_SHIPPER,
        color: 'bg-warning',
      },
      [OrderStatus.CARRIER_SHIPPER_REJECTED]: {
        label: '再提案待ち',
        status: Matching.MATCHING_CARRIER,
        color: 'bg-warning',
      },
      [OrderStatus.CARRIER_CARRIER_REJECTED]: {
        label: '予約',
        status: Matching.MATCHING_CARRIER,
        color: 'bg-warning',
      },
    };

    return (
      shipperStatusMap[status] ||
      this.orderStatusMap[status] || { label: 'マッチなし', status: Matching.NOT_MATCH, color: 'bg-other-gray' }
    );
  }

  public static getTrailerStatus(trailer: ITrailer) {
    if (trailer?.order_status) {
      if (trailer.trans_type === TransType.SHIPPER) {
        return this.getOrderStatus(+trailer.order_status);
      }
      const companyId = getCookie(KEY_COOKIE_COMPANY_ID);
      const role = companyId === trailer.carrier_operator_id ? 'shipper' : 'carrier';

      return this.getOrderStatus(+trailer.order_status, role);
    }

    return this.getMatchingStatus(+trailer.matching_status, +trailer.total_count);
  }
}
