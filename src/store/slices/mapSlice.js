import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   selectedFeature: null,
   editMode: false,
   zoomTo: null
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
      },
      zoomTo: (state, action) => {
         return {
            ...state,
            zoomTo: action.payload
         };
      }
   }
});

export const { selectFeature, toggleEditMode, zoomTo } = mapSlice.actions;

export default mapSlice.reducer;