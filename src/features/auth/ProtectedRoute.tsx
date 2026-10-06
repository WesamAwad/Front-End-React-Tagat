import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";

/** Requires a logged-in user only; what each user may access is enforced by the backend permissions. */
export function ProtectedRoute() {
  const location = useLocation();
  const token = useAppSelector((state) => state.auth.token);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
