import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { UserInfo } from '@/types/auth';

interface CompanyInfoModalProps {
  isOpen: boolean;
  data: UserInfo;
  onClose: () => void;
}

const CompanyInfoModal = (props: CompanyInfoModalProps) => {
  const { isOpen, data, onClose } = props;

  return (
    <CmnModal isOpen={isOpen} onClose={onClose}>
      <CmnModalHeader title={data.role === 'shipper' ? '荷主会社情報' : '会社情報'} />
      <CmnModalBody>
        <p className='text-xs mb-2'>
          {data.role === 'shipper' ? '荷主の会社情報です。' : '運送事業者の会社情報です。'}
        </p>
        <div className='bg-white border border-other-gray rounded-lg text-sm p-4'>
          <div className='w-full text-sm text-gray-700'>
            <div className='px-2 py-1 flex'>
              <p className='font-bold w-28'>会社名</p>
              <p>{data.companyName}</p>
            </div>
            <div className='px-2 py-1 flex'>
              <p className='font-bold w-28'>住所</p>
              <p>{data.address}</p>
            </div>
            <div className='px-2 py-1 flex'>
              <p className='font-bold w-28'>担当者</p>
              <p>{data.contactPerson}</p>
            </div>
            <div className='px-2 py-1 flex'>
              <p className='font-bold w-28'>所属</p>
              <p>{data.department}</p>
            </div>
            <div className='px-2 py-1 flex'>
              <p className='font-bold w-28'>その他</p>
              <p></p>
            </div>
            <div className='px-2 py-1 flex'>
              <p className='font-bold w-28'>電話番号</p>
              <p>{data.phoneNumber}</p>
            </div>
            <div className='px-2 py-1 flex'>
              <p className='font-bold w-28'>メールアドレス</p>
              <p>{data.email}</p>
            </div>
          </div>
        </div>
      </CmnModalBody>
      <CmnModalFooter
        buttonLeftFirst={{
          onPress: onClose,
          children: '閉じる',
          className: 'border-1 text-base font-bold px-4 border-none bg-background',
        }}
      />
    </CmnModal>
  );
};

export default CompanyInfoModal;
