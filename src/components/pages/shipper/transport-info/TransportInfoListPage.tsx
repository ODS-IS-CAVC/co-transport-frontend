'use client';

import { Button } from '@nextui-org/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { CmnPagination } from '@/components/common/CmnPagination';
import Loading from '@/components/common/Loading';
import { DEFAULT_CURRENT_PAGE, DEFAULT_PAGE_SIZE, DEFAULT_TOTAL_PAGE } from '@/constants/common';
import { ROUTER_ID } from '@/constants/router/router';
import { useAppDispatch } from '@/hook/useRedux';
import { objectToQueryParamsNoEncodeArray } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { transportService } from '@/services/shipper/transportPlan';
import { ENotificationType } from '@/types/app';
import { TransportInfo, TransportPlanInfoRequest } from '@/types/shipper/transportList';

import DownloadCsvTemplateModal from './DownloadCsvTemplateModal';
import PostCSV from './PostCSV';
import { SearchSection } from './SearchSection';
import TransportFormModal from './TransportFormModal';
import { TransportItem } from './TransportItem';
import { TransportPlanInfoListSkeleton } from './TransportPlanInfoListSkeleton';

const TransportInfoListPage = () => {
  const dispatch = useAppDispatch();
  const transportPlanApi = transportService();

  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const [searchParams, setSearchParams] = useState<Record<string, any>>({
    page: DEFAULT_CURRENT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [dataList, setDataList] = useState<TransportInfo[]>([]);
  const [totalPage, setTotalPage] = useState<number>(DEFAULT_TOTAL_PAGE);
  const [companyName, setCompanyName] = useState<string>('');
  const [modeEdit, setModeEdit] = useState<boolean>(false);
  const [isOpenModalDetail, setIsOpenModalDetail] = useState<boolean>(false);
  const [isOpenModalCSV, setIsOpenModalCSV] = useState<boolean>(false);
  const [isOpenModalTemplateCSV, setIsOpenModalTemplateCSV] = useState<boolean>(false);
  const [formValue, setFormValue] = useState<TransportInfo>();

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  const fetchData = () => {
    setLoadingList(true);
    const searchString = objectToQueryParamsNoEncodeArray(searchParams);
    transportPlanApi
      .getLstTransport(searchString)
      .then((response) => {
        setDataList(response.dataList || []);
        setTotalPage(response.totalPage || DEFAULT_TOTAL_PAGE);
        setCompanyName(response.companyName || '');
      })
      .catch((error) => {
        console.error('Error:', error);
        dispatch(
          actions.appAction.showNotification({
            type: ENotificationType.ERROR,
            title: gTxt('MENU.SHIPPER.TRANSPORT_INFO_LIST'),
            content: gTxt('MESSAGES.SERVER_ERROR'),
          }),
        );
      })
      .finally(() => {
        setLoadingList(false);
      });
  };

  const getDetailTransportPlan = async (id: number) => {
    return await transportPlanApi.transportPlanDetails(id);
  };

  const handleCloseModalDetail = () => {
    setIsOpenModalDetail(false);
    setModeEdit(false);
    setFormValue(undefined);
  };

  const handleSearchOuterPackageCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const outerPackageCode = e.target.value;
    setSearchParams({ ...searchParams, outerPackageCode: outerPackageCode, page: DEFAULT_CURRENT_PAGE });
  };

  const handleSearchStatusesChange = (value: string[]) => {
    setSearchParams({ ...searchParams, statuses: value, page: DEFAULT_CURRENT_PAGE });
  };

  const onSearch = (searchName?: string) => {
    if (searchName) {
      setSearchParams({ ...searchParams, transportName: searchName, page: DEFAULT_CURRENT_PAGE });
    } else {
      const { transportName, ...restParams } = searchParams;
      setSearchParams({ ...restParams, page: DEFAULT_CURRENT_PAGE });
    }
  };

  const handleViewDetail = useCallback(async (id: number) => {
    try {
      setLoadingDetail(true);
      const response = await getDetailTransportPlan(id);
      setFormValue({ ...response });
      setIsOpenModalDetail(true);
      setModeEdit(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleSubmit = (value: TransportPlanInfoRequest) => {
    setLoadingDetail(true);
    if (modeEdit && value.transport_plan.id) {
      transportPlanApi
        .updateTransportPlan(value.transport_plan.id, value)
        .then(() => {
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.INFO,
              title: '配送計画が修正されました',
              onClose: () => {
                setSearchParams({ ...searchParams, page: DEFAULT_CURRENT_PAGE });
                handleCloseModalDetail();
              },
            }),
          );
        })
        .catch((errors) => {
          if (errors?.payload?.responseData?.parameters?.error?.code == 'cns_line_item_by_date_have_in_trans_order') {
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
                title: '輸送計画の編集',
                content: Object.values(errors)
                  .map((error: any) => error?.message || '')
                  .join('\n'),
              }),
            );
          }
        })
        .finally(() => {
          setLoadingDetail(false);
        });
    } else {
      transportPlanApi
        .createTransportPlan(value)
        .then(() => {
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.INFO,
              title: '輸送計画を登録しました',
              onClose: () => {
                setSearchParams({ ...searchParams, page: DEFAULT_CURRENT_PAGE });
                handleCloseModalDetail();
              },
            }),
          );
        })
        .catch((errors) => {
          dispatch(
            actions.appAction.showNotification({
              type: ENotificationType.ERROR,
              title: '輸送計画の新規登録',
              content: Object.values(errors)
                .map((error: any) => error?.message || '')
                .join('\n'),
            }),
          );
        })
        .finally(() => {
          setLoadingDetail(false);
        });
    }
  };

  const openCreateModal = () => {
    setIsOpenModalDetail(true);
    setModeEdit(false);
  };

  const handleCloseModalCSV = () => {
    setIsOpenModalCSV(false);
  };

  const handleCloseModalTemplateCSV = () => {
    setIsOpenModalTemplateCSV(false);
  };

  const transportList = useMemo(() => {
    return dataList.map((item, index) => <TransportItem key={index} item={item} onViewDetail={handleViewDetail} />);
  }, [dataList, handleViewDetail]);

  return (
    <>
      {loadingDetail && <Loading />}
      <section className='bg-white p-4' id={ROUTER_ID.SHIPPER_TRANSPORT_INFO_LIST}>
        <div className='flex items-center justify-between flex-wrap'>
          <h3>{gTxt('MENU.SHIPPER.TRANSPORT_INFO_LIST')}</h3>
          <div className='flex space-x-2'>
            <Button
              size='lg'
              radius='sm'
              color='primary'
              variant='bordered'
              className='text-base font-bold'
              onPress={openCreateModal}
            >
              個別登録
            </Button>
            <Button
              size='lg'
              radius='sm'
              color='primary'
              variant='bordered'
              className='text-base font-bold'
              onPress={() => setIsOpenModalCSV(true)}
            >
              CSV登録
            </Button>
          </div>
        </div>

        <p className='mt-4 text-xs'>登録した輸送計画はこのボード内で確認可能</p>
        <SearchSection
          searchName={searchParams.transportName}
          searchStatuses={searchParams.statuses}
          searchOuterPackageCode={searchParams.outerPackageCode}
          onSearchOuterPackageCodeChange={handleSearchOuterPackageCodeChange}
          onSearchStatusesChange={handleSearchStatusesChange}
          onSearch={onSearch}
        />
        {loadingList ? (
          <TransportPlanInfoListSkeleton />
        ) : (
          <>
            {dataList.length > 0 ? (
              <div className='mt-4 bg-background p-4'>
                <div className='space-y-3'>{transportList}</div>
                <CmnPagination
                  className='pt-4'
                  totalPage={totalPage}
                  currentPage={searchParams.page}
                  onPageChange={(pageNumber) => {
                    setSearchParams({ ...searchParams, page: pageNumber });
                    fetchData();
                  }}
                />
              </div>
            ) : (
              <div className='mt-8 bg-background px-4 py-40 text-center'>{gTxt('COMMON.NO_RECORD_FOUND')}</div>
            )}
          </>
        )}
        {isOpenModalDetail && (
          <TransportFormModal
            isOpen={isOpenModalDetail}
            modeEdit={modeEdit}
            detailData={formValue}
            companyName={companyName}
            setLoadingDetail={setLoadingDetail}
            onClose={handleCloseModalDetail}
            onSubmit={handleSubmit}
          />
        )}
        {isOpenModalCSV && <PostCSV isOpen={isOpenModalCSV} onClose={handleCloseModalCSV} />}
        {isOpenModalTemplateCSV && (
          <DownloadCsvTemplateModal isOpen={isOpenModalTemplateCSV} onClose={handleCloseModalTemplateCSV} />
        )}
      </section>
    </>
  );
};

export default TransportInfoListPage;
