import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { getPostLoginPath } from "./authRoles";

export function GuestRoute() {
  const token = useAppSelector((state) => state.auth.token);
  const role = useAppSelector((state) => state.auth.user?.role);

  if (token) {
    return <Navigate to={getPostLoginPath(role)} replace />;
  }

  return <Outlet />;
}
