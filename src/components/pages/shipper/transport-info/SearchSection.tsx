import React, { memo, useState } from 'react';

import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import CmnDropdown from '@/components/common/CmnDropdown';
import CmnInputSearch from '@/components/common/CmnInputSearch';
import { OUTER_PACKAGE, STATUS_CARGO_GROUP } from '@/constants/common';

interface SearchSectionProps {
  searchName?: string;
  searchOuterPackageCode?: string;
  searchStatuses: string[];
  onSearchOuterPackageCodeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSearchStatusesChange: (value: string[]) => void;
  onSearch: (searchName?: string) => void;
}

export const SearchSection = memo(
  ({
    searchName,
    searchOuterPackageCode,
    searchStatuses,
    onSearchOuterPackageCodeChange,
    onSearchStatusesChange,
    onSearch,
  }: SearchSectionProps) => {
    const [_searchName, _setSearchName] = useState(searchName);

    return (
      <>
        <CmnInputSearch
          classNameWrap='mt-6 w-[24.813rem]'
          value={_searchName}
          onChange={(e) => _setSearchName(e.target.value)}
          onSearch={() => onSearch(_searchName)}
        />
        <div className='mt-4 flex flex-wrap items-end space-x-4'>
          <CmnDropdown
            size='md'
            classNameWrap='min-w-20 w-20'
            title='品目'
            items={OUTER_PACKAGE}
            selectedKeys={searchOuterPackageCode ? [searchOuterPackageCode] : []}
            onChange={onSearchOuterPackageCodeChange}
          />
          <CmnCheckboxGroup
            size='md'
            option={STATUS_CARGO_GROUP}
            value={searchStatuses}
            onChange={onSearchStatusesChange}
          />
        </div>
      </>
    );
  },
);
