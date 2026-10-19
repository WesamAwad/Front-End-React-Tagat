import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { logout } from "../../auth/authSlice";
import { useLogoutClientMutation } from "../../auth/authApi";
import { hasPermission } from "../../auth/permissions";

export function useWorkshopOwnerSession() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [logoutClient] = useLogoutClientMutation();

  const displayName = user ? `${user.first_name} ${user.last_name}`.trim() : "صاحب الورشة";
  const initials = user?.first_name?.[0] ?? "و";
  // Users without access to the workshop profile get their account profile instead.
  const profilePath = hasPermission(user?.permissions, "عرض ملف الورشة") ? "/workshop-owner/profile" : "/profile";

  const handleLogout = async () => {
    let logoutMessage = "";

    try {
      const result = await logoutClient().unwrap();
      logoutMessage = result.message;
    } catch {
      // نكمّل الخروج المحلي حتى لو فشل الطلب
    } finally {
      dispatch(logout());
      navigate("/login", {
        state: logoutMessage ? { successMessage: logoutMessage } : undefined,
      });
    }
  };

  return { displayName, initials, profilePath, handleLogout };
}
