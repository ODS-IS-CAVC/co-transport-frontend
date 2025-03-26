import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';

interface ModalConfirmMatchingProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const ModalMatchingConfirm = ({ isOpen, onClose, onSubmit }: ModalConfirmMatchingProps) => {
  return (
    <div id='modal-confirm-matching'>
      <CmnModal id={'modal-matching'} isOpen={isOpen} onClose={onClose} size='4xl' placement='top' className='px-2'>
        <CmnModalHeader title='このマッチングを確定しますか？' classNames='mb-0 px-8 pt-8' classNamesTitle='mb-8' />
        <CmnModalBody classNames='px-8 pt-8'>
          <p className='text-sm font-normal text-foreground'>よろしければOKボタンを押してください。</p>
          <p className='text-sm font-normal text-foreground'>事業者にマッチング確定が通知されます。</p>
        </CmnModalBody>
        <CmnModalFooter
          classNames='p-8'
          buttonRightFirst={{
            children: 'OK',
            color: 'primary',
            onPress: onSubmit,
          }}
          buttonLeftFirst={{
            children: '閉じる',
            onPress: onClose,
            className: 'border-none bg-background underline font-bold',
          }}
        />
      </CmnModal>
    </div>
  );
};

export default ModalMatchingConfirm;
