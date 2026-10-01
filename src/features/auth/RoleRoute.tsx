import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import type { AppUserRole } from "./authRoles";
import { getPostLoginPath } from "./authRoles";

type RoleRouteProps = {
  allow: AppUserRole | AppUserRole[];
};

export function RoleRoute({ allow }: RoleRouteProps) {
  const location = useLocation();
  const token = useAppSelector((state) => state.auth.token);
  const role = useAppSelector((state) => state.auth.user?.role);
  const allowed = Array.isArray(allow) ? allow : [allow];

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!role || !allowed.includes(role)) {
    return <Navigate to={getPostLoginPath(role)} replace />;
  }

  return <Outlet />;
}
