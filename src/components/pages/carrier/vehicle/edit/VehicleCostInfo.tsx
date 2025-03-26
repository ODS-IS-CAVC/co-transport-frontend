import { Button } from '@nextui-org/react';

import CmnAutocomplete from '@/components/common/CmnAutocomplete';
import CmnInput from '@/components/common/CmnInput';
import Label from '@/components/common/Label';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { gTxt } from '@/messages/gTxt';

interface VehicleCostInfoAddProps {
  isOpen: boolean;
  onClose: () => void;
}

function VehicleCostInfoAdd(props: VehicleCostInfoAddProps) {
  const { isOpen = false, onClose = () => null } = props;

  return (
    <CmnModal isOpen={isOpen} onClose={onClose}>
      <CmnModalHeader title='原価計算用車両情報' description='原価計算用車両情報を登録してください。' />
      <CmnModalBody>
        <div className='text-sm font-normal leading-7 text-[#1E1E1E]'>
          <div className='p-6 border border-other-gray rounded-lg'>
            <h3>企業関連情報</h3>
            <p className='mt-4 text-base font-bold'>登録済み企業情報をコピー</p>
            <p className='mt-2 text-[#626264]'>登録済みの企業情報をコピーして入力に利用できます。</p>

            <div className='flex items-center'>
              <CmnAutocomplete
                title=''
                size='md'
                options={[]}
                classNameWrap='w-[14rem] min-w-[14rem] mr-[15%]'
                placeholder={gTxt('COMMON.LABEL_PLEASE_SELECT_VEHICLE')}
              />
              <Button color='primary' radius='sm' className='h-12 font-bold text-base'>
                読み込んで入力欄にコピー
              </Button>
            </div>

            <div className='flex items-start mt-4 space-x-6'>
              <div>
                <p className='font-bold text-base leading-7'>基本情報</p>
                <CmnInput title='社名' classNameWrap='w-[11rem] mt-4' />
                <CmnInput title='住所' classNameWrap='w-[11rem] mt-4' />
                <div className='mt-4'>
                  <Label title='区分' />
                  <p className='text-xs font-normal'>営業用は1、自家用は2を入力</p>
                  <CmnInput title='' classNameWrap='w-[11rem] mt-2' />
                </div>
              </div>
              <div>
                <p className='font-bold text-base leading-7'>保有車両台数</p>
                <CmnInput title='大型車両' classNameWrap='w-[11rem] mt-4' />
                <CmnInput title='中型車両' classNameWrap='w-[11rem] mt-4' />
                <CmnInput title='小型車両' classNameWrap='w-[11rem] mt-4' />
              </div>
            </div>

            <div className='flex justify-end'>
              <Button radius='sm' color='primary' className='text-white h-12 font-bold text-base px-4'>
                登録
              </Button>
            </div>
          </div>

          <div className='p-6 border border-other-gray rounded-lg mt-3'>
            <h3>車両関連情報</h3>
            <p className='mt-4 text-base font-bold'>登録済み車両関連情報をコピー</p>
            <p className='mt-2 text-[#626264]'>登録済みの車両関連情報をコピーして入力に利用できます。</p>
            <div className='flex items-center'>
              <CmnAutocomplete
                title=''
                size='md'
                options={[]}
                classNameWrap='w-[14rem] min-w-[14rem] mr-[20%]'
                placeholder={gTxt('COMMON.LABEL_PLEASE_SELECT_VEHICLE')}
              />
              <Button color='primary' radius='sm' className='h-12 font-bold text-base'>
                読み込んで入力欄にコピー
              </Button>
            </div>

            <p className='font-bold text-base leading-7 mt-2'>運行経路</p>
            <div className='flex items-center space-x-4'>
              <CmnInput title='出発' classNameWrap='w-[11rem] mt-4' />
              <CmnInput title='到着' classNameWrap='w-[11rem] mt-4' />
            </div>
            <div className='flex items-center space-x-4'>
              <CmnInput title='月あたり稼働日数' classNameWrap='w-[11rem] mt-4' />
              <CmnInput title='営業距離（片道、km）' classNameWrap='w-[11rem] mt-4' />
              <CmnInput title='一般道路走行距離' classNameWrap='w-[11rem] mt-4' />
            </div>
            <div className='flex items-center space-x-4'>
              <CmnInput title='有料道路走行距離' classNameWrap='w-[11rem] mt-4' />
              <CmnInput title='月当たり運行回数' classNameWrap='w-[11rem] mt-4' />
              <CmnInput title='月間走行距離' classNameWrap='w-[11rem] mt-4' />
            </div>

            <p className='mt-4'>※以降の項目は後日反映とさせていただきます。</p>
            <div className='mt-6'>
              <p className='font-bold'>1：車両費関係</p>
              <p className='font-bold'>2-1：自賠責保険</p>
              <p className='font-bold'>2-2：任意自動車保険</p>
              <p className='font-bold'>3：運行費関係</p>
              <p className='font-bold'>4：人件費関係</p>
              <p className='font-bold'>5：事故費関係</p>
              <p className='font-bold'>6：施設費(車庫及び事務所に関する費用)</p>
              <p className='font-bold'>7：その他諸費用関係</p>
              <p className='font-bold'>8：通行料関係</p>
              <p className='font-bold'>9：一般管理費</p>
              <p className='font-bold'>10：営業利益</p>
            </div>

            <div className='flex justify-end'>
              <Button radius='sm' color='primary' className='text-white h-12 font-bold text-base px-4'>
                登録
              </Button>
            </div>
          </div>
        </div>
      </CmnModalBody>
      <CmnModalFooter
        buttonLeftFirst={{
          onPress: onClose,
          children: '閉じる',
          className: 'border-none bg-background rounded-lg font-bold px-4',
        }}
      />
    </CmnModal>
  );
}

export default VehicleCostInfoAdd;
