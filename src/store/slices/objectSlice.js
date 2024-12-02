import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    initializedDataObject: null,
    createdDataObject: null,
    updatedDataObject: null,
    deletedDataObjects: [],
    editedDataObjects: [],
    showObjectsInExtent: false
};

export const objectSlice = createSlice({
    name: 'object',
    initialState,
    reducers: {
        initializeDataObject: (state, action) => {
            return {
                ...state,
                initializedDataObject: action.payload
            };
        },
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
        setEditedDataObjects: (state, action) => {
            return {
                ...state,
                editedDataObjects: action.payload
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

export const {
    initializeDataObject,
    createDataObject,
    updateDataObject,
    deleteDataObjects,
    setEditedDataObjects,
    setShowObjectsInExtent
} = objectSlice.actions;

export default objectSlice.reducer;