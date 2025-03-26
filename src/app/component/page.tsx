'use client';

import { getLocalTimeZone, today } from '@internationalized/date';
import { Accordion, AccordionItem, Button } from '@nextui-org/react';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import CmnAutocomplete from '@/components/common/CmnAutocomplete';
import CmnCalendar from '@/components/common/CmnCalendar';
import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import CmnDateRangePicker from '@/components/common/CmnDateRangePicker';
import CmnDropdown from '@/components/common/CmnDropdown';
import CmnFileUpload, { Files } from '@/components/common/CmnFileUpload';
import CmnInput from '@/components/common/CmnInput';
import CmnInputNumber from '@/components/common/CmnInputNumber';
import CmnRadioGroup from '@/components/common/CmnRadioGroup';
import { CmnSelectableCard } from '@/components/common/CmnSelectableCard';
import { CmnStep } from '@/components/common/CmnStep';
import { CmnTabs } from '@/components/common/CmnTabs';
import CmnTextarea from '@/components/common/CmnTextarea';
import CmnTime from '@/components/common/CmnTime';
import CmnTimeInput, { TimeString } from '@/components/common/CmnTimeInput';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { SearchSection } from '@/components/common/SearchSection';
import Stepper from '@/components/common/Stepper';
import { gTxt } from '@/messages/gTxt';

interface ReactHookForm {
  name: string;
  age: number;
  checkboxGroup: string[];
  dropdown: string;
  autocomplete: string;
  radioGroup: string;
  textarea: string;
}

type DateString = `${number}/${number}/${number}`;

function CommonPage() {
  const [searchParams, setSearchParams] = useState<Record<string, any>>({
    searchName: '',
    departureFrom: '',
    arrivalTo: '',
    startDate: '',
    endDate: '',
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<ReactHookForm>({
    defaultValues: {
      name: '',
      age: 18,
      dropdown: '2',
      autocomplete: '5',
      checkboxGroup: ['monday', 'thursday'],
      radioGroup: '1',
      textarea: '',
    },
  });

  const {
    handleSubmit: handleSubmitTime,
    watch: watchTime,
    setValue: setValueTime,
    setError: setErrorTime,
    clearErrors: clearErrorsTime,
    formState: { errors: errorsTime },
  } = useForm<{
    startTime: TimeString;
    endTime: TimeString;
  }>({
    defaultValues: {
      startTime: '11:08',
      endTime: '12:08',
    },
  });

  const handleChangeTime = (data: any) => {
    const timeKey = data.timeStart ? 'startTime' : 'endTime';
    const timeValue = data.timeStart ? data.timeStart : data.timeEnd;
    setValueTime(timeKey, timeValue);
    clearErrorsTime('endTime');
    clearErrorsTime('startTime');
  };

  const {
    handleSubmit: handleSubmitDate,
    watch: watchDate,
    setValue: setValueDate,
    setError: setErrorDate,
    clearErrors: clearErrorsDate,
    formState: { errors: errorsDate },
  } = useForm<{
    start1: DateString | null;
    end1: DateString | null;
    start2: DateString | null;
    end2: DateString | null;
  }>({
    defaultValues: {
      start1: '2025/01/01',
      end1: '2025/01/11',
    },
  });

  const handleFileSuccess = useCallback((flies: Files[]) => {
    console.log('flies =====Success=====>', flies);
  }, []);

  const radioOptions = [
    { key: 'option1', value: '1', label: '空便' },
    { key: 'option2', value: '2', label: '取引済の便' },
    { key: 'option3', value: '3', label: 'ドライ' },
  ];

  const dataCalendar = [
    {
      month: '202412',
      day: '30',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202412',
      day: '31',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '01',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '02',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '03',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '04',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '05',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '06',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '07',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '08',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '09',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '10',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '11',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '12',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '13',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '14',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '15',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '16',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '17',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '18',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '19',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '20',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '21',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '22',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '23',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '24',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '25',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '26',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '27',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '28',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '29',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '30',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202501',
      day: '31',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202502',
      day: '01',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
    {
      month: '202502',
      day: '02',
      total_trans_number: 0,
      total_trailer_number: 10,
      low_price: 100000,
      high_price: 200000,
      market_price: null,
      total_proposal_number: 3,
      total_trailer_proposal_number: 36903723,
      low_proposal_price: null,
      high_proposal_price: null,
      average_proposal_price: null,
      total_request_number: 0,
      total_trailer_request_number: null,
      low_request_price: null,
      high_request_price: null,
      average_request_price: null,
    },
  ];

  const steps = [
    {
      id: 0,
      text: '予約',
    },
    {
      id: 1,
      text: '契約',
    },
    {
      id: 2,
      text: '決済',
    },
    {
      id: 3,
      text: '運行',
    },
  ];

  const steppers = [
    {
      label: '予約',
      content: <p>予約</p>,
    },
    {
      label: '契約',
      content: <p>契約</p>,
    },
    {
      label: '決済',
      content: <p>決済</p>,
    },
    {
      label: '運行',
      content: <p>運行</p>,
    },
    {
      label: '取引完了',
      content: <p>取引完了</p>,
    },
  ];

  const dataShipperBoard = [
    {
      price: 9999,
      status: 130,
      departure_from: 333,
      arrival_to: 555,
      transport_date: '2025-12-23',
      collection_time_from: '22:14:00',
      collection_time_to: '23:00:00',
      created_date: '2025-01-10',
      item_name_txt: 'Transport Plan 1sad',
      trsp_cli_prty_name_txt: 'Transport Plan 1sad',
    },
    {
      price: 9999,
      status: 130,
      departure_from: 333,
      arrival_to: 555,
      transport_date: '2025-12-23',
      collection_time_from: '22:14:00',
      collection_time_to: '23:00:00',
      created_date: '2025-01-10',
      item_name_txt: 'Transport Plan 1sad',
      trsp_cli_prty_name_txt: 'Transport Plan 1sad',
    },
    {
      price: 9999,
      status: 130,
      departure_from: 333,
      arrival_to: 555,
      transport_date: '2025-12-23',
      collection_time_from: '22:14:00',
      collection_time_to: '23:00:00',
      created_date: '2025-01-10',
      item_name_txt: 'Transport Plan 1sad',
      trsp_cli_prty_name_txt: 'Transport Plan 1sad',
    },
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [totalPage, _setTotalPage] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const onPageChange = (page: number) => {
    //TODO: search
  };

  const onSubmit = (data: ReactHookForm) => {
    alert(`data: ${JSON.stringify(data)}`);
  };
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const onSubmitTimeInput = (data: any) => {
    console.log('data ===== onSubmitTimeInput ====>', data);
    alert(JSON.stringify(data));
  };

  const onSubmitDate = (data: any) => {
    console.log('data ======onSubmitDate========>', data);
    alert(JSON.stringify(data));
  };

  return (
    <div className='min-h-screen max-w-screen-xl min-w-96 flex-col mx-auto p-6'>
      <Accordion variant='splitted' showDivider>
        <AccordionItem key='selectCard' aria-label='selectCard' title='selectCard'>
          <CmnSelectableCard
            items={[
              {
                key: 'baggage_search',
                title: (
                  <div className='flex flex-col'>
                    <p>荷物情報(マッチングzしていない荷物)</p>
                    <p>荷物情報(マッチングしていない荷物)</p>
                  </div>
                ),
                content: <p>荷物情報(マッチングしていない荷物)</p>,
              },
              {
                key: 'flight_search',
                title: '空便情報(マッチングしていない便)',
                content: <p>空便情報(マッチングしていない便)</p>,
              },
            ]}
          />
        </AccordionItem>
        <AccordionItem key='search' aria-label='SearchSection' title='SearchSection'>
          <div className='bg-background p-4 space-y-4'>
            <SearchSection
              searchName={searchParams.searchName}
              departureFrom={searchParams.departureFrom}
              arrivalTo={searchParams.arrivalTo}
              startDate={searchParams.startDate}
              endDate={searchParams.endDate}
              onChangeLocation={(departureFrom, arrivalTo) => {
                console.log('onChangeLocation', departureFrom, arrivalTo);
                setSearchParams({ ...searchParams, departureFrom, arrivalTo });
              }}
              onChangeDate={(startDate, endDate) => {
                console.log('onChangeDate', startDate, endDate);
                setSearchParams({ ...searchParams, startDate, endDate });
              }}
              onSearch={(searchName) => {
                console.log('onSearch', searchName);
                setSearchParams({ ...searchParams, searchName });
              }}
            />
          </div>
        </AccordionItem>
        <AccordionItem key='0' aria-label='ReactHookForm' title='ReactHookForm'>
          <div className='bg-background p-4 space-y-4'>
            <label>ReactHookForm & common</label>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CmnInput
                title='User name'
                required
                placeholder='please enter name'
                register={register}
                name='name'
                rules={{
                  required: 'Name is a required field.',
                }}
                errorMessage={errors?.name?.message}
              />

              <CmnInputNumber
                title='Age'
                required
                placeholder='please enter age'
                classNameWrap='mt-6'
                register={register}
                valueDefault={watch('age')}
                name='age'
                rules={{
                  required: 'Age is a required field.',
                  min: {
                    value: 1,
                    message: 'The age must be greater than 1',
                  },
                  max: {
                    value: 100,
                    message: 'The age must be less than 100',
                  },
                }}
                errorMessage={errors?.age?.message}
                clearErrors={clearErrors}
                setValue={setValue}
              />

              <CmnRadioGroup
                title='Your gender'
                classNameWrap='mt-6'
                defaultValue={watch('radioGroup')}
                option={[
                  { key: '1', value: '1', label: 'Male' },
                  { key: '2', value: '2', label: 'Female' },
                ]}
                orientation='horizontal'
              />

              <CmnDropdown
                classNameWrap='mt-6'
                title='Interest'
                placeholder='Select...'
                defaultSelectedKeys={[watch('dropdown')]}
                onChange={(e) => {
                  setValue('dropdown', e.target.value);
                }}
                items={[
                  {
                    key: '1',
                    label: 'listening to music',
                  },
                  {
                    key: '2',
                    label: 'watch a movie',
                  },
                  {
                    key: '3',
                    label: 'eat and drink',
                  },
                ]}
              />

              <CmnAutocomplete
                classNameWrap='mt-6'
                options={[
                  {
                    key: '1',
                    label: 'Staff',
                  },
                  {
                    key: '2',
                    label: 'Worker',
                  },
                  {
                    key: '3',
                    label: 'Engineer',
                  },
                  {
                    key: '4',
                    label: 'Doctor',
                  },
                  {
                    key: '5',
                    label: 'Other work',
                  },
                ]}
                defaultSelectedKey={watch('autocomplete')}
                title='Your work'
                placeholder='Select your work'
                onSelectionChange={(key) => setValue('autocomplete', key as string)}
              />

              <CmnCheckboxGroup
                classNameWrap='mt-6'
                onChange={(value: string[]) => {
                  setValue('checkboxGroup', value);
                }}
                title='Day of the week'
                defaultValue={watch('checkboxGroup')}
                option={[
                  {
                    key: '1',
                    value: 'monday',
                    label: 'Monday',
                  },
                  {
                    key: '2',
                    value: 'tuesday',
                    label: 'Tuesday',
                  },
                  {
                    key: '3',
                    value: 'wednesday',
                    label: 'Wednesday',
                  },
                  {
                    key: '4',
                    value: 'thursday',
                    label: 'Thursday',
                  },
                  {
                    key: '5',
                    value: 'friday',
                    label: 'Friday',
                  },
                  {
                    key: '6',
                    value: 'saturday',
                    label: 'Saturday',
                  },
                  {
                    key: '7',
                    value: 'sunday',
                    label: 'Sunday',
                  },
                ]}
              />

              <CmnTextarea
                register={register}
                name='textarea'
                rules={{
                  required: 'Other information is a required field.',
                  maxLength: {
                    value: 100,
                    message: 'The input must be less than or equal to 100 characters.',
                  },
                }}
                title='Other information'
                classNameWrap='mt-6'
                placeholder='Enter other information'
                required
                maxLength={100}
                clearErrors={clearErrors}
                errorMessage={errors.textarea?.message}
              />

              <Button
                fullWidth
                type='submit'
                color='primary'
                className='mt-10 h-12 text-h6 font-bold leading-6 text-white'
              >
                submit
              </Button>
            </form>
          </div>
        </AccordionItem>

        <AccordionItem key='1' aria-label='File Upload' title='File Upload'>
          <div className='bg-white p-10 flex justify-center'>
            <CmnFileUpload
              classNameWrap='w-[25rem]'
              getFileSuccess={handleFileSuccess}
              // extend={{ maxFile: 2, maxSize: 10, allowedTypes: ['csv'], notAllowedTypes: ['jpg', 'pdf'] }}
            />
          </div>
        </AccordionItem>
        <AccordionItem key='2' aria-label='Button' title='Button'>
          <div className='bg-background p-4 grid grid-cols-2 gap-4 py-4'>
            <div className='col-span-1'>
              <div className='grid grid-cols-3'>
                <div className='col-span-1'>Outline:</div>
                <div className='col-span-2'>
                  <Button className='font-bold text-base' variant='bordered' radius='sm' color='primary'>
                    <span>{gTxt('COMMON.BTN_LOGOUT')}</span>
                  </Button>
                </div>
              </div>
            </div>
            <div className='col-span-1'>
              <div className='grid grid-cols-3'>
                <div className='col-span-1'>Primary:</div>
                <div className='col-span-2'>
                  <Button className='font-bold text-base' radius='sm' color='primary'>
                    {gTxt('COMMON.BTN_LOGIN')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </AccordionItem>
        <AccordionItem key='3' aria-label='Dropdown' title='Dropdown'>
          <div className='bg-background p-4 space-y-4'>
            <div>Dropdown Required:</div>
            <div>
              <CmnDropdown
                className='max-w-96'
                title='入力項目名'
                helpText='サポートテキストを表示'
                required
                items={[
                  {
                    key: '1',
                    label: '新東名高速道路1',
                  },
                  {
                    key: '2',
                    label: '新東名高速道路2',
                  },
                  {
                    key: '3',
                    label: '新東名高速道路3',
                  },
                  {
                    key: '4',
                    label: '新東名高速道路4',
                  },
                ]}
              />
            </div>
          </div>
        </AccordionItem>
        <AccordionItem key='4' aria-label='Input' title='Input'>
          <div className='bg-background p-4 space-y-4'>
            <div>
              <label>Input</label>
              <CmnInput className='max-w-96' helpText='サポートテキストを表示' title='入力項目名' required />
            </div>
            <div>
              <label>Input Number</label>
              <CmnInputNumber
                className='max-w-96'
                helpText='サポートテキストを表示'
                title='input number'
                required
                valueDefault={10000.4}
              />
            </div>
          </div>
        </AccordionItem>
        <AccordionItem key='5' aria-label='Checkbox Group' title='Checkbox Group'>
          <div className='bg-background p-4 space-y-4'>
            <div>
              <label>Checkbox Group</label>
              <CmnCheckboxGroup
                onChange={(value: string[]) => {
                  console.log('value ==== CheckboxGroup ====>', value);
                }}
                title='入力項目名'
                defaultValue={['monday', 'tuesday']}
                option={[
                  {
                    key: '1',
                    value: 'monday',
                    label: '日',
                  },
                  {
                    key: '2',
                    value: 'tuesday',
                    label: '月',
                  },
                  {
                    key: '3',
                    value: 'wednesday',
                    label: '火',
                  },
                  {
                    key: '4',
                    value: 'thursday',
                    label: '水',
                  },
                  {
                    key: '5',
                    value: 'friday',
                    label: '木',
                  },
                  {
                    key: '6',
                    value: 'saturday',
                    label: '金',
                  },
                  {
                    key: '7',
                    value: 'sunday',
                    label: '土',
                  },
                ]}
              />
            </div>
          </div>
        </AccordionItem>
        <AccordionItem key='6' aria-label='Radio Group' title='Radio Group'>
          <div className='bg-background p-4 space-y-4'>
            <div>
              <label>Radio Group</label>
              <CmnRadioGroup
                title='確定前の輸送計画'
                helpText='確定前の輸送計画'
                option={radioOptions}
                orientation='vertical'
                required
              />
            </div>
          </div>
        </AccordionItem>
        <AccordionItem key='7' aria-label='Auto Complete' title='Auto Complete'>
          <div className='bg-background p-4 space-y-4'>
            <div>
              <label>Auto Complete</label>
              <CmnAutocomplete
                className='max-w-96'
                options={[
                  {
                    key: 'baggage_search',
                    label: '荷物情報(マッチングしていない荷物)',
                  },
                  {
                    key: 'flight_search',
                    label: '空便情報(マッチングしていない便)',
                  },
                ]}
                // defaultInputValue={animals[3].label}
                required
                title='入力項目名'
                helpText='サポートテキストを表示'
                onInputChange={(value) => {
                  console.log('value ===select==', value);
                }}
              />
            </div>
          </div>
        </AccordionItem>
        <AccordionItem key='8' aria-label='TextArea' title='TextArea'>
          <div className='bg-background p-4 space-y-4'>
            <div>
              <label>TextArea</label>
              <CmnTextarea
                classNameWrap='max-w-96'
                title='入力項目名'
                helpText='サポートテキストを表示'
                required
                maxLength={10}
                onValueChange={(value: string) => {
                  console.log('value', value);
                }}
              />
            </div>
          </div>
        </AccordionItem>
        <AccordionItem key='9' aria-label='Tabs' title='Tabs'>
          <div className='bg-background p-4 space-y-4'>
            <label>Tabs</label>
            <div className='px-4'>
              <CmnTabs
                items={[
                  {
                    key: 'baggage_search',
                    title: '荷物情報(マッチングしていない荷物)',
                    content: <p>荷物情報(マッチングしていない荷物)</p>,
                  },
                  {
                    key: 'flight_search',
                    title: '空便情報(マッチングしていない便)',
                    content: <p>空便情報(マッチングしていない便)</p>,
                  },
                ]}
              ></CmnTabs>
            </div>
          </div>
        </AccordionItem>
        <AccordionItem key='10' aria-label='Calendar' title='Calendar'>
          <div className='bg-background p-4 space-y-4'>
            <label>Calendar</label>
            <CmnCalendar
              data={dataCalendar}
              setMonthCalendar={(month: string) => {}}
              viewList={<>View List</>}
              viewMode={1}
            />
          </div>
        </AccordionItem>
        <AccordionItem key='11' aria-label='DateRangePicker' title='DateRangePicker'>
          <form onSubmit={handleSubmitDate(onSubmitDate)} className='bg-background '>
            <div className='p-4 space-y-4'>
              <label>DateRangePicker:</label>
              <CmnDateRangePicker
                classNameWrap='max-w-36'
                date={
                  watchDate('start1') && watchDate('end1')
                    ? {
                        start: watchDate('start1') || '',
                        end: watchDate('end1') || '',
                      }
                    : null
                }
                size='sm'
                onChangeValue={(value) => {
                  setValueDate('start1', value?.start as DateString);
                  setValueDate('end1', value?.end as DateString);

                  errorsDate.start1?.message && clearErrorsDate('start1');
                  errorsDate.end1?.message && clearErrorsDate('end1');

                  if (value && value?.start > value?.end) {
                    setErrorDate('start1', { message: '開始日は終了日より前である必要があります。' });
                  }
                }}
                errorMessage={errorsDate?.start1?.message || errorsDate?.end1?.message}
              />
            </div>
            <div className='p-4 space-y-4'>
              <label>Disable date previous:</label>
              <CmnDateRangePicker
                classNameWrap='max-w-36'
                size='sm'
                minValue={today(getLocalTimeZone())}
                date={
                  watchDate('start2') && watchDate('end2')
                    ? {
                        start: watchDate('start2') || '',
                        end: watchDate('end2') || '',
                      }
                    : null
                }
                onChangeValue={(value) => {
                  setValueDate('start2', value?.start as DateString);
                  setValueDate('end2', value?.end as DateString);
                }}
              />
            </div>

            <Button type='submit' className='m-4'>
              Submit
            </Button>
          </form>
        </AccordionItem>
        <AccordionItem key='12' aria-label='TimeRangeInput' title='TimeRangeInput'>
          <div className='bg-background p-4 space-y-4'>
            <label>TimeRangeInput:</label>
            <form onSubmit={handleSubmitTime(onSubmitTimeInput)}>
              <CmnTimeInput
                size='sm'
                classNameWrap='max-w-52'
                onError={(message: string) => {
                  message && setErrorTime('startTime', { message });
                }}
                onChangeTime={handleChangeTime}
                defaultTimeEnd={watchTime('endTime')}
                defaultTimeStart={watchTime('startTime')}
                errorMessage={errorsTime?.startTime?.message || errorsTime?.endTime?.message}
              />
              <Button type='submit' className='mt-4'>
                Submit
              </Button>
            </form>
          </div>
        </AccordionItem>
        <AccordionItem key='13' aria-label='Stepper' title='Stepper'>
          <CmnStep
            steps={steps}
            activeStep={activeStep}
            handleClick={(stepId: number) => setActiveStep(stepId)}
            isLoading={false}
          />
        </AccordionItem>
        <AccordionItem key='14' aria-label='Stepper' title='Stepper 2'>
          <Stepper steps={steppers} activeStep={'予約'} />
        </AccordionItem>
        <AccordionItem key='15' aria-label='Modal' title='Modal'>
          <Button onPress={() => setIsOpenModal(true)}>Open Modal</Button>
          <CmnModal placement='top' isOpen={isOpenModal} onClose={() => setIsOpenModal(false)}>
            <CmnModalHeader
              title='モーダルのタイトル'
              description='モーダルビューよりも大きな入力画面で任意の複雑な情報を入力することができます。情報ビューはソートなどの簡単な条件設定、入力モーダルビューはユーザーにデータを入力させたいときに使います。'
            ></CmnModalHeader>
            <CmnModalBody>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
              <p>Modal Body</p>
            </CmnModalBody>
            <CmnModalFooter
              buttonRightFirst={{ children: 'アップロードを保存する' }}
              buttonRightSecond={{ children: '閉じる', onPress: () => setIsOpenModal(false) }}
              buttonLeftFirst={{ children: '閉じる' }}
            />
          </CmnModal>
        </AccordionItem>

        <AccordionItem key='16' aria-label='time' title='Time'>
          <div className='bg-background p-4 space-y-4'>
            <label>Time input:</label>
            <CmnTime classNameWrap='max-w-20' defaultTime='11:08' />
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default CommonPage;
