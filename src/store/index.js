import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import geomEditorReducer from './slices/geomEditorSlice';
import mapReducer from './slices/mapSlice';
import objectReducer from './slices/objectSlice';
import { api } from './services/api'

export default configureStore({
   reducer: {
      app: appReducer,
      geomEditor: geomEditorReducer,
      map: mapReducer,
      object: objectReducer,
      [api.reducerPath]: api.reducer
   },
   middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware)
});
