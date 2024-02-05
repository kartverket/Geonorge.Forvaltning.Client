import { createBrowserRouter, redirect } from 'react-router-dom';
import { getDataset, getDatasetDefinition, getDatasetDefinitions } from 'store/services/loaders';
import { ErrorBoundary, Home, Login, NotFound, Dataset, DatasetAccessControl, DatasetDefinitions, DatasetImportCsv, DatasetImportGeoJson, DatasetNew } from 'features';
import App from 'App';
import DefaultLayout from 'components/DefaultLayout';

const router = createBrowserRouter([
   {
      id: 'root',
      element: <App />,
      handle: {
         pageName: () => 'Mine datasett'
      },
      children: [
         {
            index: true,
            path: '/',
            element: (
               <DefaultLayout>
                  <Home />
               </DefaultLayout>
            ),
            loader: () => {
               const error = catchLoginError();

               return error === null ?
                  getDatasetDefinitions() :
                  redirect(`/logg-inn?error=${error}`);
            },
            errorElement: <ErrorBoundary />,
         },
         {
            path: '/datasett/nytt',
            element: (
               <DefaultLayout>
                  <DatasetNew />
               </DefaultLayout>
            ),
            handle: {
               pageName: () => 'Legg til datasett'
            },
            errorElement: <ErrorBoundary />
         },
         {
            path: '/datasett/:id',
            handle: {
               pageName: data => data.Name
            },
            children: [
               {
                  index: true,
                  element: (
                     <DefaultLayout>
                        <Dataset />
                     </DefaultLayout>
                  ),
                  loader: getDataset,
                  errorElement: <ErrorBoundary />
               },          
               {
                  path: 'objekt/:objId',
                  element: (
                     <DefaultLayout>
                        <Dataset />
                     </DefaultLayout>
                  ),
                  loader: getDataset,
                  errorElement: <ErrorBoundary />
               },                       
               {
                  element: (
                     <DefaultLayout>
                        <DatasetImportGeoJson />
                     </DefaultLayout>
                  ),
                  path: 'import/geojson',
                  loader: getDatasetDefinition,
                  handle: {
                     pageName: () => 'Importer GeoJSON'
                  },
                  errorElement: <ErrorBoundary />
               },
               {
                  element: (
                     <DefaultLayout>
                        <DatasetImportCsv />
                     </DefaultLayout>
                  ),
                  path: 'import/csv',
                  loader: getDatasetDefinition,
                  handle: {
                     pageName: () => 'Importer CSV'
                  },
                  errorElement: <ErrorBoundary />
               },
               {
                  element: (
                     <DefaultLayout>
                        <DatasetDefinitions />
                     </DefaultLayout>
                  ),
                  path: 'definisjoner',
                  loader: getDatasetDefinition,
                  handle: {
                     pageName: () => 'Definisjoner'
                  },
                  errorElement: <ErrorBoundary />
               },
               {
                  element: (
                     <DefaultLayout>
                        <DatasetAccessControl />
                     </DefaultLayout>
                  ),
                  path: 'tilganger',
                  loader: getDatasetDefinition,
                  handle: {
                     pageName: () => 'Tilganger'
                  },
                  errorElement: <ErrorBoundary />
               },               
            ]
         },
         {
            element: <Login />,
            path: '/logg-inn',
            handle: {
               pageName: () => {
                  return 'Logg inn'
               }
            },
            errorElement: <ErrorBoundary />
         },
         {
            element: <NotFound />,
            path: '*'
         }
      ]
   }
]);

function catchLoginError() {
   return new URLSearchParams(location.search).get('error_description');
}

export default router;