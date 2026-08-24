import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, Lock, Mail, X } from "lucide-react";
import { useLoginClientMutation } from "../auth/authApi";
import { setCredentials } from "../auth/authSlice";
import { useAppDispatch } from "../../store/hooks";
import type { AuthValidationErrorResponse } from "../../types/authTypes";
import loginImage from "../../assets/login-image.webp";
import logo from "../../assets/SwiftFix-Logo2.png";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [loginClient, { isLoading }] = useLoginClientMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [successMessage, setSuccessMessage] = useState((location.state as { successMessage?: string } | null)?.successMessage ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setFieldErrors({ email: "", password: "" });

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      const result = await loginClient({
        email,
        password,
        remember_me: rememberMe,
      }).unwrap();

      dispatch(setCredentials({ user: result.data, token: result.token }));
      navigate("/");
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      // console.log(error);
      // console.log(errorData);

      if (errorData?.errors) {
        setFieldErrors({
          email: errorData.errors.email?.[0] ?? "",
          password: errorData.errors.password?.[0] ?? "",
        });
        return;
      }

      if (errorData?.message) {
        if (errorData.message.includes("تفعيل") || errorData.message.includes("verify") || errorData.message.includes("verified")) {
          navigate("/verify-email", { state: { email } });
          return;
        }
        setErrorMessage(errorData.message);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <section className="hidden w-1/2 flex-col bg-primary px-10 py-10 text-white lg:flex">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logo} alt="SwiftFix" className="mb-6 h-29 w-44.5 object-contain" />
          <h2 className="text-3xl font-bold">انضم إلى شبكة سويفت فيكس</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">سجل ورشتك اليوم وابدأ باستقبال طلبات الصيانة وتوسيع قاعدة عملائك بكل سهولة وذكاء.</p>
        </div>

        <div className="relative mt-auto overflow-hidden rounded-2xl">
          <img src={loginImage} alt="ورشة إصلاح أجهزة سويفت فيكس" className="w-full object-cover" />

          <div className="absolute right-0 bottom-0 left-0 flex items-center justify-between rounded-b-2xl bg-primary/80 px-6 py-6 ">
            <p className="text-base font-medium text-white">نظام إدارة متكامل لورشتك</p>
            <p className="text-base font-bold text-secondary">أكثر من 1000 ورشة مسجلة</p>
          </div>
        </div>
      </section>

      <section className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md text-center">
          {successMessage ? (
            <div role="status" className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-start text-sm text-green-800">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden="true" />
              <p className="flex-1 font-medium leading-relaxed">{successMessage}</p>
              <button type="button" onClick={() => setSuccessMessage("")} className="cursor-pointer rounded-md p-0.5 text-green-700 transition hover:bg-green-100" aria-label="إغلاق رسالة النجاح">
                <X className="size-4" />
              </button>
            </div>
          ) : null}

          <h1 className="text-3xl font-bold text-primary">تسجيل الدخول</h1>
          <p className="mt-2 text-sm text-primary/50">أدخل بيانات حسابك للمتابعة</p>

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
                  required
                  placeholder="example@email.com"
                  className={`w-full rounded-lg border py-3 pr-4 pl-12 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary ${fieldErrors.email ? "border-red-500" : "border-primary/15"}`}
                />
              </div>
              {fieldErrors.email ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.email}</p> : null}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-label">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-primary/40" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="أدخل كلمة المرور"
                  className={`w-full rounded-lg border py-3 pr-12 pl-12 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary ${fieldErrors.password ? "border-red-500" : "border-primary/15"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((open) => !open)}
                  className="absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer text-primary/40 transition hover:text-primary"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                </button>
              </div>
              {fieldErrors.password ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.password}</p> : null}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
                <input
                  type="checkbox"
                  className="size-4 cursor-pointer accent-primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                تذكرني
              </label>
              <Link to="/forgot-password" className="text-sm text-secondary hover:text-secondary-hover">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <button type="submit" disabled={isLoading} className="w-full cursor-pointer rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70">
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          <p className="mt-8 text-sm text-primary/70">
            ليس لديك حساب؟{" "}
            <Link to="/signup" className="font-bold text-secondary hover:text-secondary-hover">
              إنشاء حساب
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;
