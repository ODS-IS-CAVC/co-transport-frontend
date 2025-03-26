export interface IMarketPrice {
  month: string;
  day: string;
  total_trans_number: number;
  total_trailer_number: number;
  total_available_trailer_number: number;
  low_price: number;
  high_price: number;
  median_price: number;
  total_proposal_number: number;
  total_trailer_proposal_number: number;
  low_proposal_price: number;
  high_proposal_price: number;
  average_proposal_price: number;
  total_request_number: number;
  total_trailer_request_number: number;
  low_request_price: number;
  high_request_price: number;
  average_request_price: number;
}
