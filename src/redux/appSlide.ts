import { createSlice } from '@reduxjs/toolkit';

import { ENotificationType, NotificationType } from '@/types/app';
import { IPrefecture, IRegion } from '@/types/prefecture';

const DEFAULT_NOTIFICATION: NotificationType = {
  isShow: false,
  type: ENotificationType.INFO,
  title: '',
  content: '',
  duration: 3000,
};
const DEFAULT_MODAL_RESULT: NotificationType = {
  isShow: false,
  type: ENotificationType.ERROR,
  title: '',
  content: '',
  duration: 3000,
  size: 'xl',
  onClose: () => {},
};

interface AppState {
  openDrawer: boolean;
  notification: NotificationType;
  modalResult: NotificationType;
  locations: IRegion[];
  reloadMenu: string;
  reloadPage: Record<string, any>;
}

const initialState: AppState = {
  openDrawer: false,
  notification: { ...DEFAULT_NOTIFICATION },
  modalResult: { ...DEFAULT_MODAL_RESULT },
  locations: [],
  reloadMenu: '',
  reloadPage: {},
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleDrawer(state, action) {
      state.openDrawer = action.payload;
    },
    showNotification(state, action) {
      state.notification = {
        ...state.notification,
        ...action.payload,
        isShow: true,
        onClick: action.payload.onClick,
      };
    },
    hideNotification(state) {
      state.notification = { ...DEFAULT_NOTIFICATION };
    },
    showModalResult(state, action) {
      state.modalResult = {
        ...state.modalResult,
        ...action.payload,
        isShow: true,
        onClick: action.payload.onClick,
      };
    },
    hideModalResult(state) {
      state.modalResult = { ...DEFAULT_MODAL_RESULT };
    },
    setLocations(state, action) {
      const _regions = action.payload.map((item: IRegion) => {
        return {
          ...item,
          id: Number(item.id),
          prefectures: item.prefectures.map((prefecture: IPrefecture) => ({
            ...prefecture,
            id: Number(prefecture.id),
          })),
        };
      });
      state.locations = _regions;
    },
    setReloadMenu(state, action) {
      state.reloadMenu = action.payload;
    },
    setReloadPage(state, action) {
      const { key, value } = action.payload;
      state.reloadPage[key] = value;
    },

    resetReloadPage(state) {
      Object.keys(state.reloadPage).forEach((key) => {
        state.reloadPage[key] = false;
      });
    },
  },
});

export const appAction = appSlice.actions;

export const appReducer = appSlice.reducer;
