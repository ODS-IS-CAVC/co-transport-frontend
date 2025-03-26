export interface IPrefecture {
  id: number;
  name: string;
  code: string;
}

export interface IRegion {
  id: number;
  name: string;
  prefectures: IPrefecture[];
}
