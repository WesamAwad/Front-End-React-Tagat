import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { baseApi, useUpdateUserProfileMutation } from "../../auth/authApi";
import { logout, updateUser } from "../../auth/authSlice";
import { useAppDispatch } from "../../../store/hooks";
import type { AuthValidationErrorResponse, UserProfile } from "../../../types/authTypes";
import userIcon from "../../../assets/profile/input-user.svg";
import smsIcon from "../../../assets/profile/input-sms.svg";
import { ProfileField } from "./ProfileField";
import { ProfileSaveButton } from "./ProfileSection";

const emptyFieldErrors = { full_name: "", email: "" };

type PersonalInfoFormProps = {
  profile: UserProfile;
  onSaved: (message: string) => void;
};

export function PersonalInfoForm({ profile, onSaved }: PersonalInfoFormProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [updateUserProfile, { isLoading }] = useUpdateUserProfileMutation();
  const savedFullName = `${profile.first_name} ${profile.last_name}`.trim();
  const [fullName, setFullName] = useState(savedFullName);
  const [email, setEmail] = useState(profile.email);
  const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors);
  const [submitError, setSubmitError] = useState("");
  const hasChanges = fullName.trim() !== savedFullName || email.trim() !== profile.email;

  const clearFieldError = (field: keyof typeof emptyFieldErrors) => {
    setFieldErrors((current) => (current[field] ? { ...current, [field]: "" } : current));
    setSubmitError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    // The API stores first and last name separately while the design has a single full-name field.
    const [firstName = "", ...lastNameParts] = fullName.trim().split(/\s+/);
    const lastName = lastNameParts.join(" ");

    if (!firstName || !lastName) {
      setFieldErrors({ ...emptyFieldErrors, full_name: "أدخل الاسم الأول واسم العائلة" });
      return;
    }

    setFieldErrors(emptyFieldErrors);

    const nextEmail = email.trim();

    try {
      const result = await updateUserProfile({ first_name: firstName, last_name: lastName, email: nextEmail }).unwrap();

      if (result.requiresEmailVerification) {
        // Logging out right before a flushSync navigation commits both in a single render, so the
        // guest-only verify page renders instead of RoleRoute redirecting the logged-out user to /login.
        dispatch(logout());
        navigate("/verify-email", {
          replace: true,
          flushSync: true,
          state: { email: nextEmail, message: "تم تغيير بريدك الإلكتروني. فعّل البريد الجديد لتتمكن من تسجيل الدخول مجدداً." },
        });
        dispatch(baseApi.util.resetApiState());
        return;
      }

      dispatch(updateUser({ first_name: firstName, last_name: lastName }));
      onSaved(result.message || "تم تحديث معلوماتك الشخصية.");
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      const errors = errorData?.errors;
      const nextErrors = {
        full_name: errors?.first_name?.[0] ?? errors?.last_name?.[0] ?? "",
        email: errors?.email?.[0] ?? "",
      };

      setFieldErrors(nextErrors);
      if (!nextErrors.full_name && !nextErrors.email) {
        setSubmitError(errorData?.message || "تعذر حفظ التغييرات، حاول مرة أخرى.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="space-y-6">
        <ProfileField
          label="الاسم الكامل"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          value={fullName}
          onChange={(event) => {
            setFullName(event.target.value);
            clearFieldError("full_name");
          }}
          placeholder="أدخل اسمك الكامل"
          error={fieldErrors.full_name}
          adornment={<img src={userIcon} alt="" width={24} height={24} className="pointer-events-none" />}
        />

        <ProfileField
          label="البريد الإلكتروني"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            clearFieldError("email");
          }}
          placeholder="example@email.com"
          error={fieldErrors.email}
          adornment={<img src={smsIcon} alt="" width={24} height={24} className="pointer-events-none" />}
        />
      </div>

      {submitError ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {submitError}
        </p>
      ) : null}

      <ProfileSaveButton disabled={!hasChanges} isLoading={isLoading} />
    </form>
  );
}
