import { useState } from "react";
import { ChevronDown, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { Pagination } from "../../../components/Pagination";
import SuccessToast from "../../../components/SuccessToast";
import { TableSearch } from "../../../components/TableSearch";
import { getPageSlice } from "../../../utils/getPageSlice";
import { useGetAllCountriesQuery, useGetCitiesAllQuery, useStoreCityMutation, useUpdateCityMutation, useDeleteCityMutation } from "../../auth/authApi";
import type { AuthValidationErrorResponse, City } from "../../../types/authTypes";

const EMPTY_CITIES: never[] = [];
const PAGE_SIZE = 10;

function formatCityDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ar", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function CitiesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [cityName, setCityName] = useState("");
  const [countryId, setCountryId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string | number; name: string } | null>(null);
  const [nameError, setNameError] = useState("");
  const [countryError, setCountryError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: countriesData, isLoading: isCountriesLoading, isError: isCountriesError } = useGetAllCountriesQuery();
  const { data, isLoading, isError, isFetching } = useGetCitiesAllQuery();
  const [storeCity, { isLoading: isStoring }] = useStoreCityMutation();
  const [updateCity, { isLoading: isUpdating }] = useUpdateCityMutation();
  const [deleteCity, { isLoading: isDeleting }] = useDeleteCityMutation();

  const countries = countriesData?.data ?? [];
  const cities = data?.data ?? EMPTY_CITIES;
  const isEditing = Boolean(editingCity);
  const isSaving = isStoring || isUpdating;

  const resolveCountryName = (city: City) => {
    if (city.country_name) return city.country_name;
    if (city.country_id == null || city.country_id === "") return "—";
    const match = countries.find((country) => String(country.id) === String(city.country_id));
    return match?.name ?? "—";
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredCities = normalizedQuery
    ? cities.filter((city) => {
        const cityName = city.name.toLowerCase();
        const countryName = resolveCountryName(city).toLowerCase();
        return cityName.includes(normalizedQuery) || countryName.includes(normalizedQuery);
      })
    : cities;
  const { pageItems, currentPage } = getPageSlice(filteredCities, page, PAGE_SIZE);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const openAddForm = () => {
    setEditingCity(null);
    setCityName("");
    setCountryId("");
    setNameError("");
    setCountryError("");
    setSubmitError("");
    setIsFormOpen(true);
  };

  const openEditForm = (city: City) => {
    setEditingCity(city);
    setCityName(city.name);
    setCountryId(city.country_id == null ? "" : String(city.country_id));
    setNameError("");
    setCountryError("");
    setSubmitError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCity(null);
    setCityName("");
    setCountryId("");
    setNameError("");
    setCountryError("");
    setSubmitError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNameError("");
    setCountryError("");
    setSubmitError("");

    const name = cityName.trim();

    if (!countryId) {
      setCountryError("يرجى اختيار الدولة");
      return;
    }

    try {
      if (editingCity) {
        const result = await updateCity({ id: editingCity.id, name, country_id: countryId }).unwrap();
        setSuccessMessage(result.message || "تم تعديل المدينة بنجاح");
      } else {
        const result = await storeCity({ name, country_id: countryId }).unwrap();
        setSuccessMessage(result.message || "تمت إضافة المدينة بنجاح");
      }
      closeForm();
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      const errors = errorData?.errors;

      if (errors?.name?.[0]) {
        setNameError(errors.name[0]);
      }
      if (errors?.country_id?.[0]) {
        setCountryError(errors.country_id[0]);
      }
      if (errors?.name?.[0] || errors?.country_id?.[0]) return;

      setSubmitError(errorData?.message || (isEditing ? "تعذر تعديل المدينة، حاول مرة أخرى." : "تعذر إضافة المدينة، حاول مرة أخرى."));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return;

    setDeleteError("");

    try {
      const result = await deleteCity(deleteTarget.id).unwrap();
      setSuccessMessage(result.message || "تم حذف المدينة بنجاح");
      setDeleteTarget(null);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setDeleteError(errorData?.message || "تعذر حذف المدينة، حاول مرة أخرى.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary">المدن</h1>
          <p className="mt-1 text-sm text-gray-500">إضافة وتعديل وحذف المدن</p>
        </div>
        <div className="flex flex-nowrap items-center gap-3">
          <TableSearch id="cities-search" value={searchQuery} onChange={handleSearchChange} placeholder="ابحث عن مدينة أو دولة..." />
          <button type="button" onClick={openAddForm} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-secondary-hover">
            <Plus className="size-4" aria-hidden="true" />
            إضافة مدينة
          </button>
        </div>
      </div>

      {isFormOpen ? (
        <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-primary">{isEditing ? "تعديل المدينة" : "إضافة مدينة"}</h2>
            <button type="button" onClick={closeForm} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-primary-light hover:text-primary" aria-label="إغلاق النموذج">
              <X className="size-4" />
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {submitError ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {submitError}
              </p>
            ) : null}

            <div>
              <label htmlFor="city_name" className="mb-2 block text-sm font-medium text-label">
                اسم المدينة
              </label>
              <input
                id="city_name"
                name="name"
                type="text"
                value={cityName}
                onChange={(event) => {
                  setCityName(event.target.value);
                  setNameError("");
                }}
                placeholder="ادخل اسم المدينة"
                disabled={isSaving}
                className={`w-full max-w-md rounded-lg border py-3 px-4 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-70 ${
                  nameError ? "border-red-500" : "border-primary/15"
                }`}
              />
              {nameError ? <p className="mt-1.5 text-sm text-red-600">{nameError}</p> : null}
            </div>

            <div>
              <label htmlFor="country_id" className="mb-2 block text-sm font-medium text-label">
                الدولة
              </label>
              <div className="relative w-full max-w-md">
                <select
                  id="country_id"
                  name="country_id"
                  value={countryId}
                  onChange={(event) => {
                    setCountryId(event.target.value);
                    setCountryError("");
                  }}
                  disabled={isSaving || isCountriesLoading || isCountriesError}
                  className={`w-full appearance-none rounded-lg border bg-white py-3 ps-4 pe-10 text-primary outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-70 ${
                    countryError ? "border-red-500" : "border-primary/15"
                  }`}
                >
                  <option value="">{isCountriesLoading ? "جاري تحميل الدول..." : isCountriesError ? "تعذر تحميل الدول" : "اختر الدولة"}</option>
                  {countries.map((country) => (
                    <option key={country.id} value={String(country.id)}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-primary/40" aria-hidden="true" />
              </div>
              {countryError ? <p className="mt-1.5 text-sm text-red-600">{countryError}</p> : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={isSaving} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70">
                {isSaving ? "جاري الحفظ..." : isEditing ? "حفظ التعديل" : "حفظ"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                disabled={isSaving}
                className="rounded-lg border border-primary/15 px-5 py-2.5 text-sm font-medium text-primary transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-70"
              >
                إلغاء
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-primary/10 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm text-primary/70" role="status">
            جاري تحميل المدن...
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm" role="alert">
          <p className="text-sm font-medium text-red-700">تعذر تحميل المدن</p>
          <p className="mt-1 text-xs text-red-600">حاول تحديث الصفحة أو المحاولة لاحقاً.</p>
        </div>
      ) : cities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
          <p className="text-sm font-medium text-primary">{isFetching ? "جاري تحديث القائمة..." : "لا توجد مدن"}</p>
          <p className="mt-1 text-xs text-gray-500">ابدأ بإضافة أول مدينة من الزر أعلاه</p>
        </div>
      ) : filteredCities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
          <p className="text-sm font-medium text-primary">لا توجد نتائج للبحث</p>
          <p className="mt-1 text-xs text-gray-500">جرّب كلمة بحث أخرى أو امسح البحث</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
          {isFetching ? (
            <p className="border-b border-primary/10 bg-primary-light/40 px-4 py-2 text-center text-xs text-primary/70" role="status">
              جاري تحديث القائمة...
            </p>
          ) : null}
          <div className="overflow-x-auto">
            <table className="min-w-176 w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10 bg-primary-light/60 text-center text-xs font-semibold text-primary">
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    اسم المدينة
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    الدولة
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    تاريخ الإنشاء
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    آخر تحديث
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {pageItems.map((city) => (
                  <tr key={city.id} className="transition hover:bg-primary-light/30">
                    <td className="whitespace-nowrap px-4 py-4 text-center font-medium text-gray-800 sm:px-6">
                      <span className="inline-flex items-center justify-center gap-2">
                        <MapPin className="size-4 text-primary/40" aria-hidden="true" />
                        {city.name}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-gray-600 sm:px-6">{resolveCountryName(city)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-gray-600 sm:px-6">{formatCityDate(city.created_at)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-gray-600 sm:px-6">{formatCityDate(city.updated_at)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-center sm:px-6">
                      <div className="flex flex-nowrap items-center justify-center gap-2">
                        <button
                          type="button"
                          aria-label={`تعديل ${city.name}`}
                          onClick={() => openEditForm(city)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary-light"
                        >
                          <Pencil className="size-3.5 shrink-0" aria-hidden="true" />
                          تعديل
                        </button>
                        <button
                          type="button"
                          aria-label={`حذف ${city.name}`}
                          onClick={() => {
                            setDeleteError("");
                            setDeleteTarget(city);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-3.5 shrink-0" aria-hidden="true" />
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={currentPage} totalItems={filteredCities.length} pageSize={PAGE_SIZE} itemLabel="مدينة" onPageChange={setPage} />
        </div>
      )}

      <SuccessToast open={Boolean(successMessage)} message={successMessage} onClose={() => setSuccessMessage("")} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف المدينة"
        message={deleteTarget ? `هل تريد حذف مدينة ${deleteTarget.name}؟` : ""}
        confirmLabel="حذف"
        variant="danger"
        isLoading={isDeleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (isDeleting) return;
          setDeleteError("");
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

export default CitiesPage;
