import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   user: null,
   fullscreen: false,
   breadcrumbs: []
};

export const appSlice = createSlice({
   name: 'app',
   initialState,
   reducers: {
      setUser: (state, action) => {
         return {
            ...state,
            user: action.payload
         };
      },
      toggleFullscreen: (state, action) => {
         return {
            ...state,
            fullscreen: action.payload
         };
      },
      setBreadcrumbs: (state, action) => {
         return {
            ...state,
            breadcrumbs: action.payload
         };
      }
   }
});

export const { setUser, toggleFullscreen, setBreadcrumbs } = appSlice.actions;

export default appSlice.reducer;