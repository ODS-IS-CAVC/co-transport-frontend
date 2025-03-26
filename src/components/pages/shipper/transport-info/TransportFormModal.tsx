'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Chip } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import CmnDatePicker from '@/components/common/CmnDatePicker';
import CmnDropdown from '@/components/common/CmnDropdown';
import CmnInputNumber from '@/components/common/CmnInputNumber';
import CmnTimeInput from '@/components/common/CmnTimeInput';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import {
  INIT_CARGO_INFO_SHIPPER,
  INIT_TRANSPORT_PLAN_INFO_REQUEST,
  INIT_TRANSPORT_PLAN_TIME,
  OUTER_PACKAGE,
  STATUS_TRANSPORT_INFO_FORM,
  TEMPERATURE_RANGE,
} from '@/constants/common';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { KEY_COOKIE_COMPANY_CODE, KEY_COOKIE_USER_ID } from '@/constants/keyStorage';
import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import dayjs from '@/lib/dayjs';
import { handleFormatNumberInput } from '@/lib/helper';
import { getPrefectureName } from '@/lib/prefectures';
import { cn, formatCurrency, formatTimeHHMM, getCookie, objectToQueryParamsNoEncode, subtractHours } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { RootState } from '@/redux/store';
import { cargoService } from '@/services/shipper/cargo';
import { transactionService } from '@/services/transaction/transaction';
import { transportService } from '@/services/transaction/transport';
import { ENotificationType, Option } from '@/types/app';
import { CargoInfo, CargoInfoForm } from '@/types/shipper/cargo';
import { CutOffInfoType } from '@/types/shipper/transaction';
import { ITransportPlanSale, ITransportShipperSearch } from '@/types/shipper/transport';
import {
  DayWeek,
  TransportInfo,
  TransportPlanCargoInfoRequest,
  TransportPlanInfoRequest,
  TransportPlanItem,
  TransportPlanItemRequest,
  TransportPlanRequest,
  TransportPlanTime,
} from '@/types/shipper/transportList';

import ModalConfirmRequest from '../board/modal/trading/ModalConfirmRequest';
import ModalDataPropose from '../board/modal/trading/ModalDataPropose';
import ModalDetailMatchingTransport from '../board/modal/trading/ModalDetaiMatchingTransport';
import ModalRequestComplete from '../board/modal/trading/ModalRequestComplete';
import ModalDetailInfo from '../cargo-info/ModalDetailInfo';
import ChooseCargoModal from './ChooseCargoModal';
import TimeModal from './TimeModal';

const schema = yup.object({
  transport_name: yup.string(),
  transport_code: yup.string(),
  is_private: yup.boolean().required().default(false),
  origin_type: yup.number(),
  price_per_unit: yup
    .number()
    .required(gTxt('VALIDATE.REQUIRED', { field: '運賃' }))
    .nullable(),
  trailer_number: yup
    .number()
    .required(gTxt('VALIDATE.REQUIRED', { field: 'トレーラ数' }))
    .nullable(),
  collection_date_from: yup.string().required(gTxt('VALIDATE.REQUIRED', { field: '輸送日時' })),
  collection_date_to: yup.string().required(gTxt('VALIDATE.REQUIRED', { field: '輸送日時' })),
  collection_time_from: yup.string().required(gTxt('VALIDATE.REQUIRED', { field: '基本持込期限' })),
  collection_time_to: yup.string().required(gTxt('VALIDATE.REQUIRED', { field: '基本持込期限' })),
  repeat_day: yup.number().required(gTxt('VALIDATE.REQUIRED', { field: '繰り返し' })),
  day_week: yup
    .array()
    .of(yup.number().required())
    .required(gTxt('VALIDATE.REQUIRED', { field: '繰り返し' })),
  import_id: yup.number().required().nullable(),
  departure_from: yup
    .number()
    .required(gTxt('VALIDATE.REQUIRED', { field: '出発地' }))
    .nullable()
    .notOneOf([null], gTxt('VALIDATE.REQUIRED', { field: '出発地' })),
  arrival_to: yup
    .number()
    .required(gTxt('VALIDATE.REQUIRED', { field: '到着地' }))
    .nullable()
    .notOneOf([null], gTxt('VALIDATE.REQUIRED', { field: '到着地' })),
  vehicle_condition: yup
    .array()
    .of(yup.number().required())
    .required(gTxt('VALIDATE.REQUIRED', { field: '温度帯' })),
});

interface TransportFormModalProps {
  isOpen: boolean;
  modeEdit: boolean;
  detailData?: TransportInfo;
  companyName?: string;
  setLoadingDetail: (loading: boolean) => void;
  onClose: () => void;
  onSubmit: (value: TransportPlanInfoRequest, isEdit: boolean) => void;
}

const TransportFormModal = (props: TransportFormModalProps) => {
  const { isOpen, modeEdit, detailData, companyName, setLoadingDetail, onClose, onSubmit } = props;
  const regions = useAppSelector((state: RootState) => state.app.locations);
  const dispatch = useAppDispatch();

  const cargoApi = cargoService();
  const transactionApi = transactionService();

  const [isDetail, setIsDetail] = useState(false);
  const [formValue, setFormValue] = useState<TransportPlanRequest>({
    ...INIT_TRANSPORT_PLAN_INFO_REQUEST.transport_plan,
  });

  const [timeData, setTimeData] = useState<TransportPlanTime>({ ...INIT_TRANSPORT_PLAN_TIME });
  const [cargoData, setCargoData] = useState<TransportPlanCargoInfoRequest[]>([]);
  const [transportPlanItems, setTransportPlanItems] = useState<TransportPlanItem[]>([]);
  const [modeViewTime, setModeViewTime] = useState<boolean>(false);
  const [isOpenTimeModal, setIsOpenTimeModal] = useState<boolean>(false);
  const [isOpenChooseCargoModal, setIsOpenChooseCargoModal] = useState<boolean>(false);
  const [isOpenSearchSimilarModal, setIsOpenSearchSimilarModal] = useState<boolean>(false);
  const [isOpenModalDetailMatchingTransport, setIsOpenModalDetailMatchingTransport] = useState<boolean>(false);
  const [isOpenModalConfirmRequest, setIsOpenModalConfirmRequest] = useState<boolean>(false);
  const [isOpenModalRequestComplete, setIsOpenModalRequestComplete] = useState<boolean>(false);

  const [errorPrice, setErrorPrice] = useState<string[]>([]);
  const [isErrorRequiredTime, setIsErrorRequiredTime] = useState<boolean>(false);
  const [isErrorRequiredCargo, setIsErrorRequiredCargo] = useState<boolean>(false);
  const [showModalDetailInfo, setShowModalDetailInfo] = useState<boolean>(false);

  const [dataDetailCargo, setDataDetailCargo] = useState<CargoInfoForm>({ ...INIT_CARGO_INFO_SHIPPER });
  const [dataPropose, setDataPropose] = useState<ITransportShipperSearch[]>([]);
  const [dataTransportSaleDetail, setDataTransportPlanDetail] = useState<ITransportPlanSale>();
  const [dataDetailMatchingTransport, setDataDetailMatchingTransport] = useState<ITransportShipperSearch>();
  const [cutOffInfos, setCutOffInfos] = useState<CutOffInfoType[]>();
  const {
    trigger,
    watch,
    reset,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<TransportPlanRequest>({
    resolver: yupResolver(schema),
    defaultValues: {
      ...INIT_TRANSPORT_PLAN_INFO_REQUEST.transport_plan,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (detailData && JSON.stringify(detailData) !== JSON.stringify(formValue)) {
      reset({ ...detailData.transport_plan });
      setFormValue({ ...detailData.transport_plan });
      setCargoData(detailData.transport_plan_cargo_info);
      setTransportPlanItems(detailData.transport_plan_item);
      const dayWeek: DayWeek = detailData.transport_plan_item.reduce(
        (acc, item) => ({
          ...acc,
          [item.collection_date]: {
            fromTime: item.collection_time_from,
            toTime: item.collection_time_to,
          },
        }),
        {},
      );
      setTimeData({
        date_from: detailData.transport_plan.collection_date_from,
        date_to: detailData.transport_plan.collection_date_to,
        time_from: detailData.transport_plan.collection_time_from,
        time_to: detailData.transport_plan.collection_time_to,
        repeat_day: detailData.transport_plan.repeat_day,
        day_week: dayWeek,
      });
    }
  }, [detailData]);

  useEffect(() => {
    if (modeEdit) {
      setIsDetail(true);
    }
  }, [modeEdit]);

  const handleOpenModalDetailCargo = async (cargoId: number) => {
    setLoadingDetail(true);
    cargoApi
      .cargoDetail(cargoId)
      .then((response) => {
        setDataDetailCargo(response);
        setShowModalDetailInfo(true);
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoadingDetail(false);
      });
  };

  const onSubmitFormCargo = (formValue: CargoInfoForm) => {
    // TODO: API request to register cargo information
    setLoadingDetail(true);
    cargoApi
      .updateCargo(formValue)
      .then((response) => {
        dispatch(
          actions.appAction.showModalResult({
            type: ENotificationType.SUCCESS,
            title: '荷物情報の詳細',
            content: gTxt('MESSAGES.SUCCESS'),
          }),
        );
      })
      .catch((error) => {
        if (error?.payload?.responseData?.parameters?.error?.code == 'cns_line_item_by_date_have_in_trans_order') {
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.ERROR,
              title: '輸送計画の編集',
              content: '輸送計画は取引中のため編集できません。',
            }),
          );
        } else {
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.ERROR,
              title: '荷物情報の個別登録',
              content: gTxt('MESSAGES.FAILED'),
            }),
          );
        }
      })
      .finally(() => {
        setLoadingDetail(false);
        handleCloseModalDetailCargo();
      });
  };

  const showErrorDelete = () => {
    dispatch(
      actions.appAction.showNotification({
        type: ENotificationType.ERROR,
        title: '荷物情報を削除する',
        content: gTxt('MESSAGES.FAILED'),
      }),
    );
  };

  const handleApiDeleteCargo = (id: number) => {
    setLoadingDetail(true);
    cargoApi
      .deleteCargo(id)
      .then((response) => {
        if (response && response?.status && response?.status !== 200) {
          showErrorDelete();
        } else {
          dispatch(
            actions.appAction.showNotification({
              type: ENotificationType.SUCCESS,
              title: '荷物情報を削除する',
              content: gTxt('MESSAGES.SUCCESS'),
            }),
          );
        }
      })
      .catch(() => showErrorDelete())
      .finally(() => {
        setLoadingDetail(false);
      });
    handleCloseModalDetailCargo();
  };

  const handleCloseModalDetailCargo = () => {
    setDataDetailCargo({ ...INIT_CARGO_INFO_SHIPPER });
    setShowModalDetailInfo(false);
  };

  const handleConfirmMatching = async (paramTransactionsCarrier: any) => {
    if (!paramTransactionsCarrier) return;
    const cid = getCookie(KEY_COOKIE_COMPANY_CODE) as string;
    const shipperCode = getCookie(KEY_COOKIE_USER_ID) as string;
    const params = {
      cns_line_item_by_date_id: dataTransportSaleDetail?.id,
      vehicle_avb_resource_item_id: paramTransactionsCarrier.id,
      service_no: paramTransactionsCarrier.service_no || 'N/A',
      departure_date: dayjs(paramTransactionsCarrier.day).format(DATE_FORMAT.YYYYMMDD),
      giai: paramTransactionsCarrier.giai,
      departure_time: formatTimeHHMM(paramTransactionsCarrier.departure_time_min),
      collection_time_from: subtractHours(
        paramTransactionsCarrier.departure_time_min,
        paramTransactionsCarrier.cut_off_time || 1,
      ),
      collection_time_to: formatTimeHHMM(paramTransactionsCarrier.departure_time_min),
      price: paramTransactionsCarrier.price,
      cid: cid,
      carrier_code: paramTransactionsCarrier.operator_code,
      shipper_code: shipperCode,
      isNotIX: process.env.NEXT_PUBLIC_IS_NOT_IX !== 'false' ? true : false,
    };
    try {
      const response: any = await transactionApi.apiAth0211(params);
      if (!response?.data?.id) {
        dispatch(
          actions.appAction.showNotification({
            type: ENotificationType.ERROR,
            title: gTxt('MESSAGES.FAILED'),
            content: gTxt('MESSAGES.FAILED'),
          }),
        );
        return;
      }
      setIsOpenModalRequestComplete(true);
    } catch (error) {
      console.error('Error in useEffect:', error);
    } finally {
      setIsOpenModalConfirmRequest(false);
    }
  };

  const fetchCutOffInfos = async (id: number) => {
    try {
      const response = await transactionApi.apiAth114(id);
      setCutOffInfos(response.data);
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  };

  const handleOpenSearchSimilarModal = async (item: TransportPlanItem) => {
    setLoadingDetail(true);
    try {
      setDataTransportPlanDetail({
        price: item.price_per_unit,
        status: item.status || 0,
        departure_from: item.departure_from,
        arrival_to: item.arrival_to,
        transport_date: item.collection_date,
        collection_time_from: item.collection_time_from,
        collection_time_to: item.collection_time_to,
        created_date: item.created_at,
        item_name_txt: item.transport_name,
        trsp_cli_prty_name_txt: '',
        id: item.cns_line_item_by_date_id,
        created_user: '',
        updated_user: '',
        updated_date: '',
        req_cns_line_item_id: 0,
        operator_id: '',
        operator_code: '',
        trans_plan_id: detailData?.transport_plan.id.toString() || '',
        transport_code: item.transport_code,
        transport_name: item.transport_name,
        operatorName: '',
        collection_date: item.collection_date,
        trailer_number: item.trailer_number || 0,
        trailer_number_rest: item.trailer_number_rest || 0,
        price_per_unit: item.price_per_unit,
        vehicle_condition: item.vehicle_condition,
        outer_package_code: item.outer_package_code,
        total_length: item.total_length?.toString() || '',
        total_width: item.total_width?.toString() || '',
        total_height: item.total_height?.toString() || '',
        weight: item.weight?.toString() || '',
        trans_type: 0,
        temperatureRange: item.temp_range as [],
      });
      const transportApi = transportService();
      const _queryString = objectToQueryParamsNoEncode({
        depId: item.departure_from + '',
        arrId: item.arrival_to + '',
        isNotIX: process.env.NEXT_PUBLIC_IS_NOT_IX !== 'false' ? true : false,
        page: 1,
        limit: 5,
      });
      const result = await transportApi.apiAth0191(_queryString);
      setDataPropose(result?.data);
      setIsOpenSearchSimilarModal(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const showModalDetailMatchingTransport = (id: number) => {
    setDataDetailMatchingTransport(dataPropose?.find((d) => d.id === id));
    setIsOpenSearchSimilarModal(false);
    setIsOpenModalDetailMatchingTransport(true);
  };

  const showModalConfirmRequest = (id: number) => {
    fetchCutOffInfos(id);
    setIsOpenModalConfirmRequest(true);
  };

  const convertRegionsToListDropdown = (): Option[] => {
    // convert regions to list dropdown for key is key is id of prefecture. label is name of prefecture (name of region)
    const listDropdown: Option[] = [];
    regions.forEach((region) => {
      region.prefectures.forEach((prefecture) => {
        listDropdown.push({
          key: `${prefecture.id}`,
          label: `${prefecture.name} (${region.name})`,
        });
      });
    });
    return listDropdown;
  };

  const formatDate = (date?: string | null) => {
    if (!date) return '';
    return dayjs(date, DATE_FORMAT.YYYYMMDD).format(DATE_FORMAT.DEFAULT);
  };

  const formatTime = (time?: string | null) => {
    if (!time) return '';
    // get AM/PM for toTime
    const amPm = dayjs(time, TIME_FORMAT.HHMM).hour() >= 12 ? 'PM' : 'AM';
    // get time for toTime (12h)
    const timeStr = dayjs(time, TIME_FORMAT.HHMM).format(TIME_FORMAT.H_MM_12);
    return `${amPm} ${timeStr}`;
  };

  const getHeaderTitle = () => {
    if (isDetail) {
      return '輸送計画の詳細';
    }
    return modeEdit ? '輸送計画の編集' : '輸送計画の新規登録';
  };

  const getHeaderDescription = () => {
    if (isDetail) {
      return '登録した輸送計画の確認ができます。';
    }
    return modeEdit ? '登録した輸送計画の編集ができます。' : '登録した輸送計画の編集ができます。';
  };

  const getTimeRepeat = () => {
    let repeatString = '';
    if (timeData.date_from && timeData.date_to && timeData.day_week) {
      // Create a map to track which days of the week have time settings
      const daysWithTime = new Map<number, boolean>();

      // Iterate through all dates in the range
      const startDate = dayjs(timeData.date_from, DATE_FORMAT.YYYYMMDD);
      const endDate = dayjs(timeData.date_to, DATE_FORMAT.YYYYMMDD);
      const daysDiff = endDate.diff(startDate, 'day');

      // Check each date in the range
      for (let i = 0; i <= daysDiff; i++) {
        const currentDate = startDate.add(i, 'day');
        const dateString = currentDate.format(DATE_FORMAT.YYYYMMDD);

        // If this date has time settings, mark its day of week
        if (timeData.day_week[dateString]?.fromTime && timeData.day_week[dateString]?.toTime) {
          daysWithTime.set(currentDate.day(), true);
        }
      }
      if (daysWithTime.size > 0) {
        repeatString = '毎週';

        const dayNames = ['月', '火', '水', '木', '金', '土', '日'];
        const days = [];

        for (let i = 1; i <= 6; i++) {
          if (daysWithTime.has(i)) {
            days.push(dayNames[i - 1]);
          }
        }
        if (daysWithTime.has(0)) {
          days.push(dayNames[6]);
        }

        if (days.length > 0) {
          repeatString += ', ' + days.join(', ');
        }
      }
    }

    return repeatString;
  };

  const handleChooseCargo = (cargo: CargoInfo) => {
    const transportPlanCargo: TransportPlanCargoInfoRequest = {
      ...cargo,
      price_per_unit: null,
      cargo_info_id: cargo.id,
      total_weight: cargo.weight || 0,
    };
    delete transportPlanCargo.id;
    setCargoData([...cargoData, transportPlanCargo]);
    setValue('trailer_number', cargoData.length + 1);
  };

  const handleDeleteCargo = (cargo: CargoInfo) => {
    const _cargoData = cargoData.filter((item) => item.cargo_info_id !== cargo.id);
    setCargoData(_cargoData);
    setValue('trailer_number', _cargoData.length);
  };

  const handleDeleteCargoRequest = (cargo: TransportPlanCargoInfoRequest) => {
    const _cargoData = cargoData.filter((item) => item.cargo_info_id !== cargo.cargo_info_id);
    setCargoData(_cargoData);
    setValue('trailer_number', _cargoData.length);
  };

  const updateData = (data: TransportPlanTime) => {
    setTimeData(data);
    setValue('collection_date_from', data.date_from || '');
    setValue('collection_date_to', data.date_to || '');
    setValue('collection_time_from', data.time_from || '');
    setValue('collection_time_to', data.time_to || '');
    setValue('repeat_day', data.repeat_day || 0);
    const daysWithTime = new Map<number, boolean>();
    if (data.date_from && data.date_to && data.day_week) {
      // Create a map to track which days of the week have time settings

      // Iterate through all dates in the range
      const startDate = dayjs(data.date_from, DATE_FORMAT.YYYYMMDD);
      const endDate = dayjs(data.date_to, DATE_FORMAT.YYYYMMDD);
      const daysDiff = endDate.diff(startDate, 'day');

      // Check each date in the range
      for (let i = 0; i <= daysDiff; i++) {
        const currentDate = startDate.add(i, 'day');
        const dateString = currentDate.format(DATE_FORMAT.YYYYMMDD);

        // If this date has time settings, mark its day of week
        if (data.day_week[dateString]?.fromTime && data.day_week[dateString]?.toTime) {
          daysWithTime.set(currentDate.day(), true);
        }
      }
    }
    setValue('day_week', Array.from(daysWithTime.keys()));
    setModeViewTime(false);
    setIsOpenTimeModal(false);
  };

  const getOldId = (collection_date: string, cargo_info_id: number) => {
    let transportPlanItem = transportPlanItems.find(
      (item) => item.collection_date === collection_date && item.cargo_info_id === cargo_info_id,
    );
    if (transportPlanItem) {
      return transportPlanItem.id;
    }
    return undefined;
  };

  const onSubmitForm = (value: TransportPlanRequest) => {
    let _transportPlanItem: TransportPlanItemRequest[] = [];
    if (timeData.day_week) {
      Object.keys(timeData.day_week).forEach((key) => {
        if (timeData.day_week) {
          const data = timeData.day_week[key];
          if (data?.fromTime && data?.toTime) {
            // Create array of trailer items
            for (let i = 0; i < cargoData.length; i++) {
              const cargo = cargoData[i];
              _transportPlanItem.push({
                id: getOldId(key, cargo.cargo_info_id || 0),
                transport_name: cargo.cargo_name,
                transport_code: `${cargo.cargo_info_id}`,
                collection_date: key,
                collection_time_from: data.fromTime,
                collection_time_to: data.toTime,
                departure_from: value.departure_from,
                arrival_to: value.arrival_to,
                trailer_number: value.trailer_number,
                trailer_number_rest: null,
                price_per_unit: cargo.price_per_unit,
                outer_package_code: cargo.outer_package_code,
                total_length: cargo.total_length,
                total_width: cargo.total_width,
                total_height: cargo.total_height,
                weight: cargo.total_weight,
                special_instructions: cargo.special_instructions,
                status: 0,
                cargo_info_id: cargo.cargo_info_id,
                cargo_name: cargo.cargo_name,
                temp_range: cargo.temp_range,
              });
            }
          }
        }
      });
    }

    const formValue: TransportPlanInfoRequest = {
      transport_plan: value,
      transport_plan_cargo_info: cargoData,
      transport_plan_item: _transportPlanItem,
    };
    onSubmit(formValue, modeEdit);
    setErrorPrice([]);
  };

  const handleExternalSubmit = async () => {
    try {
      const isValid = await trigger();
      if (cargoData.length == 0) {
        setIsErrorRequiredCargo(true);
      }
      if (!timeData.date_from || !timeData.date_to || !timeData.time_from || !timeData.time_to) {
        setIsErrorRequiredTime(true);
      }
      if (
        cargoData.length == 0 ||
        !timeData.date_from ||
        !timeData.date_to ||
        !timeData.time_from ||
        !timeData.time_to
      ) {
        return;
      }
      let _errorPrice: string[] = [];
      if (cargoData.length > 0) {
        cargoData.forEach((cargo) => {
          if (cargo.price_per_unit === null) {
            _errorPrice.push(gTxt('VALIDATE.REQUIRED', { field: '希望運賃' }));
          } else {
            _errorPrice.push('');
          }
        });
        setErrorPrice(_errorPrice);
      }
      if (_errorPrice.filter((item) => item !== '').length == 0 && isValid) {
        handleSubmit(onSubmitForm)();
      }
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const renderDetail = () => {
    if (!detailData) return null;
    return (
      <div className='flex flex-col'>
        <Chip
          className={cn(
            'text-white text-base font-bold',
            detailData.transport_plan.is_private ? 'bg-warning' : 'bg-other-gray',
          )}
          radius='sm'
        >
          {STATUS_TRANSPORT_INFO_FORM.find(
            (status) => status.key === (detailData.transport_plan.is_private ? '1' : '0'),
          )?.label || ''}
        </Chip>
        <div className='py-4 space-y-4'>
          <div className='flex items-center'>
            <span className='font-bold'>輸送計画ID</span>
            <span className='ml-2'>{detailData.transport_plan.id}</span>
          </div>
          <div className='flex items-center'>
            <span className='font-bold'>トレーラ数</span>
            <span className='ml-2'>{detailData?.transport_plan?.trailer_number}</span>
          </div>
          <div className='flex items-center'>
            <span className='font-bold'>1日単位運賃</span>
            <span className='ml-2'>¥ {formatCurrency(detailData.transport_plan.price_per_unit.toString())}</span>
          </div>
          <div className='flex items-center'>
            <span className='text-[1.75rem]'>区間情報</span>
          </div>
          <div className='flex items-center'>
            <span className='space-x-2'>
              <b>出発地</b>
              <span>{getPrefectureName(regions, detailData.transport_plan.departure_from)}</span>
              <b>到着地</b>
              <span>{getPrefectureName(regions, detailData.transport_plan.arrival_to)}</span>
            </span>
          </div>
          <div className='flex items-center'>
            <span className='text-[1.75rem]'>日時情報</span>
          </div>
          <div className='flex items-center'>
            <span className='font-bold'>輸送日時</span>
            <span className='ml-2'>{`${formatDate(timeData.date_from)} - ${formatDate(timeData.date_to)}`}</span>
          </div>
          <div className='flex items-center'>
            <span className='font-bold'>基本持込期限(カットオフ)</span>
            <span className='ml-2'>{formatTime(detailData.transport_plan.collection_time_to)}まで</span>
          </div>
          <div className='flex items-center'>
            <span className='font-bold'>繰り返し</span>
            <span className='ml-2'>{getTimeRepeat()}</span>
          </div>
          <div className='w-full flex items-center justify-end'>
            <Button
              color='primary'
              radius='sm'
              className='font-bold'
              variant='ghost'
              onPress={() => {
                setModeViewTime(true);
                setIsOpenTimeModal(true);
              }}
            >
              日時情報の詳細を確認
            </Button>
          </div>
        </div>
        <div>
          <div className='flex items-center'>
            <span className='text-[1.75rem]'>輸送計画に登録されている荷物</span>
          </div>
          <div className='mt-4 grid sm:grid-cols-4 grid-cols-2 gap-4'>
            <div className='flex flex-col space-y-2'>
              <span className='font-bold text-base'>開始日</span>
              <CmnDatePicker
                size='md'
                radius='sm'
                className='w-[12.125rem]'
                onChangeValue={(value: string) => {
                  console.log(value);
                }}
              />
              <CmnTimeInput size='md' classNameWrap='w-[12.125rem] max-w-52' onChangeTime={() => {}} />
            </div>
            <div className='flex flex-col space-y-2'>
              <span className='font-bold'>終了日</span>
              <CmnDatePicker
                size='md'
                radius='sm'
                className='w-[12.125rem]'
                onChangeValue={(value: string) => {
                  console.log(value);
                }}
              />
              <CmnTimeInput size='md' classNameWrap='w-[12.125rem] max-w-52' onChangeTime={() => {}} />
            </div>
            <div className='flex flex-col space-y-2'>
              <span className='font-bold'>表示順</span>
              <CmnDropdown
                size='md'
                classNameWrap='w-32 min-w-32'
                placeholder='なし'
                items={[{ label: '日付順序', key: 'date_order' }]}
                disallowEmptySelection
                selectedKeys={['date_order']}
              />
            </div>
            <div className='flex flex-col space-y-2'>
              <span className='font-bold h-6'></span>
              <Button size='lg' radius='sm' color='primary' className='w-32 min-w-32'>
                絞り込む
              </Button>
            </div>
          </div>
          <div className='flex items-center'>
            <span className=''>荷物が{detailData.transport_plan_item.length}件登録されています。</span>
          </div>
          <div className='mt-2'>
            {detailData.transport_plan_item.map((item, index) => {
              const tempRangeString = item.temp_range
                .map((range) => TEMPERATURE_RANGE[range as keyof typeof TEMPERATURE_RANGE])
                .join(', ');

              return (
                <div key={index} className='flex items-center justify-between space-x-2 mb-2 last:mb-0'>
                  <div className='flex-1 border border-gray-border rounded px-3 py-1 space-y-2'>
                    <div className='flex items-center justify-end space-x-2'>
                      <span className='font-bold'>荷物ID</span>
                      <span>{item.id}</span>
                      <span className='font-bold'>事業者</span>
                      <span>{companyName || '未定'}</span>
                      <span className='font-bold'>輸送日</span>
                      <span>
                        {item.collection_date ? dayjs(item.collection_date).format(DATE_FORMAT.JAPANESE_DATE) : ''}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='flex-1 grid grid-cols-8 gap-4'>
                        <div className='col-span-3 flex items-center gap-2'>
                          <div className='font-bold'>品名</div>
                          <div className='text-2xl font-medium'>{item.transport_name}</div>
                        </div>
                        <div className='col-span-2 flex items-center gap-2'>
                          <div className='font-bold'>品目</div>
                          <div className='text-2xl font-medium'>
                            {OUTER_PACKAGE.find((outer) => outer.key === `${item.outer_package_code}`)?.label || ''}
                          </div>
                        </div>
                        <div className='col-span-3 flex items-center gap-2'>
                          <div className='font-bold'>温度帯</div>
                          <div className='text-2xl font-medium'>{tempRangeString}</div>
                        </div>
                      </div>
                      <Button
                        radius='sm'
                        color='primary'
                        className='text-base font-bold'
                        onPress={() => handleOpenModalDetailCargo(item.cargo_info_id || 0)}
                      >
                        詳細を見る
                      </Button>
                    </div>
                  </div>
                  <div className='w-44 flex flex-col items-start justify-center space-y-2'>
                    <div className='truncate flex items-center justify-end'>
                      <span className='font-bold'>希望運賃</span>
                      <span className='ml-2'>{formatCurrency(item.price_per_unit.toString())} 円</span>
                    </div>
                    <Button
                      color='primary'
                      radius='sm'
                      className='font-bold w-full'
                      onPress={() => handleOpenSearchSimilarModal(item)}
                    >
                      条件の近い便を検索する
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderForm = () => {
    return (
      <form className='flex flex-col'>
        <CmnDropdown
          classNameWrap='min-w-24 w-24'
          size='md'
          title='公開設定'
          placeholder='なし'
          disallowEmptySelection
          items={STATUS_TRANSPORT_INFO_FORM}
          selectedKeys={watch('is_private') ? ['1'] : ['0']}
          onChange={(e) => {
            setValue('is_private', e.target.value === '1');
          }}
          errorMessage={errors?.is_private?.message}
        />
        <div className='py-4 space-y-4'>
          {watch('id') && (
            <>
              <div className='flex items-center'>
                <span className='font-bold'>輸送計画ID</span>
                <span className='ml-2'>{watch('id')}</span>
              </div>
            </>
          )}
          {watch('trailer_number') && (
            <div className='flex items-center'>
              <span className='font-bold'>トレーラ数</span>
              <span className='ml-2'>{watch('trailer_number')}</span>
            </div>
          )}
          {watch('price_per_unit') ? (
            <div className='flex items-center'>
              <span className='font-bold'>1日単位運賃</span>
              <span className='ml-2'>¥ {handleFormatNumberInput(String(watch('price_per_unit')))}</span>
            </div>
          ) : (
            <></>
          )}
          <div className='flex items-center'>
            <span className='text-[1.75rem]'>区間情報</span>
          </div>
          <div className='flex items-center'>
            <div className='flex items-center space-x-2'>
              <b>出発地</b>
              <CmnDropdown
                classNameWrap='min-w-40 w-40'
                placeholder='なし'
                items={convertRegionsToListDropdown()}
                size='md'
                selectedKeys={watch('departure_from') ? [`${watch('departure_from')}`] : []}
                disallowEmptySelection
                errorMessage={errors?.departure_from?.message}
                onChange={(e) => {
                  setValue('departure_from', e.target.value ? Number(e.target.value) : null);
                  if (e.target.value) {
                    clearErrors('departure_from');
                  } else {
                    setError('departure_from', { message: gTxt('VALIDATE.REQUIRED', { field: '到着地' }) });
                  }
                }}
              />
              <b>到着地</b>
              <CmnDropdown
                classNameWrap='min-w-40 w-40'
                placeholder='なし'
                items={convertRegionsToListDropdown()}
                size='md'
                selectedKeys={watch('arrival_to') ? [`${watch('arrival_to')}`] : []}
                disallowEmptySelection
                errorMessage={errors?.arrival_to?.message}
                onChange={(e) => {
                  setValue('arrival_to', e.target.value ? Number(e.target.value) : null);
                  if (e.target.value) {
                    clearErrors('arrival_to');
                  } else {
                    setError('arrival_to', { message: gTxt('VALIDATE.REQUIRED', { field: '到着地' }) });
                  }
                }}
              />
            </div>
          </div>
          <div className='flex flex-col items-start'>
            <span className='text-[1.75rem]'>日時情報</span>
            {isErrorRequiredTime && (
              <div className='text-xs text-error'>(＊){gTxt('VALIDATE.REQUIRED', { field: '日時情報' })}</div>
            )}
          </div>
          <div className='flex items-center'>
            <span className='font-bold'>輸送日時</span>
            <span className='ml-2'>
              {timeData.date_from && timeData.date_to ? `${timeData.date_from} - ${timeData.date_to}` : '未登録'}
            </span>
          </div>
          <div className='flex items-center'>
            <span className='font-bold'>基本持込期限(カットオフ)</span>
            <span className='ml-2'>{timeData.time_to ? `${formatTime(timeData.time_to)}まで` : '未登録'}</span>
          </div>
          <div className='flex items-center'>
            <span className='font-bold'>繰り返し</span>
            <span className='ml-2'>{timeData.day_week ? getTimeRepeat() : '未登録'}</span>
          </div>
          <div className='w-full flex items-center justify-end'>
            <Button
              color='primary'
              radius='sm'
              className='font-bold'
              variant='ghost'
              onPress={() => {
                setModeViewTime(false);
                setIsOpenTimeModal(true);
              }}
            >
              日時情報の設定
            </Button>
          </div>
        </div>
        <div>
          <div className='flex flex-col items-start'>
            <span className='text-[1.75rem]'>輸送計画に登録されている荷物</span>
            {isErrorRequiredCargo && (
              <div className='text-xs text-error'>
                (＊){gTxt('VALIDATE.REQUIRED', { field: '輸送計画に登録されている荷物' })}
              </div>
            )}
          </div>
          <div className='flex items-center'>
            <span className=''>荷物が{cargoData.length}件登録されています。</span>
          </div>
          <div className='mt-2'>
            {cargoData.map((cargo, index) => {
              const tempRangeString = cargo?.temp_range
                ?.map((range: any) => TEMPERATURE_RANGE[range as keyof typeof TEMPERATURE_RANGE])
                .join(', ');
              return (
                <div key={index} className='flex items-start justify-between space-x-2 mb-2 last:mb-0'>
                  <div className='flex-1 border border-gray-border rounded px-3 py-1 space-y-2'>
                    <div className='flex items-center justify-end space-x-2'>
                      <span className='font-bold'>荷物ID</span>
                      <span>{cargo.cargo_info_id}</span>
                      <span className='font-bold'>事業者</span>
                      <span>{companyName || '未定'}</span>
                      <span className='font-bold'>登録日</span>
                      <span>{cargo.created_date}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='flex-1 grid grid-cols-8 gap-4'>
                        <div className='col-span-3 flex items-center gap-2'>
                          <div className='font-bold'>品名</div>
                          <div className='text-2xl font-medium'>{cargo.cargo_name}</div>
                        </div>
                        <div className='col-span-2 flex items-center gap-2'>
                          <div className='font-bold'>品目</div>
                          <div className='text-2xl font-medium'>
                            {OUTER_PACKAGE.find((outer) => outer.key === `${cargo.outer_package_code}`)?.label || ''}
                          </div>
                        </div>
                        <div className='col-span-3 flex items-center gap-2'>
                          <div className='font-bold'>温度帯</div>
                          <div className='text-2xl font-medium'>{tempRangeString}</div>
                        </div>
                      </div>
                      <Button
                        radius='sm'
                        color='primary'
                        className='text-base font-bold'
                        onPress={() => handleOpenModalDetailCargo(cargo.cargo_info_id || 0)}
                      >
                        詳細を見る
                      </Button>
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <div className='flex items-center justify-center space-x-2'>
                      <span className='font-bold'>希望運賃</span>
                      <CmnInputNumber
                        isPrice
                        classNameWrap='w-32'
                        size='md'
                        placeholder='入力内容'
                        valueDefault={cargo.price_per_unit === null ? undefined : cargo.price_per_unit}
                        onValueChange={(value: string) => {
                          if (value) {
                            let _errorPrice = [...errorPrice];
                            _errorPrice[index] = '';
                            setErrorPrice(_errorPrice);
                          } else {
                            let _errorPrice = [...errorPrice];
                            _errorPrice[index] = gTxt('VALIDATE.REQUIRED', { field: '希望運賃' });
                            setErrorPrice(_errorPrice);
                          }
                          const _cargoData = cargoData.map((item) => {
                            if (item.cargo_info_id === cargo.cargo_info_id) {
                              return { ...item, price_per_unit: value ? Number(value) : null };
                            }
                            return item;
                          });
                          setCargoData(_cargoData);
                          const totalPrice = _cargoData.reduce((acc, item) => acc + (item.price_per_unit || 0), 0);
                          setValue('price_per_unit', totalPrice);
                        }}
                        errorMessage={errorPrice[index]}
                      />
                      <span>円</span>
                    </div>
                    <div className='flex items-center justify-end'>
                      <Button
                        radius='sm'
                        variant='ghost'
                        color='danger'
                        className='text-base font-bold'
                        onPress={() => {
                          handleDeleteCargoRequest(cargo);
                        }}
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className='w-full flex items-center justify-end mt-4'>
            <Button
              color='primary'
              radius='sm'
              className='font-bold'
              variant='ghost'
              onPress={() => setIsOpenChooseCargoModal(true)}
            >
              荷物情報を追加する
            </Button>
          </div>
        </div>
      </form>
    );
  };

  const onRightButtonPress = () => {
    if (isDetail) {
      setIsDetail(false);
    } else {
      handleExternalSubmit();
    }
  };

  const getRightButtonTitle = () => {
    if (isDetail) {
      return '輸送計画を編集する';
    }
    if (modeEdit) {
      return '輸送計画を更新する';
    }
    return '登録する';
  };

  return (
    <CmnModal size='4xl' isOpen={isOpen} onClose={onClose}>
      <CmnModalHeader title={getHeaderTitle()} description={getHeaderDescription()} />
      <CmnModalBody className='text-xs'>
        <div>{isDetail ? renderDetail() : renderForm()}</div>
        {isOpenTimeModal && (
          <TimeModal
            isOpen={isOpenTimeModal}
            detailData={timeData}
            modeView={modeViewTime}
            onClose={() => setIsOpenTimeModal(false)}
            updateData={updateData}
          />
        )}
        {isOpenChooseCargoModal && (
          <ChooseCargoModal
            isOpen={isOpenChooseCargoModal}
            selectedList={cargoData.map((cargo) => cargo.cargo_info_id || 0)}
            onClose={() => setIsOpenChooseCargoModal(false)}
            chooseCargo={handleChooseCargo}
            deleteCargo={handleDeleteCargo}
            showDetailCargo={handleOpenModalDetailCargo}
          />
        )}
        {isOpenSearchSimilarModal && (
          <CmnModal
            isOpen={isOpenSearchSimilarModal}
            onClose={() => {
              setDataPropose([]);
              setDataTransportPlanDetail(undefined);
              setIsOpenSearchSimilarModal(false);
            }}
            customSize={{ width: '1261px', marginTop: '0px' }}
            size='custom'
            placement='center'
          >
            <ModalDataPropose
              onClose={() => {
                setDataPropose([]);
                setDataTransportPlanDetail(undefined);
                setIsOpenSearchSimilarModal(false);
              }}
              onSubmit={() => {
                setIsOpenSearchSimilarModal(false);
              }}
              checkDetailMatching={showModalDetailMatchingTransport}
              dataItem={dataPropose}
              dataTransportSaleDetail={dataTransportSaleDetail}
            />
          </CmnModal>
        )}
        {isOpenModalDetailMatchingTransport && (
          <CmnModal
            isOpen={isOpenModalDetailMatchingTransport}
            onClose={() => {
              setIsOpenModalDetailMatchingTransport(false);
              setDataDetailMatchingTransport(undefined);
            }}
            size='4xl'
            placement='center'
          >
            <ModalDetailMatchingTransport
              onClose={() => {
                setIsOpenModalDetailMatchingTransport(false);
                setDataDetailMatchingTransport(undefined);
              }}
              onSubmit={showModalConfirmRequest}
              dataItem={dataDetailMatchingTransport}
            />
          </CmnModal>
        )}
        {isOpenModalConfirmRequest && (
          <CmnModal
            isOpen={isOpenModalConfirmRequest}
            onClose={() => {
              setIsOpenModalConfirmRequest(false);
              setDataDetailMatchingTransport(undefined);
            }}
            size='custom'
            customSize={{ width: '734px', marginTop: '0px' }}
            placement='center'
          >
            <ModalConfirmRequest
              onClose={() => {
                setIsOpenModalConfirmRequest(false);
                setDataDetailMatchingTransport(undefined);
                setCutOffInfos([]);
                setDataTransportPlanDetail(undefined);
              }}
              onSubmit={handleConfirmMatching}
              dataItem={dataDetailMatchingTransport}
              cutOffInfos={cutOffInfos}
              dataTransportSaleDetail={dataTransportSaleDetail}
            />
          </CmnModal>
        )}
        {isOpenModalRequestComplete && (
          <CmnModal
            isOpen={isOpenModalRequestComplete}
            onClose={() => {
              setIsOpenModalRequestComplete(false);
              setDataDetailMatchingTransport(undefined);
            }}
            size='custom'
            customSize={{ width: '475px', marginTop: '0px' }}
            placement='center'
          >
            <ModalRequestComplete
              onClose={() => {
                setIsOpenModalRequestComplete(false);
                setDataDetailMatchingTransport(undefined);
              }}
              dataItem={dataDetailMatchingTransport}
            />
          </CmnModal>
        )}
        {showModalDetailInfo && (
          <ModalDetailInfo
            dataDetail={dataDetailCargo}
            isOpen={showModalDetailInfo}
            onDelete={handleApiDeleteCargo}
            setLoadingDetail={setLoadingDetail}
            onClose={handleCloseModalDetailCargo}
            onSubmit={(formValue) => onSubmitFormCargo(formValue)}
          />
        )}
      </CmnModalBody>
      <CmnModalFooter
        buttonLeftFirst={{
          onPress: onClose,
          children: '閉じる',
          className: 'font-bold text-base text-primary leading-normal bg-background border-none',
        }}
        buttonRightFirst={{
          children: getRightButtonTitle(),
          className: 'font-bold text-base text-white',
          onPress: onRightButtonPress,
        }}
      />
    </CmnModal>
  );
};

export default TransportFormModal;
