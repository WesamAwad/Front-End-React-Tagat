import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react";
import { PhoneInput, defaultCountries, parseCountry } from "react-international-phone";
import { useRegisterClientMutation } from "../auth/authApi";
import signupImage from "../../assets/signup-image.webp";
import logo from "../../assets/SwiftFix-Logo2.png";

const arabicCountries = defaultCountries.filter((country) => {
  const { iso2 } = parseCountry(country);
  return ["ps", "jo", "eg", "sa", "ae", "kw", "qa", "bh", "om", "lb", "sy", "iq", "ye", "sd", "ly", "tn", "dz", "ma", "mr", "so", "dj", "km"].includes(iso2);
});

function ClientSignupPage() {
  const navigate = useNavigate();
  const [registerClient, { isLoading }] = useRegisterClientMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirmation: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      password: "",
      password_confirmation: "",
    });

    const form = new FormData(event.currentTarget);
    const firstName = String(form.get("firstName") ?? "").trim();
    const lastName = String(form.get("lastName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    try {
      const result = await registerClient({
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        email,
        password,
        password_confirmation: confirmPassword,
      }).unwrap();

      // console.log("API data:", result?.data ?? result);

      navigate("/login", {
        state: {
          successMessage: result?.message,
        },
      });
    } catch (error) {
      // console.log("error error", error);
      const errors = (error as { data?: { errors?: Record<string, string[]> } })?.data?.errors;
      // console.log("API error data:", (error as { data?: unknown })?.data ?? error);

      setFieldErrors({
        first_name: errors?.first_name?.[0] ?? "",
        last_name: errors?.last_name?.[0] ?? "",
        email: errors?.email?.[0] ?? "",
        phone_number: errors?.phone_number?.[0] ?? "",
        password: errors?.password?.[0] ?? "",
        password_confirmation: errors?.password_confirmation?.[0] ?? "",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <section className="hidden w-1/2 flex-col bg-primary px-10 py-10 text-white lg:flex">
        <div className="m-auto flex w-full max-w-lg flex-col gap-14">
          <div className="flex flex-col items-center text-center">
            <img src={logo} alt="SwiftFix" className="mb-6 h-29 w-44.5 object-contain" />
            <h2 className="text-3xl font-bold">انضم إلى شبكة سويفت فيكس</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">سجل ورشتك اليوم وابدأ باستقبال طلبات الصيانة وتوسيع قاعدة عملائك بكل سهولة وذكاء.</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl">
            <img src={signupImage} alt="ورشة إصلاح أجهزة سويفت فيكس" className="w-full object-cover" />

            <div className="absolute right-0 bottom-0 left-0 flex items-center justify-between rounded-b-2xl bg-primary/80 px-6 py-6">
              <p className="text-base font-medium text-white">نظام إدارة متكامل لورشتك</p>
              <p className="text-base font-bold text-secondary">أكثر من 1000 ورشة مسجلة</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-primary">أنشئ حسابك كعميل</h1>
          <p className="mt-2 text-sm text-primary/50">أدخل بيانات حسابك للمتابعة</p>

          <form className="mt-8 space-y-5 text-start" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-label">
                  الاسم الأول
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-primary/40" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    placeholder="ادخل اسمك الأول"
                    className={`w-full rounded-lg border py-3 pr-4 pl-12 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary ${fieldErrors.first_name ? "border-red-500" : "border-primary/15"}`}
                  />
                </div>
                {fieldErrors.first_name ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.first_name}</p> : null}
              </div>

              <div>
                <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-label">
                  الاسم الثاني
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-primary/40" />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    placeholder="ادخل اسمك الثاني"
                    className={`w-full rounded-lg border py-3 pr-4 pl-12 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary ${fieldErrors.last_name ? "border-red-500" : "border-primary/15"}`}
                  />
                </div>
                {fieldErrors.last_name ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.last_name}</p> : null}
              </div>
            </div>

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
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-label">
                رقم الهاتف
              </label>
              <div dir="ltr">
                <PhoneInput
                  defaultCountry="ps"
                  countries={arabicCountries}
                  value={phone}
                  onChange={setPhone}
                  placeholder="ادخل رقم هاتفك"
                  required
                  className={fieldErrors.phone_number ? "has-error" : undefined}
                  countrySelectorStyleProps={{
                    buttonClassName: "!p-[10px]",
                  }}
                  inputProps={{
                    id: "phone",
                    name: "phone",
                    "aria-invalid": Boolean(fieldErrors.phone_number),
                  }}
                />
              </div>
              {fieldErrors.phone_number ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.phone_number}</p> : null}
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

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-label">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-primary/40" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="أكد كلمة المرور"
                  className={`w-full rounded-lg border py-3 pr-12 pl-12 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary ${fieldErrors.password_confirmation ? "border-red-500" : "border-primary/15"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((open) => !open)}
                  className="absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer text-primary/40 transition hover:text-primary"
                  aria-label={showConfirmPassword ? "إخفاء تأكيد كلمة المرور" : "إظهار تأكيد كلمة المرور"}
                >
                  {showConfirmPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                </button>
              </div>
              {fieldErrors.password_confirmation ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.password_confirmation}</p> : null}
            </div>

            <label className="flex items-start gap-2 text-sm text-primary">
              <input name="terms" type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-primary" />
              <span>
                بتسجيل الدخول، أنت توافق على{" "}
                <Link to="#" className="font-semibold text-secondary hover:text-secondary-hover">
                  شروط الاستخدام
                </Link>{" "}
                و{" "}
                <Link to="#" className="font-semibold text-secondary hover:text-secondary-hover">
                  سياسة الخصوصية
                </Link>
              </span>
            </label>

            <button type="submit" disabled={isLoading} className="w-full cursor-pointer rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70">
              {isLoading ? "جاري إنشاء الحساب..." : "انشاء حساب"}
            </button>
          </form>

          <p className="mt-8 text-sm text-primary/70">
            لديك حساب بالفعل؟{" "}
            <Link to="/login" className="font-semibold text-secondary hover:text-secondary-hover">
              تسجيل دخول
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default ClientSignupPage;
