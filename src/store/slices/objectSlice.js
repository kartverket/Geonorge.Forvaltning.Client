import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   createdDataObject: null,
   updatedDataObject: null,
   deletedDataObjects: []
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
      }
   }
});

export const { createDataObject, updateDataObject, deleteDataObjects } = objectSlice.actions;

export default objectSlice.reducer;