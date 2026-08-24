import { type ChangeEvent, type FormEvent, useState } from "react";
import { ChevronDown, ImageUp } from "lucide-react";
import { useGetAllCountriesQuery, useGetAllCitiesQuery, useGetAllDistrictsQuery, useGetAllServicesQuery } from "../../auth/authApi";
import { useWorkshopOwnerSession } from "../hooks/useWorkshopOwnerSession";
import { emptyWorkshopProfileForm } from "../types/workshopProfile";
import { WorkshopLocationMap } from "../components/WorkshopLocationMap";

const inputClass = "w-full rounded-lg border border-primary/15 px-4 py-2.5 text-sm text-primary outline-none transition placeholder:text-primary/40 focus:border-primary";

function ProfilePage() {
  const { displayName, initials } = useWorkshopOwnerSession();
  const [values, setValues] = useState(emptyWorkshopProfileForm);
  const [selectedServices, setSelectedServices] = useState<Array<string | number>>([]);
  const [coverImageName, setCoverImageName] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [mapSessionKey, setMapSessionKey] = useState(0);

  const { data: countriesData, isLoading: isCountriesLoading, isError: isCountriesError, isFetching: isCountriesFetching } = useGetAllCountriesQuery();
  const { data: citiesData, isLoading: isCitiesLoading, isError: isCitiesError, isFetching: isCitiesFetching } = useGetAllCitiesQuery(values.country_id, { skip: !values.country_id });
  const { data: districtsData, isLoading: isDistrictsLoading, isError: isDistrictsError, isFetching: isDistrictsFetching } = useGetAllDistrictsQuery(values.city_id, { skip: !values.city_id });
  const { data: servicesData, isLoading: isServicesLoading, isError: isServicesError, isFetching: isServicesFetching } = useGetAllServicesQuery();

  const countries = countriesData?.data ?? [];
  const cities = citiesData?.data ?? [];
  const districts = districtsData?.data ?? [];
  const services = servicesData?.data ?? [];

  const handleChange = (field: keyof typeof values, value: string) => {
    setValues((current) => {
      const next = { ...current, [field]: value };

      if (field === "country_id") {
        next.city_id = "";
        next.district_id = "";
      }

      if (field === "city_id") {
        next.district_id = "";
      }

      return next;
    });
    setSavedMessage("");
  };

  const handleCoverImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setCoverImageName(file ? file.name : "");
    setSavedMessage("");
  };

  const handleLocationChange = (latitude: string, longitude: string) => {
    setValues((current) => ({ ...current, latitude, longitude }));
    setSavedMessage("");
  };

  const toggleService = (serviceId: string | number) => {
    setSelectedServices((current) => (current.includes(serviceId) ? current.filter((id) => id !== serviceId) : [...current, serviceId]));
    setSavedMessage("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavedMessage("تم حفظ البيانات محلياً — سيتم ربطها بالـ API لاحقاً.");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div aria-hidden="true" className="flex size-16 items-center justify-center rounded-full bg-primary-light text-xl font-bold text-primary">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">الملف الشخصي</h1>
            <p className="mt-1 text-sm text-gray-600">{displayName}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary">بيانات الورشة</h2>
          <p className="mt-1 text-sm text-gray-600">عدّل معلومات ورشتك. الدول والخدمات تُجلب من الـ API.</p>
        </div>

        {savedMessage ? (
          <p className="mb-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
            {savedMessage}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <label htmlFor="shop_name" className="mb-2 block text-sm font-medium text-label">
                اسم الورشة
              </label>
              <input id="shop_name" name="shop_name" type="text" value={values.shop_name} onChange={(event) => handleChange("shop_name", event.target.value)} placeholder="مثال: ورشة سويفت فيكس" className={inputClass} />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="description" className="mb-2 block text-sm font-medium text-label">
                وصف الورشة
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={values.description}
                onChange={(event) => handleChange("description", event.target.value)}
                placeholder="اكتب وصفاً مختصراً عن الورشة والخدمات التي تقدمها..."
                className={`${inputClass} resize-y`}
              />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="cover_image" className="mb-2 block text-sm font-medium text-label">
                صورة الغلاف
              </label>
              <label htmlFor="cover_image" className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-dashed border-primary/20 bg-primary-light/40 px-4 py-3 text-sm text-primary transition hover:border-primary/40">
                <ImageUp className="size-5 shrink-0 text-primary/40" aria-hidden="true" />
                <span className="flex-1 truncate text-start text-primary/60">{coverImageName || "اختر صورة الغلاف"}</span>
              </label>
              <input id="cover_image" name="cover_image" type="file" accept="image/*" className="sr-only" onChange={handleCoverImageChange} />
            </div>

            <div>
              <label htmlFor="country_id" className="mb-2 block text-sm font-medium text-label">
                الدولة
              </label>
              <div className="relative">
                <select
                  id="country_id"
                  name="country_id"
                  value={values.country_id}
                  onChange={(event) => handleChange("country_id", event.target.value)}
                  disabled={isCountriesLoading || isCountriesFetching || isCountriesError}
                  className={`${inputClass} appearance-none bg-white disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  <option value="">{isCountriesLoading || isCountriesFetching ? "جاري تحميل الدول..." : isCountriesError ? "تعذر تحميل الدول" : countries.length === 0 ? "لا توجد دول متاحة" : "اختر الدولة"}</option>
                  {countries.map((country) => (
                    <option key={String(country.id)} value={String(country.id)}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-primary/40" aria-hidden="true" />
              </div>
              {isCountriesError ? <p className="mt-1.5 text-sm text-red-600">حدث خطأ أثناء جلب الدول، حاول مرة أخرى لاحقاً.</p> : null}
              {!isCountriesLoading && !isCountriesError && countries.length > 0 ? <p className="mt-1.5 text-xs text-gray-500">{countries.length} دولة متاحة</p> : null}
            </div>

            <div>
              <label htmlFor="city_id" className="mb-2 block text-sm font-medium text-label">
                المدينة
              </label>
              <div className="relative">
                <select
                  id="city_id"
                  name="city_id"
                  value={values.city_id}
                  onChange={(event) => handleChange("city_id", event.target.value)}
                  disabled={!values.country_id || isCitiesLoading || isCitiesFetching || isCitiesError}
                  className={`${inputClass} appearance-none bg-white disabled:cursor-not-allowed disabled:opacity-70`}
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
              {isCitiesError ? <p className="mt-1.5 text-sm text-red-600">حدث خطأ أثناء جلب المدن، حاول مرة أخرى لاحقاً.</p> : null}
            </div>

            <div>
              <label htmlFor="district_id" className="mb-2 block text-sm font-medium text-label">
                الحي
              </label>
              <div className="relative">
                <select
                  id="district_id"
                  name="district_id"
                  value={values.district_id}
                  onChange={(event) => handleChange("district_id", event.target.value)}
                  disabled={!values.city_id || isDistrictsLoading || isDistrictsFetching || isDistrictsError}
                  className={`${inputClass} appearance-none bg-white disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  <option value="">{!values.city_id ? "اختر المدينة أولاً" : isDistrictsLoading || isDistrictsFetching ? "جاري تحميل الأحياء..." : isDistrictsError ? "تعذر تحميل الأحياء" : districts.length === 0 ? "لا توجد أحياء متاحة" : "اختر الحي"}</option>
                  {districts.map((district) => (
                    <option key={String(district.id)} value={String(district.id)}>
                      {district.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-primary/40" aria-hidden="true" />
              </div>
              {isDistrictsError ? <p className="mt-1.5 text-sm text-red-600">حدث خطأ أثناء جلب الأحياء، حاول مرة أخرى لاحقاً.</p> : null}
            </div>

            <div>
              <label htmlFor="street" className="mb-2 block text-sm font-medium text-label">
                الشارع
              </label>
              <input id="street" name="street" type="text" value={values.street} onChange={(event) => handleChange("street", event.target.value)} placeholder="مثال: شارع التحلية" className={inputClass} />
            </div>

            <div className="lg:col-span-2">
              <WorkshopLocationMap key={mapSessionKey} latitude={values.latitude} longitude={values.longitude} onLocationChange={handleLocationChange} />
            </div>

            <div>
              <label htmlFor="latitude" className="mb-2 block text-sm font-medium text-label">
                خط العرض (Latitude)
              </label>
              <input id="latitude" name="latitude" type="number" step="any" value={values.latitude} onChange={(event) => handleChange("latitude", event.target.value)} placeholder="24.7136" dir="ltr" className={inputClass} />
            </div>

            <div>
              <label htmlFor="longitude" className="mb-2 block text-sm font-medium text-label">
                خط الطول (Longitude)
              </label>
              <input id="longitude" name="longitude" type="number" step="any" value={values.longitude} onChange={(event) => handleChange("longitude", event.target.value)} placeholder="46.6753" dir="ltr" className={inputClass} />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="working_hours" className="mb-2 block text-sm font-medium text-label">
                ساعات العمل
              </label>
              <textarea
                id="working_hours"
                name="working_hours"
                rows={3}
                value={values.working_hours}
                onChange={(event) => handleChange("working_hours", event.target.value)}
                placeholder={"السبت - الخميس: 9:00 - 18:00\nالجمعة: مغلق"}
                className={`${inputClass} resize-y`}
              />
            </div>

            <div className="lg:col-span-2">
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-label">الخدمة المقدمة</legend>
                <div className="max-h-36 overflow-y-auto rounded-lg border border-primary/15 px-3 py-2 focus-within:border-primary">
                  {isServicesLoading || isServicesFetching ? (
                    <p className="px-2 py-2 text-sm text-primary/50">جاري تحميل الخدمات...</p>
                  ) : isServicesError ? (
                    <p className="px-2 py-2 text-sm text-red-600">تعذر تحميل الخدمات</p>
                  ) : services.length === 0 ? (
                    <p className="px-2 py-2 text-sm text-primary/50">لا توجد خدمات متاحة حاليًا</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {services.map((service) => {
                        const checked = selectedServices.includes(service.id);
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
                {selectedServices.length > 0 ? <p className="mt-1.5 text-xs text-primary/50">تم اختيار {selectedServices.length} خدمة</p> : <p className="mt-1.5 text-xs text-primary/50">يمكنك اختيار أكثر من خدمة</p>}
              </fieldset>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-primary/10 pt-5">
            <button type="submit" className="rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-secondary-hover">
              حفظ التغييرات
            </button>
            <button
              type="button"
              onClick={() => {
                setValues(emptyWorkshopProfileForm);
                setSelectedServices([]);
                setCoverImageName("");
                setSavedMessage("");
                setMapSessionKey((current) => current + 1);
              }}
              className="rounded-lg border border-primary/15 px-5 py-2.5 text-sm font-medium text-primary transition hover:bg-primary-light"
            >
              إعادة تعيين
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ProfilePage;
