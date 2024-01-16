import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from 'store';
import router from 'config/router';
import 'config/map/setup';
import 'config/date';
import '@kartverket/geonorge-web-components';
import 'styles/styles.scss';

const root = document.getElementById('root');

ReactDOM.createRoot(root).render(
   <StrictMode>
      <Provider store={store}>
         <RouterProvider router={router} />
      </Provider>
   </StrictMode>
);
