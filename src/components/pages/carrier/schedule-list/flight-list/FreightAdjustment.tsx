'use client';

import { Button } from '@nextui-org/react';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import CmnDropdown from '@/components/common/CmnDropdown';
import CmnInputNumber from '@/components/common/CmnInputNumber';
import { CmnTabs } from '@/components/common/CmnTabs';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { CUT_OFF_TIMES, VEHICLE_TYPE } from '@/constants/common';
import { KEY_COOKIE_TOKEN } from '@/constants/keyStorage';
import { useAppDispatch } from '@/hook/useRedux';
import { cn } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { scheduleCarrierService } from '@/services/carrier/schedule';
import { ENotificationType } from '@/types/app';
import { DataFlightListItem } from '@/types/schedule';

const updateDetailFlight = async ({ id, data }: { id: number; data: DataFlightListItem }) => {
  const userToken = getCookie(KEY_COOKIE_TOKEN);
  const scheduleCarrierApi = scheduleCarrierService(userToken as string);
  return await scheduleCarrierApi.updateDetailFlight(id, data);
};

interface CutOffList {
  [key: number]: {
    id: number;
    price: number;
    cut_off_price: { [key: string]: number }[];
  };
}

interface FreightAdjustmentProps {
  id: number;
  isOpen: boolean;
  idTrailer: number;
  onClose: () => void;
  dataFlight: DataFlightListItem;
}

function FreightAdjustment(props: FreightAdjustmentProps) {
  const { id, idTrailer, dataFlight, isOpen = false, onClose = () => null } = props;

  const router = useRouter();
  const dispatch = useAppDispatch();

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const [idActive, setIdActive] = useState(idTrailer);

  const [cutOffList, setCutOffList] = useState<CutOffList>();

  useEffect(() => {
    if (dataFlight?.vehicle_diagram_item_trailer.length) {
      const itemTrailer = (dataFlight?.vehicle_diagram_item_trailer || []).find(
        (data) => data?.vehicle_diagram_allocation_id === idTrailer,
      );
      if (itemTrailer?.cut_off_price) {
        const dataNew = {
          [idTrailer]: {
            id: itemTrailer?.id,
            price: itemTrailer?.price || 0,
            cut_off_price: Object.entries(itemTrailer?.cut_off_price).map(([key, value]) => ({ [key]: value })),
          },
        };
        setCutOffList(dataNew as CutOffList);
      }
    }
  }, [dataFlight?.vehicle_diagram_item_trailer]);

  const getTrailer = (dataFlight?.vehicle_diagram_allocations || []).filter(
    (data) => data?.vehicle_type === VEHICLE_TYPE.TRAILER,
  );

  const handleUpdateIdActive = (id: number) => {
    setIdActive(id);
    const dataNew = vehicleDiagramItemTrailer(id);
    if (dataNew?.cut_off_price && (!cutOffList || !cutOffList[id])) {
      setCutOffList((prev) => ({
        ...prev,
        [id]: {
          id: dataNew?.id,
          price: dataNew?.price || 0,
          cut_off_price: Object.entries(dataNew?.cut_off_price).map(([key, value]) => ({
            [key]: value || 0,
          })),
        },
      }));
    }
  };

  const vehicleDiagramItemTrailer = (idAllocation: number) => {
    return (dataFlight?.vehicle_diagram_item_trailer || []).find(
      (data) => data?.vehicle_diagram_allocation_id === idAllocation,
    );
  };

  const handleUpdateDropdown = (value: string, index: number) => {
    setCutOffList((prevList) => {
      const newList = { ...prevList };
      if (newList && newList[idActive] && newList[idActive].cut_off_price && newList[idActive]?.cut_off_price[index]) {
        newList[idActive].cut_off_price[index] = {
          [value]: Object.values(newList[idActive].cut_off_price[index])[0] || 0,
        };
      } else {
        newList[idActive].cut_off_price[index] = { [value]: 0 };
      }
      return newList;
    });
  };

  const handleUpdateInput = (value: string, index: number) => {
    setCutOffList((prevList) => {
      const newList = { ...prevList };
      if (newList && newList[idActive] && newList[idActive]?.cut_off_price && newList[idActive]?.cut_off_price[index]) {
        newList[idActive].cut_off_price[index] = {
          [Object.keys(newList[idActive].cut_off_price[index])[0]]: +value || 0,
        };
      }
      return newList;
    });
  };

  const handleUpdatePrice = (value: string) => {
    setError(!value ? gTxt('VALIDATE.REQUIRED', { field: '運賃入力' }) : '');
    setCutOffList((prevList) => ({
      ...prevList,
      [idActive]: {
        price: +value,
        id: prevList?.[idActive]?.id || 0,
        cut_off_price: prevList?.[idActive]?.cut_off_price || [],
      },
    }));
  };

  const handleUpdateDetailFlight = async (id: number, data: DataFlightListItem) => {
    setLoading(true);
    updateDetailFlight({
      id,
      data,
    })
      .then((response) => {
        if (response?.status === ENotificationType.SUCCESS) {
          router.refresh();
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.INFO,
              title: '運賃修正',
              content: response?.message || gTxt('MESSAGES.SUCCESS'),
            }),
          );
        } else {
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.ERROR,
              title: '運賃修正',
              content: response?.message || gTxt('MESSAGES.FAILED'),
            }),
          );
        }
      })
      .catch((error) => {
        dispatch(
          actions.appAction.showModalResult({
            type: ENotificationType.ERROR,
            title: '運賃修正',
            content: error?.message || gTxt('MESSAGES.FAILED'),
          }),
        );
      })
      .finally(() => {
        setLoading(false);
        onClose();
      });
  };

  const handleSubmit = async () => {
    !(cutOffList && cutOffList[idActive] && cutOffList[idActive].price) &&
      setError(gTxt('VALIDATE.REQUIRED', { field: '運賃入力' }));
    const idUpdate = cutOffList && cutOffList[idActive] && cutOffList[idActive].id;
    const vehicle_diagram_item_trailer = dataFlight?.vehicle_diagram_item_trailer?.find((item) => item.id === idUpdate);
    if (vehicle_diagram_item_trailer && cutOffList && !error) {
      vehicle_diagram_item_trailer.price = cutOffList[idActive]?.price || 0;
      const updatedCutOffPrice = cutOffList[idActive]?.cut_off_price.reduce<Record<string, number>>((acc, item) => {
        const key = Object.keys(item)[0];
        acc[key] = item[Number(key)];
        return acc;
      }, {});
      vehicle_diagram_item_trailer.cut_off_price = updatedCutOffPrice;

      const data = {
        ...dataFlight,
        vehicle_diagram_item_trailer: (dataFlight?.vehicle_diagram_item_trailer || []).map((item) =>
          item.id === idUpdate ? vehicle_diagram_item_trailer : item,
        ),
      };
      handleUpdateDetailFlight(id, data);
    }
  };

  const checkActive = (dataFlight?.vehicle_diagram_item_trailer || []).find(
    (item) => item.vehicle_diagram_allocation_id === idActive,
  );

  return (
    <CmnModal isOpen={isOpen} onClose={onClose}>
      <CmnModalHeader title='運賃修正' />
      <CmnModalBody>
        <div className='text-sm font-normal leading-[1.225rem] border rounded-lg border-other-gray p-6'>
          <div className='flex items-center'>
            <p className='text-[#000000] font-bold text-base leading-7 w-40'>車両別運賃選択</p>
            <CmnTabs
              onSelectionChange={(key) => handleUpdateIdActive(Number(key))}
              items={[
                getTrailer[0] && {
                  key: `${getTrailer[0]?.id}`,
                  title: `${getTrailer[0]?.vehicle_info?.registration_area_code || ''} ${getTrailer[0]?.vehicle_info?.registration_group_number || ''} ${getTrailer[0]?.vehicle_info?.registration_character || ''} ${getTrailer[0]?.vehicle_info?.registration_number_1 || ''} ${getTrailer[0]?.vehicle_info?.vehicle_name || ''}`,
                  content: '',
                },
                getTrailer[1] && {
                  key: `${getTrailer[1]?.id}`,
                  title: `${getTrailer[1]?.vehicle_info?.registration_area_code || ''} ${getTrailer[1]?.vehicle_info?.registration_group_number || ''} ${getTrailer[1]?.vehicle_info?.registration_character || ''} ${getTrailer[1]?.vehicle_info?.registration_number_1 || ''} ${getTrailer[1]?.vehicle_info?.vehicle_name || ''}`,
                  content: '',
                },
              ]}
            />
          </div>
          <form key={idActive}>
            <div className='flex items-center mt-4'>
              <p className='text-[#000000] font-bold text-base leading-7 w-40'>運賃入力</p>
              <CmnInputNumber
                size='md'
                isPrice
                name='price'
                endContent='円'
                errorMessage={error}
                classNameWrap='w-40'
                valueDefault={cutOffList && cutOffList[idActive]?.price}
                onValueChange={(value: string) => handleUpdatePrice(value)}
              />
            </div>
            <div className='mt-2'>
              {CUT_OFF_TIMES.map((cutoff, index) => (
                <div className='flex items-center' key={cutoff.label}>
                  <p className='text-[#000000] font-bold text-base leading-7 w-40'>
                    {index === 0 ? 'カットオフ時間' : ''}
                  </p>
                  <div className='mt-2'>
                    <div className='flex space-x-4'>
                      <CmnDropdown
                        size='md'
                        placeholder='選択'
                        items={CUT_OFF_TIMES}
                        disallowEmptySelection
                        isDisabled={!cutOffList}
                        classNameWrap='min-w-[7.5rem] w-[7.5rem]'
                        onChange={(e) => handleUpdateDropdown(e.target.value, index)}
                        disabledKeys={
                          (cutOffList &&
                            cutOffList[idActive] &&
                            cutOffList[idActive]?.cut_off_price?.flatMap((item) => Object.keys(item))) ||
                          []
                        }
                        selectedKeys={
                          cutOffList && cutOffList[idActive] && cutOffList[idActive]?.cut_off_price[index]
                            ? Object.keys(cutOffList[idActive]?.cut_off_price[index])
                            : []
                        }
                      />
                      <CmnInputNumber
                        size='md'
                        isPrice
                        endContent='円'
                        placeholder='入力'
                        classNameWrap={cn(
                          'w-40',
                          !(cutOffList && cutOffList[idActive] && cutOffList[idActive]?.cut_off_price[index]) &&
                            'pointer-events-none',
                        )}
                        onValueChange={(value: string) => handleUpdateInput(value, index)}
                        valueDefault={
                          cutOffList && cutOffList[idActive] && cutOffList[idActive]?.cut_off_price[index]
                            ? Object.values(cutOffList[idActive]?.cut_off_price[index])[0]
                            : undefined
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {checkActive && (
              <div className='flex justify-end'>
                <Button radius='sm' color='primary' isLoading={loading} onPress={handleSubmit} className='h-12 px-4'>
                  運賃修正
                </Button>
              </div>
            )}
          </form>
        </div>
      </CmnModalBody>

      <CmnModalFooter
        buttonLeftFirst={{
          children: '閉じる',
          onPress: onClose,
          className: 'border-1 text-base font-bold px-4 border-none bg-background',
        }}
      />
    </CmnModal>
  );
}

export default FreightAdjustment;
