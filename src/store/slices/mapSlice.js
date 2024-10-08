import { createSlice } from '@reduxjs/toolkit';
import { isNil } from 'lodash';

const initialState = {
   selectedFeature: null,
   featureContextMenuData: null,
   mapContextMenuData: null,
   styling: null,
   featuresInExtent: [],
   editMode: false,
   editor: {
      show: false,
      featuresSelected: false
   }
};

export const mapSlice = createSlice({
   name: 'map',
   initialState,
   reducers: {
      selectFeature: (state, action) => {
         if (action.payload === null) {
            return {
               ...state,
               selectedFeature: null
            };
         }

         return {
            ...state,
            selectedFeature: {
               ...action.payload,
               updateUrl: !isNil(action.payload.updateUrl) ? 
                  action.payload.updateUrl : 
                  true,
               featureType: !isNil(action.payload.featureType) ?
                  action.payload.featureType :
                  'default'
            }
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
      setStyling: (state, action) => {
         return {
            ...state,
            styling: action.payload
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
      },
      toggleEditor: (state, action) => {
         return {
            ...state,
            editor: {
               ...state.editor,
               show: action.payload
            }         
         };
      },
      setFeaturesSelected: (state, action) => {
         return {
            ...state,
            editor: {
               ...state.editor,
               featuresSelected: action.payload
            }         
         };
      }
   }
});

export const { 
   selectFeature, 
   setFeatureContextMenuData, 
   setMapContextMenuData,
   setStyling,
   setFeaturesInExtent, 
   toggleEditMode,
   toggleEditor,
   setFeaturesSelected
} = mapSlice.actions;

export default mapSlice.reducer;