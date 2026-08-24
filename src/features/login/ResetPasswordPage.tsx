import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { usePasswordResetMutation } from "../auth/authApi";
import type { AuthValidationErrorResponse } from "../../types/authTypes";
import logo from "../../assets/SwiftFix-Logo.svg";

const OTP_LENGTH = 6;

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? "";
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [passwordReset, { isLoading }] = usePasswordResetMutation();
  const [errorMessage, setErrorMessage] = useState("");
  const [otpShakeKey, setOtpShakeKey] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({
    code: "",
    password: "",
    password_confirmation: "",
  });

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (fieldErrors.code) {
      setFieldErrors((prev) => ({ ...prev, code: "" }));
    }

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, index) => {
      next[index] = char;
    });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setFieldErrors({ code: "", password: "", password_confirmation: "" });

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const passwordConfirmation = String(form.get("password_confirmation") ?? "");
    const code = otp.join("");

    try {
      await passwordReset({
        email,
        code,
        password,
        password_confirmation: passwordConfirmation,
      }).unwrap();
      setShowSuccess(true);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      const errors = errorData?.errors;
      const message = errorData?.message ?? "";

      const codeFromErrors = errors?.code?.[0] ?? errors?.otp?.[0] ?? "";
      const isInvalidCodeMessage = /كود|رمز|code|otp|غير صالح|invalid/i.test(message);

      const nextCodeError = codeFromErrors || (isInvalidCodeMessage ? message : "");

      setFieldErrors({
        code: nextCodeError,
        password: errors?.password?.[0] ?? "",
        password_confirmation: errors?.password_confirmation?.[0] ?? "",
      });

      if (nextCodeError) {
        setOtpShakeKey((key) => key + 1);
      }

      if (message && !codeFromErrors && !isInvalidCodeMessage && !errors?.password?.[0] && !errors?.password_confirmation?.[0]) {
        setErrorMessage(message);
      }
    }
  };

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-xl rounded-xl border border-primary/10 px-10 py-12 text-center shadow-sm">
        <img src={logo} alt="SwiftFix" className="mx-auto mb-8 h-16 object-contain" />

        <h1 className="text-3xl font-bold text-primary">تحديث كلمة المرور</h1>

        <form className="mt-8 space-y-5 text-start" onSubmit={handleSubmit}>
          {errorMessage ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <input type="hidden" name="email" value={email} />

          <div>
            <label htmlFor="otp-0" className="mb-2 block text-sm font-medium text-label">
              رمز التحقق
            </label>
            <div key={otpShakeKey} className={`flex justify-center gap-2 sm:gap-3 ${fieldErrors.code ? "otp-shake" : ""}`} dir="ltr">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  required
                  aria-label={`رقم رمز التحقق ${index + 1}`}
                  onChange={(event) => handleOtpChange(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  onPaste={handleOtpPaste}
                  className={`size-10 rounded-lg border text-center text-base font-semibold text-primary outline-none transition focus:border-primary sm:size-12 sm:text-lg ${fieldErrors.code ? "border-red-500" : "border-primary/15"}`}
                />
              ))}
            </div>
            {fieldErrors.code ? <p className="mt-1.5 text-center text-sm text-red-600">{fieldErrors.code}</p> : null}
          </div>

          <div>
            <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-label">
              كلمة المرور الجديدة
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-primary/40" />
              <input
                id="new-password"
                name="password"
                type={showNewPassword ? "text" : "password"}
                required
                placeholder="أدخل كلمة المرور الجديدة"
                className={`w-full rounded-lg border py-3 pr-12 pl-12 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary ${fieldErrors.password ? "border-red-500" : "border-primary/15"}`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((open) => !open)}
                className="absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer text-primary/40 transition hover:text-primary"
                aria-label={showNewPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showNewPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
              </button>
            </div>
            {fieldErrors.password ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.password}</p> : null}
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-label">
              تأكيد كلمة المرور الجديدة
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-primary/40" />
              <input
                id="confirm-password"
                name="password_confirmation"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="أعد إدخال كلمة المرور الجديدة"
                className={`w-full rounded-lg border py-3 pr-12 pl-12 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary ${fieldErrors.password_confirmation ? "border-red-500" : "border-primary/15"}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((open) => !open)}
                className="absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer text-primary/40 transition hover:text-primary"
                aria-label={showConfirmPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showConfirmPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
              </button>
            </div>
            {fieldErrors.password_confirmation ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.password_confirmation}</p> : null}
          </div>

          <button type="submit" disabled={isLoading} className="w-full cursor-pointer rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70">
            {isLoading ? "جاري التحديث..." : "تأكيد"}
          </button>
        </form>
      </div>

      {showSuccess && (
        <div className=" fixed inset-0 z-50 flex items-center justify-center bg-primary/40 px-6">
          <div role="dialog" aria-modal="true" aria-labelledby="password-success-title" className="w-full max-w-md rounded-xl bg-white px-8 py-10 text-center shadow-lg pt-15">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="size-10 text-green-600" aria-hidden="true" />
            </div>

            <h2 id="password-success-title" className="text-2xl font-bold text-primary">
              تم تحديث كلمة المرور بنجاح
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-label">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة</p>

            <button type="button" onClick={() => navigate("/login")} className="mt-8 w-full cursor-pointer rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover">
              الانتقال إلى تسجيل الدخول
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResetPasswordPage;
