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
import Login, {
  action as loginAction
} from "./routes/login";
import Group, {
  loader as groupLoader,
  action as groupAction
} from "./routes/group";
import GroupStatistics, {
  loader as groupStatisticsLoader
} from "./routes/group-statistics";
import CompetitionStatistics, {
  loader as competitionStatisticsLoader
} from "./routes/competition-statistics";
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
import Activity, {
  loader as activityLoader,
  action as activityAction
} from "./routes/activity";
import EditActivity, {
  action as editActivityAction
} from "./routes/edit-activity";
import {
  action as deleteAction
} from "./routes/destroy-contact"
import {
  action as deleteActivityAction
} from "./routes/destroy-activity"

import ErrorPage from "./error-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <ErrorPage />,
    action: loginAction
  },
  {
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/group/:groupSlug",
        element: <Group />,
        loader: groupLoader,
        action: groupAction,
        children: [
          {
            path: "statistics",
            element: <GroupStatistics />,
            loader: groupStatisticsLoader
          },
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
            path: "contacts/:contactId/destroy",
            action: deleteAction
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
        path: "/group/:groupSlug/competitions/:competitionId",
        element: <Competition />,
        loader: competitionLoader,
        action: competitionAction,
        children: [
          {
            path: "statistics",
            element: <CompetitionStatistics />,
            loader: competitionStatisticsLoader
          },
          {
            path: "activities/:activityId",
            element: <Activity />,
            action: activityAction,
            loader: activityLoader
          },
          {
            path: "activities/:activityId/edit",
            element: <EditActivity />,
            action: editActivityAction,
            loader: activityLoader
          },
          {
            path: "activities/:activityId/destroy",
            action: deleteActivityAction
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
