const CARRIER_BASE_URL = '/carrier';
const SHIPPER_BASE_URL = '/shipper';
const LOGIN_BASE_URL = '/login';

export const ROUTER = {
  CARRIER: CARRIER_BASE_URL,
  CARRIER_FLIGHT_LIST: `${CARRIER_BASE_URL}/schedule-list/flights`,
  SHIPPER: SHIPPER_BASE_URL,
  LOGIN: LOGIN_BASE_URL,
  LOGIN_FOR_TEST_URL: `${LOGIN_BASE_URL}/for-testing`,
  HOME_PAGE: '/',
};

export const ROUTER_ID = {
  SHIPPER_DASHBOARD_NEGOTIATION: 'dashboard-negotiation',
  SHIPPER_DASHBOARD_CONFIRMATION: 'dashboard-confirmation',
  SHIPPER_DASHBOARD_TRADING: 'dashboard-trading',
  SHIPPER_CARGO_INFO_LIST: 'cargo-info-list',
  SHIPPER_TRANSPORT_INFO_LIST: 'transport-info-list',
  SHIPPER_CARRIER_TRANSPORT_SEARCH: 'carrier-transport-search',
  CARRIER_DASHBOARD_NEGOTIATION: 'dashboard-negotiation',
  CARRIER_DASHBOARD_CONFIRMATION: 'dashboard-confirmation',
  CARRIER_DASHBOARD_TRADING: 'dashboard-trading',
  CARRIER_VEHICLE_INFO_LIST: 'vehicle-info-list',
  CARRIER_SCHEDULE_LIST: 'schedule-info-list',
  CARRIER_SHIPPING_REQUEST: 'shipping-request',
};
