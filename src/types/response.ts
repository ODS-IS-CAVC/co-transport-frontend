export interface IResponse<T> {
  status: number;
  payload: T;
}

export interface IListResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
}

export interface IDetailResponse<T> {
  data: T[];
}

export interface IUpdateResponse<T> {
  data: T;
}

export interface IProposeResponse {
  propose_id: string;
}
