'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import CmnCalendarPrice from '@/components/common/calendar-price/CmnCalendarPrice';
import CmnDropdown from '@/components/common/CmnDropdown';
import CmnInputNumber from '@/components/common/CmnInputNumber';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { CUT_OFF_TIMES, INIT_VEHICLE_DIAGRAM_TRAILER_REQUEST, VEHICLE_TYPE } from '@/constants/common';
import dayjs from '@/lib/dayjs';
import { cn, isEmptyObject } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { ICalendarPrice } from '@/types/app';
import { VehicleDiagramAllocation, VehicleDiagramItem, VehicleDiagramTrailerRequest } from '@/types/schedule';

const cutOffPriceSchema = yup.lazy((value: Record<string, unknown>) =>
  yup.object(
    Object.keys(value || {}).reduce(
      (acc, key) => {
        acc[key] = yup.number().min(0, 'カットオフ時間は0以上で入力してください');
        return acc;
      },
      {} as Record<string, yup.NumberSchema<number | undefined>>,
    ),
  ),
);

const daySchema = yup.object().shape({
  vehicle_diagram_item_id: yup.number().required(),
  vehicle_diagram_item_trailer_id: yup.number().required().nullable(),
  day: yup.string().required(),
  price: yup.number().required(),
  status: yup.number().required(),
});

const trailerSchema = yup.object().shape({
  vehicle_diagram_allocation_id: yup.number().required(),
  freight_rate_type: yup.number().required(),
  days: yup.array(daySchema).required(),
});

const schema = yup.object().shape({
  trip_name: yup.string().required(),
  departure_time: yup.string().required(),
  arrival_time: yup.string().required(),
  freight_rate_type: yup.number().nullable(),
  cut_off_price: cutOffPriceSchema,
  trailers: yup.array(trailerSchema).required(),
});

interface FareAdjustmentModalProps {
  isOpen: boolean;
  vehicleDiagramItems: VehicleDiagramItem[];
  vehicleInfos: Partial<VehicleDiagramAllocation>[];
  detailData?: VehicleDiagramTrailerRequest;
  onClose: () => void;
  onSubmit: (value: VehicleDiagramTrailerRequest) => void; // TODO submit form value here
}

const FareAdjustmentModal = (props: FareAdjustmentModalProps) => {
  const { vehicleInfos, vehicleDiagramItems, detailData, isOpen, onClose, onSubmit } = props;
  const [selectedTrailerIndex, setSelectedTrailerIndex] = useState<number>(0);
  const [dataCalendarPrice, setDataCalendarPrice] = useState<ICalendarPrice[]>([]);
  const [cutOffList, setCutOffList] = useState<string[]>([]);
  const [errorCutoffMessage, setErrorCutoffMessage] = useState<string>('');
  const [formValue, setFormValue] = useState<VehicleDiagramTrailerRequest>({ ...INIT_VEHICLE_DIAGRAM_TRAILER_REQUEST });
  const {
    watch,
    reset,
    setValue,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: formValue,
    mode: 'onChange',
  });

  useEffect(() => {
    if (detailData && JSON.stringify(detailData) !== JSON.stringify(formValue)) {
      reset({ ...detailData });
      setFormValue({ ...detailData });
      setCutOffList(Object.keys(detailData.cut_off_price || {}));
      const trailer = detailData.trailers[selectedTrailerIndex];
      if (trailer) {
        setDataCalendarPrice(
          trailer.days.map((day) => {
            const date = dayjs(day.day);
            return {
              price: day.price,
              day: date.date().toString(),
              month: (date.month() + 1).toString(),
              year: date.year().toString(),
            };
          }),
        );
      }
    }
  }, [detailData]);

  const isValidCutOffPrice = () => {
    const cutOffPrice = watch('cut_off_price');
    if (!cutOffPrice) {
      return false;
    }
    if (isEmptyObject(cutOffPrice)) {
      return false;
    }
    return Object.values(cutOffPrice).every((price) => price !== undefined);
  };

  const handleSelectTrailer = (index: number) => {
    setSelectedTrailerIndex(index);
    const vehicleInfo = vehicleInfos.filter(
      (vehicle) => vehicle.vehicle_info?.id && vehicle.vehicle_info.vehicle_type == VEHICLE_TYPE.TRAILER,
    )[index];
    if (vehicleInfo && vehicleInfo.id) {
      const trailers = watch('trailers');
      const trailer = trailers.find((trailer) => trailer.vehicle_diagram_allocation_id === vehicleInfo.id);
      if (!trailer) {
        trailers.push({
          vehicle_diagram_allocation_id: vehicleInfo.id,
          freight_rate_type: 1,
          days: [],
        });
        setValue('trailers', trailers);
      } else {
        setDataCalendarPrice(
          trailer.days.map((dayTrailer) => {
            const date = dayjs(dayTrailer.day);
            return {
              price: dayTrailer.price,
              day: date.date().toString(),
              month: (date.month() + 1).toString(),
              year: date.year().toString(),
            };
          }),
        );
      }
    }
  };

  // const handleApplyPrice = () => {
  //   const trailers = watch('trailers');
  //   const vehicleInfo = vehicleInfos.filter(
  //     (vehicle) => vehicle.vehicle_info?.id && vehicle.vehicle_info.vehicle_type == VEHICLE_TYPE.TRAILER,
  //   )[selectedTrailerIndex];
  //   const trailer = trailers.find((trailer) => trailer.vehicle_diagram_allocation_id === vehicleInfo.id);
  //   if (trailer) {
  //     selectedDays.forEach((day) => {
  //       const dayString = `${day.year}${day.month.toString().padStart(2, '0')}${day.day.toString().padStart(2, '0')}`;
  //       const vehicleDiagramItem = vehicleDiagramItems.find((item) => item.day === dayString);
  //       if (vehicleDiagramItem) {
  //         // check if the day already exists
  //         const dayExists = trailer.days.find((day) => day.vehicle_diagram_item_id === vehicleDiagramItem.id);
  //         if (!dayExists) {
  //           trailer.days.push({
  //             vehicle_diagram_item_id: vehicleDiagramItem.id,
  //             day: dayString,
  //             price: Number(price),
  //             status: 1,
  //           });
  //         } else {
  //           dayExists.price = Number(price);
  //         }
  //       }
  //     });
  //     setValue('trailers', [...trailers]);
  //     setDataCalendarPrice(
  //       trailer.days.map((dayTrailer) => {
  //         const date = dayjs(dayTrailer.day);
  //         return {
  //           price: dayTrailer.price,
  //           day: date.date().toString(),
  //           month: (date.month() + 1).toString(),
  //           year: date.year().toString(),
  //         };
  //       }),
  //     );
  //   }
  //   setSelectedDays([]);
  // };

  const handleApplyPrice = (price: number, day: string) => {
    const trailers = watch('trailers');
    const vehicleInfo = vehicleInfos.filter(
      (vehicle) => vehicle.vehicle_info?.id && vehicle.vehicle_info.vehicle_type == VEHICLE_TYPE.TRAILER,
    )[selectedTrailerIndex];
    if (vehicleInfo) {
      const trailer = trailers.find((trailer) => trailer.vehicle_diagram_allocation_id === vehicleInfo.id);
      if (trailer) {
        const vehicleDiagramItem = vehicleDiagramItems.find((item) => item.day === day);
        if (vehicleDiagramItem) {
          const dayExists = trailer.days.find((day) => day.vehicle_diagram_item_id === vehicleDiagramItem.id);
          if (!dayExists) {
            trailer.days.push({
              vehicle_diagram_item_id: vehicleDiagramItem.id,
              vehicle_diagram_item_trailer_id: null,
              day: day,
              price: price,
              status: 1,
            });
          } else {
            dayExists.price = price;
          }
        }
        setValue('trailers', [...trailers]);
        setDataCalendarPrice(
          trailer.days.map((dayTrailer) => {
            const date = dayjs(dayTrailer.day);
            return {
              price: dayTrailer.price,
              day: date.date().toString(),
              month: (date.month() + 1).toString(),
              year: date.year().toString(),
            };
          }),
        );
      }
    }
  };

  const handleApplyAllPrice = (price: number) => {
    let trailers = watch('trailers');
    const vehicleInfo = vehicleInfos.filter(
      (vehicle) => vehicle.vehicle_info?.id && vehicle.vehicle_info.vehicle_type == VEHICLE_TYPE.TRAILER,
    )[selectedTrailerIndex];
    if (vehicleInfo) {
      trailers = trailers.map((trailer) => {
        if (trailer.vehicle_diagram_allocation_id === vehicleInfo.id) {
          vehicleDiagramItems.forEach((item) => {
            const dayExists = trailer.days.find((day) => day.vehicle_diagram_item_id === item.id);
            if (!dayExists) {
              trailer.days.push({
                vehicle_diagram_item_id: item.id,
                vehicle_diagram_item_trailer_id: null,
                day: item.day,
                price: price,
                status: 1,
              });
            } else {
              dayExists.price = price;
            }
          });
        }
        return trailer;
      });
      setValue('trailers', trailers);
      setDataCalendarPrice(
        trailers[selectedTrailerIndex].days.map((dayTrailer) => {
          const date = dayjs(dayTrailer.day);
          return {
            price: dayTrailer.price,
            day: date.date().toString(),
            month: (date.month() + 1).toString(),
            year: date.year().toString(),
          };
        }),
      );
    }
  };

  const handleSubmitForm = (value: VehicleDiagramTrailerRequest) => {
    if (!isValidCutOffPrice()) {
      setErrorCutoffMessage(gTxt('VALIDATE.REQUIRED', { field: 'カットオフ時間' }));
    } else {
      setErrorCutoffMessage('');
      onSubmit(value);
    }
  };

  return (
    <CmnModal size='5xl' isOpen={isOpen} onClose={onClose}>
      <CmnModalHeader title='運賃修正' description='登録されている運賃を修正します。' />
      <CmnModalBody className='text-xs'>
        <form className='p-4 rounded border border-other-gray' onSubmit={handleSubmit(handleSubmitForm)}>
          <div className='flex flex-col text-xs px-6'>
            <div className='grid grid-cols-1 gap-y-4 text-sm'>
              <div className='flex items-center'>
                <div className='w-1/5 font-bold'>車両別運賃選択</div>
                <div className='w-3/4 grid grid-cols-2 text-xs font-medium gap-3'>
                  {vehicleInfos
                    .filter(
                      (vehicle) =>
                        vehicle.vehicle_info?.id && vehicle.vehicle_info.vehicle_type == VEHICLE_TYPE.TRAILER,
                    )
                    .map((vehicle, index) => {
                      return (
                        <div
                          key={`tab-vehicle-${index}`}
                          className={cn(
                            'cursor-pointer px-3 py-1 border-b-4 text-[#757575] truncate text-center',
                            selectedTrailerIndex === index ? 'border-primary text-foreground' : 'border-[#E8F1FE]',
                          )}
                          onClick={() => handleSelectTrailer(index)}
                        >
                          <span className='text-base'>{`${vehicle.vehicle_info?.registration_area_code} ${vehicle.vehicle_info?.registration_group_number} ${vehicle.vehicle_info?.registration_character} ${vehicle.vehicle_info?.registration_number_1}`}</span>
                          &#x3000;
                          <span className='text-base font-bold'>{vehicle.vehicle_info?.vehicle_name}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
              <div className=''>
                <CmnCalendarPrice
                  data={dataCalendarPrice}
                  availableDays={vehicleDiagramItems.map((item) => item.day)}
                  handleApplyPrice={handleApplyPrice}
                  handleApplyAllPrice={handleApplyAllPrice}
                />
              </div>
              {CUT_OFF_TIMES.map((cutoff, index) => (
                <div className='flex items-center' key={cutoff.label}>
                  <div className='w-1/5 font-bold'>{index == 0 ? 'カットオフ時間' : ''}</div>
                  <div className='w-4/5'>
                    <div className='flex items-center gap-4'>
                      <div className='flex space-x-2'>
                        <CmnDropdown
                          placeholder='選択'
                          classNameWrap='min-w-[7.5rem] w-[7.5rem]'
                          items={CUT_OFF_TIMES}
                          disabledKeys={cutOffList.filter((_, i) => i !== index)}
                          size='md'
                          selectedKeys={[cutOffList[index]]}
                          onChange={(e) => {
                            const newCutOffList = [...cutOffList];
                            newCutOffList[index] = e.target.value;
                            setCutOffList(newCutOffList);
                          }}
                        />
                        <CmnInputNumber
                          isPrice
                          placeholder='入力'
                          valueDefault={watch(`cut_off_price.${cutOffList[index]}`)}
                          disabled={!cutOffList[index]}
                          classNameWrap='w-40'
                          size='md'
                          endContent='円'
                          onValueChange={(value: string) =>
                            setValue(`cut_off_price.${cutOffList[index]}`, value ? +value : undefined)
                          }
                          errorMessage={errors.cut_off_price?.[cutOffList[index]]?.message}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {errorCutoffMessage && <p className='text-red-500 text-xs mt-2'>{errorCutoffMessage}</p>}
            </div>
          </div>
          <div className='mt-6 flex items-center justify-end'>
            <Button
              color='primary'
              className='font-bold text-base leading-normal'
              size='lg'
              radius='sm'
              type='submit'
              isDisabled={!isValid || !isValidCutOffPrice()}
            >
              <div className='text-bold'>入力確定</div>
            </Button>
          </div>
        </form>
      </CmnModalBody>
      <CmnModalFooter
        buttonLeftFirst={{
          onPress: onClose,
          children: '閉じる',
          className: 'border-1 text-base font-bold border-none bg-background',
        }}
      />
    </CmnModal>
  );
};

export default FareAdjustmentModal;
