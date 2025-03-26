import { createSlice } from '@reduxjs/toolkit';

interface HomeState {
  counter: number;
}

const initialState: HomeState = {
  counter: 0,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    increment(state) {
      state.counter += 1;
    },
    decrement(state) {
      state.counter -= 1;
    },
  },
});

export const homeAction = homeSlice.actions;

export const homeReducer = homeSlice.reducer;
