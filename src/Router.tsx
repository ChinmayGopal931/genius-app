import { createHashRouter } from "react-router-dom";

import { AppLayout } from "./components/layouts/AppLayout";

import Dashboard from "./pages/Dashboard";

export const router = createHashRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
    ],
  },
]);
