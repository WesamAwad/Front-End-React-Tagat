import { Plus } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import SuccessToast from "../../../components/SuccessToast";
import {
  useDeleteShopProductMutation,
  useGetAllShopProductsQuery,
  useGetBrandByIdQuery,
  useGetBrandsForSelectQuery,
  useGetCategoriesForSelectQuery,
  useGetCategoryByIdQuery,
  useStoreShopProductMutation,
  useUpdateShopProductMutation,
} from "../../auth/authApi";
import type { AuthValidationErrorResponse } from "../../../types/authTypes";
import type { Brand, BrandDevice, Category, CategoryProduct } from "../../../types/authTypes";
import { buildShopProductFormData } from "./buildShopProductFormData";
import type { SparePart, SparePartFormValues } from "./types";
import { emptySparePartForm } from "./types";
import { SparePartForm } from "./SparePartForm";
import { SparePartsTable } from "./SparePartsTable";

const EMPTY_BRANDS: Brand[] = [];
const EMPTY_CATEGORIES: Category[] = [];
const EMPTY_DEVICES: BrandDevice[] = [];
const EMPTY_PRODUCTS: CategoryProduct[] = [];
const EMPTY_PARTS: SparePart[] = [];

const sparePartFormKeys = new Set<keyof SparePartFormValues>([
  "company",
  "product_id",
  "category_id",
  "device_model_id",
  "device_model_name",
  "description",
  "price",
  "quantity",
  "image",
  "status",
]);

function normalizeApiErrorKey(key: string): keyof SparePartFormValues | null {
  const rootKey = key.split(".")[0];
  if (rootKey === "device_id") return "device_model_id";

  if (sparePartFormKeys.has(rootKey as keyof SparePartFormValues)) {
    return rootKey as keyof SparePartFormValues;
  }

  return null;
}

function mapApiErrorsToForm(errors: Record<string, string[]> | undefined) {
  if (!errors) return {};

  return Object.entries(errors).reduce<Partial<Record<keyof SparePartFormValues, string>>>((accumulator, [key, messages]) => {
    const formKey = normalizeApiErrorKey(key);
    const message = messages?.[0];

    if (formKey && message && !accumulator[formKey]) {
      accumulator[formKey] = message;
    }

    return accumulator;
  }, {});
}

function sparePartToFormValues(part: SparePart): SparePartFormValues {
  return {
    company: String(part.company ?? ""),
    product_id: String(part.product_id ?? ""),
    category_id: String(part.category_id ?? ""),
    device_model_id: String(part.device_model_id ?? ""),
    device_model_name: part.device_model_name ?? "",
    description: part.description ?? "",
    price: String(part.price),
    quantity: String(part.quantity),
    image: part.image,
    status: part.status,
  };
}

function revokeImagePreview(image: string) {
  if (image.startsWith("blob:")) {
    URL.revokeObjectURL(image);
  }
}

function SparePartsWorkshopPage() {
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; productName: string } | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [formValues, setFormValues] = useState<SparePartFormValues>(emptySparePartForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof SparePartFormValues, string>>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [storeShopProduct, { isLoading: isStoring }] = useStoreShopProductMutation();
  const [updateShopProduct, { isLoading: isUpdating }] = useUpdateShopProductMutation();
  const [deleteShopProduct, { isLoading: isDeleting }] = useDeleteShopProductMutation();
  const isSubmitting = isStoring || isUpdating;

  const { data: shopProductsData, isLoading: isPartsLoading, isFetching: isPartsFetching, isError: isPartsError } = useGetAllShopProductsQuery();

  const parts = shopProductsData?.data ?? EMPTY_PARTS;
  const editingPart = formMode === "edit" && editingId ? (parts.find((part) => part.id === editingId) ?? null) : null;

  const { data: brandsData, isLoading: isBrandsLoading, isFetching: isBrandsFetching, isError: isBrandsError } = useGetBrandsForSelectQuery(undefined, { skip: !formMode });

  const { data: categoriesData, isLoading: isCategoriesLoading, isFetching: isCategoriesFetching, isError: isCategoriesError } = useGetCategoriesForSelectQuery(undefined, { skip: !formMode });

  const brands = brandsData?.data ?? EMPTY_BRANDS;
  const categories = categoriesData?.data ?? EMPTY_CATEGORIES;

  const {
    data: brandDetailsData,
    isLoading: isDevicesLoading,
    isFetching: isDevicesFetching,
    isError: isDevicesError,
  } = useGetBrandByIdQuery(formValues.company, {
    skip: !formMode || !formValues.company,
  });

  const devices = brandDetailsData?.data?.devices ?? EMPTY_DEVICES;

  const {
    data: categoryDetailsData,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
    isError: isProductsError,
  } = useGetCategoryByIdQuery(formValues.category_id, {
    skip: !formMode || !formValues.category_id,
  });

  const products = categoryDetailsData?.data?.products ?? EMPTY_PRODUCTS;

  const lowStockCount = parts.filter((part) => part.quantity > 0 && part.quantity <= 5).length;
  const outOfStockCount = parts.filter((part) => part.quantity === 0).length;

  const resetFormState = () => {
    revokeImagePreview(formValues.image);
    setFormMode(null);
    setEditingId(null);
    setFormValues(emptySparePartForm);
    setFormErrors({});
    setImageFile(null);
    setImageFileName("");
    setSubmitError("");
  };

  const openAddForm = () => {
    setFormMode("add");
    setEditingId(null);
    setFormValues(emptySparePartForm);
    setFormErrors({});
    setImageFile(null);
    setImageFileName("");
    setSubmitError("");
  };

  const openEditForm = (id: string) => {
    const part = parts.find((item) => item.id === id);
    if (!part) return;

    setFormMode("edit");
    setEditingId(id);
    setFormValues(sparePartToFormValues(part));
    setFormErrors({});
    setImageFile(null);
    setImageFileName(part.image ? "الصورة الحالية" : "");
    setSubmitError("");
  };

  const closeForm = () => {
    resetFormState();
  };

  const handleFieldChange = (field: keyof SparePartFormValues, value: string) => {
    setFormValues((current) => {
      const next = { ...current, [field]: value };

      if (field === "company") {
        next.device_model_id = "";
        next.device_model_name = "";
      }

      if (field === "device_model_id") {
        const selectedDevice = devices.find((device) => String(device.id) === value);
        next.device_model_name = selectedDevice?.name ?? "";
      }

      if (field === "category_id") {
        next.product_id = "";
      }

      return next;
    });
    setFormErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError("");
  };

  const handleImageChange = (file: File | null) => {
    setFormValues((current) => {
      revokeImagePreview(current.image);
      return {
        ...current,
        image: file ? URL.createObjectURL(file) : "",
      };
    });
    setImageFile(file);
    setImageFileName(file ? file.name : "");
    setFormErrors((current) => ({ ...current, image: undefined }));
    setSubmitError("");
  };

  const handleSubmit = async () => {
    setFormErrors({});
    setSubmitError("");

    const formData = buildShopProductFormData(formValues, imageFile);

    try {
      const result = formMode === "edit" && editingId ? await updateShopProduct({ id: editingId, body: formData }).unwrap() : await storeShopProduct(formData).unwrap();

      setSuccessMessage(result.message || (formMode === "edit" ? "تم تحديث قطعة الغيار بنجاح." : "تمت إضافة قطعة الغيار بنجاح."));
      setShowSuccess(true);
      resetFormState();
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      const apiErrors = errorData?.errors;
      const mappedErrors = mapApiErrorsToForm(apiErrors);

      if (Object.keys(mappedErrors).length > 0) {
        setFormErrors(mappedErrors);
        return;
      }

      setSubmitError(errorData?.message || (formMode === "edit" ? "حدث خطأ أثناء تحديث قطعة الغيار، حاول مرة أخرى." : "حدث خطأ أثناء حفظ قطعة الغيار، حاول مرة أخرى."));
    }
  };

  const handleDeleteRequest = (id: string) => {
    const part = parts.find((item) => item.id === id);
    if (!part) return;

    setDeleteError("");
    setPendingDelete({ id, productName: part.product_name });
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setPendingDelete(null);
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      const result = await deleteShopProduct(pendingDelete.id).unwrap();
      setSuccessMessage(result.message || "تم حذف قطعة الغيار بنجاح.");
      setShowSuccess(true);
      setPendingDelete(null);
      setDeleteError("");

      if (editingId === pendingDelete.id) {
        closeForm();
      }
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      setDeleteError(errorData?.message || "حدث خطأ أثناء حذف قطعة الغيار، حاول مرة أخرى.");
    }
  };

  return (
    <div className="space-y-6">
      <SuccessToast open={showSuccess} message={successMessage} onClose={() => setShowSuccess(false)} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="تأكيد الحذف"
        message={pendingDelete ? `هل أنت متأكد من حذف «${pendingDelete.productName}»؟ لا يمكن التراجع عن هذا الإجراء.` : ""}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="danger"
        isLoading={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-primary">قطع الغيار</h1>
            <p className="mt-1 text-sm text-gray-600">إدارة مخزون قطع الغيار — إضافة، تعديل، أو حذف القطع المتوفرة في الورشة.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-primary/10 bg-primary-light/50 px-4 py-2 text-center">
              <p className="text-xs text-gray-500">إجمالي القطع</p>
              <p className="text-lg font-bold text-primary">{parts.length}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-center">
              <p className="text-xs text-amber-700">كمية منخفضة</p>
              <p className="text-lg font-bold text-amber-800">{lowStockCount}</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-center">
              <p className="text-xs text-red-700">نفدت</p>
              <p className="text-lg font-bold text-red-800">{outOfStockCount}</p>
            </div>
            {!formMode ? (
              <button type="button" onClick={openAddForm} className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-secondary-hover">
                <Plus className="size-4 shrink-0" aria-hidden="true" />
                إضافة قطعة
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {formMode ? (
        <SparePartForm
          mode={formMode}
          editPart={editingPart}
          values={formValues}
          errors={formErrors}
          imageFileName={imageFileName}
          brands={brands}
          isBrandsLoading={isBrandsLoading}
          isBrandsFetching={isBrandsFetching}
          isBrandsError={isBrandsError}
          devices={devices}
          isDevicesLoading={isDevicesLoading}
          isDevicesFetching={isDevicesFetching}
          isDevicesError={isDevicesError}
          categories={categories}
          isCategoriesLoading={isCategoriesLoading}
          isCategoriesFetching={isCategoriesFetching}
          isCategoriesError={isCategoriesError}
          products={products}
          isProductsLoading={isProductsLoading}
          isProductsFetching={isProductsFetching}
          isProductsError={isProductsError}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onChange={handleFieldChange}
          onImageChange={handleImageChange}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      ) : null}

      <SparePartsTable parts={parts} isLoading={isPartsLoading} isFetching={isPartsFetching} isError={isPartsError} onEdit={openEditForm} onDelete={handleDeleteRequest} />
    </div>
  );
}

export default SparePartsWorkshopPage;
