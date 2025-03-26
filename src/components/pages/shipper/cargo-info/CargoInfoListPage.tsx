'use client';

import { Button } from '@nextui-org/react';
import { useEffect, useState } from 'react';

import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import { CmnPagination } from '@/components/common/CmnPagination';
import Loading from '@/components/common/Loading';
import {
  DEFAULT_CURRENT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_TOTAL_PAGE,
  INIT_CARGO_INFO_SHIPPER,
  STATUS_CARGO_GROUP,
} from '@/constants/common';
import { ROUTER_ID } from '@/constants/router/router';
import { useAppDispatch } from '@/hook/useRedux';
import { objectToQueryParamsNoEncode } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { cargoService } from '@/services/shipper/cargo';
import { ENotificationType } from '@/types/app';
import { CargoInfo, CargoInfoForm } from '@/types/shipper/cargo';

import CargoInfoItem from './CargoInfoItem';
import { CargoInfoListSkeleton } from './CargoInfoListSkeleton';
import ModalDetailInfo from './ModalDetailInfo';
import PostCSV from './PostCSV';

const CargoInfoListPage = () => {
  const dispatch = useAppDispatch();

  const cargoApi = cargoService();

  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const [searchParams, setSearchParams] = useState<Record<string, any>>({
    page: DEFAULT_CURRENT_PAGE,
    limit: DEFAULT_PAGE_SIZE,
  });
  const [dataList, setDataList] = useState<CargoInfo[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(DEFAULT_CURRENT_PAGE);
  const [totalPage, setTotalPage] = useState<number>(DEFAULT_TOTAL_PAGE);
  const [companyName, setCompanyName] = useState<string>('');
  const [dataDetail, setDataDetail] = useState<CargoInfoForm>({ ...INIT_CARGO_INFO_SHIPPER });
  const [showModalDetailInfo, setShowModalDetailInfo] = useState<boolean>(false);
  const [showModalRegisterPackage, setShowModalRegisterPackage] = useState<boolean>(false);
  const [showModalRegisterBulksPackage, setShowModalRegisterBulksPackage] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  const fetchData = () => {
    setLoadingList(true);
    cargoApi
      .cargoShipper(objectToQueryParamsNoEncode(searchParams))
      .then((response) => {
        setDataList(response?.dataList || []);
        setTotalPage(response?.totalPages || DEFAULT_TOTAL_PAGE);
        setCompanyName(response?.companyName || '');
      })
      .catch((error) => {
        console.error('Error:', error);
        dispatch(
          actions.appAction.showNotification({
            type: ENotificationType.ERROR,
            title: gTxt('MENU.SHIPPER.CARGO_INFO_LIST'),
            content: gTxt('MESSAGES.SERVER_ERROR'),
          }),
        );
      })
      .finally(() => {
        setLoadingList(false);
      });
  };

  const onChangeStatus = (value: string[]) => {
    setSearchParams({ ...searchParams, status: value, page: DEFAULT_CURRENT_PAGE });
  };

  const handleOpenModalDetail = async (cargoId: number) => {
    setLoadingDetail(true);
    cargoApi
      .cargoDetail(cargoId)
      .then((response) => {
        setDataDetail(response);
        setShowModalDetailInfo(true);
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoadingDetail(false);
      });
  };

  const handleCloseModalDetail = () => {
    setDataDetail({ ...INIT_CARGO_INFO_SHIPPER });
    setShowModalDetailInfo(false);
  };

  const handleCloseModalRegisterPackage = () => {
    setDataDetail({ ...INIT_CARGO_INFO_SHIPPER });
    setShowModalRegisterPackage(false);
  };

  const onSubmitForm = (formValue: CargoInfoForm, isRegister: boolean) => {
    // TODO: API request to register cargo information
    if (isRegister) {
      const showErrorCreateCargo = () => {
        dispatch(
          actions.appAction.showModalResult({
            type: ENotificationType.ERROR,
            title: '荷物情報の個別登録',
            content: gTxt('MESSAGES.FAILED'),
          }),
        );
      };
      setLoadingDetail(true);
      cargoApi
        .createCargo(formValue)
        .then((response) => {
          if (response && response?.status && response?.status !== 200) {
            showErrorCreateCargo();
          } else {
            dispatch(
              actions.appAction.showModalResult({
                type: ENotificationType.INFO,
                title: '荷物情報の登録が完了しました',
                onClose: () => {
                  setSearchParams({ ...searchParams, page: DEFAULT_CURRENT_PAGE });
                  handleCloseModalRegisterPackage();
                },
              }),
            );
          }
        })
        .catch(() => showErrorCreateCargo())
        .finally(() => {
          setLoadingDetail(false);
        });
    } else {
      const showErrorUpdateCargo = (error?: any) => {
        if (
          error &&
          error?.payload?.responseData?.parameters?.error?.code == 'cns_line_item_by_date_have_in_trans_order'
        ) {
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
      };
      setLoadingDetail(true);
      cargoApi
        .updateCargo(formValue)
        .then((response) => {
          if (response && response?.status && response?.status !== 200) {
            showErrorUpdateCargo();
          } else {
            dispatch(
              actions.appAction.showModalResult({
                type: ENotificationType.INFO,
                title: '荷物情報の編集が完了しました。',
                onClose: () => {
                  setSearchParams({ ...searchParams, page: DEFAULT_CURRENT_PAGE });
                  handleCloseModalDetail();
                },
              }),
            );
          }
        })
        .catch((error) => showErrorUpdateCargo(error))
        .finally(() => {
          setLoadingDetail(false);
        });
    }
  };

  const handleDelete = (id: number) => {
    const showErrorDelete = () => {
      dispatch(
        actions.appAction.showNotification({
          type: ENotificationType.ERROR,
          title: '荷物情報を削除する',
          content: gTxt('MESSAGES.FAILED'),
        }),
      );
    };

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
          fetchData();
        }
      })
      .catch(() => showErrorDelete())
      .finally(() => {
        setLoadingDetail(false);
      });
    handleCloseModalDetail();
  };

  return (
    <>
      {loadingDetail && <Loading />}
      <section className='bg-white p-4' id={ROUTER_ID.SHIPPER_CARGO_INFO_LIST}>
        <div className='flex gap-3'>
          <h3 className='mr-auto'>{gTxt('MENU.SHIPPER.CARGO_INFO_LIST')}</h3>
          <Button
            size='sm'
            className='h-12 px-8 text-center text-primary text-base leading-normal border-1 font-bold'
            color='primary'
            variant='bordered'
            radius='sm'
            onPress={() => setShowModalRegisterPackage(true)}
          >
            個別登録
          </Button>
          <Button
            size='sm'
            className='h-12 px-8 text-center text-primary text-base leading-normal border-1 font-bold'
            color='primary'
            variant='bordered'
            radius='sm'
            onPress={() => setShowModalRegisterBulksPackage(true)}
          >
            CSV登録
          </Button>
        </div>
        <p className='mt-8 text-xs'>登録した荷物情報の確認、また荷物情報の登録が行えます。</p>
        <CmnCheckboxGroup
          title=''
          classNameWrap='ml-3 mt-8'
          onChange={onChangeStatus}
          value={searchParams?.status}
          option={STATUS_CARGO_GROUP}
        />
        {loadingList ? (
          <CargoInfoListSkeleton />
        ) : (
          <>
            {dataList.length > 0 ? (
              <>
                <div className='mt-4 space-y-2'>
                  {dataList.map((item, index) => (
                    <CargoInfoItem
                      key={`cargo-${index}`}
                      item={item}
                      companyName={companyName}
                      showModalDetailInfo={() => handleOpenModalDetail(item.id)}
                    />
                  ))}
                  {totalPage > 0 && (
                    <div className='mt-4'>
                      <CmnPagination
                        totalPage={totalPage}
                        currentPage={currentPage}
                        onPageChange={(page) => {
                          setCurrentPage(page);
                          setSearchParams({ ...searchParams, page: page });
                        }}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className='mt-8 bg-background px-4 py-40 text-center'>{gTxt('COMMON.NO_RECORD_FOUND')}</div>
            )}
          </>
        )}
      </section>

      {/* modal show detail info */}
      {showModalDetailInfo && (
        <ModalDetailInfo
          dataDetail={dataDetail}
          onDelete={handleDelete}
          isOpen={showModalDetailInfo}
          setLoadingDetail={setLoadingDetail}
          onClose={handleCloseModalDetail}
          onSubmit={(formValue) => onSubmitForm(formValue, false)}
        />
      )}

      {/* modal register package */}
      {showModalRegisterPackage && (
        <ModalDetailInfo
          isRegister
          dataDetail={dataDetail}
          isOpen={showModalRegisterPackage}
          setLoadingDetail={setLoadingDetail}
          onClose={handleCloseModalRegisterPackage}
          onSubmit={(formValue) => onSubmitForm(formValue, true)}
        />
      )}
      <PostCSV isOpen={showModalRegisterBulksPackage} onClose={() => setShowModalRegisterBulksPackage(false)} />
    </>
  );
};

export default CargoInfoListPage;
