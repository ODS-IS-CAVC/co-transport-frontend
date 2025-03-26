import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';

interface Props {
  isOpen: boolean;
  data: string;
  onClose: () => void;
}

const ModalCreateMatchingSuccess = (props: Props) => {
  const { isOpen, data, onClose } = props;

  return (
    <CmnModal isOpen={isOpen} onClose={onClose}>
      <CmnModalHeader title='提案完了' />
      <CmnModalBody>
        <p className='text-xs mb-6'>運行を提案しました。</p>
        <div className='text-sm leading-6'>
          <p className='py-2'>{`${data}の輸送計画に運行提案を送信しました。`}</p>
          <p className='py-2'>※更新情報は取引ダッシュボード、取引詳細から確認可能です。</p>
        </div>
      </CmnModalBody>
      <CmnModalFooter buttonLeftFirst={{ children: '閉じる', onPress: onClose }} />
    </CmnModal>
  );
};

export default ModalCreateMatchingSuccess;
