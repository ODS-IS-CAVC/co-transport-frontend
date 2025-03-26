import { gTxt } from '@/messages/gTxt';
import { Route } from '@/types/app';

import { ROUTER, ROUTER_ID } from './router';

export const SHIPPER_MENU: Record<string, Route> = {
  shipperDashboard: {
    name: gTxt('MENU.SHIPPER.DASHBOARD'),
    router: ROUTER.SHIPPER,
    subRoutes: {
      negotiationBoard: {
        id: ROUTER_ID.SHIPPER_DASHBOARD_NEGOTIATION,
        name: gTxt('MENU.SHIPPER.NEGOTIATION'),
        router: ROUTER.SHIPPER,
      },
      confirmationBoard: {
        id: ROUTER_ID.SHIPPER_DASHBOARD_CONFIRMATION,
        name: gTxt('MENU.SHIPPER.CONFIRMATION'),
        router: ROUTER.SHIPPER,
      },
      tradingDashboard: {
        id: ROUTER_ID.SHIPPER_DASHBOARD_TRADING,
        name: gTxt('MENU.SHIPPER.TRADING'),
        router: ROUTER.SHIPPER,
      },
    },
  },
  cargoInfo: {
    name: gTxt('MENU.SHIPPER.CARGO_INFO'),
    router: ROUTER.SHIPPER,
    subRoutes: {
      cargoInfoList: {
        id: ROUTER_ID.SHIPPER_CARGO_INFO_LIST,
        name: gTxt('MENU.SHIPPER.CARGO_INFO_LIST'),
        router: ROUTER.SHIPPER,
      },
    },
  },
  transportInfo: {
    name: gTxt('MENU.SHIPPER.TRANSPORT_INFO'),
    router: ROUTER.SHIPPER,
    subRoutes: {
      transportList: {
        id: ROUTER_ID.SHIPPER_TRANSPORT_INFO_LIST,
        name: gTxt('MENU.SHIPPER.TRANSPORT_INFO_LIST'),
        router: ROUTER.SHIPPER,
      },
    },
  },
};

export const CARRIER_MENU: Record<string, Route> = {
  carrierDashboard: {
    name: gTxt('MENU.CARRIER.DASHBOARD'),
    router: ROUTER.CARRIER,
    subRoutes: {
      tradingDashboard: {
        id: ROUTER_ID.CARRIER_DASHBOARD_TRADING,
        name: gTxt('MENU.CARRIER.TRADING'),
        router: ROUTER.CARRIER,
      },
      negotiationBoard: {
        id: ROUTER_ID.CARRIER_DASHBOARD_NEGOTIATION,
        name: gTxt('MENU.CARRIER.NEGOTIATION'),
        router: ROUTER.CARRIER,
      },
      confirmationBoard: {
        id: ROUTER_ID.CARRIER_DASHBOARD_CONFIRMATION,
        name: gTxt('MENU.CARRIER.CONFIRMATION'),
        router: ROUTER.CARRIER,
      },
    },
  },
  vehicleInfo: {
    name: gTxt('MENU.CARRIER.VEHICLE_INFO'),
    router: ROUTER.CARRIER,
    subRoutes: {
      vehicleInfoList: {
        id: ROUTER_ID.CARRIER_VEHICLE_INFO_LIST,
        name: gTxt('MENU.CARRIER.VEHICLE_INFO_LIST'),
        router: ROUTER.CARRIER,
      },
    },
  },
  scheduleInfo: {
    name: gTxt('MENU.CARRIER.SCHEDULE'),
    router: ROUTER.CARRIER,
    subRoutes: {
      scheduleInfoList: {
        id: ROUTER_ID.CARRIER_SCHEDULE_LIST,
        name: gTxt('MENU.CARRIER.SCHEDULE_LIST'),
        router: ROUTER.CARRIER,
      },
    },
  },
  shippingRequest: {
    id: ROUTER_ID.CARRIER_SHIPPING_REQUEST,
    name: gTxt('MENU.CARRIER.SHIPPING_REQUEST'),
    router: ROUTER.CARRIER,
  },
};

export const MENU: Record<string, Route> = {
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
  homeShipper: {
    router: ROUTER.SHIPPER,
    name: gTxt('MENU.SHIPPER.HOME'),
    subRoutes: { ...SHIPPER_MENU },
  },
  homeCarrier: {
    router: ROUTER.CARRIER,
    name: gTxt('MENU.CARRIER.HOME'),
    subRoutes: { ...CARRIER_MENU },
  },
};
