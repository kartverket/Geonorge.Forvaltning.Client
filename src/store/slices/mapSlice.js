import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   selectedFeature: null,
   featureContextMenuData: null,
   mapContextMenuData: null,
   featuresInExtent: [],
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
      setFeatureContextMenuData: (state, action) => {
         return {
            ...state,
            featureContextMenuData: action.payload
         };
      },
      setMapContextMenuData: (state, action) => {
         return {
            ...state,
            mapContextMenuData: action.payload
         };
      },
      setFeaturesInExtent: (state, action) => {
         return {
            ...state,
            featuresInExtent: action.payload
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

export const { 
   selectFeature, 
   setFeatureContextMenuData, 
   setMapContextMenuData, 
   setFeaturesInExtent, 
   toggleEditMode 
} = mapSlice.actions;

export default mapSlice.reducer;