'use client';

import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { VehicleAVBResource } from '@/types/carrier/transport';

interface ConditionProposalSuccessModalProps {
  isOpen: boolean;
  isCarrierKan: boolean;
  parent: VehicleAVBResource;
  onClose: () => void;
}

const ConditionProposalSuccessModal = (props: ConditionProposalSuccessModalProps) => {
  const { isOpen, isCarrierKan, parent, onClose } = props;
  return (
    <CmnModal isOpen={isOpen} placement='center' size='4xl' onClose={onClose}>
      <CmnModalHeader
        title='予約完了'
        description='運送能力に類似する条件に調整して予約を行いました。'
        className='flex flex-col p-8 gap-4'
      />
      <CmnModalBody className='flex flex-col text-xs p-8'>
        <p>
          {isCarrierKan
            ? '荷主の運送能力に予約を送信しました'
            : `${parent.operator_name}の運送能力に予約を送信しました`}
        </p>
        <p className='mt-4'>更新情報は取引ダッシュボードと取引詳細から確認可能です</p>
      </CmnModalBody>
      <CmnModalFooter
        className='flex items-center justify-center'
        buttonRightFirst={{ children: '取引詳細へ', onPress: onClose }}
        buttonRightSecond={{ children: '閉じる', onPress: onClose }}
      />
    </CmnModal>
  );
};

export default ConditionProposalSuccessModal;
