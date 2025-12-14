import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

/**
 * PrivateRoute
 * - If user is authenticated -> render children (via <Outlet />)
 * - If not -> redirect to /login and preserve `state.from` so login can redirect back
 * - If your auth has a "loading" state, you can show a spinner while checking.
 */
export default function PrivateRoute({ redirectTo = "/login" }) {
  const user = useSelector((s) => s.auth.user);
  const authStatus = useSelector((s) => s.auth.status); // optional

  if (authStatus === "loading") {
    return <div className="p-4 text-center">Checking authentication…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
