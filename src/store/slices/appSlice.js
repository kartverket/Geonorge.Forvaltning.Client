import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    connectionId: null,
    fullscreen: false,
    breadcrumbs: [],
    connectedUsers: {}
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
        setConnectedUsers: (state, action) => {
            return {
                ...state,
                connectedUsers: {
                    ...state.connectedUsers,
                    [action.payload.connectionId]: action.payload
                }
            };
        },
        setConnectionId: (state, action) => {
            return {
                ...state,
                connectionId: action.payload
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

export const { setUser, setConnectedUsers, setConnectionId, toggleFullscreen, setBreadcrumbs } = appSlice.actions;

export default appSlice.reducer;