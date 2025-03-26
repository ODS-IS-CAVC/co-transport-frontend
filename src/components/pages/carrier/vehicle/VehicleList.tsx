'use client';

import { Button } from '@nextui-org/react';
import { useCallback, useEffect, useState } from 'react';

import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import CmnDropdown from '@/components/common/CmnDropdown';
import { CmnPagination } from '@/components/common/CmnPagination';
import {
  COST_CALCULATION_VEHICLE_INFO,
  DEFAULT_CURRENT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_TOTAL_PAGE,
  PAGE_LIST_SIZE,
  TEMPERATURE_RANGE_LIST,
  VEHICLE,
  VEHICLE_UNAVAILABLE_PERIOD,
} from '@/constants/common';
import { ROUTER_ID } from '@/constants/router/router';
import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import { objectToQueryParamsNoEncode } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { RootState } from '@/redux/store';
import { vehicleCarrierService } from '@/services/carrier/vehicle';
import { VehicleData } from '@/types/carrier/vehicle';

import RegisterDetail from './edit';
import PostCSV from './PostCSV';
import Register from './register';
import VehicleItem from './VehicleItem';
import { VehicleListSkeleton } from './VehicleListSkeleton';

function VehicleList() {
  const vehicleCarrierApi = vehicleCarrierService();
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<Record<string, any>>({
    page: DEFAULT_CURRENT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [isOpenCSV, setIsOpenCSV] = useState(false);
  const [data, setData] = useState<VehicleData[]>([]);
  const [totalPage, setTotalPage] = useState(DEFAULT_TOTAL_PAGE);
  const [openDetail, setOpenDetail] = useState<{ open: boolean; id: number }>({ open: false, id: -1 });
  const reloadMenu = useAppSelector((state: RootState) => state.app.reloadMenu);
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  useEffect(() => {
    reloadMenu && reloadMenu == ROUTER_ID.CARRIER_VEHICLE_INFO_LIST && fetchData();
    dispatch(actions.appAction.setReloadMenu(''));
  }, [reloadMenu]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    vehicleCarrierApi
      .vehicle(objectToQueryParamsNoEncode(searchParams))
      .then((result) => {
        setData(result.dataList);
        setTotalPage(result.totalPage);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);

  const handleChangeCheckboxGroupVehicle = (name: string, value: string[]) => {
    if (value?.length > 0) {
      setSearchParams({
        ...searchParams,
        page: DEFAULT_CURRENT_PAGE,
        [name]: [value[value.length - 1]],
      });
    } else {
      setSearchParams({
        ...searchParams,
        [name]: [],
        page: DEFAULT_CURRENT_PAGE,
      });
    }
  };

  return (
    <>
      <section className='bg-white p-2' id={ROUTER_ID.CARRIER_VEHICLE_INFO_LIST}>
        <div className='flex items-center justify-between'>
          <h2>運送能力・車両情報</h2>
          <div className='flex items-center'>
            <Button
              radius='sm'
              color='primary'
              variant='bordered'
              onPress={() => setIsOpenAdd(true)}
              className='h-12 px-8 text-center text-primary text-base leading-normal border-1 font-bold mr-4'
            >
              個別登録
            </Button>
            <Button
              radius='sm'
              color='primary'
              variant='bordered'
              onPress={() => setIsOpenCSV(true)}
              className='h-12 px-8 text-center text-primary text-base leading-normal border-1 font-bold'
            >
              CSV登録
            </Button>
          </div>
        </div>
        <p className='text-xs'>登録されている運送能力・車両情報の一覧です。</p>

        <CmnCheckboxGroup
          title='車両'
          classNameWrap='mt-6'
          classNames={{
            wrapper: 'px-4 py-2',
          }}
          value={searchParams?.vehicle_type || []}
          onChange={(value) => handleChangeCheckboxGroupVehicle('vehicle_type', value)}
          option={VEHICLE.map((item) => (item.label === 'すべて' ? { ...item, value: 'null' } : item))}
        />

        <CmnCheckboxGroup
          title='温度帯'
          classNameWrap='mr-4'
          classNames={{
            wrapper: 'px-4 py-2',
          }}
          value={searchParams?.temperature_range || []}
          onChange={(value) => handleChangeCheckboxGroupVehicle('temperature_range', value)}
          option={TEMPERATURE_RANGE_LIST.map((item) => (item.label === 'すべて' ? { ...item, value: 'null' } : item))}
        />

        <CmnDropdown
          size='md'
          title='原価計算用車両情報'
          classNameWrap='min-w-[8rem] w-[8rem] mt-2'
          items={COST_CALCULATION_VEHICLE_INFO}
          defaultSelectedKeys={[searchParams.cost_calculation_vehicle_info]}
          onChange={(e) => {
            const value = e.target.value;
            setSearchParams({
              ...searchParams,
              cost_calculation_vehicle_info: value,
              page: DEFAULT_CURRENT_PAGE,
            });
          }}
        />

        <CmnDropdown
          size='md'
          title='車両使用不可期間'
          items={VEHICLE_UNAVAILABLE_PERIOD}
          classNameWrap='min-w-[8rem] w-[8rem] mt-4'
          defaultSelectedKeys={[searchParams?.vehicle_unavailable_period]}
          onChange={(e) => {
            const value = e.target.value;
            setSearchParams({ ...searchParams, vehicle_unavailable_period: value, page: DEFAULT_CURRENT_PAGE });
          }}
        />

        <div className='mt-6 flex justify-end'>
          <CmnDropdown
            size='sm'
            title='表示件数'
            items={PAGE_LIST_SIZE}
            disallowEmptySelection
            selectedKeys={[searchParams?.pageSize?.toString()]}
            onChange={(e) => {
              setSearchParams({
                ...searchParams,
                pageSize: parseInt(e.target.value),
                page: DEFAULT_CURRENT_PAGE,
              });
            }}
            classNameWrap='min-w-[5rem] w-[5rem]'
          />
        </div>

        {loading ? (
          <VehicleListSkeleton />
        ) : (
          <>
            <div className='mt-2'>
              {data?.length > 0 ? (
                <>
                  {data.map((item, index) => (
                    <VehicleItem
                      item={item}
                      index={index}
                      key={item.vehicle_info.id}
                      onUpdateOpenDetail={(status, id) => setOpenDetail({ open: status, id })}
                    />
                  ))}
                  {totalPage > 0 && (
                    <div className='mt-4'>
                      <CmnPagination
                        totalPage={totalPage}
                        currentPage={searchParams?.page}
                        onPageChange={(page) => {
                          setSearchParams({ ...searchParams, page });
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className='bg-background px-4 py-40 text-center'>{gTxt('COMMON.NO_RECORD_FOUND')}</div>
              )}
            </div>
          </>
        )}
      </section>

      {isOpenAdd && <Register isOpen={isOpenAdd} fetchData={fetchData} onClose={() => setIsOpenAdd(false)} />}
      <PostCSV isOpen={isOpenCSV} onClose={() => setIsOpenCSV(false)} />
      {openDetail.open && openDetail.id !== -1 && (
        <RegisterDetail
          id={openDetail.id}
          fetchData={fetchData}
          isOpen={openDetail.open}
          onClose={() => setOpenDetail({ open: false, id: -1 })}
        />
      )}
    </>
  );
}

export default VehicleList;
