'use client';

import { useState } from 'react';

import Item from '@/components/pages/carrier/board/Item';
import ModalCompanyInfo from '@/components/pages/carrier/board/Modal/ModalCompanyInfo';
import ModalCreateMatchingSuccess from '@/components/pages/carrier/board/Modal/ModalCreateMatchingSuccess';
import ModalTransaction from '@/components/pages/carrier/board/Modal/ModalDetailTransaction';
import ModalMatching from '@/components/pages/carrier/board/Modal/ModalMatching';
import { mockAccount } from '@/constants/auth';
import { TransType } from '@/constants/common';
import { KEY_COOKIE_COMPANY_ID } from '@/constants/keyStorage';
import useModals from '@/hook/useModals';
import * as CarrierHelper from '@/lib/carrier';
import { MatchingHelper } from '@/lib/matching';
import { getCookie } from '@/lib/utils';
import { ITrailer, ITransportMatching } from '@/types/carrier/transport';

import DetailDiagramItemModal from './Modal/DetailDiagramItemModal';

interface MatchingItemProps {
  item: ITransportMatching;
  type: 'trading' | 'transaction' | 'matching';
  onRefetch?: () => void;
  handleEmergency?: (ids: number[], remove: boolean) => void;
}

const MatchingItem = (props: MatchingItemProps) => {
  const { item, type, onRefetch, handleEmergency } = props;
  const { trailer_1, trailer_2 } = item;
  // Sort trailers by display_order and assign to array
  const trailers = [trailer_1, trailer_2].sort((a, b) => Number(a.display_order) - Number(b.display_order));
  const trailer1 = trailers[0] || {};
  const trailer2 = trailers[1] || {};
  const [trailerActive, setTrailerActive] = useState(trailer1);
  const [dataCreate, setDataCreate] = useState('');

  const [dataCompany, setDataCompany] = useState<any>();

  const eventRequest = (status: number, trailer: ITrailer) => {
    if (CarrierHelper.isNotMatch(status)) {
      return;
    }

    setTrailerActive(trailer);
    if (
      CarrierHelper.isShipperApprove(status) ||
      CarrierHelper.isCarrierApprove(status) ||
      CarrierHelper.isShipperMatch(status) ||
      CarrierHelper.isCarrierMatch(status)
    ) {
      openModal('modalTransaction');
    }

    if (CarrierHelper.isMatched(status)) {
      openModal('modalMatching');
    }
  };

  const { modals, openModal, closeModal } = useModals({
    modalMatching: false,
    createMatchingSuccess: false,
    modalCompanyInfo: false,
    modalTransaction: false,
    modalDetailSchedule: false,
  });

  const trailer1Stt = MatchingHelper.getTrailerStatus(trailer1);
  const trailer2Stt = MatchingHelper.getTrailerStatus(trailer2);

  const cid = getCookie(KEY_COOKIE_COMPANY_ID) as string;

  return (
    <>
      <Item
        item={item}
        eventRequest={eventRequest}
        type={type}
        showDetail={() => {
          openModal('modalDetailSchedule');
        }}
        handleEmergency={handleEmergency}
      />

      {modals.modalMatching && item && trailerActive && (
        <ModalMatching
          isOpen={modals.modalMatching}
          trailer={trailerActive}
          onClose={() => closeModal('modalMatching')}
          onViewCompanyInfo={(id, role) => {
            setDataCompany(mockAccount.find((account) => account.companyId === id && account.role === role));
            openModal('modalCompanyInfo');
          }}
          onSubmit={(dt) => {
            if (dt.trans_type === TransType.SHIPPER) {
              setDataCreate(dt.shipper_operator_name);
            } else {
              setDataCreate(cid === dt.carrier_operator_id ? dt.carrier2_operator_name : dt.carrier_operator_name);
            }
            openModal('createMatchingSuccess');
          }}
        />
      )}

      {modals.createMatchingSuccess && item && (
        <ModalCreateMatchingSuccess
          data={dataCreate}
          isOpen={modals.createMatchingSuccess}
          onClose={() => {
            closeModal('createMatchingSuccess');
            onRefetch && onRefetch();
          }}
        />
      )}

      {modals.modalCompanyInfo && dataCompany && (
        <ModalCompanyInfo
          isOpen={modals.modalCompanyInfo}
          onClose={() => {
            closeModal('modalCompanyInfo');
          }}
          data={dataCompany}
        />
      )}

      {modals.modalTransaction && (
        <ModalTransaction
          open={modals.modalTransaction}
          active={trailerActive}
          item={item}
          onClose={() => {
            closeModal('modalTransaction');
          }}
          onRefetch={onRefetch}
        />
      )}
      {modals.modalDetailSchedule && item && (
        <DetailDiagramItemModal
          item={item}
          isOpen={modals.modalDetailSchedule}
          onClose={() => {
            closeModal('modalDetailSchedule');
          }}
          onRequest={(trailer: ITrailer) => {
            setTrailerActive(trailer);
            eventRequest(MatchingHelper.getTrailerStatus(trailer).status, trailer);
          }}
        />
      )}
    </>
  );
};

export default MatchingItem;
