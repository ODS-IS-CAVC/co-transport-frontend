import { Button, Card, CardBody, CardHeader, Chip } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useState } from 'react';

import { Icon } from '@/components/common/Icon';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import Status from '@/components/pages/carrier/board/Status';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { useAppSelector } from '@/hook/useRedux';
import { getCondition } from '@/lib/carrier';
import { handleFormatNumberToCurrency } from '@/lib/helper';
import { MatchingHelper } from '@/lib/matching';
import { getPrefectureName } from '@/lib/prefectures';
import { currencyFormatWithIcon, formatCutOffTime } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { transactionService } from '@/services/transaction/transaction';
import { CarInfo, PackageCNSLine, ProposeTrspAbility } from '@/types/carrier/transport';
import { CutOffInfoType } from '@/types/shipper/transaction';

import ConditionProposalPackageModal from '../shipping-request/ConditionProposalPackageModal';

interface TransactionItemModalProps {
  id: string;
  isOpen: boolean;
  parent: PackageCNSLine;
  item: ProposeTrspAbility[];
  onClose?: () => void;
  onOpenCompanyDetail?: (id: string, role: string) => void;
  onOpenSuccessModal?: () => void;
}

function TransactionItemPackageModal(props: TransactionItemModalProps) {
  const {
    id,
    isOpen = false,
    item,
    parent,
    onClose = () => null,
    onOpenCompanyDetail = () => null,
    onOpenSuccessModal = () => null,
  } = props;

  const regions = useAppSelector((state: RootState) => state.app.locations);

  const [selectedCar, setSelectedCar] = useState<CarInfo | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProposeTrspAbility | null>(null);
  const [isOpenSuggestion, setIsOpenSuggestion] = useState(false);
  const [cutOffInfos, setCutOffInfos] = useState<CutOffInfoType[]>();

  const transactionApi = transactionService();

  const fetchCutOffInfos = async (id: number) => {
    try {
      const response = await transactionApi.apiAth114(id);
      setCutOffInfos(response.data);
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  };

  const renderCutoffTime = (car: CarInfo) => {
    if (car.order_status) {
      return `${formatCutOffTime(Number(car.cut_off_time))} ${handleFormatNumberToCurrency(car.cut_off_fee ?? 0)}円`;
    }

    return `${dayjs(car?.service_strt_time, TIME_FORMAT.HH_MM)
      .subtract(Number(car.cut_off_time || 0), 'hour')
      .format(TIME_FORMAT.HH_MM)}-${dayjs(car?.service_end_time, TIME_FORMAT.HH_MM)
      .subtract(Number(car.cut_off_time || 0), 'hour')
      .format(TIME_FORMAT.HH_MM)}`;
  };

  return (
    <>
      <CmnModal
        id={id}
        isOpen={isOpen}
        placement={item.length > 1 ? 'top' : 'center'}
        size='5xl'
        onClose={onClose}
        radius='none'
      >
        <CmnModalHeader
          title={`提案可能な運行 - ${item.length}件`}
          description={`マッチングしていない荷物情報(輸送計画)に提案可能な運行です。`}
          classNames='flex flex-col font-normal px-6'
        />
        <CmnModalBody key={`${item.length}-${parent.id}-modal-body`} classNames='text-sm leading-normal p-4'>
          <p className='text-base word-break p-3'>
            ※提案可能な条件は運行時間と運賃とカットオフ運賃。例えば、運行時間は+-1時間の範囲で提案可能、運賃は-5,000円の範囲で提案可能(カットオフ運賃は適宜調整可能)、それぞれに該当しないものは提案不可。
            <br />
            ※提案可能な運行で、トレーラーが前後空きの場合は運行時間が調整できる。トレーラーが後空きの場合は運行時間は調整できない。
          </p>
          {item.map((data: ProposeTrspAbility) => {
            const truck = data?.car_info?.find((car: CarInfo) => car.tractor_idcr == 1);
            const cars = data?.car_info
              ?.filter((car: CarInfo) => car.car_license_plt_num_id !== truck?.car_license_plt_num_id)
              .sort((a, b) => Number(a.display_order) - Number(b.display_order));
            return (
              <Card
                key={`${data.id}-${parent.id}`}
                className='border border-gray-border rounded-lg mt-4 mx-3'
                shadow='none'
              >
                <CardHeader className={`text-sm pb-0 p-2 gap-2 flex justify-between`}>
                  <div className='flex text-foreground text-sm items-center'>
                    <p className='text-base font-bold'>便名 &nbsp;</p>
                    <p className='text-2xl font-semibold whitespace-nowrap flex'>{data.trip_name}</p>
                  </div>
                  <div className='flex text-foreground text-base'>
                    <span className='whitespace-nowrap flex'>
                      <p className='font-bold'>登録日 &nbsp;</p>
                      <p>{data.created_date && dayjs(data.created_date).format(DATE_FORMAT.JAPANESE)}</p>
                    </span>
                    <span className='whitespace-nowrap flex'>
                      <p className='font-bold'>&nbsp; 運送日 &nbsp;</p>
                      <p>{dayjs(data.day).format(DATE_FORMAT.JAPANESE)}</p>
                    </span>
                  </div>
                </CardHeader>
                <CardBody key={`${data.id}-${parent.id}-body`} className={`pb-2 pt-0 flex flex-col gap-3 px-2`}>
                  <div className='flex'>
                    <div className='flex items-center px-3 gap-3 border border-default rounded-lg'>
                      <p className='text-base font-bold leading-9'>出発</p>
                      <p className='text-2xl font-medium'>
                        {`${getPrefectureName(regions, data.departure_from)} ${cars && cars?.length > 0 && cars[0].service_strt_time ? dayjs(cars[0].service_strt_time, TIME_FORMAT.HH_MM).format(TIME_FORMAT.HH_MM) : '--:--'}発`}
                      </p>
                      <Icon icon='keyboard_arrow_right' size={24} />
                      <p className='text-base font-bold leading-9'>到着</p>
                      <p className='text-2xl font-medium'>
                        {`${getPrefectureName(regions, data.arrival_to)} ${cars && cars?.length > 0 && cars[0].service_end_time ? dayjs(cars[0].service_end_time, TIME_FORMAT.HH_MM).format(TIME_FORMAT.HH_MM) : '--:--'}着`}
                      </p>
                    </div>
                  </div>
                  <div className='grid grid-cols-5 gap-3 text-base'>
                    <div className='col-span-1'>
                      <p className='text-base font-bold'>トラクター</p>
                    </div>
                    <div className='col-span-2'>
                      <p className='text-base font-bold'>トレーラ</p>
                    </div>
                  </div>
                  <div key={`${data.id}-${parent.id}-body-truck`} className='grid grid-cols-5 gap-3 text-base'>
                    <div className='col-span-1 p-2 flex flex-col justify-center border-default border rounded-lg'>
                      {truck ? (
                        <>
                          <p className='text-foreground'>{truck?.car_license_plt_num_id ?? ''}</p>
                          <p className='mt-2'>{truck?.vehicle_name ?? ''}</p>
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                    {cars &&
                      cars.length > 0 &&
                      cars.map((car: CarInfo, index: number) => {
                        const trailerStt = MatchingHelper.getOrderStatus(car.order_status);
                        return car.trailer_license_plt_num_id ? (
                          <div
                            key={`${car.id}-${data.id}-${index}`}
                            className='col-span-2 space-y-6 p-2 flex border-default border rounded-lg w-full'
                          >
                            <div className='flex flex-col items-start w-full'>
                              <div className='flex items-center gap-2 w-full mb-1'>
                                {car.order_status ? (
                                  <Status type={false} data={trailerStt} />
                                ) : (
                                  <>
                                    <Chip
                                      className={
                                        'h-8 px-2 text-base text-white bg-[#259d63] rounded-lg justify-center items-center gap-2 inline-flex'
                                      }
                                      size='lg'
                                      radius='sm'
                                    >
                                      提案可能
                                    </Chip>
                                    <div className='col-span-1 flex flex-col justify-end items-end space-y-2'>
                                      <Button
                                        className='text-neutral w-[13rem] text-base'
                                        size='sm'
                                        color='primary'
                                        radius='sm'
                                        onPress={() => {
                                          setSelectedCar(car);
                                          setSelectedItem(data);
                                          onClose();
                                          setIsOpenSuggestion(true);
                                          fetchCutOffInfos(data.vehicle_avb_resource_id);
                                        }}
                                      >
                                        条件を調整して提案する
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                              <div className='flex gap-2 w-full justify-between'>
                                <div className='flex flex-col items-start'>
                                  <p className='text-foreground flex'>
                                    {car.tractor_idcr == 1
                                      ? car.car_license_plt_num_id
                                        ? car.car_license_plt_num_id
                                        : ''
                                      : car.trailer_license_plt_num_id
                                        ? car.trailer_license_plt_num_id
                                        : ''}{' '}
                                    &nbsp;
                                  </p>
                                  <p className='mt-2'>
                                    {car?.vehicle_name ?? ''}{' '}
                                    {car?.temperature_range ? getCondition(car?.temperature_range) : ''}
                                  </p>
                                </div>
                                <div className='border-l border-default flex flex-col justify-end h-full' />
                                <div className='flex items-center'>
                                  <div className='flex flex-col'>
                                    <div className='flex items-center gap-0.5'>
                                      <span className='text-foreground font-bold text-base'>運賃</span>
                                      <span>{currencyFormatWithIcon(+car.freight_rate) ?? '--'}</span>
                                    </div>
                                    <div className='flex items-center gap-0.5'>
                                      <span className='text-foreground font-bold text-base'>カットオフ</span>
                                      <span>{renderCutoffTime(car)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <></>
                        );
                      })}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </CmnModalBody>
        <CmnModalFooter
          buttonLeftFirst={{
            children: '閉じる',
            color: 'primary',
            variant: 'light',
            onPress: onClose,
            className: 'bg-[#e8f1fe] text-base font-bold text-primary border-none mt-6',
          }}
        />
      </CmnModal>

      {selectedItem && selectedCar && cutOffInfos && cutOffInfos.length > 0 && (
        <ConditionProposalPackageModal
          id={`condition-proposal-package-modal-${selectedItem?.id}`}
          parent={parent}
          item={selectedItem!}
          car={selectedCar!}
          isOpen={isOpenSuggestion}
          onClose={() => {
            setIsOpenSuggestion(false);
            setSelectedCar(null);
            setSelectedItem(null);
            setCutOffInfos([]);
          }}
          onOpenCompanyDetail={onOpenCompanyDetail}
          cutOffInfos={cutOffInfos || []}
          onOpenSuccessModal={onOpenSuccessModal}
        />
      )}
    </>
  );
}

export default TransactionItemPackageModal;
