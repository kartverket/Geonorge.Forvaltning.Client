import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import mapReducer from './slices/mapSlice';
import objectReducer from './slices/objectSlice';
import { api } from './services/api'

export default configureStore({
   reducer: {
      app: appReducer,
      map: mapReducer,
      object: objectReducer,
      [api.reducerPath]: api.reducer
   },
   middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware)
});
