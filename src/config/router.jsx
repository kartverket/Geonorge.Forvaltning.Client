import { createBrowserRouter, redirect } from 'react-router-dom';
import { ErrorBoundary, Login, NotFound } from 'features';
import { Dataset, DatasetAccessControl, DatasetDefinitions, DatasetImportCsv, DatasetImportGeoJson, DatasetNew, Home } from 'pages';
import { signedIn } from 'store/services/supabase/client';
import App from 'App';

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
                element: <Home />,
                loader: authGuard,
                errorElement: <ErrorBoundary />,
            },
            {
                path: '/datasett/nytt',
                element: <DatasetNew />,
                loader: authGuard,
                handle: {
                    pageName: () => 'Legg til datasett'
                },
                errorElement: <ErrorBoundary />
            },
            {
                path: '/datasett/:id',
                loader: authGuard,
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
                        element: <DatasetImportCsv />,
                        path: 'import/csv',
                        handle: {
                            pageName: () => 'Importer CSV'
                        },
                        errorElement: <ErrorBoundary />
                    },
                    {
                        element: <DatasetDefinitions />,
                        path: 'definisjoner',
                        handle: {
                            pageName: () => 'Definisjoner'
                        },
                        errorElement: <ErrorBoundary />
                    },
                    {
                        element: <DatasetAccessControl />,
                        path: 'tilganger',
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

async function authGuard() {
    if (await signedIn()) {
        return true;
    }

    const error = new URLSearchParams(location.search).get('error_description');
    const url = error !== null ?
        `/logg-inn?error=${error}` :
        '/logg-inn';

    return redirect(url);
}

export default router;