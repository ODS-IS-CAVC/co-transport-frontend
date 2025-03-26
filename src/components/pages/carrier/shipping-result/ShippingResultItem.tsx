'use client';

import { Button, Card, CardBody } from '@nextui-org/react';
import dayjs from 'dayjs';
import React, { useState } from 'react';

import { Icon } from '@/components/common/Icon';
import TransactionItemVehicleModal from '@/components/pages/carrier/shipping-result/TransactionItemVehicleModal';
import { mockAccount } from '@/constants/auth';
import { TransType, VEHICLE_TYPE } from '@/constants/common';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { OUT_PACKAGES } from '@/constants/shipper';
import useModals from '@/hook/useModals';
import { useAppSelector } from '@/hook/useRedux';
import { getPrefectureName } from '@/lib/prefectures';
import { formatCurrency, formatTime } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { RootState } from '@/redux/store';
import { UserInfo } from '@/types/auth';
import { PackageCNSLine, VehicleAVBResource } from '@/types/carrier/transport';

import { getCondition } from '../../../../lib/carrier';
import CompanyInfoModal from '../board/Modal/ModalCompanyInfo';
import ConditionProposalSuccessModal from '../shipping-request/ConditionProposalSuccessModal';
import TransactionItemPackageModal from './TransactionItemPackageModal';

interface ShippingResultItemProps {
  record: VehicleAVBResource | PackageCNSLine;
  screen: string;
  onReloadPage: () => void;
}
const ShippingResultItem = React.memo((props: ShippingResultItemProps) => {
  const { record, screen, onReloadPage } = props;

  const regions = useAppSelector((state: RootState) => state.app.locations);

  let item: any;
  if (screen === 'baggage_search') {
    item = record as PackageCNSLine;
  } else if (screen === 'flight_search') {
    item = record as VehicleAVBResource;
  }

  const { modals, toggleModal, openModal, closeModal } = useModals({
    modalResult: false,
    modalCompanyInfo: false,
    modalTransactionItem: false,
  });

  const [selectParent, setSelectParent] = useState<VehicleAVBResource | PackageCNSLine | null>(null);

  const [data, setData] = useState<UserInfo | undefined>();

  const eventCompanyInfo = (id: string, role: string) => {
    if (!id || !role) return;
    if (modals.modalCompanyInfo) {
      setData(undefined);
    } else {
      setData(mockAccount.find((account) => account.companyId == id && account.role == role));
    }
    toggleModal('modalCompanyInfo');
  };

  return (
    <div key={`${item.id}-${screen}-list`}>
      <Card
        key={`${item.id}-${screen}`}
        className='bg-white shadow-none border border-other-gray rounded-lg text-sm mt-2'
      >
        <CardBody className='px-2 py-2'>
          {screen === 'baggage_search' && (
            <>
              <div className='h-7 justify-between items-center gap-2 inline-flex'>
                {item.trans_type == TransType.CARRIER && (
                  <div className='w-[6.25rem] h-8 px-2 py-2 bg-other-gray rounded-lg justify-center items-center gap-2 inline-flex'>
                    <div className='text-center text-[#f2f2f2] text-base font-bold leading-normal'>キャリア間</div>
                  </div>
                )}
                <div className='flex items-center'>
                  <div className='w-12 h-5 text-sm font-normal leading-tight'>輸送日</div>
                  <div className='text-[#1e1e1e] text-sm font-normal leading-tight'>
                    {item.collection_date ? dayjs(item.collection_date).format(DATE_FORMAT.JAPANESE) : ''}
                  </div>
                </div>
              </div>
              {item.trans_type == TransType.SHIPPER ? (
                <>
                  <div className='py-2 justify-start items-center gap-4 flex flex-wrap flex-row my-4'>
                    <div className='px-3 py-1 rounded-lg border border-[#d9d9d9] justify-start items-center gap-6 flex'>
                      <div className='justify-start items-center gap-2 flex'>
                        <div className='text-base font-bold leading-7'>運送区間</div>
                        <div className='text-2xl font-medium leading-9'>{`${item?.departure_from ? getPrefectureName(regions, item?.departure_from) : ''}`}</div>
                        <Icon icon='keyboard_arrow_right' size={24} />
                        <div className='text-2xl font-medium leading-9'>{`${item?.arrival_to ? getPrefectureName(regions, item?.arrival_to) : ''}`}</div>
                      </div>
                    </div>
                    <div className='justify-start items-center gap-2 flex'>
                      <div className='text-base font-bold leading-7'>希望持ち込み時間</div>
                      <div className='text-2xl font-medium leading-9'>{`${item?.collection_time_from ? formatTime(item?.collection_time_from, TIME_FORMAT.HH_MM_SS) : ''} ~ ${item?.collection_time_to ? formatTime(item?.collection_time_to, TIME_FORMAT.HH_MM_SS) : ''}`}</div>
                    </div>
                    <div className='text-base font-bold leading-7'>希望運賃</div>
                    <div className='text-2xl font-medium leading-9'>
                      ¥ {item?.price_per_unit ? formatCurrency(`${item?.price_per_unit}`) : ''}
                    </div>
                  </div>
                  <div className='flex-col justify-start items-start gap-[15px] inline-flex'>
                    <div className='self-stretch justify-between items-center flex flex-wrap flex-row '>
                      <div className='justify-start items-center gap-8 flex'>
                        <div className='justify-start items-center gap-2 flex'>
                          <div className='text-base font-bold leading-7'>荷主</div>
                          <div className='text-2xl font-medium leading-9'>{item?.operator_name ?? ''}</div>
                        </div>
                        <div className='justify-start items-center gap-2 flex'>
                          <div className='text-base font-bold leading-7'>品名</div>
                          <div className='text-2xl font-medium leading-9'>{item?.transport_name ?? ''}</div>
                        </div>
                        <div className='justify-start items-center gap-2 flex'>
                          <div className='text-base font-bold leading-7'>品目</div>
                          <div className='text-2xl font-medium leading-9'>
                            {item?.outer_package_code
                              ? OUT_PACKAGES.find((op) => op.key == item?.outer_package_code)?.label
                              : ''}
                          </div>
                        </div>
                        <div className='justify-start items-center gap-2 flex'>
                          <div className='text-base font-bold leading-7'>温度帯</div>
                          <div className='text-2xl font-medium leading-9'>
                            {item?.temperature_range ? getCondition(item?.temperature_range) : ''}
                          </div>
                        </div>
                      </div>
                      <div className='h-12 flex-col justify-end items-end gap-2.5 inline-flex'>
                        <div className='justify-end items-end gap-2 inline-flex'>
                          <Button
                            color='primary'
                            className='w-48 rounded-lg text-base font-bold h-12'
                            onPress={() => eventCompanyInfo(item.operator_id, 'shipper')}
                          >
                            荷主会社情報を見る
                          </Button>
                          {item.propose_trsp_ability && item.propose_trsp_ability.length > 0 ? (
                            <Button
                              color='primary'
                              className='w-48 rounded-lg text-base font-bold h-12'
                              onPress={() => openModal('modalTransactionItem')}
                            >
                              提案可能な運行を見る
                            </Button>
                          ) : (
                            <Button
                              color='default'
                              variant='ghost'
                              className='w-60 h-12 border-other-gray rounded-lg text-base text-other-gray font-bold'
                              onPress={() => {
                                openModal('modalTransactionItem');
                                setSelectParent(item);
                              }}
                            >
                              提案できる運行がありません
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className='py-2 justify-start items-center gap-4 flex flex-row flex-wrap'>
                    <div className='justify-start items-center gap-2 flex'>
                      <div className='text-base font-bold leading-7'>便名</div>
                      <div className='text-2xl font-medium leading-9'>
                        {item?.parent_order_propose_snapshot?.trip_name}
                      </div>
                    </div>
                    <div className='h-10 px-3 py-1 rounded-lg border border-[#d9d9d9] justify-start items-center gap-6 flex'>
                      <div className='justify-start items-center gap-2 flex'>
                        <div className='text-base font-bold  leading-7'>出発</div>
                        <div className='text-2xl font-medium  leading-9'>{`${getPrefectureName(regions, item.departure_from)} ${item?.propose_depature_time ? formatTime(item?.propose_depature_time, TIME_FORMAT.HH_MM_SS) + '発' : ''}`}</div>
                        <Icon icon='keyboard_arrow_right' size={24} />
                        <div className='text-base font-bold  leading-7'>到着</div>
                        <div className='text-2xl font-medium  leading-9'>{`${getPrefectureName(regions, item.arrival_to)} ${item?.propose_arrival_time ? formatTime(item?.propose_arrival_time, TIME_FORMAT.HH_MM_SS) + '発' : ''}`}</div>
                      </div>
                    </div>
                    <div className='justify-start items-center gap-2 flex'>
                      <div className='text-center text-base font-bold  leading-7'>運賃</div>
                      <div className='text-center text-[#1e1e1e] text-2xl font-medium  leading-9'>
                        ¥ {item?.propose_price ? formatCurrency(`${item?.propose_price}`) : ''}
                      </div>
                    </div>
                  </div>
                  <div className='py-2 justify-start items-center gap-4 flex flex-wrap flex-row'>
                    <div className='justify-start items-center gap-2 flex'>
                      <div className='text-base font-bold leading-7'>運送会社</div>
                      <div className='text-2xl font-medium leading-9'>{item?.operator_name}</div>
                    </div>
                    <div className='px-3 py-1 rounded-lg border border-[#d9d9d9] justify-start items-center gap-6 flex flex-wrap'>
                      <div className='justify-start items-center gap-2 flex whitespace-nowrap'>
                        <div className='text-base font-bold leading-7'>車両</div>
                        <div className='text-2xl font-medium leading-9'>{item?.vehicle_name}</div>
                      </div>
                      <div className='justify-start items-center gap-2 flex whitespace-nowrap'>
                        <div className='text-base font-bold leading-7'>タイプ</div>
                        <div className='text-2xl font-medium leading-9'>
                          {item.vehicle_type == VEHICLE_TYPE.TRACTOR
                            ? gTxt('COMMON.VEHICLE_TYPE_TRACTOR')
                            : gTxt('COMMON.VEHICLE_TYPE_TRAILER')}
                        </div>
                      </div>
                      <div className='justify-start items-center gap-2 flex whitespace-nowrap'>
                        <div className='text-base font-bold leading-7'>温度帯</div>
                        <div className='text-2xl font-medium leading-9'>
                          {item?.temperature_range ? getCondition(item?.temperature_range) : ''}
                        </div>
                      </div>
                      <div className='justify-start items-center gap-4 flex whitespace-nowrap'>
                        <div className='text-base font-bold leading-7'>車両ナンバー</div>
                        <div className='text-2xl font-medium leading-9'>{`${item?.tractor_idcr == 1 ? (item?.car_license_plt_num_id ? `${item?.car_license_plt_num_id}` : '') : item.trailer_license_plt_num_id ? `${item.trailer_license_plt_num_id}` : ''}`}</div>
                      </div>
                    </div>
                  </div>
                  <div className='flex-col justify-start items-start gap-[15px] inline-flex'>
                    <div className='self-stretch justify-end items-center inline-flex'>
                      <div className='h-12 flex-col justify-end items-end gap-2.5 inline-flex'>
                        <div className='justify-end items-end gap-2 inline-flex'>
                          <Button
                            color='primary'
                            className='w-48 rounded-lg text-base font-bold h-12'
                            onPress={() => eventCompanyInfo(item.operator_id, 'carrier')}
                          >
                            運送会社情報を見る
                          </Button>
                          {item.propose_trsp_ability && item.propose_trsp_ability.length > 0 && (
                            <Button
                              color='primary'
                              className='w-48 rounded-lg text-base font-bold h-12'
                              onPress={() => {
                                openModal('modalTransactionItem');
                                setSelectParent(item);
                              }}
                            >
                              提案可能な運行を見る
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {item.request_snapshot && (
                    <>
                      <div className='py-2justify-start items-center gap-4 flex flex-wrap flex-row'>
                        <div className='px-3 py-1 rounded-lg border border-[#d9d9d9] justify-start items-center gap-6 flex'>
                          <div className='justify-start items-center gap-2 flex'>
                            <div className='text-base font-bold leading-7'>運送区間</div>
                            <div className='text-2xl font-medium leading-9'>
                              {item?.departure_from ? getPrefectureName(regions, item?.departure_from) : ''}
                            </div>
                            <Icon icon='keyboard_arrow_right' size={24} />
                            <div className='text-2xl font-medium leading-9'>
                              {item?.arrival_to ? getPrefectureName(regions, item?.arrival_to) : ''}
                            </div>
                          </div>
                        </div>
                        <div className='justify-start items-center gap-2 flex'>
                          <div className='text-base font-bold leading-7'>希望持ち込み時間</div>
                          <div className='text-2xl font-medium leading-9'>{`${item.request_snapshot?.collection_time_from ? formatTime(item?.request_snapshot?.collection_time_from, TIME_FORMAT.HH_MM_SS) : ''} ~ ${item.request_snapshot?.collection_time_to ? formatTime(item?.request_snapshot?.collection_time_to, TIME_FORMAT.HH_MM_SS) : ''}`}</div>
                        </div>
                        <div className='justify-start items-center gap-2 flex'>
                          <div className='text-base font-bold leading-7'>希望運賃</div>
                          <div className='text-2xl font-medium leading-9'>
                            ¥{' '}
                            {item?.request_snapshot?.price_per_unit
                              ? formatCurrency(`${item?.request_snapshot?.price_per_unit}`)
                              : ''}
                          </div>
                        </div>
                      </div>
                      <div className='flex-col justify-start items-start gap-[15px] inline-flex'>
                        <div className='self-stretch justify-between items-center inline-flex '>
                          <div className='justify-start items-center gap-8 flex'>
                            <div className='justify-start items-center gap-2 flex'>
                              <div className='text-base font-bold leading-7'>荷主</div>
                              <div className='text-2xl font-medium leading-9'>
                                {item?.request_snapshot?.operator_name}
                              </div>
                            </div>
                            <div className='justify-start items-center gap-2 flex'>
                              <div className='text-base font-bold leading-7'>品名</div>
                              <div className='text-2xl font-medium leading-9'>
                                {item?.request_snapshot?.transport_name}
                              </div>
                            </div>
                            <div className='justify-start items-center gap-2 flex'>
                              <div className='text-base font-bold leading-7'>品目</div>
                              <div className='text-2xl font-medium leading-9'>
                                {item?.request_snapshot?.outer_package_code
                                  ? OUT_PACKAGES.find(
                                      (op) => Number(op.key) == Number(item?.request_snapshot?.outer_package_code),
                                    )?.label
                                  : ''}
                              </div>
                            </div>
                            <div className='justify-start items-center gap-2 flex'>
                              <div className='text-base font-bold leading-7'>温度帯</div>
                              <div className='text-2xl font-medium leading-9'>
                                {item?.request_snapshot?.temperature_range
                                  ? getCondition(item?.request_snapshot?.temperature_range)
                                  : ''}
                              </div>
                            </div>
                          </div>
                          <div className='h-12 flex-col justify-end items-end gap-2.5 inline-flex'>
                            <div className='justify-end items-end gap-2 inline-flex'>
                              <Button
                                color='primary'
                                className='w-48 rounded-lg text-base font-bold h-12'
                                onPress={() => eventCompanyInfo(item?.request_snapshot?.operator_id, 'shipper')}
                              >
                                荷主会社情報を見る
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
          {screen === 'flight_search' && (
            <>
              <div className='h-8 justify-between items-center inline-flex'>
                {item.trans_type == TransType.CARRIER && (
                  <div className='justify-start items-start gap-2 flex'>
                    <div className='px-2 py-1 bg-[#555555] rounded-lg justify-center items-center gap-2 flex'>
                      <div className='text-center text-[#f2f2f2] text-base font-bold leading-normal'>キャリア間</div>
                    </div>
                  </div>
                )}
                <div className='justify-start items-center gap-2 flex'>
                  <div className='text-black text-sm font-normal leading-tight'>運行日</div>
                  <div className='text-[#1e1e1e] text-sm font-normal leading-tight'>
                    {item.day ? dayjs(item.day).format(DATE_FORMAT.JAPANESE) : ''}
                  </div>
                </div>
              </div>
              <div className='py-2 justify-start items-center gap-4 flex flex-wrap flex-row'>
                <div className='justify-start items-center gap-2 flex'>
                  <div className='text-black text-base font-bold leading-7'>便名</div>
                  <div className='text-black text-2xl font-medium leading-9'>{item?.trip_name}</div>
                </div>
                <div className='h-9 px-3 py-1 rounded-lg border border-[#d9d9d9] justify-start items-center gap-6 flex'>
                  <div className='justify-start items-center gap-2 flex'>
                    <div className='text-black text-base font-bold leading-7'>出発</div>
                    <div className='text-black text-2xl font-medium leading-9'>
                      {`${item?.departure_from ? getPrefectureName(regions, item?.departure_from) : ''} ${item?.service_strt_time ? `${formatTime(item?.service_strt_time, TIME_FORMAT.HH_MM_SS)}発` : ''}`}
                    </div>
                    <Icon icon='keyboard_arrow_right' size={24} />
                    <div className='text-black text-base font-bold leading-7'>到着</div>
                    <div className='text-black text-2xl font-medium leading-9'>{`${item?.arrival_to ? getPrefectureName(regions, item?.arrival_to) : ''} ${item?.service_end_time ? `${formatTime(item?.service_end_time, TIME_FORMAT.HH_MM_SS)}着` : ''}`}</div>
                  </div>
                </div>
                <div className='justify-start items-center gap-2 flex'>
                  <div className='text-center text-black text-base font-bold leading-7'>運賃</div>
                  <div className='text-center text-[#1e1e1e] text-2xl font-medium leading-9'>
                    ¥ {item?.price ? formatCurrency(String(item.price + (item?.cut_off_fee || 0))) : ''}
                  </div>
                </div>
              </div>
              <div className='py-2 justify-start items-center gap-4 flex flex-wrap flex-row'>
                <div className='justify-start items-center gap-2 flex'>
                  <div className='text-black text-base font-bold leading-7'>運送会社</div>
                  <div className='text-black text-2xl font-medium leading-9'>{item?.operator_name}</div>
                </div>
                <div className='px-3 py-1 rounded-lg border border-[#d9d9d9] justify-start items-center gap-6 flex flex-wrap'>
                  <div className='justify-start items-center gap-2 flex whitespace-nowrap'>
                    <div className='text-black text-base font-bold leading-7'>車両</div>
                    <div className='text-black text-2xl font-medium leading-9'>{item?.vehicle_name}</div>
                  </div>
                  <div className='justify-start items-center gap-2 flex whitespace-nowrap'>
                    <div className='text-black text-base font-bold leading-7'>タイプ</div>
                    <div className='text-black text-2xl font-medium leading-9'>
                      {item.vehicle_type == VEHICLE_TYPE.TRACTOR
                        ? gTxt('COMMON.VEHICLE_TYPE_TRACTOR')
                        : gTxt('COMMON.VEHICLE_TYPE_TRAILER')}
                    </div>
                  </div>
                  <div className='justify-start items-center gap-2 flex whitespace-nowrap'>
                    <div className='text-black text-base font-bold leading-7'>温度帯</div>
                    <div className='text-black text-2xl font-medium leading-9'>
                      {item?.temperature_range ? getCondition(item?.temperature_range) : ''}
                    </div>
                  </div>
                  <div className='justify-start items-center gap-4 flex whitespace-nowrap'>
                    <div className='text-black text-base font-bold leading-7'>車両ナンバー</div>
                    <div className='text-black text-2xl font-medium leading-9'>{`${item?.tractor_idcr == 1 ? (item?.car_license_plt_num_id ?? '') : (item?.trailer_license_plt_num_id ?? '')}`}</div>
                  </div>
                </div>
              </div>
              <div className='h-12 justify-end items-center gap-8 flex flex-wrap flex-row'>
                <div className='justify-end items-end gap-2.5 inline-flex'>
                  <Button
                    color='primary'
                    className='w-48 rounded-lg text-base font-bold h-12'
                    onPress={() => eventCompanyInfo(item.operator_id, 'carrier')}
                  >
                    運送会社情報を見る
                  </Button>
                  {item.propose_trsp_plan && item.propose_trsp_plan.length > 0 ? (
                    <Button
                      color='primary'
                      className='w-48 rounded-lg text-base font-bold h-12'
                      onPress={() => {
                        openModal('modalTransactionItem');
                        setSelectParent(item);
                      }}
                    >
                      予約可能な運行を見る
                    </Button>
                  ) : (
                    <Button color='default' variant='ghost' className='w-60 rounded-lg text-base font-bold h-12'>
                      予約できる運行がありません
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {data && (
        <CompanyInfoModal
          isOpen={modals.modalCompanyInfo}
          data={data}
          onClose={() => {
            closeModal('modalCompanyInfo');
            setData(undefined);
          }}
        />
      )}

      {item.propose_trsp_ability && item.propose_trsp_ability.length > 0 && (
        <TransactionItemPackageModal
          key={`transaction-item-pkg-modal-${item.id}`}
          id={`transaction-item-pkg-modal-${item.id}`}
          isOpen={modals.modalTransactionItem}
          item={item.propose_trsp_ability}
          parent={item}
          onClose={() => closeModal('modalTransactionItem')}
          onOpenCompanyDetail={eventCompanyInfo}
          onOpenSuccessModal={() => openModal('modalResult')}
        />
      )}

      {item.propose_trsp_plan && item.propose_trsp_plan.length > 0 && (
        <TransactionItemVehicleModal
          key={`transaction-item-vehicle-modal-${item.id}`}
          id={`transaction-item-vehicle-modal-${item.id}`}
          isOpen={modals.modalTransactionItem}
          item={item.propose_trsp_plan}
          parent={item}
          onClose={() => closeModal('modalTransactionItem')}
          onOpenCompanyDetail={eventCompanyInfo}
          onOpenSuccessModal={() => openModal('modalResult')}
        />
      )}

      <ConditionProposalSuccessModal
        isOpen={modals.modalResult}
        isCarrierKan={selectParent?.trans_type == TransType.CARRIER}
        parent={item}
        onClose={() => {
          closeModal('modalResult');
          setSelectParent(null);
          onReloadPage();
        }}
      />
    </div>
  );
});

export default ShippingResultItem;
