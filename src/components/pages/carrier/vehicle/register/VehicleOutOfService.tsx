import { Button } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useState } from 'react';

import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import DialogMonthPicker from '@/components/common/dialog/DialogMonthPicker';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { useAppDispatch } from '@/hook/useRedux';
import { DAY_OF_WEEK_LIST_CHECKBOX } from '@/lib/dayOfWeek';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { vehicleCarrierService } from '@/services/carrier/vehicle';
import { ENotificationType } from '@/types/app';
import { VehicleData, VehicleNoAvailable } from '@/types/carrier/vehicle';

import CalendarVehicle, { CurrentSelection, DateRange } from '../CalendarVehicle';

const vehicleAdd = async ({ data }: { data: VehicleData }) => {
  const vehicleCarrierApi = vehicleCarrierService();
  const result = await vehicleCarrierApi.vehicleAdd(data);
  return result;
};

interface SelectionDate extends CurrentSelection {
  day_week: number[];
}

interface VehicleOutOfServiceProps {
  isOpen: boolean;
  data: VehicleData;
  onClose: () => void;
  fetchData: () => void;
  onCloseModalFather: () => void;
  onUpdateVehicleData: (data: VehicleData) => void;
}

function VehicleOutOfService(props: VehicleOutOfServiceProps) {
  const {
    data,
    isOpen = false,
    onClose = () => null,
    fetchData = () => null,
    onCloseModalFather = () => null,
    onUpdateVehicleData = () => null,
  } = props;
  const dispatch = useAppDispatch();

  const [active, setActive] = useState(true);
  const [isSelect, setIsSelect] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [tempDateRanges, setTempDateRanges] = useState<DateRange[]>([]);
  const [selectionDate, setSelectionDate] = useState<SelectionDate>({
    start_date: null,
    end_date: null,
    day_week: [],
  });

  const handleSubmit = () => {
    const vehicle_no_availableNew = tempDateRanges.map((item) => {
      return {
        ...item,
        start_date: dayjs(item?.start_date).format('YYYYMMDD'),
        end_date: dayjs(item?.end_date).format('YYYYMMDD'),
      };
    });

    const showError = (code: string) => {
      dispatch(
        actions.appAction.showNotification({
          type: ENotificationType.ERROR,
          title: gTxt('MENU.CARRIER.VEHICLE_POST.TITLE_ERROR'),
          content:
            code === 'license_plate_number_or_giai_exist'
              ? 'ナンバープレート番号または解決済みが存在する'
              : gTxt('MENU.CARRIER.VEHICLE_POST.CONTENT_ERROR'),
        }),
      );
    };

    setLoadingAdd(true);
    vehicleAdd({ data: { ...data, vehicle_no_available: vehicle_no_availableNew as VehicleNoAvailable[] } })
      .then((response) => {
        if (response && response?.status && response?.status !== 200) {
          showError(response?.code);
        } else {
          fetchData();
          onUpdateVehicleData(response);
          dispatch(
            actions.appAction.showNotification({
              type: ENotificationType.SUCCESS,
              title: gTxt('MENU.CARRIER.VEHICLE_POST.TITLE_SUCCESS'),
              content: gTxt('MENU.CARRIER.VEHICLE_POST.CONTENT_SUCCESS'),
            }),
          );
        }
      })
      .catch((error) => showError(error?.payload?.responseData?.parameters?.error?.code))
      .finally(() => {
        onClose();
        onCloseModalFather();
        setLoadingAdd(false);
      });
  };

  const formatDateRange = (start: Date, end: Date) => {
    return `${dayjs(start).format('YYYY年M月D日')}～${dayjs(end).format('YYYY年M月D日')}`;
  };

  const handleDeleteTempDate = (key: number) => {
    setTempDateRanges((prevRanges) => prevRanges.filter((_, index) => index !== key));
  };

  const handleConfirm = () => {
    if (selectionDate?.start_date && selectionDate?.end_date) {
      const updateData = () => {
        setIsSelect(!isSelect);
        setErrorMessage('');
        setSelectionDate({
          start_date: null,
          end_date: null,
          day_week: [],
        });
        setTempDateRanges(
          (prevRanges) =>
            [
              ...prevRanges,
              {
                start_date: selectionDate.start_date,
                end_date: selectionDate.end_date,
                day_week: selectionDate?.day_week || [],
              },
            ] as DateRange[],
        );
      };
      if (selectionDate?.day_week.length > 0) {
        const getDaysOfWeekInRange = (startDate: Date, endDate: Date): number[] => {
          const start = dayjs(startDate);
          const end = dayjs(endDate);
          const daysCount = end.diff(start, 'day') + 1;
          return Array.from({ length: daysCount }, (_, i) => start.add(i, 'day').day() || 7).filter(
            (day, index, self) => self.indexOf(day) === index,
          );
        };
        const daysOfWeek = getDaysOfWeekInRange(selectionDate.start_date, selectionDate.end_date);
        const hasCommonElement = daysOfWeek.some((day) => selectionDate.day_week.includes(day));
        hasCommonElement ? updateData() : setErrorMessage('選択した曜日は指定された期間に含まれていません。');
      } else updateData();
    }
  };

  return (
    <CmnModal isOpen={isOpen} onClose={onClose}>
      <CmnModalHeader title='車両使用不可期間の設定' description='使用不能期間を設定してリストに加えてください。' />
      <CmnModalBody>
        <div className='text-[#1E1E1E]'>
          <div className='border border-[#0017C1] p-2 rounded-lg overflow-hidden'>
            <form key={`${isSelect}`} className='p-2 border border-[#264AF4] rounded-lg'>
              <CmnCheckboxGroup
                size='sm'
                value={active ? [] : ['1']}
                onChange={(value: string[]) => setActive(!value?.length)}
                option={[
                  {
                    key: '1',
                    value: '1',
                    label: '期間を日付で設定する',
                  },
                ]}
              />
              <DialogMonthPicker
                disabled={active}
                classNameWrap='mt-6'
                onSelect={(startDate, endDate) =>
                  startDate &&
                  endDate &&
                  setSelectionDate((old) => ({ ...old, start_date: startDate, end_date: endDate }))
                }
              />

              <CmnCheckboxGroup
                size='sm'
                option={DAY_OF_WEEK_LIST_CHECKBOX}
                isDisabled={active}
                classNameWrap='mt-6'
                value={selectionDate?.day_week?.map(String)}
                onChange={(value: string[]) =>
                  setSelectionDate((old) => ({
                    ...old,
                    day_week: value.sort((a, b) => Number(a) - Number(b)).map(Number),
                  }))
                }
              />

              {errorMessage && (
                <p className={'!text-error font-normal text-xs leading-[1.313rem] mt-4'}>{errorMessage}</p>
              )}

              <div className='flex justify-end mt-4'>
                <Button
                  radius='sm'
                  color='primary'
                  isDisabled={active}
                  onPress={handleConfirm}
                  className='text-white h-12 text-base font-bold'
                >
                  この期間を使用不能期間に加える
                </Button>
              </div>
            </form>
            <h3 className='mt-6'>設定された運行期間</h3>
            <p className='mt-2 mb-4'>青く表示されていない期間が設定された「車両使用不可期間」です</p>
            <CalendarVehicle
              initialDates={
                tempDateRanges.length
                  ? tempDateRanges.map((date) => ({
                      ...date,
                      start_date: dayjs(date?.start_date).format('YYYYMMDD'),
                      end_date: dayjs(date?.end_date).format('YYYYMMDD'),
                    }))
                  : (data?.vehicle_no_available as any)
              }
              onGetDataCalendar={(tempDateRangesData) => setTempDateRanges(tempDateRangesData)}
            />
          </div>

          <div className='border rounded-lg p-6 border-other-gray mt-4'>
            <h3>設定された車両使用不能期間一覧</h3>
            <>
              {(tempDateRanges || []).map((range, index) => (
                <div key={index} className='flex items-center justify-between mt-2'>
                  <div className='flex items-center flex-wrap font-bold'>
                    <p className='mr-2'>{formatDateRange(range?.start_date, range?.end_date)}</p>
                    {(range?.day_week || []).map((day, index, array) => (
                      <p key={day}>
                        {DAY_OF_WEEK_LIST_CHECKBOX.find((item) => item.value === String(day))?.label}
                        {index !== array.length - 1 ? '、' : ''}
                      </p>
                    ))}
                  </div>
                  <Button
                    radius='sm'
                    onPress={() => handleDeleteTempDate(index)}
                    className='bg-white border-error text-error border-1 font-bold text-base !w-[6.25rem]'
                  >
                    設定を削除
                  </Button>
                </div>
              ))}
            </>
          </div>
        </div>
      </CmnModalBody>
      <CmnModalFooter
        buttonLeftFirst={{
          children: '閉じる',
          onPress: onClose,
          className: 'border-none bg-background rounded-lg font-bold',
        }}
        buttonRightFirst={{
          children: '入力確定',
          onPress: handleSubmit,
          isLoading: loadingAdd,
          className: 'border-1 rounded-lg font-bold',
        }}
      />
    </CmnModal>
  );
}

export default VehicleOutOfService;
