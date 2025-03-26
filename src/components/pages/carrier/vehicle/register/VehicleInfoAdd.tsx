import { Button } from '@nextui-org/react';
import { getCookie } from 'cookies-next';
import { useCallback, useEffect, useState } from 'react';

import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import CmnDropdown from '@/components/common/CmnDropdown';
import CmnFetchAutoComplete from '@/components/common/CmnFetchAutoComplete';
import CmnInput from '@/components/common/CmnInput';
import CmnInputNumber from '@/components/common/CmnInputNumber';
import Label from '@/components/common/Label';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { TEMPERATURE_RANGE_LIST, VEHICLE, VEHICLE_TYPE } from '@/constants/common';
import { KEY_COOKIE_TOKEN } from '@/constants/keyStorage';
import { cn, objectToQueryParamsNoEncode } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { vehicleCarrierService } from '@/services/carrier/vehicle';
import { MessageErrors, VehicleData, VehicleInfo } from '@/types/carrier/vehicle';

const fetchVehicleList = async (search?: string) => {
  const userToken = getCookie(KEY_COOKIE_TOKEN);
  const vehicleCarrierApi = vehicleCarrierService(userToken as string);
  const result = await vehicleCarrierApi.vehicle(search);
  return result;
};

interface VehicleInfoAddProps {
  isOpen: boolean;
  data: VehicleData;
  onClose: () => void;
  onNextModal: () => void;
  onUpdateVehicleData: (data: VehicleData) => void;
}

function VehicleInfoAdd(props: VehicleInfoAddProps) {
  const {
    data,
    isOpen = false,
    onClose = () => null,
    onNextModal = () => null,
    onUpdateVehicleData = () => null,
  } = props;

  const [loading, setLoading] = useState(false);
  const [idSearch, setIdSearch] = useState<number>();
  const [vehicleList, setVehicleList] = useState<VehicleData[]>([]);
  const [messageErrors, setMessageErrors] = useState<MessageErrors>();
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    ...data?.vehicle_info,
    vehicle_type: Number(data?.vehicle_info?.vehicle_type ? data?.vehicle_info?.vehicle_type : VEHICLE[1].value),
  });

  const [page, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const handleChangeValue = useCallback(
    (name: keyof VehicleInfo, value: any) => {
      setVehicleInfo((prev) => ({ ...prev, [name]: value }));
    },
    [vehicleInfo],
  );

  const handleUpdateError = useCallback(
    (name: string, value: string) => {
      setMessageErrors((prev) => ({ ...prev, [name]: value }) as any);
    },
    [messageErrors],
  );

  const fetchData = async (page: number) => {
    setLoading(true);
    fetchVehicleList(objectToQueryParamsNoEncode({ page, pageSize: 20 }))
      .then((response) => {
        setVehicleList((old) => [...old, ...response.dataList]);
        setTotalPage(response.totalPage);
      })
      .catch((error) => {
        console.log('[ERROR] = vehicleList:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleUpdate = useCallback(() => {
    const vehicleInfo = vehicleList.find((item) => item.vehicle_info.id === idSearch);
    if (vehicleInfo?.vehicle_info) {
      // eslint-disable-next-line no-unsafe-optional-chaining
      const { images, id, vehicle_code, vehicle_size, status, ...vehicleInfoValue } = vehicleInfo?.vehicle_info;
      setVehicleInfo({
        ...vehicleInfoValue,
      } as VehicleInfo);
      setMessageErrors(undefined);
    }
  }, [idSearch]);

  const getDataNew = (dataVehicle: VehicleInfo) => {
    const { ...vehicleInfo } = dataVehicle;
    return {
      ...data,
      vehicle_info: {
        ...data?.vehicle_info,
        ...vehicleInfo,

        vehicle_type:
          vehicleInfo?.vehicle_type || data?.vehicle_info?.vehicle_type
            ? Number(vehicleInfo?.vehicle_type || data?.vehicle_info?.vehicle_type)
            : VEHICLE_TYPE.TRACTOR,
      },
    };
  };

  const checkRequired = () => {
    const requiredFields = {
      vehicle_name: '車両名称',
      registration_area_code: '運輸支局',
      registration_group_number: '分類番号',
      registration_character: 'かな文字',
      registration_number_1: '一連指定番号',
    };

    return Object.entries(requiredFields).reduce((acc, [field, label]) => {
      const value = vehicleInfo?.[field as keyof VehicleInfo]?.toString().trim();
      if (!value) {
        acc[field as keyof MessageErrors] = gTxt('VALIDATE.REQUIRED', { field: label });
      }
      return acc;
    }, {} as MessageErrors);
  };

  const handleNextModal = () => {
    if (Object.values(checkRequired()).length) {
      setMessageErrors(checkRequired());
    } else if (messageErrors && Object.values(messageErrors).some((value) => value !== undefined && value !== '')) {
      setMessageErrors(messageErrors);
    } else {
      const vehicleInfoValue = getDataNew(vehicleInfo);
      onUpdateVehicleData({ vehicle_no_available: [], vehicle_info: vehicleInfoValue?.vehicle_info || {} });
      onNextModal();
    }
  };

  const styleTitle = 'w-28';
  const textDefault = '';

  return (
    <CmnModal isOpen={isOpen} onClose={onClose}>
      <CmnModalHeader title='車両情報の登録' description='登録されている車両情報の詳細です。' />
      <CmnModalBody>
        <div className='text-xs font-normal leading-[1.313rem] p-6 border border-other-gray rounded-lg'>
          <p className='text-[#1A1A1C] text-base font-bold'>登録済み車両情報をコピー</p>
          <p className='text-[#626264] mt-2'>登録済みの車両情報をコピーして入力に利用できます。</p>
          <div className='flex items-center'>
            <CmnFetchAutoComplete
              width='w-[12.5rem]'
              classNameWrap='mr-[15%]'
              isLoading={loading}
              placeholder='選んでください'
              selected={idSearch ? `${idSearch}` : undefined}
              onChange={(value) => setIdSearch(Number(value))}
              fetchMoreData={() => {
                if (page < totalPage) {
                  setPage(page + 1);
                }
              }}
              items={
                vehicleList?.length > 0
                  ? (vehicleList || []).map((item) => ({
                      key: item?.vehicle_info?.id ? item?.vehicle_info?.id?.toString() : '',
                      label: item?.vehicle_info?.vehicle_name ? item?.vehicle_info?.vehicle_name : '',
                    }))
                  : []
              }
            />

            <Button onPress={handleUpdate} radius='sm' className='text-white bg-primary h-12 px-4 text-base font-bold'>
              読み込んで入力欄にコピー
            </Button>
          </div>
          <form key={`${idSearch}`}>
            <div className='mt-4'>
              <Label title='車両名称' required txtRequired='※必須' />
              <p className='mt-1 text-xs font-normal leading-[1.313rem]'>
                車両を識別するために、メーカー名・車種名・管理番号などを、任意で入力してください。
              </p>
              <CmnInput
                title=''
                name='vehicle_name'
                classNameWrap='w-[11rem] mt-2'
                value={vehicleInfo?.vehicle_name}
                errorMessage={messageErrors?.vehicle_name}
                onValueChange={(value) => {
                  handleUpdateError('vehicle_name', '');
                  handleChangeValue('vehicle_name', value || '');
                }}
              />
            </div>

            <div className='mt-4'>
              <p className='text-[#1A1A1C] left-7 font-bold text-base'>車両ナンバー</p>
              <div className='flex flex-wrap items-start mt-3 gap-y-3'>
                <CmnInput
                  required
                  title='運輸支局'
                  txtRequired='※必須'
                  name='registration_area_code'
                  classNameWrap='w-[11rem] mr-3'
                  value={vehicleInfo?.registration_area_code}
                  errorMessage={messageErrors?.registration_area_code}
                  onValueChange={(value) => {
                    handleUpdateError('registration_area_code', '');
                    handleChangeValue('registration_area_code', value || '');
                  }}
                />
                <CmnInput
                  required
                  title='分類番号'
                  txtRequired='※必須'
                  classNameWrap='w-[11rem] mr-3'
                  name='registration_group_number'
                  value={vehicleInfo?.registration_group_number}
                  errorMessage={messageErrors?.registration_group_number}
                  onValueChange={(value) => {
                    handleUpdateError('registration_group_number', '');
                    handleChangeValue('registration_group_number', value || '');
                  }}
                />
                <CmnInput
                  required
                  title='かな文字'
                  txtRequired='※必須'
                  name='registration_character'
                  classNameWrap='w-[11rem] mr-3'
                  value={vehicleInfo?.registration_character}
                  errorMessage={messageErrors?.registration_character}
                  onValueChange={(value) => {
                    const valueNew = value?.trim();
                    handleUpdateError(
                      'registration_character',
                      valueNew?.length > 1 ? gTxt('VALIDATE.MAX_LENGTH', { field: 'かな文字', max: 1 }) : '',
                    );
                    handleChangeValue('registration_character', valueNew);
                  }}
                />
                <CmnInput
                  required
                  title='一連指定番号'
                  txtRequired='※必須'
                  classNameWrap='w-[11rem] mr-3'
                  value={vehicleInfo?.registration_number_1}
                  errorMessage={messageErrors?.registration_number_1}
                  onValueChange={(value) => {
                    handleChangeValue('registration_number_1', value);
                    handleUpdateError('registration_number_1', '');
                  }}
                />
              </div>
            </div>

            <div className='mt-4'>
              <p className='text-[#1A1A1C] left-7 font-bold text-base'>車両種別</p>
              <CmnDropdown
                size='md'
                disallowEmptySelection
                items={VEHICLE.slice(1)}
                classNameWrap='w-[11rem] min-w-[11rem] mt-2'
                selectedKeys={[`${vehicleInfo?.vehicle_type}`]}
                onChange={(e) => {
                  handleChangeValue('vehicle_type', Number(e.target.value));
                  e?.target?.value === VEHICLE[1].value && handleChangeValue('temperature_range', []);
                }}
              />
            </div>
            <div className='flex items-center mt-4'>
              <p className={cn(styleTitle, 'font-bold text-base leading-7')}>温度帯</p>
              <CmnCheckboxGroup
                title=''
                size='sm'
                classNameWrap='mr-6'
                option={TEMPERATURE_RANGE_LIST.slice(1)}
                isDisabled={vehicleInfo?.vehicle_type === Number(VEHICLE[1].value)}
                onChange={(value: string[]) => handleChangeValue('temperature_range', value.map(Number))}
                value={
                  vehicleInfo?.temperature_range && vehicleInfo?.vehicle_type !== Number(VEHICLE[1].value)
                    ? (vehicleInfo?.temperature_range || []).map(String)
                    : []
                }
              />
              <p className='text-foreground'>(トラクタの場合)</p>
            </div>

            <div className='mt-2'>
              <p className='font-bold text-base leading-7'>荷台情報</p>
              <div className='flex flex-wrap items-start gap-y-3 mt-3'>
                <CmnInputNumber
                  title='最大積載量'
                  name='max_payload'
                  placeholder={textDefault}
                  classNameWrap='w-[11rem] mr-3'
                  errorMessage={messageErrors?.max_payload}
                  valueDefault={vehicleInfo?.max_payload ? +vehicleInfo?.max_payload : undefined}
                  setValue={(name, value) => {
                    handleChangeValue('max_payload', value ? +value : 0);
                    const hasTooManyDecimals = value?.toString()?.split('.')[1]?.length > 3;
                    handleUpdateError(
                      'max_payload',
                      hasTooManyDecimals ? gTxt('VALIDATE.MAX_CHARS_AFTER_PERIOD', { max: 3 }) : '',
                    );
                  }}
                  endContent={<span className='text-xs font-normal leading-[1.313rem] text-[#757575]'>t</span>}
                />

                <CmnInputNumber
                  title='荷台全長'
                  name='total_length'
                  placeholder={textDefault}
                  classNameWrap='w-[11rem] mr-3'
                  errorMessage={messageErrors?.total_length}
                  setValue={(name, value) => {
                    handleChangeValue('total_length', value ? +value : 0);
                    const hasTooManyDecimals = value?.toString()?.split('.')[1]?.length > 3;
                    handleUpdateError(
                      'total_length',
                      hasTooManyDecimals ? gTxt('VALIDATE.MAX_CHARS_AFTER_PERIOD', { max: 3 }) : '',
                    );
                  }}
                  valueDefault={vehicleInfo?.total_length ? +vehicleInfo?.total_length : undefined}
                  endContent={<span className='text-xs font-normal leading-[1.313rem] text-[#757575]'>cm</span>}
                />

                <CmnInputNumber
                  title='荷台全幅'
                  name='total_width'
                  placeholder={textDefault}
                  classNameWrap='w-[11rem] mr-3'
                  errorMessage={messageErrors?.total_width}
                  valueDefault={vehicleInfo?.total_width ? +vehicleInfo?.total_width : undefined}
                  setValue={(name, value) => {
                    handleChangeValue('total_width', value ? +value : 0);
                    const hasTooManyDecimals = value?.toString()?.split('.')[1]?.length > 3;
                    handleUpdateError(
                      'total_width',
                      hasTooManyDecimals ? gTxt('VALIDATE.MAX_CHARS_AFTER_PERIOD', { max: 3 }) : '',
                    );
                  }}
                  endContent={<span className='text-xs font-normal leading-[1.313rem] text-[#757575]'>cm</span>}
                />
                <CmnInputNumber
                  title='荷台全高'
                  name='total_height'
                  placeholder={textDefault}
                  classNameWrap='w-[11rem] mr-3'
                  errorMessage={messageErrors?.total_height}
                  setValue={(name, value) => {
                    handleChangeValue('total_height', value ? +value : 0);
                    const hasTooManyDecimals = value?.toString()?.split('.')[1]?.length > 3;
                    handleUpdateError(
                      'total_height',
                      hasTooManyDecimals ? gTxt('VALIDATE.MAX_CHARS_AFTER_PERIOD', { max: 3 }) : '',
                    );
                  }}
                  valueDefault={vehicleInfo?.total_height ? +vehicleInfo?.total_height : undefined}
                  endContent={<span className='text-xs font-normal leading-[1.313rem] text-[#757575]'>cm</span>}
                />
              </div>
            </div>

            <div className='mt-3 flex flex-row flex-wrap gap-y-3 items-center'>
              <CmnInputNumber
                title='地上高'
                name='ground_clearance'
                placeholder={textDefault}
                classNameWrap='w-[11rem] mr-3'
                errorMessage={messageErrors?.ground_clearance}
                setValue={(name, value) => {
                  handleChangeValue('ground_clearance', value ? +value : 0);
                  const hasTooManyDecimals = value?.toString()?.split('.')[1]?.length > 3;
                  handleUpdateError(
                    'ground_clearance',
                    hasTooManyDecimals ? gTxt('VALIDATE.MAX_CHARS_AFTER_PERIOD', { max: 3 }) : '',
                  );
                }}
                valueDefault={vehicleInfo?.ground_clearance ? +vehicleInfo?.ground_clearance : undefined}
                endContent={<span className='text-xs font-normal leading-[1.313rem] text-[#757575]'>cm</span>}
              />

              <CmnInputNumber
                title='門高'
                name='door_height'
                placeholder={textDefault}
                classNameWrap='w-[11rem] mr-3'
                errorMessage={messageErrors?.door_height}
                valueDefault={vehicleInfo?.door_height ? +vehicleInfo?.door_height : undefined}
                endContent={<span className='text-xs font-normal leading-[1.313rem] text-[#757575]'>cm</span>}
                setValue={(name, value) => {
                  handleChangeValue('door_height', value ? +value : 0);
                  const hasTooManyDecimals = value?.toString()?.split('.')[1]?.length > 3;
                  handleUpdateError(
                    'door_height',
                    hasTooManyDecimals ? gTxt('VALIDATE.MAX_CHARS_AFTER_PERIOD', { max: 3 }) : '',
                  );
                }}
              />

              <CmnInput
                title='ボディ形状'
                name='body_shape'
                placeholder={textDefault}
                classNameWrap='w-[11rem] mr-3'
                value={vehicleInfo?.body_shape}
                onValueChange={(value) => handleChangeValue('body_shape', value)}
              />

              <CmnInput
                title='ボディ使用'
                name='body_specification'
                placeholder={textDefault}
                classNameWrap='w-[11rem] mr-3'
                value={vehicleInfo?.body_specification}
                onValueChange={(value) => handleChangeValue('body_specification', value)}
              />
            </div>

            <CmnInput
              title='ボディ架装'
              name='body_construction'
              placeholder={textDefault}
              classNameWrap='w-[11rem] mt-4'
              value={vehicleInfo?.body_construction}
              onValueChange={(value) => handleChangeValue('body_construction', value)}
            />
          </form>
        </div>
      </CmnModalBody>
      <CmnModalFooter
        buttonLeftFirst={{
          onPress: onClose,
          children: '編集を中止',
          className: 'font-bold border-none bg-background px-4',
        }}
        buttonRightFirst={{
          children: '次へ',
          onPress: handleNextModal,
          className: 'font-bold border-1 px-4',
        }}
      />
    </CmnModal>
  );
}

export default VehicleInfoAdd;
