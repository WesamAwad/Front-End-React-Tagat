import { useState } from "react";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePasswordSendCodeMutation } from "../auth/authApi";
import type { AuthValidationErrorResponse } from "../../types/authTypes";
import logo from "../../assets/SwiftFix-Logo.svg";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [passwordSendCode, { isLoading }] = usePasswordSendCodeMutation();
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setEmailError("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();

    try {
      await passwordSendCode({ email }).unwrap();
      navigate("/reset-password", { state: { email } });
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;

      if (errorData?.errors?.email?.[0]) {
        setEmailError(errorData.errors.email[0]);
        return;
      }

      if (errorData?.message) {
        setErrorMessage(errorData.message);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-xl rounded-xl border border-primary/10 px-10 py-12 text-center shadow-sm">
        <img src={logo} alt="SwiftFix" className="mx-auto mb-8 h-16 object-contain" />

        <h1 className="text-3xl font-bold text-primary">هل نسيت كلمة المرور؟</h1>
        <p className="mt-3 text-sm leading-relaxed text-primary/50">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.</p>

        <form className="mt-8 space-y-5 text-start" onSubmit={handleSubmit}>
          {errorMessage ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-label">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-primary/40" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                className={`w-full rounded-lg border py-3 pr-4 pl-12 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary ${emailError ? "border-red-500" : "border-primary/15"}`}
              />
            </div>
            {emailError ? <p className="mt-1.5 text-sm text-red-600">{emailError}</p> : null}
          </div>

          <button type="submit" disabled={isLoading} className="w-full cursor-pointer rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70">
            {isLoading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
