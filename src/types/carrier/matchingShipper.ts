export interface SearchParamAbilityPublic {
  depId: string;
  arrId: string;
  depDate?: string;
  arrDate?: string;
  depTime?: string;
  arrTime?: string;
  collectTimeFrom?: string;
  collectTimeTo?: string;
  dayWeek?: string;
  freightRateMax?: number;
  freightRateMin?: number;
  temperatureRange?: string;
  keyword?: string;
  page: number;
  limit: number;
}

export type CutoffFareKeys = `cutoffFare${1 | 2 | 3 | 4 | 5}.type`;
export type CutoffFarePriceKeys = `cutoffFare${1 | 2 | 3 | 4 | 5}.price`;
