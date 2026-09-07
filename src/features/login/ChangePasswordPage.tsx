import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useChangePasswordMutation } from "../auth/authApi";
import type { AuthValidationErrorResponse } from "../../types/authTypes";
import logo from "../../assets/SwiftFix-Logo.svg";

type ChangePasswordLocationState = {
  from?: string;
};

function resolveReturnPath(from: string | undefined) {
  if (!from || from === "/change-password") return "/";
  return from;
}

function resolveReturnLabel(path: string) {
  if (path.startsWith("/workshop-owner")) return "العودة للوحة التحكم";
  if (path === "/") return "العودة للرئيسية";
  return "العودة للصفحة السابقة";
}

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
  error?: string;
  onChange?: () => void;
};

function PasswordField({ id, name, label, placeholder, show, onToggle, error, onChange }: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-label">
        {label}
      </label>
      <div className="relative">
        <Lock className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-primary/40" />
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={name === "current_password" ? "current-password" : "new-password"}
          placeholder={placeholder}
          onChange={onChange}
          className={`w-full rounded-lg border py-3 pr-12 pl-12 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary ${error ? "border-red-500" : "border-primary/15"}`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer text-primary/40 transition hover:text-primary"
          aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        >
          {show ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
        </button>
      </div>
      {error ? <p className="mt-1.5 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function ChangePasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as ChangePasswordLocationState | null) ?? null;
  const returnPath = resolveReturnPath(locationState?.from);
  const returnLabel = resolveReturnLabel(returnPath);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [fieldErrors, setFieldErrors] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const clearFieldError = (field: keyof typeof fieldErrors) => {
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setSubmitError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({ current_password: "", password: "", password_confirmation: "" });
    setSubmitError("");

    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("current_password") ?? "");
    const password = String(form.get("password") ?? "");
    const passwordConfirmation = String(form.get("password_confirmation") ?? "");

    try {
      const result = await changePassword({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      }).unwrap();

      setSuccessMessage(result.message || "تم تغيير كلمة المرور بنجاح.");
      setShowSuccess(true);
      event.currentTarget.reset();
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      const errors = errorData?.errors;
      const message = errorData?.message ?? "";

      setFieldErrors({
        current_password: errors?.current_password?.[0] ?? "",
        password: errors?.password?.[0] ?? "",
        password_confirmation: errors?.password_confirmation?.[0] ?? "",
      });

      const hasFieldErrors = Boolean(errors?.current_password?.[0] || errors?.password?.[0] || errors?.password_confirmation?.[0]);
      if (message && !hasFieldErrors) {
        setSubmitError(message);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-xl rounded-xl border border-primary/10 px-10 py-12 text-center shadow-sm">
        <img src={logo} alt="SwiftFix" className="mx-auto mb-8 h-16 object-contain" />

        <h1 className="text-3xl font-bold text-primary">تغيير كلمة المرور</h1>
        <p className="mt-3 text-sm leading-relaxed text-primary/50">أدخل كلمة المرور الحالية ثم اختر كلمة مرور جديدة.</p>

        <form className="mt-8 space-y-5 text-start" onSubmit={handleSubmit}>
          <PasswordField
            id="current-password"
            name="current_password"
            label="كلمة المرور الحالية"
            placeholder="أدخل كلمة المرور الحالية"
            show={showCurrentPassword}
            onToggle={() => setShowCurrentPassword((open) => !open)}
            error={fieldErrors.current_password}
            onChange={() => clearFieldError("current_password")}
          />

          <PasswordField
            id="new-password"
            name="password"
            label="كلمة المرور الجديدة"
            placeholder="أدخل كلمة المرور الجديدة"
            show={showNewPassword}
            onToggle={() => setShowNewPassword((open) => !open)}
            error={fieldErrors.password}
            onChange={() => clearFieldError("password")}
          />

          <PasswordField
            id="confirm-password"
            name="password_confirmation"
            label="تأكيد كلمة المرور الجديدة"
            placeholder="أعد إدخال كلمة المرور الجديدة"
            show={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((open) => !open)}
            error={fieldErrors.password_confirmation}
            onChange={() => clearFieldError("password_confirmation")}
          />

          {submitError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {submitError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "جاري الحفظ..." : "حفظ كلمة المرور"}
          </button>

          <p className="text-center text-sm text-primary/50">
            <Link to={returnPath} className="font-medium text-secondary transition hover:text-secondary-hover">
              {returnLabel}
            </Link>
          </p>
        </form>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 px-6">
          <div role="dialog" aria-modal="true" aria-labelledby="change-password-success-title" className="w-full max-w-md rounded-xl bg-white px-8 py-10 text-center shadow-lg">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="size-10 text-green-600" aria-hidden="true" />
            </div>

            <h2 id="change-password-success-title" className="text-2xl font-bold text-primary">
              تم تغيير كلمة المرور بنجاح
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-label">{successMessage || "يمكنك الآن استخدام كلمة المرور الجديدة في تسجيل الدخول القادم."}</p>

            <button
              type="button"
              onClick={() => navigate(returnPath)}
              className="mt-8 w-full cursor-pointer rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover"
            >
              {returnLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChangePasswordPage;
