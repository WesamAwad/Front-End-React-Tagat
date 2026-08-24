import type { FormEvent } from "react";
import { X } from "lucide-react";
import type { SparePartFormValues } from "../types/sparePart";

type SparePartFormProps = {
  mode: "add" | "edit";
  values: SparePartFormValues;
  errors: Partial<Record<keyof SparePartFormValues, string>>;
  onChange: (field: keyof SparePartFormValues, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

const inputClass =
  "w-full rounded-lg border border-primary/15 px-4 py-2.5 text-sm text-primary outline-none transition placeholder:text-primary/40 focus:border-primary";

const categories = ["شاشات", "بطاريات", "كابلات وموصلات", "كامeras", "لوحات أم", "إطارات", "أخرى"];

export function SparePartForm({
  mode,
  values,
  errors,
  onChange,
  onSubmit,
  onCancel,
}: SparePartFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-primary">
            {mode === "add" ? "إضافة قطعة غيار" : "تعديل قطعة غيار"}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {mode === "add"
              ? "أدخل بيانات القطعة الجديدة ثم احفظها في المخزون."
              : "عدّل البيانات ثم احفظ التغييرات."}
          </p>
        </div>
        <button
          type="button"
          aria-label="إغلاق النموذج"
          onClick={onCancel}
          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-primary-light hover:text-primary"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="spare-name" className="mb-2 block text-sm font-medium text-label">
              اسم القطعة
            </label>
            <input
              id="spare-name"
              type="text"
              value={values.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="مثال: شاشة iPhone 13 Pro"
              className={`${inputClass} ${errors.name ? "border-red-500" : ""}`}
            />
            {errors.name ? <p className="mt-1.5 text-sm text-red-600">{errors.name}</p> : null}
          </div>

          <div>
            <label htmlFor="spare-category" className="mb-2 block text-sm font-medium text-label">
              الفئة
            </label>
            <select
              id="spare-category"
              value={values.category}
              onChange={(event) => onChange("category", event.target.value)}
              className={`${inputClass} ${errors.category ? "border-red-500" : ""}`}
            >
              <option value="">اختر الفئة</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category ? <p className="mt-1.5 text-sm text-red-600">{errors.category}</p> : null}
          </div>

          <div>
            <label htmlFor="spare-device" className="mb-2 block text-sm font-medium text-label">
              الجهاز المتوافق
            </label>
            <input
              id="spare-device"
              type="text"
              value={values.compatibleDevice}
              onChange={(event) => onChange("compatibleDevice", event.target.value)}
              placeholder="مثال: iPhone 13 Pro"
              className={`${inputClass} ${errors.compatibleDevice ? "border-red-500" : ""}`}
            />
            {errors.compatibleDevice ? (
              <p className="mt-1.5 text-sm text-red-600">{errors.compatibleDevice}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="spare-sku" className="mb-2 block text-sm font-medium text-label">
              رمز القطعة (SKU)
            </label>
            <input
              id="spare-sku"
              type="text"
              value={values.sku}
              onChange={(event) => onChange("sku", event.target.value)}
              placeholder="مثال: SCR-IP13P-OLED"
              dir="ltr"
              className={`${inputClass} font-mono ${errors.sku ? "border-red-500" : ""}`}
            />
            {errors.sku ? <p className="mt-1.5 text-sm text-red-600">{errors.sku}</p> : null}
          </div>

          <div>
            <label htmlFor="spare-price" className="mb-2 block text-sm font-medium text-label">
              السعر (ر.س)
            </label>
            <input
              id="spare-price"
              type="number"
              min="0"
              step="1"
              value={values.price}
              onChange={(event) => onChange("price", event.target.value)}
              placeholder="0"
              dir="ltr"
              className={`${inputClass} ${errors.price ? "border-red-500" : ""}`}
            />
            {errors.price ? <p className="mt-1.5 text-sm text-red-600">{errors.price}</p> : null}
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
        </div>

        <div className="flex flex-wrap gap-3 border-t border-primary/10 pt-5">
          <button
            type="submit"
            className="rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-secondary-hover"
          >
            {mode === "add" ? "إضافة القطعة" : "حفظ التعديلات"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-primary/15 px-5 py-2.5 text-sm font-medium text-primary transition hover:bg-primary-light"
          >
            إلغاء
          </button>
        </div>
      </form>
    </section>
  );
}
