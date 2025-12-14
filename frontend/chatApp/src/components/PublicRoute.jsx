import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

/**
 * PublicRoute
 * - If user is NOT authenticated -> render children (via <Outlet />)
 * - If authenticated -> redirect to fallback (e.g. / or /chats)
 * Useful for login/register screens so logged-in users don't see them.
 */
export default function PublicRoute() {
  const user = useSelector((s) => s.auth.user);

  if (user) {
    return <Navigate to="/chats" replace />;
  }

  return <Outlet />;
}
