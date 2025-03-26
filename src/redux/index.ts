import { appAction, appReducer } from './appSlide';
import { authAction, authReducer } from './authSlide';
import { homeAction, homeReducer } from './homeSlice';

const actions = {
  authAction,
  appAction,
  homeAction,
};

const reducers = {
  authReducer,
  appReducer,
  homeReducer,
};

export { actions, reducers };
