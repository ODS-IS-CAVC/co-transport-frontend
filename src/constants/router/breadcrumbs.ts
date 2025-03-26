import { gTxt } from '@/messages/gTxt';
import { IBreadcrumb } from '@/types/app';

import { ROUTER, ROUTER_ID } from './router';

const SHIPPER_MENU: Record<string, IBreadcrumb> = {
  shipperDashboard: {
    router: ROUTER.SHIPPER,
    name: gTxt('MENU.SHIPPER.DASHBOARD'),
    subRoutes: {
      negotiationBoard: {
        router: ROUTER.SHIPPER,
        name: gTxt('MENU.SHIPPER.NEGOTIATION'),
        id: ROUTER_ID.SHIPPER_DASHBOARD_NEGOTIATION,
      },
      confirmationBoard: {
        router: ROUTER.SHIPPER,
        name: gTxt('MENU.SHIPPER.CONFIRMATION'),
        id: ROUTER_ID.SHIPPER_DASHBOARD_CONFIRMATION,
      },
      tradingDashboard: {
        router: ROUTER.SHIPPER,
        name: gTxt('MENU.SHIPPER.TRADING'),
        id: ROUTER_ID.SHIPPER_DASHBOARD_TRADING,
      },
    },
  },
  cargoInfo: {
    name: gTxt('MENU.SHIPPER.CARGO_INFO'),
    router: ROUTER.SHIPPER,
    subRoutes: {
      cargoInfoList: {
        router: ROUTER.SHIPPER,
        name: gTxt('MENU.SHIPPER.CARGO_INFO_LIST'),
        id: ROUTER_ID.SHIPPER_CARGO_INFO_LIST,
      },
    },
  },
  transportInfo: {
    name: gTxt('MENU.SHIPPER.TRANSPORT_INFO'),
    router: ROUTER.SHIPPER,
    subRoutes: {
      transportList: {
        router: ROUTER.SHIPPER,
        name: gTxt('MENU.SHIPPER.TRANSPORT_INFO_LIST'),
        id: ROUTER_ID.SHIPPER_TRANSPORT_INFO_LIST,
      },
    },
  },
};

const CARRIER_MENU: Record<string, IBreadcrumb> = {
  carrierDashboard: {
    name: gTxt('MENU.CARRIER.DASHBOARD'),
    router: ROUTER.CARRIER,
    subRoutes: {
      tradingDashboard: {
        router: ROUTER.CARRIER,
        name: gTxt('MENU.CARRIER.TRADING'),
        id: ROUTER_ID.CARRIER_DASHBOARD_TRADING,
      },
      negotiationBoard: {
        router: ROUTER.CARRIER,
        name: gTxt('MENU.CARRIER.NEGOTIATION'),
        id: ROUTER_ID.CARRIER_DASHBOARD_NEGOTIATION,
      },
      confirmationBoard: {
        router: ROUTER.CARRIER,
        name: gTxt('MENU.CARRIER.CONFIRMATION'),
        id: ROUTER_ID.CARRIER_DASHBOARD_CONFIRMATION,
      },
    },
  },
  vehicleInfo: {
    name: gTxt('MENU.CARRIER.VEHICLE_INFO'),
    router: ROUTER.CARRIER,
    subRoutes: {
      vehicleInfoList: {
        router: ROUTER.CARRIER,
        name: gTxt('MENU.CARRIER.VEHICLE_INFO_LIST'),
        id: ROUTER_ID.CARRIER_VEHICLE_INFO_LIST,
      },
    },
  },
  scheduleInfo: {
    name: gTxt('MENU.CARRIER.SCHEDULE'),
    router: ROUTER.CARRIER,
    subRoutes: {
      scheduleInfoList: {
        router: ROUTER.CARRIER,
        name: gTxt('MENU.CARRIER.SCHEDULE_LIST_BREADCRUMBS'),
        id: ROUTER_ID.CARRIER_SCHEDULE_LIST,
        subRoutes: {
          flightSchedule: {
            router: ROUTER.CARRIER_FLIGHT_LIST,
            name: gTxt('MENU.CARRIER.SCHEDULE_LIST_FLIGHT_SCHEDULE'),
          },
        },
      },
    },
  },
  shippingRequest: {
    router: ROUTER.CARRIER,
    name: gTxt('MENU.CARRIER.SHIPPING_REQUEST_PAGE'),
    id: ROUTER_ID.CARRIER_SHIPPING_REQUEST,
  },
};

export const BREADCRUMBS: Record<string, IBreadcrumb> = {
  homePage: {
    router: '/',
    name: gTxt('MENU.HOME'),
  },
  login: {
    router: ROUTER.LOGIN,
    name: '',
    subRoutes: {
      loginForTesting: {
        router: ROUTER.LOGIN_FOR_TEST_URL,
        name: '',
      },
    },
  },
  ...SHIPPER_MENU,
  ...CARRIER_MENU,
};
