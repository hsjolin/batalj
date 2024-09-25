import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "./index.css";
import Competition, {
  loader as competitionLoader,
  action as competitionAction
} from "./routes/competition";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Contact, {
  loader as contactLoader,
  action as contactAction
} from "./routes/contact";
import EditContact, {
  action as editAction
} from "./routes/edit-contact";
import Event, {
  loader as eventLoader,
  action as eventAction
} from "./routes/event";
import EditEvent, {
  action as editEventAction
} from "./routes/edit-event";
import {
  action as deleteAction
} from "./routes/destroy-contact"
import {
  action as deleteEventAction
} from "./routes/destroy-event"

import Index from "./routes/index";
import ErrorPage from "./error-page";

const router = createBrowserRouter([
  {
    path: "/:competitionId",
    element: <Competition />,
    errorElement: <ErrorPage />,
    loader: competitionLoader,
    action: competitionAction,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            element: <Index />
          },
          {
            path: "events/:eventId",
            element: <Event />,
            action: eventAction,
            loader: eventLoader
          },
          {
            path: "events/:eventId/edit",
            element: <EditEvent />,
            action: editEventAction,
            loader: eventLoader
          },
          {
            path: "events/:eventId/destroy",
            action: deleteEventAction
          },
          {
            path: "contacts/:contactId",
            element: <Contact />,
            action: contactAction,
            loader: contactLoader
          },
          {
            path: "contacts/:contactId/edit",
            element: <EditContact />,
            loader: contactLoader,
            action: editAction
          },
          {
            path: "contacts/:contactId/destroy",
            action: deleteAction
          }
        ]
      }
    ]
  }
]);

window.documentTitle = "BK";
document.title = window.documentTitle;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
