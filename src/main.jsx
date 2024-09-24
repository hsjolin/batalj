import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Root, {
  loader as rootLoader,
  action as rootAction
} from "./routes/root";
import Contact, {
  loader as contactLoader,
  action as contactAction
} from "./routes/contact";
import EditContact, {
  action as editAction
} from "./routes/edit";
import {
  action as deleteAction
} from "./routes/destroy"
import Index from "./routes/index";
import ErrorPage from "./error-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    loader: rootLoader,
    action: rootAction,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            element: <Index />
          },
          {
            path: "/contacts/:contactId",
            element: <Contact />,
            action: contactAction,
            loader: contactLoader
          },
          {
            path: "/contacts/:contactId/edit",
            element: <EditContact />,
            loader: contactLoader,
            action: editAction
          },
          {
            path: "/contacts/:contactId/destroy",
            action: deleteAction
          }
        ]
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
