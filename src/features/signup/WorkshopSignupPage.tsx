import { useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, IdCard, Mail, Upload, UserRound } from "lucide-react";
import { PhoneInput, defaultCountries, parseCountry } from "react-international-phone";
import { useGetAllCountriesQuery, useGetAllServicesQuery, useRegisterWorkShopMutation } from "../auth/authApi";
import type { AuthValidationErrorResponse } from "../../types/authTypes";
import signupImage from "../../assets/signup-image.webp";
import logo from "../../assets/SwiftFix-Logo2.png";

const arabicCountries = defaultCountries.filter((country) => {
  const { iso2 } = parseCountry(country);
  return ["ps", "jo", "eg", "sa", "ae", "kw", "qa", "bh", "om", "lb", "sy", "iq", "ye", "sd", "ly", "tn", "dz", "ma", "mr", "so", "dj", "km"].includes(iso2);
});

const emptyFieldErrors = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  national_id_image: "",
  country_id: "",
  service_ids: "",
  notes: "",
};

function WorkshopSignupPage() {
  const navigate = useNavigate();
  const [registerWorkShop, { isLoading }] = useRegisterWorkShopMutation();
  const { data: countriesData, isLoading: isCountriesLoading, isError: isCountriesError } = useGetAllCountriesQuery();
  const { data: servicesData, isLoading: isServicesLoading, isError: isServicesError } = useGetAllServicesQuery();

  const [idImageName, setIdImageName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedServices, setSelectedServices] = useState<Array<string | number>>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors);

  const countries = countriesData?.data ?? [];
  const services = servicesData?.data ?? [];

  const handleIdImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setIdImageName(file ? file.name : "");
  };

  const toggleService = (serviceId: string | number) => {
    setSelectedServices((prev) => (prev.includes(serviceId) ? prev.filter((item) => item !== serviceId) : [...prev, serviceId]));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setFieldErrors(emptyFieldErrors);

    const raw = new FormData(event.currentTarget);
    const formData = new FormData();

    formData.append("first_name", String(raw.get("first_name") ?? "").trim());
    formData.append("last_name", String(raw.get("last_name") ?? "").trim());
    formData.append("email", String(raw.get("email") ?? "").trim());
    formData.append("phone_number", phone);
    formData.append("country_id", String(raw.get("country_id") ?? ""));
    formData.append("notes", String(raw.get("notes") ?? "").trim());

    const nationalIdImage = raw.get("national_id_image");
    if (nationalIdImage instanceof File && nationalIdImage.size > 0) {
      formData.append("national_id_image", nationalIdImage);
    }

    selectedServices.forEach((serviceId) => {
      formData.append("service_ids[]", String(serviceId));
    });

    try {
      const result = await registerWorkShop(formData).unwrap();
      navigate("/login", {
        state: {
          successMessage: result.message || "تم إرسال طلب التسجيل بنجاح",
        },
      });
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      const errors = errorData?.errors;

      if (errors) {
        setFieldErrors({
          first_name: errors.first_name?.[0] ?? "",
          last_name: errors.last_name?.[0] ?? "",
          email: errors.email?.[0] ?? "",
          phone_number: errors.phone_number?.[0] ?? "",
          national_id_image: errors.national_id_image?.[0] ?? "",
          country_id: errors.country_id?.[0] ?? "",
          service_ids: errors.service_ids?.[0] ?? "",
          notes: errors.notes?.[0] ?? "",
        });
        return;
      }

      setErrorMessage(errorData?.message || "حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى.");
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <section className="hidden w-1/2 flex-col bg-primary px-10 py-10 text-white lg:flex">
        <div className="mt-20 flex w-full max-w-lg flex-col gap-14">
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
          <h1 className="text-3xl font-bold text-primary">أنشئ حسابك كصاحب ورشة</h1>
          <p className="mt-2 text-sm text-primary/50">أدخل بيانات حسابك للمتابعة</p>

          <form className="mt-8 space-y-5 text-start" onSubmit={handleSubmit}>
            {errorMessage ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="mb-2 block text-sm font-medium text-label">
                  الاسم الأول
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-primary/40" />
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="ادخل اسمك الأول"
                    className={`w-full rounded-lg border py-3 pr-4 pl-12 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary ${fieldErrors.first_name ? "border-red-500" : "border-primary/15"}`}
                  />
                </div>
                {fieldErrors.first_name ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.first_name}</p> : null}
              </div>

              <div>
                <label htmlFor="last_name" className="mb-2 block text-sm font-medium text-label">
                  الاسم الثاني
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-primary/40" />
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
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
                    name: "phone_number",
                    "aria-invalid": Boolean(fieldErrors.phone_number),
                  }}
                />
              </div>
              {fieldErrors.phone_number ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.phone_number}</p> : null}
            </div>

            <div>
              <label htmlFor="national_id_image" className="mb-2 block text-sm font-medium text-label">
                صورة الهوية
              </label>
              <label
                htmlFor="national_id_image"
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border border-dashed bg-primary-light/40 px-4 py-3 text-sm text-primary transition hover:border-primary/40 ${
                  fieldErrors.national_id_image ? "border-red-500" : "border-primary/20"
                }`}
              >
                <IdCard className="size-5 shrink-0 text-primary/40" />
                <span className="flex-1 truncate text-start text-primary/60">{idImageName || "اختر صورة الهوية"}</span>
                <Upload className="size-5 shrink-0 text-primary/40" />
              </label>
              <input id="national_id_image" name="national_id_image" type="file" accept="image/*" className="sr-only" onChange={handleIdImageChange} />
              {fieldErrors.national_id_image ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.national_id_image}</p> : null}
            </div>

            <div>
              <label htmlFor="country_id" className="mb-2 block text-sm font-medium text-label">
                الدولة
              </label>
              <div className="relative">
                <select
                  id="country_id"
                  name="country_id"
                  defaultValue=""
                  disabled={isCountriesLoading || isCountriesError || countries.length === 0}
                  className={`w-full appearance-none rounded-lg border bg-white py-3 pr-4 pl-12 text-primary outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-70 ${
                    fieldErrors.country_id ? "border-red-500" : "border-primary/15"
                  }`}
                >
                  <option value="" disabled>
                    {isCountriesLoading ? "جاري تحميل الدول..." : isCountriesError ? "تعذر تحميل الدول" : "اختر الدولة"}
                  </option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-primary/40" />
              </div>
              {fieldErrors.country_id ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.country_id}</p> : null}
              {isCountriesError ? <p className="mt-1.5 text-sm text-red-600">حدث خطأ أثناء جلب الدول، حاول مرة أخرى لاحقًا.</p> : null}
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-label">الخدمة المقدمة</legend>
              <div className={`max-h-36 overflow-y-auto rounded-lg border px-3 py-2 focus-within:border-primary ${fieldErrors.service_ids ? "border-red-500" : "border-primary/15"}`}>
                {isServicesLoading ? (
                  <p className="px-2 py-2 text-sm text-primary/50">جاري تحميل الخدمات...</p>
                ) : isServicesError ? (
                  <p className="px-2 py-2 text-sm text-red-600">تعذر تحميل الخدمات</p>
                ) : services.length === 0 ? (
                  <p className="px-2 py-2 text-sm text-primary/50">لا توجد خدمات متاحة حاليًا</p>
                ) : (
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {services.map((service) => {
                      const checked = selectedServices.includes(service.id);
                      const inputId = `service-${service.id}`;

                      return (
                        <label key={service.id} htmlFor={inputId} className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition ${checked ? "bg-primary/5 text-primary" : "text-primary/80 hover:bg-primary-light/50"}`}>
                          <input id={inputId} type="checkbox" name="service_ids" value={service.id} checked={checked} onChange={() => toggleService(service.id)} className="size-4 shrink-0 accent-primary" />
                          <span className="leading-snug">{service.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              {fieldErrors.service_ids ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.service_ids}</p> : null}
              {selectedServices.length > 0 ? <p className="mt-1.5 text-xs text-primary/50">تم اختيار {selectedServices.length} خدمة</p> : <p className="mt-1.5 text-xs text-primary/50">يمكنك اختيار أكثر من خدمة</p>}
            </fieldset>

            <div>
              <label htmlFor="notes" className="mb-2 block text-sm font-medium text-label">
                ملاحظة
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                placeholder="اكتب شرحاً عن الخدمة وسنوات الخبرة وأي تفاصيل إضافية..."
                className={`w-full resize-y rounded-lg border px-4 py-3 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary ${fieldErrors.notes ? "border-red-500" : "border-primary/15"}`}
              />
              {fieldErrors.notes ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.notes}</p> : null}
            </div>

            <button type="submit" disabled={isLoading} className="w-full cursor-pointer rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70">
              {isLoading ? "جاري الإرسال..." : "ارسال"}
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

export default WorkshopSignupPage;
