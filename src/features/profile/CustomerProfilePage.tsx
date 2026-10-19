import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SuccessToast from "../../components/SuccessToast";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { baseApi, useDeleteUserAccountMutation, useGetUserProfileQuery } from "../auth/authApi";
import { logout } from "../auth/authSlice";
import type { AuthValidationErrorResponse, DeleteUserAccountRequest } from "../../types/authTypes";
import { AccountDeletedDialog } from "./components/AccountDeletedDialog";
import { AccountInfoSection } from "./components/AccountInfoSection";
import { ChangePasswordForm } from "./components/ChangePasswordForm";
import { DeleteAccountDialog } from "./components/DeleteAccountDialog";
import { PersonalInfoForm } from "./components/PersonalInfoForm";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileSection } from "./components/ProfileSection";

type ToastState = { title: string; message: string } | null;

function getErrorMessage(error: unknown) {
  return ((error as { data?: AuthValidationErrorResponse } | undefined)?.data?.message ?? "").trim();
}

function getDeleteAccountErrorMessage(error: unknown) {
  const errors = (error as { data?: AuthValidationErrorResponse } | undefined)?.data?.errors ?? {};
  // Laravel keys errors for array items as "reason_id.0", "reason_id.1", ...
  const reasonError = Object.entries(errors).find(([key]) => key === "reason_id" || key.startsWith("reason_id."))?.[1]?.[0];
  return reasonError || getErrorMessage(error) || "تعذر حذف الحساب، حاول مرة أخرى.";
}

function CustomerProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const { data: profileData, isLoading: isProfileLoading, isFetching: isProfileFetching, error: profileError, refetch: refetchProfile } = useGetUserProfileQuery();
  const [deleteUserAccount, { isLoading: isDeletingAccount }] = useDeleteUserAccountMutation();
  const [toast, setToast] = useState<ToastState>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isAccountDeleted, setIsAccountDeleted] = useState(false);

  const profile = profileData?.data ?? null;
  const isProfilePending = isProfileLoading || (isProfileFetching && !profile);
  const fullName = `${profile?.first_name ?? user?.first_name ?? ""} ${profile?.last_name ?? user?.last_name ?? ""}`.trim();
  const canDeleteAccount = user?.role !== "admin";

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeleteError("");
  };

  const handleDeleteAccount = async (request: DeleteUserAccountRequest) => {
    setDeleteError("");

    try {
      await deleteUserAccount(request).unwrap();
      setIsDeleteDialogOpen(false);
      setIsAccountDeleted(true);
    } catch (error) {
      setDeleteError(getDeleteAccountErrorMessage(error));
    }
  };

  const leaveDeletedAccount = async () => {
    // Leave this protected route before clearing the session, otherwise ProtectedRoute redirects to /login.
    await navigate("/", { replace: true, flushSync: true });
    dispatch(logout());
    dispatch(baseApi.util.resetApiState());
  };

  return (
    <div className="px-4 pt-10 pb-16 sm:pt-19 sm:pb-32.5">
      <div className="mx-auto max-w-280">
        <h1 className="sr-only">الملف الشخصي</h1>
        <ProfileHeader fullName={fullName} />

        <div className="mx-auto mt-8.5 flex max-w-257.75 flex-col gap-8">
          <ProfileSection title="المعلومات الشخصية" className="pb-6">
            {isProfilePending ? (
              <p className="mt-6 text-sm text-label" role="status">
                جاري تحميل البيانات...
              </p>
            ) : profile ? (
              <PersonalInfoForm
                // Remount with fresh values whenever the saved profile changes.
                key={`${profile.first_name}|${profile.last_name}|${profile.email}`}
                profile={profile}
                onSaved={(message) => setToast({ title: "تم الحفظ بنجاح", message })}
              />
            ) : (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                <p>{getErrorMessage(profileError) || "تعذر تحميل بيانات الملف الشخصي."}</p>
                <button type="button" onClick={() => refetchProfile()} className="font-semibold underline-offset-4 hover:underline">
                  إعادة المحاولة
                </button>
              </div>
            )}
          </ProfileSection>

          <ProfileSection title="تغيير كلمة المرور" className="pb-6">
            <ChangePasswordForm onSaved={(message) => setToast({ title: "تم تغيير كلمة المرور", message })} />
          </ProfileSection>

          {canDeleteAccount ? <AccountInfoSection onDeleteClick={() => setIsDeleteDialogOpen(true)} /> : null}
        </div>
      </div>

      {canDeleteAccount && isDeleteDialogOpen ? (
        <DeleteAccountDialog isLoading={isDeletingAccount} error={deleteError} onConfirm={handleDeleteAccount} onClose={closeDeleteDialog} />
      ) : null}
      {canDeleteAccount && isAccountDeleted ? <AccountDeletedDialog onLeave={leaveDeletedAccount} /> : null}

      <SuccessToast open={toast !== null} title={toast?.title} message={toast?.message ?? ""} onClose={() => setToast(null)} />
    </div>
  );
}

export default CustomerProfilePage;
