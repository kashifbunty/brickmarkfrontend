import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentLocation: null, // Initially no location selected
  isLocationSet: false, // Flag to track if user has selected a location
};

export const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action) => {
      state.currentLocation = action.payload;
      state.isLocationSet = true;
    },
    clearLocation: (state) => {
      state.currentLocation = null;
      state.isLocationSet = false;
    },
  },
});

export const { setLocation, clearLocation } = locationSlice.actions;

// Selectors
export const selectCurrentLocation = (state) => state.location.currentLocation;
export const selectIsLocationSet = (state) => state.location.isLocationSet;

export default locationSlice.reducer; 