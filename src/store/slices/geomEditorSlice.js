import { createSlice } from "@reduxjs/toolkit";

const initialState = {
   geomType: null,
   featuresSelected: false,
};

export const geomEditorSlice = createSlice({
   name: "geomEditor",
   initialState,
   reducers: {
      toggleEditor: (state, action) => {
         return {
            ...state,
            geomType: action.payload,
         };
      },
      setFeaturesSelected: (state, action) => {
         return {
            ...state,
            featuresSelected: action.payload,
         };
      },
   },
});

export const { toggleEditor, setFeaturesSelected } = geomEditorSlice.actions;

export default geomEditorSlice.reducer;
