import { IPrefecture, IRegion } from '@/types/prefecture';

export const getRegionByPrefectureId = (regions: IRegion[], id: number) => {
  const region = regions.find((region) => region.prefectures.some((prefecture) => prefecture.id === id));
  return region;
};

export const getPrefecture = (regions: IRegion[], id: number): IPrefecture | undefined => {
  let _prefecture: IPrefecture | undefined = undefined;
  regions.forEach((region) => {
    if (region.prefectures.some((item) => item.id === id)) {
      const prefecture = region.prefectures.find((item) => item.id === id);
      if (prefecture) _prefecture = prefecture;
    }
  });
  return _prefecture;
};

export const getPrefectureName = (regions: IRegion[], id: number) => {
  const prefecture = getPrefecture(regions, id);
  return prefecture?.name || '';
};

// export const getPrefectureName = (id: number) => {
//   const regions = useAppSelector((state: RootState) => state.app.locations);
//   const prefecture = getPrefecture(regions, id);
//   return prefecture?.name || '';
// };
