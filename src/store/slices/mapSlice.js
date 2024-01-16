import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   selectedFeature: null,
   editMode: false
};

export const mapSlice = createSlice({
   name: 'map',
   initialState,
   reducers: {
      selectFeature: (state, action) => {
         return {
            ...state,
            selectedFeature: action.payload
         };
      },
      toggleEditMode: (state, action) => {
         return {
            ...state,
            editMode: action.payload
         };
      }
   }
});

export const { selectFeature, toggleEditMode } = mapSlice.actions;

export default mapSlice.reducer;