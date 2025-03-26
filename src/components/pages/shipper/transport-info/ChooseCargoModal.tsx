import { Button, ModalFooter } from '@nextui-org/react';
import { useEffect, useState } from 'react';

import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import CmnInputSearch from '@/components/common/CmnInputSearch';
import { CmnPagination } from '@/components/common/CmnPagination';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { DEFAULT_CURRENT_PAGE, OUTER_PACKAGE, TEMPERATURE_RANGE, TEMPERATURE_RANGE_LIST } from '@/constants/common';
import { cn } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { cargoService } from '@/services/shipper/cargo';
import { CargoInfo } from '@/types/shipper/cargo';

interface ChooseCargoModalProps {
  isOpen: boolean;
  selectedList: number[];
  onClose: () => void;
  chooseCargo: (cargo: CargoInfo) => void;
  deleteCargo: (cargo: CargoInfo) => void;
  showDetailCargo: (cargoId: number) => void;
}

const ChooseCargoModal = (props: ChooseCargoModalProps) => {
  const { isOpen, selectedList, onClose, chooseCargo, deleteCargo, showDetailCargo } = props;

  const [status, setStatus] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(DEFAULT_CURRENT_PAGE);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [companyName, setCompanyName] = useState<string>('');
  const [cargoList, setCargoList] = useState<CargoInfo[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const searchString = `status=${status.join(',')}&search=${search}&page=${currentPage}&pageSize=10`;
    const cargoApi = cargoService();
    const result = await cargoApi.cargoShipper(searchString);
    setCargoList(result?.dataList || []);
    setTotalPage(result?.totalPages || 0);
    setCompanyName(result?.companyName || '');
  };

  const tempRangeString = (item: CargoInfo) => {
    return item.temp_range.map((range) => TEMPERATURE_RANGE[range as keyof typeof TEMPERATURE_RANGE]).join(', ');
  };

  return (
    <CmnModal size='4xl' isOpen={isOpen} onClose={onClose}>
      <CmnModalHeader
        title='輸送計画に追加する荷物情報の選択'
        description='アカウントに登録済みの荷物を選択するか、荷物を新規に登録してください。'
      />

      <CmnModalBody>
        <div className='bg-white'>
          <div className='flex items-center justify-between'>
            <div className='text-[1.75rem]'>登録されている荷物一覧</div>
            <Button color='primary' radius='sm' className='font-bold' variant='ghost' onPress={() => {}}>
              アカウントに荷物を新規登録する
            </Button>
          </div>
          <CmnInputSearch
            size='md'
            classNameWrap='mt-6 w-80'
            onSearch={(value) => {
              setSearch(value);
              setCurrentPage(DEFAULT_CURRENT_PAGE);
              fetchData();
            }}
          />
          <CmnCheckboxGroup
            classNameWrap='ml-3 mt-6'
            value={status}
            title=''
            option={TEMPERATURE_RANGE_LIST.slice(1)}
            onChange={(value) => {
              setStatus(value);
              setCurrentPage(DEFAULT_CURRENT_PAGE);
              fetchData();
            }}
          />
          <div className='mt-4'>
            <div className='mt-2 min-h-60'>
              {cargoList.length > 0 ? (
                <>
                  {cargoList.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className='flex items-center justify-between space-x-4 mb-2 last:mb-0'
                    >
                      <div
                        className={cn(
                          'flex-1 p-2 border rounded-lg',
                          selectedList.includes(item.id) ? 'border-primary' : 'border-other-gray',
                        )}
                      >
                        <div className='flex flex-col items-center p-2'>
                          <div className='w-full flex items-center justify-end'>
                            <div className='flex items-center space-x-3 text-sm'>
                              <div>
                                <span className='font-bold'>荷物ID: </span>
                                <span>{item.id}</span>
                              </div>
                              <div>
                                <span className='font-bold'>事業者: </span>
                                <span>{companyName || '未定'}</span>
                              </div>
                              <div>
                                <span className='font-bold'>登録日: </span>
                                <span>{item.created_date}</span>
                              </div>
                            </div>
                          </div>
                          <div className='mt-2 flex justify-between items-center w-full gap-2'>
                            <div className='flex items-center gap-4'>
                              <div className='flex items-center gap-2'>
                                <div className='font-bold text-sm leading-[1.225rem]'>品名</div>
                                <div className='text-2xl leading-9 font-medium'>{item.cargo_name}</div>
                              </div>
                              <div className='flex items-center gap-1'>
                                <div className='font-bold text-sm leading-[1.225rem]'>品目</div>
                                <div className='text-2xl leading-9 font-medium'>
                                  {OUTER_PACKAGE.find((outer) => outer.key === `${item.outer_package_code}`)?.label ||
                                    ''}
                                </div>
                              </div>
                              <div className='flex items-center gap-1'>
                                <div className='font-bold text-sm leading-[1.225rem]'>温度帯</div>
                                <div className='text-2xl leading-9 font-medium'>{tempRangeString(item)}</div>
                              </div>
                            </div>
                            <Button
                              radius='sm'
                              color='primary'
                              className='text-base font-bold'
                              onPress={() => showDetailCargo(item.id)}
                            >
                              詳細を見る
                            </Button>
                          </div>
                        </div>
                      </div>
                      {selectedList.includes(item.id) ? (
                        <Button
                          radius='sm'
                          variant='ghost'
                          color='danger'
                          className='text-base font-bold'
                          onPress={() => deleteCargo(item)}
                        >
                          この荷物を輸送計画から削除する
                        </Button>
                      ) : (
                        <Button
                          size='lg'
                          radius='sm'
                          color='primary'
                          className='text-base font-bold'
                          onPress={() => chooseCargo({ ...item, company_name: companyName })}
                        >
                          この荷物を輸送計画に追加する
                        </Button>
                      )}
                    </div>
                  ))}
                  {totalPage > 0 && (
                    <div className='mt-4'>
                      <CmnPagination
                        totalPage={totalPage}
                        currentPage={currentPage}
                        onPageChange={(page) => {
                          setCurrentPage(page);
                          fetchData();
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className='bg-background px-4 py-40 text-center'>{gTxt('COMMON.NO_RECORD_FOUND')}</div>
              )}
            </div>
          </div>
        </div>
      </CmnModalBody>
      <ModalFooter className='flex items-center justify-center'>
        <Button
          className='font-bold text-base text-primary leading-normal bg-background'
          size='lg'
          radius='sm'
          onPress={onClose}
        >
          追加を中止する
        </Button>
      </ModalFooter>
    </CmnModal>
  );
};

export default ChooseCargoModal;
