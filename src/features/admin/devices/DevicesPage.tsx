import { useState } from "react";
import { ChevronDown, Pencil, Plus, Smartphone, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { Pagination } from "../../../components/Pagination";
import SuccessToast from "../../../components/SuccessToast";
import { TableSearch } from "../../../components/TableSearch";
import { getPageSlice } from "../../../utils/getPageSlice";
import { useGetBrandsForSelectQuery, useGetDeviceModelsAllQuery, useStoreDeviceModelMutation, useUpdateDeviceModelMutation, useDeleteDeviceModelMutation } from "../../auth/authApi";
import type { AuthValidationErrorResponse, DeviceModel } from "../../../types/authTypes";

const EMPTY_DEVICES: never[] = [];
const PAGE_SIZE = 10;

function formatDeviceDate(value?: string | null) {
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

function DevicesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceModel | null>(null);
  const [deviceName, setDeviceName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string | number; name: string } | null>(null);
  const [nameError, setNameError] = useState("");
  const [brandError, setBrandError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: brandsData, isLoading: isBrandsLoading, isError: isBrandsError } = useGetBrandsForSelectQuery();
  const { data, isLoading, isError, isFetching } = useGetDeviceModelsAllQuery();
  const [storeDeviceModel, { isLoading: isStoring }] = useStoreDeviceModelMutation();
  const [updateDeviceModel, { isLoading: isUpdating }] = useUpdateDeviceModelMutation();
  const [deleteDeviceModel, { isLoading: isDeleting }] = useDeleteDeviceModelMutation();

  const brands = brandsData?.data ?? [];
  const devices = data?.data ?? EMPTY_DEVICES;
  const isEditing = Boolean(editingDevice);
  const isSaving = isStoring || isUpdating;

  const resolveBrandName = (device: DeviceModel) => {
    if (device.brand_name) return device.brand_name;
    if (device.brand_id == null || device.brand_id === "") return "—";
    const match = brands.find((brand) => String(brand.id) === String(device.brand_id));
    return match?.name ?? "—";
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredDevices = normalizedQuery
    ? devices.filter((device) => {
        const name = device.name.toLowerCase();
        const brandName = resolveBrandName(device).toLowerCase();
        return name.includes(normalizedQuery) || brandName.includes(normalizedQuery);
      })
    : devices;
  const { pageItems, currentPage } = getPageSlice(filteredDevices, page, PAGE_SIZE);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const openAddForm = () => {
    setEditingDevice(null);
    setDeviceName("");
    setBrandId("");
    setNameError("");
    setBrandError("");
    setSubmitError("");
    setIsFormOpen(true);
  };

  const openEditForm = (device: DeviceModel) => {
    setEditingDevice(device);
    setDeviceName(device.name);
    setBrandId(device.brand_id == null ? "" : String(device.brand_id));
    setNameError("");
    setBrandError("");
    setSubmitError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingDevice(null);
    setDeviceName("");
    setBrandId("");
    setNameError("");
    setBrandError("");
    setSubmitError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNameError("");
    setBrandError("");
    setSubmitError("");

    const device_model_name = deviceName.trim();

    try {
      if (editingDevice) {
        const result = await updateDeviceModel({ id: editingDevice.id, device_model_name, brand_id: brandId }).unwrap();
        setSuccessMessage(result.message || "تم تعديل الجهاز بنجاح");
      } else {
        const result = await storeDeviceModel({ device_model_name, brand_id: brandId }).unwrap();
        setSuccessMessage(result.message || "تمت إضافة الجهاز بنجاح");
      }
      closeForm();
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      const errors = errorData?.errors;

      if (errors?.device_model_name?.[0]) {
        setNameError(errors.device_model_name[0]);
      }
      if (errors?.brand_id?.[0]) {
        setBrandError(errors.brand_id[0]);
      }
      if (errors?.device_model_name?.[0] || errors?.brand_id?.[0]) return;

      setSubmitError(errorData?.message || (isEditing ? "تعذر تعديل الجهاز، حاول مرة أخرى." : "تعذر إضافة الجهاز، حاول مرة أخرى."));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return;

    setDeleteError("");

    try {
      const result = await deleteDeviceModel(deleteTarget.id).unwrap();
      setSuccessMessage(result.message || "تم حذف الجهاز بنجاح");
      setDeleteTarget(null);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setDeleteError(errorData?.message || "تعذر حذف الجهاز، حاول مرة أخرى.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary">الأجهزة</h1>
          <p className="mt-1 text-sm text-gray-500">إضافة وتعديل وحذف الأجهزة</p>
        </div>
        <div className="flex flex-nowrap items-center gap-3">
          <TableSearch id="devices-search" value={searchQuery} onChange={handleSearchChange} placeholder="ابحث عن جهاز أو شركة..." />
          <button type="button" onClick={openAddForm} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-secondary-hover">
            <Plus className="size-4" aria-hidden="true" />
            إضافة جهاز
          </button>
        </div>
      </div>

      {isFormOpen ? (
        <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-primary">{isEditing ? "تعديل الجهاز" : "إضافة جهاز"}</h2>
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
              <label htmlFor="device_name" className="mb-2 block text-sm font-medium text-label">
                اسم الجهاز
              </label>
              <input
                id="device_name"
                name="device_model_name"
                type="text"
                value={deviceName}
                onChange={(event) => {
                  setDeviceName(event.target.value);
                  setNameError("");
                }}
                placeholder="ادخل اسم الجهاز"
                disabled={isSaving}
                className={`w-full max-w-md rounded-lg border py-3 px-4 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-70 ${
                  nameError ? "border-red-500" : "border-primary/15"
                }`}
              />
              {nameError ? <p className="mt-1.5 text-sm text-red-600">{nameError}</p> : null}
            </div>

            <div>
              <label htmlFor="brand_id" className="mb-2 block text-sm font-medium text-label">
                الشركة
              </label>
              <div className="relative w-full max-w-md">
                <select
                  id="brand_id"
                  name="brand_id"
                  value={brandId}
                  onChange={(event) => {
                    setBrandId(event.target.value);
                    setBrandError("");
                  }}
                  disabled={isSaving || isBrandsLoading || isBrandsError}
                  className={`w-full appearance-none rounded-lg border bg-white py-3 ps-4 pe-10 text-primary outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-70 ${
                    brandError ? "border-red-500" : "border-primary/15"
                  }`}
                >
                  <option value="">{isBrandsLoading ? "جاري تحميل الشركات..." : isBrandsError ? "تعذر تحميل الشركات" : "اختر الشركة"}</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={String(brand.id)}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-primary/40" aria-hidden="true" />
              </div>
              {brandError ? <p className="mt-1.5 text-sm text-red-600">{brandError}</p> : null}
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
            جاري تحميل الأجهزة...
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm" role="alert">
          <p className="text-sm font-medium text-red-700">تعذر تحميل الأجهزة</p>
          <p className="mt-1 text-xs text-red-600">حاول تحديث الصفحة أو المحاولة لاحقاً.</p>
        </div>
      ) : devices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
          <p className="text-sm font-medium text-primary">{isFetching ? "جاري تحديث القائمة..." : "لا توجد أجهزة"}</p>
          <p className="mt-1 text-xs text-gray-500">ابدأ بإضافة أول جهاز من الزر أعلاه</p>
        </div>
      ) : filteredDevices.length === 0 ? (
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
                    اسم الجهاز
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    الشركة
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
                {pageItems.map((device) => (
                  <tr key={device.id} className="transition hover:bg-primary-light/30">
                    <td className="whitespace-nowrap px-4 py-4 text-center font-medium text-gray-800 sm:px-6">
                      <span className="inline-flex items-center justify-center gap-2">
                        <Smartphone className="size-4 text-primary/40" aria-hidden="true" />
                        {device.name}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-gray-600 sm:px-6">{resolveBrandName(device)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-gray-600 sm:px-6">{formatDeviceDate(device.created_at)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-gray-600 sm:px-6">{formatDeviceDate(device.updated_at)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-center sm:px-6">
                      <div className="flex flex-nowrap items-center justify-center gap-2">
                        <button
                          type="button"
                          aria-label={`تعديل ${device.name}`}
                          onClick={() => openEditForm(device)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary-light"
                        >
                          <Pencil className="size-3.5 shrink-0" aria-hidden="true" />
                          تعديل
                        </button>
                        <button
                          type="button"
                          aria-label={`حذف ${device.name}`}
                          onClick={() => {
                            setDeleteError("");
                            setDeleteTarget(device);
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
          <Pagination page={currentPage} totalItems={filteredDevices.length} pageSize={PAGE_SIZE} itemLabel="جهاز" onPageChange={setPage} />
        </div>
      )}

      <SuccessToast open={Boolean(successMessage)} message={successMessage} onClose={() => setSuccessMessage("")} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف الجهاز"
        message={deleteTarget ? `هل تريد حذف جهاز ${deleteTarget.name}؟` : ""}
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

export default DevicesPage;
