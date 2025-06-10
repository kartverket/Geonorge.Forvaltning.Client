import { createBrowserRouter, redirect } from "react-router-dom";
import { ErrorBoundary, Home, Login, NotFound } from "features";
import { signedIn } from "store/services/supabase/client";
import { getDatasetDefinitions } from "store/services/loaders";
import App from "App";

const router = createBrowserRouter([
   {
      id: "root",
      element: <App />,
      children: [
         {
            index: true,
            path: "/",
            element: <Home />,
            loader: authGuard,
            errorElement: <ErrorBoundary />,
         },
         {
            element: <Login />,
            path: "/logg-inn",
            handle: {
               pageName: () => "Logg inn",
            },
            errorElement: <ErrorBoundary />,
         },
         {
            element: <NotFound />,
            path: "*",
         },
      ],
   },
]);

async function authGuard() {
   if (await signedIn()) {
      const datasetDefinitions = await getDatasetDefinitions();
      return datasetDefinitions;
   }

   const error = new URLSearchParams(location.search).get("error_description");
   const url = error !== null ? `/logg-inn?error=${error}` : "/logg-inn";

   return redirect(url);
}

export default router;
