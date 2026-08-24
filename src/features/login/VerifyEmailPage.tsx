import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useSendVerificationMutation, useResendVerificationMutation } from "../auth/authApi";
import type { AuthValidationErrorResponse } from "../../types/authTypes";
import logo from "../../assets/SwiftFix-Logo.svg";

function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sendVerification, { isLoading: isSending }] = useSendVerificationMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();

  const initialEmail = (location.state as { email?: string } | null)?.email ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setErrorMessage("");
    setFieldError("");
    setSuccessMessage("");

    const mutation = sent ? resendVerification : sendVerification;

    try {
      const result = await mutation({ email }).unwrap();
      setSuccessMessage(result.message || "تم إرسال رابط التفعيل إلى بريدك الإلكتروني.");
      setSent(true);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;

      if (errorData?.errors?.email?.[0]) {
        setFieldError(errorData.errors.email[0]);
        return;
      }

      setErrorMessage(errorData?.message || "حدث خطأ، يرجى المحاولة مجدداً.");
    }
  };

  const isLoading = isSending || isResending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-xl rounded-xl border border-primary/10 px-10 py-12 text-center shadow-sm">
        <div className="flex items-center justify-center gap-4">
          <img src={logo} alt="SwiftFix" className="h-16 w-auto object-contain" />
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h1 className="mt-6 text-3xl font-bold text-primary">تفعيل البريد الإلكتروني</h1>
        <p className="mt-3 text-sm leading-relaxed text-primary/50">حسابك غير مفعّل. أدخل بريدك الإلكتروني لإرسال رابط التفعيل.</p>

        <div className="mt-8 text-start">
          {errorMessage && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700" role="alert">
              {successMessage}
            </p>
          )}

          <label htmlFor="email" className="mb-2 block text-sm font-medium text-label">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-primary/40" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className={`w-full rounded-lg border py-3 pr-4 pl-12 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary ${fieldError ? "border-red-500" : "border-primary/15"}`}
            />
          </div>
          {fieldError && <p className="mt-1.5 text-sm text-red-600">{fieldError}</p>}
        </div>

        <button type="button" onClick={handleSend} disabled={isLoading} className="mt-5 w-full cursor-pointer rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70">
          {isLoading ? "جاري الإرسال..." : sent ? "إعادة إرسال رابط التفعيل" : "إرسال رابط التفعيل"}
        </button>

        <button type="button" onClick={() => navigate("/login")} className="mt-4 cursor-pointer text-sm text-secondary hover:underline">
          العودة لتسجيل الدخول
        </button>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
