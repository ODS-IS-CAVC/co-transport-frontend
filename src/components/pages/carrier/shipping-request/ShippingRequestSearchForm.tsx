'use client';

import { Button } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import CmnDateRangePicker from '@/components/common/CmnDateRangePicker';
import CmnDropdown from '@/components/common/CmnDropdown';
import CmnInput from '@/components/common/CmnInput';
import CmnInputNumber from '@/components/common/CmnInputNumber';
import CmnTimeInput, { TimeString } from '@/components/common/CmnTimeInput';
import Label from '@/components/common/Label';
import { TEMPERATURE_RANGE } from '@/constants/carrier';
import { DATE_FORMAT } from '@/constants/constants';
import { useAppSelector } from '@/hook/useRedux';
import { LST_CHECKBOX_WEEKDAYS } from '@/lib/dayOfWeek';
import { cn, convertDateFormatPickerYYYYMMDD, isValidDate } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { RootState } from '@/redux/store';
import { IDateRange } from '@/types/app';
import { SearchParamAbilityPublic } from '@/types/carrier/matchingShipper';
import { IPrefecture } from '@/types/prefecture';

interface ReactHookForm {
  depId: string;
  departurePoint?: string;
  transitId?: string;
  transitPoint?: string;
  arrId: string;
  arrivalPoint?: string;
  transportationDate?: IDateRange | null;
  deliveryTime?: { TimeStart: TimeString; TimeEnd: TimeString } | null;
  dayWeek?: number[];
  temperatureRange?: number[];
  freightRateMin?: number;
  freightRateMax?: number;
  keyword?: string;
  apiChoose?: string[];
}

interface Props {
  tab: string;
  search: (param: SearchParamAbilityPublic, apiSearch: string[]) => void;
  isLoading: boolean;
}

const ShippingRequestSearchForm = ({ tab, search, isLoading }: Props) => {
  const regions = useAppSelector((state: RootState) => state.app.locations);

  const [prefectures, setPrefectures] =
    useState<{ key: string; label: string; id: string; prefectures: IPrefecture[] }[]>();
  const [departurePointList, setDeparturePointList] = useState<{ key: string; label: string }[]>();
  // const [transitPointList, setTransitPointList] = useState<{ key: string; label: string }[]>(prefecturesChild);
  const [arrivalPointList, setArrivalPointList] = useState<{ key: string; label: string }[]>();

  const [dateRange, setDateRange] = useState<IDateRange | null>(null);

  useEffect(() => {
    const prefecturesCurrent = regions.map((item) => {
      return { key: `${item.id}`, label: item.name, id: `${item.id}`, prefectures: item.prefectures };
    });

    setPrefectures(prefecturesCurrent);

    const prefecturesChild = prefecturesCurrent[0]?.prefectures?.map(
      (item) => {
        return { key: `${item.id}`, label: item.name };
      },
      [regions],
    );

    setDeparturePointList(prefecturesChild);
    setArrivalPointList(prefecturesChild);
  }, [regions]);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<ReactHookForm>({
    mode: 'all',
    defaultValues: {
      depId: '9999900010015',
      departurePoint: '9999900000000',
      transitId: '',
      transitPoint: '',
      arrId: '9999900010022',
      arrivalPoint: '9999900000000',
      // transportationDate: {
      //   start: dayjs(new Date()).format(DATE_FORMAT.DEFAULT),
      //   end: dayjs(new Date()).format(DATE_FORMAT.DEFAULT),
      // },
      // deliveryTime: { TimeStart: '05:00', TimeEnd: '12:00' },
      transportationDate: {},
      deliveryTime: {},
      dayWeek: [],
      temperatureRange: [],
      keyword: '',
      apiChoose: ['1'],
    },
    criteriaMode: 'all',
  });

  useEffect(() => {
    trigger();
  }, [trigger]);

  useEffect(() => {
    if (departurePointList && departurePointList.length > 0) {
      setValue('departurePoint', '9999900000000', { shouldValidate: true });
      setValue('depId', '9999900010015', { shouldValidate: true });
    }
  }, [departurePointList]);

  useEffect(() => {
    if (arrivalPointList && arrivalPointList.length > 0) {
      setValue('arrivalPoint', '9999900000000', { shouldValidate: true });
      setValue('arrId', '9999900010022', { shouldValidate: true });
    }
  }, [arrivalPointList]);

  const handleDateChange = (data: IDateRange | null) => {
    setDateRange(data);
    setValue('transportationDate', data, { shouldValidate: true });
    errors.transportationDate?.message && clearErrors('transportationDate');
    trigger('transportationDate');
  };

  const handleTimeChange = (data: any) => {
    const dataTime = {
      timeStart: data.timeStart ? data.timeStart : null,
      timeEnd: data.timeEnd ? data.timeEnd : null,
    };
    setValue('deliveryTime.TimeStart', dataTime.timeStart, { shouldValidate: true });
    setValue('deliveryTime.TimeEnd', dataTime.timeEnd, { shouldValidate: true });

    clearErrors('deliveryTime');
    trigger('deliveryTime');
  };

  const onSubmit = (data: ReactHookForm) => {
    let param: SearchParamAbilityPublic = {
      depId: data.depId,
      arrId: data.arrId,
      page: 1,
      limit: 5,
    };

    param =
      data.transportationDate && data.transportationDate.start && data.transportationDate.end
        ? {
            ...param,
            depDate:
              (data.transportationDate?.start &&
                isValidDate(data.transportationDate?.start) &&
                convertDateFormatPickerYYYYMMDD(data.transportationDate?.start, DATE_FORMAT.DEFAULT)) ||
              '',
            arrDate:
              (data.transportationDate?.end &&
                isValidDate(data.transportationDate?.end) &&
                convertDateFormatPickerYYYYMMDD(data.transportationDate?.end, DATE_FORMAT.DEFAULT)) ||
              '',
          }
        : param;
    param =
      data.deliveryTime && data.deliveryTime.TimeStart && data.deliveryTime.TimeEnd
        ? { ...param, depTime: data.deliveryTime.TimeStart, arrTime: data.deliveryTime.TimeEnd }
        : param;
    param = data.dayWeek && data.dayWeek.length > 0 ? { ...param, dayWeek: data.dayWeek.join(',') } : param;
    param = data.freightRateMin ? { ...param, freightRateMin: data.freightRateMin } : param;
    param = data.freightRateMax ? { ...param, freightRateMax: data.freightRateMax } : param;
    param =
      data.temperatureRange && data.temperatureRange.length > 0
        ? { ...param, temperatureRange: data.temperatureRange.join(',') }
        : param;
    param = data.keyword ? { ...param, keyword: data.keyword } : param;
    search({ ...param } as SearchParamAbilityPublic, data.apiChoose || ['1']);
  };

  return (
    // departurePointList && departurePointList.length > 0 && arrivalPointList && arrivalPointList.length > 0 && (
    <div key={tab}>
      <p className='mt-6 text-base font-normal leading-7'>
        {tab == 'baggage_search'
          ? 'マッチングしていない荷物情報(輸送計画)を検索することが可能です。'
          : 'マッチングしていない空便情報(運送能力)を検索することが可能です。'}
      </p>
      <form onSubmit={handleSubmit(onSubmit)} key={`form-${tab}`}>
        <div className='mt-8 pl-0 pt-0 pb-0 pr-4 space-y-8'>
          {tab === 'baggage_search' && (
            <div className='space-y-2 ml-4'>
              <div className='flex items-center'>
                <div className='w-[5.5rem]'>
                  <Label title='荷物対象' className='text-base font-bold leading-7' />
                </div>
                <div className='flex items-center'>
                  <CmnCheckboxGroup
                    name='apiChoose'
                    size='sm'
                    defaultValue={['1']}
                    onChange={(value: string[]) => {
                      trigger();
                      setValue('apiChoose', value);
                    }}
                    option={[
                      { key: '1', value: '1', label: 'キャリア間' },
                      { key: '2', value: '2', label: 'シッパーリクエスト' },
                    ]}
                    classNameWrap='mr-4'
                    classNames={{
                      wrapper: 'min-h-6 h-6 border-none px-4 pr-6',
                    }}
                    classNameCheckbox={{
                      base: 'ml-0 mr-5',
                      wrapper:
                        'mr-4 border-1 border-foreground rounded-sm before:!border-foreground before:!border-[1px]',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          <div className='space-y-2 ml-4'>
            <div className='flex items-center'>
              <div className='w-[5.5rem]'>
                <label className='text-base font-bold leading-7'>区間</label>
              </div>
              <div className='flex items-center'>
                <div className='w-[5.5rem]'>
                  <Label title='出発地' className='text-base font-bold leading-7' />
                </div>
                <div className='flex space-x-2 h-6'>
                  <CmnDropdown
                    name='departurePoint'
                    classNameWrap='min-w-[10rem] h-6'
                    classNameSelect='h-5 min-h-6'
                    defaultSelectedKeys={['9999900000000']}
                    onChange={(e) => {
                      setValue('departurePoint', e.target.value);
                      trigger();
                      let item = prefectures?.filter((item) => `${item.key}` === e.target.value);
                      setDeparturePointList(
                        item &&
                          item[0] &&
                          item[0]?.prefectures?.map((item) => {
                            return { key: `${item.id}`, label: item.name };
                          }),
                      );
                    }}
                    items={prefectures!}
                    size='sm'
                    register={register}
                    rules={{
                      required: gTxt('VALIDATE.REQUIRED', { field: '出発地' }),
                    }}
                  />
                  <CmnDropdown
                    name='depId'
                    classNameWrap='min-w-[10rem] h-6'
                    classNameSelect='h-5 min-h-6'
                    defaultSelectedKeys={['9999900010015']}
                    onChange={(e) => {
                      trigger();
                      setValue('depId', e.target.value);
                      clearErrors('depId');
                    }}
                    items={departurePointList!}
                    size='sm'
                    register={register}
                    rules={{
                      required: gTxt('VALIDATE.REQUIRED', { field: '出発地' }),
                    }}
                  />
                </div>
              </div>
            </div>
            <div className='flex items-center'>
              <div className='w-[5.5rem]'></div>
              <div className='flex items-center'>
                <div className='w-[5.5rem]'>
                  <Label title='' className='' />
                </div>
                <div className='flex space-x-2'>
                  <CmnDropdown
                    name='transitPoint'
                    classNameWrap='min-w-[10rem] h-6'
                    classNameSelect='h-5 min-h-6'
                    defaultSelectedKeys={'1'}
                    // onChange={(e) => {
                    //   setValue('transitPoint', e.target.value);
                    //   let item = prefectures.filter((item) => `${item.id}` === e.target.value);
                    //   setTrasitPointList(item && item[0] && item[0]?.prefectures);
                    // }}
                    // items={prefectures?.map((item) => {
                    //   return { key: `${item.id}`, label: item.name };
                    // })}
                    items={[
                      {
                        key: '1',
                        label: 'なし',
                      },
                    ]}
                    size='sm'
                  />
                  <CmnDropdown
                    name='transitId'
                    classNameWrap='min-w-[10rem] h-6'
                    classNameSelect='h-5 min-h-6'
                    defaultSelectedKeys={'1'}
                    // onChange={(e) => {
                    //   setValue('transitId', e.target.value);
                    // }}
                    // items={transitPointList?.map((item) => {
                    //   return { key: `${item.id}`, label: item.name };
                    // })}
                    size='sm'
                    items={[
                      {
                        key: '1',
                        label: 'なし',
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
            <div className='flex items-center'>
              <div className='w-[5.5rem]'></div>
              <div className='flex items-center'>
                <div className='w-[5.5rem]'>
                  <Label title='到着地' className='text-base font-bold leading-7' />
                </div>
                <div className='flex space-x-2'>
                  <CmnDropdown
                    name='arrivalPoint'
                    classNameWrap='min-w-[10rem] h-6'
                    classNameSelect='h-5 min-h-6'
                    defaultSelectedKeys={['9999900000000']}
                    onChange={(e) => {
                      trigger();
                      setValue('arrivalPoint', e.target.value);
                      let item = prefectures?.filter((item) => `${item.id}` === e.target.value);
                      setArrivalPointList(
                        item &&
                          item[0] &&
                          item[0]?.prefectures?.map((item) => {
                            return { key: `${item.id}`, label: item.name };
                          }),
                      );
                    }}
                    items={prefectures!}
                    size='sm'
                    register={register}
                    rules={{
                      required: gTxt('VALIDATE.REQUIRED', { field: '到着地' }),
                    }}
                  />
                  <CmnDropdown
                    name='arrId'
                    classNameWrap='min-w-[10rem] h-6'
                    classNameSelect='h-5 min-h-6'
                    defaultSelectedKeys={[`9999900010022`]}
                    onChange={(e) => {
                      trigger();
                      setValue('arrId', e.target.value);
                      clearErrors('arrId');
                    }}
                    items={arrivalPointList!}
                    size='sm'
                    register={register}
                    rules={{
                      required: gTxt('VALIDATE.REQUIRED', { field: '到着地' }),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className='ml-4'>
            <div className='flex items-center'>
              <div className='w-[5.5rem]'>
                <Label title='運行日時' className='text-base font-bold leading-7' />
              </div>
              <div className='flex items-center'>
                <CmnDateRangePicker
                  size='sm'
                  radius='sm'
                  classNameInnerWrapper='min-h-6 h-6'
                  classNameInputWrapper='min-h-6 h-6'
                  onChangeValue={handleDateChange}
                  date={dateRange}
                  errorMessage={errors.transportationDate?.message}
                />
              </div>
            </div>
          </div>
          <div className='ml-4'>
            <div className='flex items-center'>
              <div className='w-[5.5rem]'>
                <Label title='持込時間' className='text-base font-bold leading-7' />
              </div>
              <div className='flex items-center'>
                <CmnTimeInput
                  classNameWrap='max-w-52 h-6 min-h-6'
                  size='sm'
                  onChangeTime={handleTimeChange}
                  onError={(message: string) => {
                    if (message) {
                      setError('deliveryTime.TimeStart', { message });
                    } else {
                      clearErrors('deliveryTime.TimeStart');
                      clearErrors('deliveryTime.TimeEnd');
                      trigger(['deliveryTime.TimeStart', 'deliveryTime.TimeEnd']);
                    }
                  }}
                  defaultTimeEnd={watch('deliveryTime.TimeEnd')}
                  defaultTimeStart={watch('deliveryTime.TimeStart')}
                  errorMessage={errors.deliveryTime?.TimeStart?.message || errors.deliveryTime?.TimeEnd?.message}
                />
              </div>
            </div>
          </div>
          <div className='ml-4'>
            <div className='flex items-center'>
              <div className='w-[5.5rem]'>
                <Label title='曜日指定' className='text-base font-bold leading-7' />
              </div>
              <div className='flex items-center'>
                <CmnCheckboxGroup
                  name='dayOfWeek'
                  size='sm'
                  onChange={(value: string[]) => {
                    trigger();
                    setValue('dayWeek', value.map(Number));
                  }}
                  option={LST_CHECKBOX_WEEKDAYS}
                  classNameWrap='mr-4'
                  classNames={{
                    wrapper: 'min-h-6 h-6 border-none px-4 pr-6',
                  }}
                  classNameCheckbox={{
                    base: 'ml-0 mr-5',
                    wrapper:
                      'mr-4 border-1 border-foreground rounded-sm before:!border-foreground before:!border-[1px]',
                  }}
                />
              </div>
            </div>
          </div>
          <div className='ml-4'>
            <div className='flex items-center'>
              <div className='w-[5.5rem]'>
                <Label title='温度帯' className='text-base font-bold leading-7' />
              </div>
              <div className='flex items-center'>
                <CmnCheckboxGroup
                  name='temperatureRange'
                  size='sm'
                  // defaultValue={watch('temperatureRange')}
                  onChange={(value: string[]) => {
                    trigger();
                    setValue('temperatureRange', value.map(Number));
                  }}
                  option={TEMPERATURE_RANGE}
                  classNameWrap='mr-4'
                  classNames={{
                    wrapper: 'min-h-6 h-6 border-none px-4 mr-6',
                  }}
                  classNameCheckbox={{
                    base: 'ml-0 mr-5',
                    wrapper:
                      'mr-4 border-1 border-foreground rounded-sm before:!border-foreground before:!border-[1px]',
                  }}
                />
              </div>
            </div>
          </div>
          <div className='ml-4'>
            <div className='flex items-center'>
              <div className='w-[5.5rem]'>
                <Label title='希望運賃' className='text-base font-bold leading-7' />
              </div>
              <div className='flex items-center space-x-8'>
                <div className='flex items-center'>
                  <Label title='希望運賃下限' className='text-base font-bold leading-7 mr-2' />
                  <CmnInputNumber
                    size='md'
                    name='freightRateMin'
                    valueDefault={watch('freightRateMin')}
                    title=''
                    classNameWrap='w-[10rem]'
                    register={register}
                    errorMessage={errors?.freightRateMin?.message}
                    clearErrors={clearErrors}
                    setValue={setValue}
                  />
                </div>
                <div className='flex items-center'>
                  <Label title='希望運賃上限' className='text-base font-bold leading-7 mr-2' />
                  <CmnInputNumber
                    size='md'
                    name='freightRateMax'
                    valueDefault={watch('freightRateMax')}
                    title=''
                    classNameWrap='w-[10rem]'
                    register={register}
                    errorMessage={errors?.freightRateMax?.message}
                    clearErrors={clearErrors}
                    setValue={setValue}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className='ml-4'>
            <div className='flex items-center'>
              <div className='w-[9.125rem]'>
                <Label title='フリーワード検索' className='text-base font-bold leading-7' />
              </div>
              <div className='flex items-center'>
                <CmnInput size='md' name='keyword' classNameWrap='w-[14rem]' register={register} />
              </div>
            </div>
          </div>
        </div>
        <div className='flex justify-end mt-8'>
          <Button
            isLoading={isLoading}
            type='submit'
            color='primary'
            className={cn(
              'w-24 h-12 text-base font-bold leading-[1.5rem] text-white',
              !isValid && 'bg-[#F5F5F5] text-[#B3B3B3]',
            )}
            isDisabled={!isValid}
          >
            検索
          </Button>
        </div>
      </form>
    </div>
    // )
  );
};

export default ShippingRequestSearchForm;
