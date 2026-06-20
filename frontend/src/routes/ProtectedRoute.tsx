import { Navigate, Outlet } from "react-router-dom";

/**
 * Renders child routes only when the user is authenticated.
 * Redirects to /login otherwise, preserving the originally
 * requested path so we can restore it after login later.
 *
 * Auth state is read from localStorage for now; will be replaced
 * by a proper AuthContext in a later step.
 */
const ProtectedRoute = () => {
  // Temporary auth check — will be replaced with AuthContext
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
