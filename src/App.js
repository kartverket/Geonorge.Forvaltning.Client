import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import NotFound from "./components/routes/notFound";

import Home from "./components/routes/home";
import Objekt from "./components/routes/objekt";
import ObjektAdd from "./components/routes/objektAdd";
import ObjektEdit from "./components/routes/objektEdit";
import ObjektDataAdd from "./components/routes/objektDataAdd";
import Layout from "./components/layout"

import style from "./App.module.scss";

// eslint-disable-next-line no-unused-vars
import { ContentContainer } from "@kartverket/geonorge-web-components";


function App() {


  const router = createBrowserRouter([
    {
      element: <Layout />,
      id: "root",
      children: [
        {
          element: <Home />,
          index: true
        },
        {
          element: <ObjektAdd />,
          path: "objekt/add"
        },
        {
          element: <ObjektEdit />,
          path: "objekt/:id/edit"
        },
        {
          element: <Objekt />,
          path: "objekt/:id"
        },
        {
          element: <ObjektDataAdd />,
          path: "objekt/:id/adddata"
        },
        {
          element: <NotFound />,
          path: "*"
        }
      ]
    }

  ]);

  return (
    <div className={style.app}>
      <content-container>
        <RouterProvider router={router} />
      </content-container>
    </div>
  );
}

export default App;
