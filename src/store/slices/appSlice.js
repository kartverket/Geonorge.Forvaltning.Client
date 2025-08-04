import { createSlice } from "@reduxjs/toolkit";

const initialState = {
   user: null,
   fullscreen: false,
};

export const appSlice = createSlice({
   name: "app",
   initialState,
   reducers: {
      setUser: (state, action) => {
         return {
            ...state,
            user: action.payload,
         };
      },
      toggleFullscreen: (state, action) => {
         return {
            ...state,
            fullscreen: action.payload,
         };
      },
   },
});

export const { setUser, toggleFullscreen } = appSlice.actions;

export default appSlice.reducer;
