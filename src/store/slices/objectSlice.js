import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   createdDataObject: null,
   updatedDataObject: null,
   deletedDataObjects: [],
   showObjectsInExtent: false
};

export const objectSlice = createSlice({
   name: 'object',
   initialState,
   reducers: {
      createDataObject: (state, action) => {
         return {
            ...state,
            createdDataObject: action.payload
         };
      },
      updateDataObject: (state, action) => {
         return {
            ...state,
            updatedDataObject: action.payload
         };
      },
      deleteDataObjects: (state, action) => {
         return {
            ...state,
            deletedDataObjects: action.payload
         };
      },
      setShowObjectsInExtent: (state, action) => {
         return {
            ...state,
            showObjectsInExtent: action.payload
         };
      },
   }
});

export const { createDataObject, updateDataObject, deleteDataObjects, setShowObjectsInExtent } = objectSlice.actions;

export default objectSlice.reducer;