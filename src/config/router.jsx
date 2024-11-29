import { createBrowserRouter, redirect } from 'react-router-dom';
import { getDataset, getDatasetDefinition, getDatasetDefinitions } from 'store/services/loaders';
import { ErrorBoundary, Home, Login, NotFound, DatasetAccessControl, DatasetDefinitions, DatasetImportCsv, DatasetNew } from 'features';
import App from 'App';
import DefaultLayout from 'components/DefaultLayout';
import { Dataset, DatasetImportGeoJson } from 'pages';

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
                        element: <Dataset />,
                        errorElement: <ErrorBoundary />
                    },
                    {
                        path: 'objekt/:objId',
                        element: <Dataset />,
                        errorElement: <ErrorBoundary />
                    },
                    {
                        element: <DatasetImportGeoJson />,
                        path: 'import/geojson',
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
                    pageName: () => 'Logg inn'
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