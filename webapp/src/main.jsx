import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "./index.css";
import Competition, {
  loader as competitionLoader,
  action as competitionAction
} from "./routes/competition";
import CompetitionEdit, {
  loader as editCompetitionLoader,
  action as editCompetitionAction
} from "./routes/edit-competition";
import Root, {
  loader as rootLoader,
  action as rootAction
} from "./routes/root";
import Group, {
  loader as groupLoader,
  action as groupAction
} from "./routes/group";
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

import ErrorPage from "./error-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    action: rootAction,
    loader: rootLoader
  },
  {
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/:groupId",
        element: <Group />,
        loader: groupLoader,
        action: groupAction,
        children: [
          {
            path: "contacts/:contactId",
            element: <Contact />,
            loader: contactLoader,
            action: contactAction
          },
          {
            path: "contacts/:contactId/edit",
            element: <EditContact />,
            loader: contactLoader,
            action: editAction
          },
          {
            path: "competitions/:competitionId/edit",
            element: <CompetitionEdit />,
            loader: editCompetitionLoader,
            action: editCompetitionAction
          }
        ]
      },
      {
        path: "/:groupId/competitions/:competitionId",
        element: <Competition />,
        loader: competitionLoader,
        action: competitionAction,
        children: [
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
          }
        ]
      },
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
