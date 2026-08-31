import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import { ChevronDown, ImageUp } from "lucide-react";
import SuccessToast from "../../../components/SuccessToast";
import { useGetAllCountriesQuery, useGetAllCitiesQuery, useGetAllServicesQuery, useGetShopProfileQuery, useSaveOrUpdateShopProfileMutation } from "../../auth/authApi";
import type { AuthValidationErrorResponse } from "../../../types/authTypes";
import { useWorkshopOwnerSession } from "../hooks/useWorkshopOwnerSession";
import { buildWorkingHoursPayload, emptyWorkshopProfileForm, emptyWorkingHours, workingDays, workingHoursFromPayload, type WorkingDayKey, type WorkingHoursState } from "../types/workshopProfile";
import { WorkshopLocationMap } from "../components/WorkshopLocationMap";

const emptyFieldErrors = {
  shop_name: "",
  description: "",
  cover_image: "",
  country_id: "",
  city_id: "",
  district: "",
  street: "",
  latitude: "",
  longitude: "",
  working_hours: "",
  service_ids: "",
};

type ProfileFieldErrorKey = keyof typeof emptyFieldErrors;

function getFieldError(errors: Record<string, string[]> | undefined, key: ProfileFieldErrorKey) {
  if (!errors) return "";
  if (errors[key]?.[0]) return errors[key][0];

  const nestedEntry = Object.entries(errors).find(([errorKey]) => errorKey.startsWith(`${key}.`));
  return nestedEntry?.[1]?.[0] ?? "";
}

function fieldBorderClass(hasError: boolean) {
  return hasError ? "border-red-500" : "border-primary/15";
}

const inputClass = "w-full rounded-lg border px-4 py-2.5 text-sm text-primary outline-none transition placeholder:text-primary/40 focus:border-primary";
const timeInputClass = "w-full min-w-0 rounded-lg border px-3 py-2 text-sm text-primary outline-none transition focus:border-primary";

function RequiredMark() {
  return (
    <span className="text-red-500" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

function ProfilePage() {
  const { displayName, initials } = useWorkshopOwnerSession();
  const [values, setValues] = useState(emptyWorkshopProfileForm);
  const [workingHours, setWorkingHours] = useState<WorkingHoursState>(emptyWorkingHours);
  const [selectedServices, setSelectedServices] = useState<Array<string | number>>([]);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImageName, setCoverImageName] = useState("");
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [coverCacheKey, setCoverCacheKey] = useState(0);
  const [savedMessage, setSavedMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors);
  const [mapSessionKey, setMapSessionKey] = useState(0);
  const hasHydratedProfile = useRef(false);

  const { data: profileData, isLoading: isProfileLoading, isError: isProfileError } = useGetShopProfileQuery();
  const [saveOrUpdateShopProfile, { isLoading: isSaving }] = useSaveOrUpdateShopProfileMutation();

  const applyCoverImage = (coverUrl: string | null) => {
    setCoverImageFile(null);
    setCoverImagePreview((previous) => {
      if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
      return coverUrl ? coverUrl : null;
    });
    setCoverImageName(coverUrl ? "صورة الغلاف الحالية" : "");
    setCoverCacheKey(coverUrl ? Date.now() : 0);
  };

  useEffect(() => {
    return () => {
      if (coverImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(coverImagePreview);
      }
    };
  }, [coverImagePreview]);

  useEffect(() => {
    const profile = profileData?.data;
    if (!profile || hasHydratedProfile.current) return;

    hasHydratedProfile.current = true;
    setValues({
      shop_name: profile.shop_name,
      description: profile.description,
      country_id: profile.country_id,
      city_id: profile.city_id,
      district: profile.district,
      street: profile.street,
      latitude: profile.latitude,
      longitude: profile.longitude,
    });
    setWorkingHours(workingHoursFromPayload(profile.working_hours));
    setSelectedServices(profile.service_ids.map(String));
    applyCoverImage(profile.cover_image);
    setMapSessionKey((current) => current + 1);
  }, [profileData]);

  const { data: countriesData, isLoading: isCountriesLoading, isError: isCountriesError, isFetching: isCountriesFetching } = useGetAllCountriesQuery();
  const { data: citiesData, isLoading: isCitiesLoading, isError: isCitiesError, isFetching: isCitiesFetching } = useGetAllCitiesQuery(values.country_id, { skip: !values.country_id });
  const { data: servicesData, isLoading: isServicesLoading, isError: isServicesError, isFetching: isServicesFetching } = useGetAllServicesQuery();

  const countries = countriesData?.data ?? [];
  const cities = citiesData?.data ?? [];
  const services = servicesData?.data ?? [];

  const clearFieldError = (field: ProfileFieldErrorKey) => {
    setFieldErrors((current) => (current[field] ? { ...current, [field]: "" } : current));
  };

  const handleChange = (field: keyof typeof values, value: string) => {
    setValues((current) => {
      const next = { ...current, [field]: value };

      if (field === "country_id") {
        next.city_id = "";
      }

      return next;
    });

    clearFieldError(field as ProfileFieldErrorKey);
    if (field === "country_id") {
      clearFieldError("city_id");
    }

    setSavedMessage("");
    setErrorMessage("");
  };

  const handleCoverImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setCoverImageFile(file);
    setCoverImageName(file ? file.name : "");
    setCoverImagePreview((previous) => {
      if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
      return file ? URL.createObjectURL(file) : null;
    });
    clearFieldError("cover_image");
    setSavedMessage("");
    setErrorMessage("");
  };

  const clearCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview((previous) => {
      if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
      return null;
    });
    setCoverImageName("");
    setCoverCacheKey(0);
  };

  const handleLocationChange = (latitude: string, longitude: string) => {
    setValues((current) => ({ ...current, latitude, longitude }));
    clearFieldError("latitude");
    clearFieldError("longitude");
    setSavedMessage("");
    setErrorMessage("");
  };

  const toggleService = (serviceId: string | number) => {
    const normalizedId = String(serviceId);
    setSelectedServices((current) => (current.some((id) => String(id) === normalizedId) ? current.filter((id) => String(id) !== normalizedId) : [...current, normalizedId]));
    clearFieldError("service_ids");
    setSavedMessage("");
    setErrorMessage("");
  };

  const handleWorkingHoursChange = (day: WorkingDayKey, field: "from" | "to", value: string) => {
    setWorkingHours((current) => ({
      ...current,
      [day]: { ...current[day], [field]: value },
    }));
    clearFieldError("working_hours");
    setSavedMessage("");
    setErrorMessage("");
  };

  const toggleWorkingDay = (day: WorkingDayKey) => {
    setWorkingHours((current) => ({
      ...current,
      [day]: { ...current[day], enabled: !current[day].enabled },
    }));
    clearFieldError("working_hours");
    setSavedMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavedMessage("");
    setShowSuccess(false);
    setErrorMessage("");
    setFieldErrors(emptyFieldErrors);

    const formData = new FormData();
    formData.append("shop_name", values.shop_name.trim());
    formData.append("description", values.description.trim());
    formData.append("country_id", values.country_id);
    formData.append("city_id", values.city_id);
    formData.append("district", values.district.trim());
    formData.append("street", values.street.trim());
    formData.append("latitude", values.latitude);
    formData.append("longitude", values.longitude);

    if (coverImageFile) {
      formData.append("cover_image", coverImageFile);
    }

    selectedServices.forEach((serviceId) => {
      formData.append("service_ids[]", String(serviceId));
    });

    const workingHoursPayload = buildWorkingHoursPayload(workingHours);
    workingHoursPayload.forEach((item, index) => {
      formData.append(`working_hours[${index}][day]`, item.day);
      formData.append(`working_hours[${index}][from]`, item.from);
      formData.append(`working_hours[${index}][to]`, item.to);
    });

    try {
      const result = await saveOrUpdateShopProfile(formData).unwrap();
      hasHydratedProfile.current = false;
      setSavedMessage(result.message || "تم حفظ بيانات البروفايل بنجاح.");
      setShowSuccess(true);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      const errors = errorData?.errors;

      if (errors) {
        setFieldErrors({
          shop_name: getFieldError(errors, "shop_name"),
          description: getFieldError(errors, "description"),
          cover_image: getFieldError(errors, "cover_image"),
          country_id: getFieldError(errors, "country_id"),
          city_id: getFieldError(errors, "city_id"),
          district: getFieldError(errors, "district"),
          street: getFieldError(errors, "street"),
          latitude: getFieldError(errors, "latitude"),
          longitude: getFieldError(errors, "longitude"),
          working_hours: getFieldError(errors, "working_hours"),
          service_ids: getFieldError(errors, "service_ids"),
        });
        return;
      }

      setErrorMessage(errorData?.message || "حدث خطأ أثناء حفظ البروفايل، حاول مرة أخرى.");
    }
  };

  return (
    <div className="space-y-6">
      {isProfileLoading ? (
        <p className="rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm text-primary/70 shadow-sm" role="status">
          جاري تحميل بيانات البروفايل...
        </p>
      ) : null}

      {isProfileError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          تعذر تحميل بيانات البروفايل، يمكنك تعبئة النموذج يدوياً والحفظ لاحقاً.
        </p>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
        <div className="relative h-44 bg-primary-light sm:h-56">
          {coverImagePreview ? (
            <img
              key={coverImagePreview}
              src={coverImagePreview.startsWith("blob:") ? coverImagePreview : `${coverImagePreview}${coverImagePreview.includes("?") ? "&" : "?"}t=${coverCacheKey}`}
              alt="صورة غلاف الورشة"
              className="h-full w-full object-cover"
              onError={() => {
                setCoverImagePreview((previous) => {
                  if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
                  return null;
                });
                setCoverImageName("");
                setCoverImageFile(null);
                setCoverCacheKey(0);
              }}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-primary/40">
              <ImageUp className="size-8" aria-hidden="true" />
              <p className="text-sm">صورة الغلاف ستظهر هنا بعد اختيارها</p>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-primary/80 to-transparent px-5 pb-4 pt-12">
            <div className="flex flex-wrap items-end gap-3">
              <div aria-hidden="true" className="flex size-14 items-center justify-center rounded-full border-2 border-white bg-primary-light text-lg font-bold text-primary sm:size-16 sm:text-xl">
                {initials}
              </div>
              <div className="pb-1 text-white">
                <h1 className="text-lg font-bold sm:text-xl">الملف الشخصي</h1>
                <p className="mt-0.5 text-sm text-white/85">{displayName}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary">بيانات الورشة</h2>
        </div>

        {errorMessage ? (
          <p className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <label htmlFor="shop_name" className="mb-2 block text-sm font-medium text-label">
                اسم الورشة
                <RequiredMark />
              </label>
              <input
                id="shop_name"
                name="shop_name"
                type="text"
                value={values.shop_name}
                onChange={(event) => handleChange("shop_name", event.target.value)}
                disabled={isProfileLoading}
                placeholder={isProfileLoading ? "جاري التحميل..." : "مثال: ورشة سويفت فيكس"}
                className={`${inputClass} disabled:cursor-not-allowed disabled:bg-primary-light/40 disabled:opacity-70 ${fieldBorderClass(Boolean(fieldErrors.shop_name))}`}
              />
              {fieldErrors.shop_name ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.shop_name}</p> : null}
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="description" className="mb-2 block text-sm font-medium text-label">
                وصف الورشة
                <RequiredMark />
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={values.description}
                onChange={(event) => handleChange("description", event.target.value)}
                disabled={isProfileLoading}
                placeholder={isProfileLoading ? "جاري التحميل..." : "اكتب وصفاً مختصراً عن الورشة والخدمات التي تقدمها..."}
                className={`${inputClass} resize-y disabled:cursor-not-allowed disabled:bg-primary-light/40 disabled:opacity-70 ${fieldBorderClass(Boolean(fieldErrors.description))}`}
              />
              {fieldErrors.description ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.description}</p> : null}
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="cover_image" className="mb-2 block text-sm font-medium text-label">
                صورة الغلاف
                <RequiredMark />
              </label>
              <label
                htmlFor="cover_image"
                className={`flex w-full items-center gap-3 rounded-lg border border-dashed bg-primary-light/40 px-4 py-3 text-sm text-primary transition hover:border-primary/40 ${
                  isProfileLoading ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                } ${fieldErrors.cover_image ? "border-red-500" : "border-primary/20"}`}
              >
                <ImageUp className="size-5 shrink-0 text-primary/40" aria-hidden="true" />
                <span className="flex-1 truncate text-start text-primary/60">{isProfileLoading ? "جاري التحميل..." : coverImageName || "اختر صورة الغلاف"}</span>
              </label>
              <input id="cover_image" name="cover_image" type="file" accept="image/*" disabled={isProfileLoading} className="sr-only" onChange={handleCoverImageChange} />
              {fieldErrors.cover_image ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.cover_image}</p> : null}
            </div>

            <div>
              <label htmlFor="country_id" className="mb-2 block text-sm font-medium text-label">
                الدولة
                <RequiredMark />
              </label>
              <div className="relative">
                <select
                  id="country_id"
                  name="country_id"
                  value={values.country_id}
                  onChange={(event) => handleChange("country_id", event.target.value)}
                  disabled={isProfileLoading || isCountriesLoading || isCountriesFetching || isCountriesError}
                  className={`${inputClass} appearance-none bg-white disabled:cursor-not-allowed disabled:opacity-70 ${fieldBorderClass(Boolean(fieldErrors.country_id))}`}
                >
                  <option value="">
                    {isProfileLoading ? "جاري التحميل..." : isCountriesLoading || isCountriesFetching ? "جاري تحميل الدول..." : isCountriesError ? "تعذر تحميل الدول" : countries.length === 0 ? "لا توجد دول متاحة" : "اختر الدولة"}
                  </option>
                  {countries.map((country) => (
                    <option key={String(country.id)} value={String(country.id)}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-primary/40" aria-hidden="true" />
              </div>
              {fieldErrors.country_id ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.country_id}</p> : null}
              {isCountriesError ? <p className="mt-1.5 text-sm text-red-600">حدث خطأ أثناء جلب الدول، حاول مرة أخرى لاحقاً.</p> : null}
              {!isCountriesLoading && !isCountriesError && countries.length > 0 && !fieldErrors.country_id ? <p className="mt-1.5 text-xs text-gray-500">{countries.length} دولة متاحة</p> : null}
            </div>

            <div>
              <label htmlFor="city_id" className="mb-2 block text-sm font-medium text-label">
                المدينة
                <RequiredMark />
              </label>
              <div className="relative">
                <select
                  id="city_id"
                  name="city_id"
                  value={values.city_id}
                  onChange={(event) => handleChange("city_id", event.target.value)}
                  disabled={!values.country_id || isCitiesLoading || isCitiesFetching || isCitiesError}
                  className={`${inputClass} appearance-none bg-white disabled:cursor-not-allowed disabled:opacity-70 ${fieldBorderClass(Boolean(fieldErrors.city_id))}`}
                >
                  <option value="">{!values.country_id ? "اختر الدولة أولاً" : isCitiesLoading || isCitiesFetching ? "جاري تحميل المدن..." : isCitiesError ? "تعذر تحميل المدن" : cities.length === 0 ? "لا توجد مدن متاحة" : "اختر المدينة"}</option>
                  {cities.map((city) => (
                    <option key={String(city.id)} value={String(city.id)}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-primary/40" aria-hidden="true" />
              </div>
              {fieldErrors.city_id ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.city_id}</p> : null}
              {isCitiesError ? <p className="mt-1.5 text-sm text-red-600">حدث خطأ أثناء جلب المدن، حاول مرة أخرى لاحقاً.</p> : null}
            </div>

            <div>
              <label htmlFor="district" className="mb-2 block text-sm font-medium text-label">
                الحي
                <RequiredMark />
              </label>
              <input
                id="district"
                name="district"
                type="text"
                value={values.district}
                onChange={(event) => handleChange("district", event.target.value)}
                disabled={isProfileLoading}
                placeholder={isProfileLoading ? "جاري التحميل..." : "أدخل اسم الحي"}
                className={`${inputClass} disabled:cursor-not-allowed disabled:bg-primary-light/40 disabled:opacity-70 ${fieldBorderClass(Boolean(fieldErrors.district))}`}
              />
              {fieldErrors.district ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.district}</p> : null}
            </div>

            <div>
              <label htmlFor="street" className="mb-2 block text-sm font-medium text-label">
                الشارع
                <RequiredMark />
              </label>
              <input
                id="street"
                name="street"
                type="text"
                value={values.street}
                onChange={(event) => handleChange("street", event.target.value)}
                disabled={isProfileLoading}
                placeholder={isProfileLoading ? "جاري التحميل..." : "مثال: شارع التحلية"}
                className={`${inputClass} disabled:cursor-not-allowed disabled:bg-primary-light/40 disabled:opacity-70 ${fieldBorderClass(Boolean(fieldErrors.street))}`}
              />
              {fieldErrors.street ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.street}</p> : null}
            </div>

            <div className="lg:col-span-2">
              <div className={fieldErrors.latitude || fieldErrors.longitude ? "rounded-xl ring-2 ring-red-500" : ""}>
                <WorkshopLocationMap key={mapSessionKey} latitude={values.latitude} longitude={values.longitude} onLocationChange={handleLocationChange} />
              </div>
              {fieldErrors.latitude ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.latitude}</p> : null}
              {fieldErrors.longitude ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.longitude}</p> : null}
            </div>

            <div className="lg:col-span-2">
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-label">
                  ساعات العمل
                  <RequiredMark />
                </legend>
                <div className={`rounded-lg border px-3 py-2 focus-within:border-primary ${fieldBorderClass(Boolean(fieldErrors.working_hours))}`}>
                  <ul className="divide-y divide-primary/10">
                    {workingDays.map(({ key, label }) => {
                      const dayHours = workingHours[key];
                      const checked = dayHours.enabled;
                      const checkboxId = `working-day-${key}`;

                      return (
                        <li key={key} className={`flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:gap-4 ${checked ? "bg-primary/5" : ""}`}>
                          <label htmlFor={checkboxId} className="flex w-28 shrink-0 cursor-pointer items-center gap-2 rounded-md px-1 text-sm font-medium text-primary">
                            <input id={checkboxId} type="checkbox" name="working_days" value={key} checked={checked} onChange={() => toggleWorkingDay(key)} className="size-4 shrink-0 accent-primary" />
                            <span>{label}</span>
                          </label>

                          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
                            <label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-label">
                              <span className="shrink-0">من</span>
                              <input
                                type="time"
                                name={`working_hours_${key}_from`}
                                value={dayHours.from}
                                onChange={(event) => handleWorkingHoursChange(key, "from", event.target.value)}
                                disabled={!checked}
                                aria-label={`وقت بداية ${label}`}
                                dir="ltr"
                                className={`${timeInputClass} border-primary/15 disabled:cursor-not-allowed disabled:bg-primary-light/40 disabled:opacity-60`}
                              />
                            </label>
                            <label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-label">
                              <span className="shrink-0">إلى</span>
                              <input
                                type="time"
                                name={`working_hours_${key}_to`}
                                value={dayHours.to}
                                onChange={(event) => handleWorkingHoursChange(key, "to", event.target.value)}
                                disabled={!checked}
                                aria-label={`وقت نهاية ${label}`}
                                dir="ltr"
                                className={`${timeInputClass} border-primary/15 disabled:cursor-not-allowed disabled:bg-primary-light/40 disabled:opacity-60`}
                              />
                            </label>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {fieldErrors.working_hours ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.working_hours}</p> : <p className="mt-1.5 text-xs text-primary/50">اختر الأيام ثم حدد ساعات العمل لكل يوم</p>}
              </fieldset>
            </div>

            <div className="lg:col-span-2">
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-label">
                  الخدمة المقدمة
                  <RequiredMark />
                </legend>
                <div className={`max-h-36 overflow-y-auto rounded-lg border px-3 py-2 focus-within:border-primary ${fieldBorderClass(Boolean(fieldErrors.service_ids))}`}>
                  {isServicesLoading || isServicesFetching ? (
                    <p className="px-2 py-2 text-sm text-primary/50">جاري تحميل الخدمات...</p>
                  ) : isServicesError ? (
                    <p className="px-2 py-2 text-sm text-red-600">تعذر تحميل الخدمات</p>
                  ) : services.length === 0 ? (
                    <p className="px-2 py-2 text-sm text-primary/50">لا توجد خدمات متاحة حاليًا</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {services.map((service) => {
                        const checked = selectedServices.some((id) => String(id) === String(service.id));
                        const inputId = `profile-service-${service.id}`;

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
                {fieldErrors.service_ids ? (
                  <p className="mt-1.5 text-sm text-red-600">{fieldErrors.service_ids}</p>
                ) : selectedServices.length > 0 ? (
                  <p className="mt-1.5 text-xs text-primary/50">تم اختيار {selectedServices.length} خدمة</p>
                ) : (
                  <p className="mt-1.5 text-xs text-primary/50">يمكنك اختيار أكثر من خدمة</p>
                )}
              </fieldset>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-primary/10 pt-5">
            <button type="submit" disabled={isProfileLoading || isSaving} className="rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-70">
              {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
            <button
              type="button"
              disabled={isProfileLoading || isSaving}
              onClick={() => {
                setValues(emptyWorkshopProfileForm);
                setWorkingHours(emptyWorkingHours);
                setSelectedServices([]);
                clearCoverImage();
                setSavedMessage("");
                setShowSuccess(false);
                setErrorMessage("");
                setFieldErrors(emptyFieldErrors);
                setMapSessionKey((current) => current + 1);
              }}
              className="rounded-lg border border-primary/15 px-5 py-2.5 text-sm font-medium text-primary transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-70"
            >
              إعادة تعيين
            </button>
          </div>
        </form>
      </section>

      <SuccessToast open={showSuccess} title="تم الحفظ بنجاح" message={savedMessage} onClose={() => setShowSuccess(false)} />
    </div>
  );
}

export default ProfilePage;
