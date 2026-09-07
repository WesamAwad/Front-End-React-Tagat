import type { ChangeEvent, FormEvent } from "react";
import { ImageUp, X } from "lucide-react";
import { SearchableSelect } from "../../../components/SearchableSelect";
import type { SearchableSelectOption } from "../../../components/SearchableSelect";
import type { Brand, BrandDevice, Category, CategoryProduct } from "../../../types/authTypes";
import type { SparePartFormValues, SparePartStatus, SparePart } from "./types";
import { SPARE_PART_STATUS_OPTIONS } from "./types";

function ensureSelectOption(options: SearchableSelectOption[], value: string, label: string) {
  const normalizedValue = String(value);
  if (!normalizedValue) return options;
  if (options.some((option) => option.value === normalizedValue)) return options;

  const resolvedLabel = label || normalizedValue;
  return [{ value: normalizedValue, label: resolvedLabel }, ...options];
}

type SparePartFormProps = {
  mode: "add" | "edit";
  editPart?: SparePart | null;
  values: SparePartFormValues;
  errors: Partial<Record<keyof SparePartFormValues, string>>;
  imageFileName: string;
  brands: Brand[];
  isBrandsLoading: boolean;
  isBrandsFetching: boolean;
  isBrandsError: boolean;
  devices: BrandDevice[];
  isDevicesLoading: boolean;
  isDevicesFetching: boolean;
  isDevicesError: boolean;
  categories: Category[];
  isCategoriesLoading: boolean;
  isCategoriesFetching: boolean;
  isCategoriesError: boolean;
  products: CategoryProduct[];
  isProductsLoading: boolean;
  isProductsFetching: boolean;
  isProductsError: boolean;
  isSubmitting: boolean;
  submitError: string;
  onChange: (field: keyof SparePartFormValues, value: string) => void;
  onImageChange: (file: File | null) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

const inputClass = "w-full rounded-lg border border-primary/15 px-4 py-2.5 text-sm text-primary outline-none transition placeholder:text-primary/40 focus:border-primary";

export function SparePartForm({
  mode,
  editPart = null,
  values,
  errors,
  imageFileName,
  brands,
  isBrandsLoading,
  isBrandsFetching,
  isBrandsError,
  devices,
  isDevicesLoading,
  isDevicesFetching,
  isDevicesError,
  categories,
  isCategoriesLoading,
  isCategoriesFetching,
  isCategoriesError,
  products,
  isProductsLoading,
  isProductsFetching,
  isProductsError,
  isSubmitting,
  submitError,
  onChange,
  onImageChange,
  onSubmit,
  onCancel,
}: SparePartFormProps) {
  const availableDevices = devices;
  const availableProducts = products;
  const brandOptions = ensureSelectOption(
    brands.map((brand) => ({
      value: String(brand.id),
      label: brand.name,
    })),
    values.company,
    editPart?.companyName ?? "",
  );
  const categoryOptions = ensureSelectOption(
    categories.map((category) => ({
      value: String(category.id),
      label: category.name,
    })),
    values.category_id,
    editPart?.category_name ?? "",
  );
  const deviceOptions = ensureSelectOption(
    availableDevices.map((device) => ({
      value: String(device.id),
      label: device.name,
    })),
    values.device_model_id,
    editPart?.device_model_name ?? "",
  );
  const productOptions = ensureSelectOption(
    availableProducts.map((product) => ({
      value: String(product.id),
      label: product.name,
    })),
    values.product_id,
    editPart?.product_name ?? "",
  );
  const selectedProductLabel = productOptions.find((option) => option.value === String(values.product_id))?.label ?? editPart?.product_name ?? "المنتج";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const handleImageInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onImageChange(file);
  };

  return (
    <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-primary">{mode === "add" ? "إضافة قطعة غيار" : "تعديل قطعة غيار"}</h2>
          <p className="mt-1 text-sm text-gray-600">{mode === "add" ? "أدخل بيانات القطعة الجديدة ثم احفظها في المخزون." : "عدّل البيانات ثم احفظ التغييرات."}</p>
        </div>
        <button type="button" aria-label="إغلاق النموذج" onClick={onCancel} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-primary-light hover:text-primary">
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="spare-company" className="mb-2 block text-sm font-medium text-label">
              اسم الشركة
            </label>
            <SearchableSelect
              id="spare-company"
              value={values.company}
              options={brandOptions}
              selectedLabel={editPart?.companyName}
              placeholder={isBrandsLoading || isBrandsFetching ? "جاري تحميل الشركات..." : isBrandsError ? "تعذر تحميل الشركات" : brands.length === 0 ? "لا توجد شركات متاحة" : "ابحث أو اختر الشركة"}
              disabled={isBrandsLoading || isBrandsFetching || isBrandsError}
              hasError={Boolean(errors.company)}
              emptyMessage="لا توجد شركات مطابقة"
              onChange={(value) => onChange("company", value)}
            />
            {errors.company ? <p className="mt-1.5 text-sm text-red-600">{errors.company}</p> : null}
            {isBrandsError ? <p className="mt-1.5 text-sm text-red-600">حدث خطأ أثناء جلب الشركات، حاول مرة أخرى لاحقاً.</p> : null}
          </div>

          <div>
            <label htmlFor="spare-device" className="mb-2 block text-sm font-medium text-label">
              الجهاز <span className="text-xs font-normal text-gray-500">(اختياري)</span>
            </label>
            <SearchableSelect
              id="spare-device"
              value={values.device_model_id}
              options={deviceOptions}
              selectedLabel={values.device_model_name || editPart?.device_model_name}
              placeholder={
                !values.company ? "اختر الشركة أولاً" : isDevicesLoading || isDevicesFetching ? "جاري تحميل الأجهزة..." : isDevicesError ? "تعذر تحميل الأجهزة" : availableDevices.length === 0 ? "لا توجد أجهزة لهذه الشركة" : "ابحث أو اختر الجهاز"
              }
              disabled={!values.company || isDevicesLoading || isDevicesFetching || isDevicesError}
              hasError={Boolean(errors.device_model_id)}
              emptyMessage="لا توجد أجهزة مطابقة"
              onChange={(value) => onChange("device_model_id", value)}
            />
            {errors.device_model_id ? <p className="mt-1.5 text-sm text-red-600">{errors.device_model_id}</p> : null}
            {isDevicesError ? <p className="mt-1.5 text-sm text-red-600">حدث خطأ أثناء جلب الأجهزة، حاول مرة أخرى لاحقاً.</p> : null}
          </div>

          <div>
            <label htmlFor="spare-category" className="mb-2 block text-sm font-medium text-label">
              الفئة
            </label>
            <SearchableSelect
              id="spare-category"
              value={values.category_id}
              options={categoryOptions}
              selectedLabel={editPart?.category_name}
              placeholder={isCategoriesLoading || isCategoriesFetching ? "جاري تحميل الفئات..." : isCategoriesError ? "تعذر تحميل الفئات" : categories.length === 0 ? "لا توجد فئات متاحة" : "ابحث أو اختر الفئة"}
              disabled={isCategoriesLoading || isCategoriesFetching || isCategoriesError}
              hasError={Boolean(errors.category_id)}
              emptyMessage="لا توجد فئات مطابقة"
              onChange={(value) => onChange("category_id", value)}
            />
            {errors.category_id ? <p className="mt-1.5 text-sm text-red-600">{errors.category_id}</p> : null}
            {isCategoriesError ? <p className="mt-1.5 text-sm text-red-600">حدث خطأ أثناء جلب الفئات، حاول مرة أخرى لاحقاً.</p> : null}
          </div>

          <div>
            <label htmlFor="spare-name" className="mb-2 block text-sm font-medium text-label">
              المنتج
            </label>
            <SearchableSelect
              id="spare-name"
              value={values.product_id}
              options={productOptions}
              selectedLabel={editPart?.product_name}
              placeholder={
                !values.category_id
                  ? "اختر الفئة أولاً"
                  : isProductsLoading || isProductsFetching
                    ? "جاري تحميل المنتجات..."
                    : isProductsError
                      ? "تعذر تحميل المنتجات"
                      : availableProducts.length === 0
                        ? "لا توجد منتجات لهذه الفئة"
                        : "ابحث أو اختر المنتج"
              }
              disabled={!values.category_id || isProductsLoading || isProductsFetching || isProductsError}
              hasError={Boolean(errors.product_id)}
              emptyMessage="لا توجد منتجات مطابقة"
              onChange={(value) => onChange("product_id", value)}
            />
            {errors.product_id ? <p className="mt-1.5 text-sm text-red-600">{errors.product_id}</p> : null}
            {isProductsError ? <p className="mt-1.5 text-sm text-red-600">حدث خطأ أثناء جلب المنتجات، حاول مرة أخرى لاحقاً.</p> : null}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="spare-description" className="mb-2 block text-sm font-medium text-label">
              الوصف <span className="text-xs font-normal text-gray-500">(اختياري)</span>
            </label>
            <textarea
              id="spare-description"
              value={values.description}
              onChange={(event) => onChange("description", event.target.value)}
              rows={3}
              placeholder="أدخل وصفاً للقطعة إن وجد"
              className={`${inputClass} resize-y ${errors.description ? "border-red-500" : ""}`}
            />
            {errors.description ? <p className="mt-1.5 text-sm text-red-600">{errors.description}</p> : null}
          </div>

          <div>
            <label htmlFor="spare-quantity" className="mb-2 block text-sm font-medium text-label">
              الكمية
            </label>
            <input
              id="spare-quantity"
              type="number"
              min="0"
              step="1"
              value={values.quantity}
              onChange={(event) => onChange("quantity", event.target.value)}
              placeholder="0"
              dir="ltr"
              className={`${inputClass} ${errors.quantity ? "border-red-500" : ""}`}
            />
            {errors.quantity ? <p className="mt-1.5 text-sm text-red-600">{errors.quantity}</p> : null}
          </div>

          <div>
            <label htmlFor="spare-price" className="mb-2 block text-sm font-medium text-label">
              السعر (ر.س)
            </label>
            <input id="spare-price" type="number" min="0" step="1" value={values.price} onChange={(event) => onChange("price", event.target.value)} placeholder="0" dir="ltr" className={`${inputClass} ${errors.price ? "border-red-500" : ""}`} />
            {errors.price ? <p className="mt-1.5 text-sm text-red-600">{errors.price}</p> : null}
          </div>

          <div className="sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-label">
              الصورة <span className="text-xs font-normal text-gray-500">(اختياري)</span>
            </span>
            <div className="flex flex-wrap items-start gap-4">
              {values.image ? (
                <img src={values.image} alt={values.product_id ? `صورة ${selectedProductLabel}` : "معاينة صورة المنتج"} className="size-20 rounded-lg border border-primary/10 object-cover" />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-lg border border-dashed border-primary/20 bg-primary-light/40 text-xs text-primary/50">لا توجد صورة</div>
              )}
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="spare-image"
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border border-dashed px-4 py-3 text-sm text-primary transition hover:border-primary/40 ${
                    errors.image ? "border-red-500" : "border-primary/20"
                  } bg-primary-light/40`}
                >
                  <ImageUp className="size-5 shrink-0 text-primary/40" aria-hidden="true" />
                  <span className="flex-1 truncate text-primary/60">{imageFileName || "اختر صورة المنتج"}</span>
                </label>
                <input id="spare-image" type="file" accept="image/*" className="sr-only" onChange={handleImageInputChange} />
                {errors.image ? <p className="mt-1.5 text-sm text-red-600">{errors.image}</p> : null}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="spare-status" className="mb-2 block text-sm font-medium text-label">
              الحالة
            </label>
            <select id="spare-status" value={values.status} onChange={(event) => onChange("status", event.target.value as SparePartStatus)} className={`${inputClass} ${errors.status ? "border-red-500" : ""}`}>
              {SPARE_PART_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status ? <p className="mt-1.5 text-sm text-red-600">{errors.status}</p> : null}
          </div>
        </div>

        {submitError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3 border-t border-primary/10 pt-5">
          <button type="submit" disabled={isSubmitting} className="rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "جاري الحفظ..." : mode === "add" ? "إضافة القطعة" : "حفظ التعديلات"}
          </button>
          <button type="button" onClick={onCancel} className="rounded-lg border border-primary/15 px-5 py-2.5 text-sm font-medium text-primary transition hover:bg-primary-light">
            إلغاء
          </button>
        </div>
      </form>
    </section>
  );
}
