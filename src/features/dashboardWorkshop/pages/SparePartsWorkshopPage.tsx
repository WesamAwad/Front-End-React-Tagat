import { Plus } from "lucide-react";
import { useState } from "react";
import { mockSpareParts } from "../data/spareParts.mock";
import type { SparePart, SparePartFormValues } from "../types/sparePart";
import { emptySparePartForm } from "../types/sparePart";
import { SparePartForm } from "./SparePartForm";
import { SparePartsTable } from "./SparePartsTable";

function sparePartToFormValues(part: SparePart): SparePartFormValues {
  return {
    name: part.name,
    category: part.category,
    compatibleDevice: part.compatibleDevice,
    sku: part.sku,
    price: String(part.price),
    quantity: String(part.quantity),
  };
}

function validateForm(values: SparePartFormValues, existingSkus: string[], editingSku?: string) {
  const errors: Partial<Record<keyof SparePartFormValues, string>> = {};

  if (!values.name.trim()) errors.name = "اسم القطعة مطلوب";
  if (!values.category) errors.category = "اختر الفئة";
  if (!values.compatibleDevice.trim()) errors.compatibleDevice = "الجهاز المتوافق مطلوب";
  if (!values.sku.trim()) {
    errors.sku = "رمز القطعة مطلوب";
  } else if (existingSkus.includes(values.sku.trim()) && values.sku.trim() !== editingSku) {
    errors.sku = "رمز القطعة مستخدم مسبقاً";
  }

  const price = Number(values.price);
  if (!values.price.trim() || Number.isNaN(price) || price < 0) {
    errors.price = "أدخل سعراً صحيحاً";
  }

  const quantity = Number(values.quantity);
  if (!values.quantity.trim() || Number.isNaN(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
    errors.quantity = "أدخل كمية صحيحة";
  }

  return errors;
}

function generateSparePartId(parts: SparePart[]) {
  const nextNumber = parts.length + 1;
  return `SP-${String(nextNumber).padStart(3, "0")}`;
}

function SparePartsWorkshopPage() {
  const [parts, setParts] = useState<SparePart[]>(mockSpareParts);
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<SparePartFormValues>(emptySparePartForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof SparePartFormValues, string>>>({});

  const lowStockCount = parts.filter((part) => part.quantity > 0 && part.quantity <= 5).length;
  const outOfStockCount = parts.filter((part) => part.quantity === 0).length;

  const openAddForm = () => {
    setFormMode("add");
    setEditingId(null);
    setFormValues(emptySparePartForm);
    setFormErrors({});
  };

  const openEditForm = (id: string) => {
    const part = parts.find((item) => item.id === id);
    if (!part) return;

    setFormMode("edit");
    setEditingId(id);
    setFormValues(sparePartToFormValues(part));
    setFormErrors({});
  };

  const closeForm = () => {
    setFormMode(null);
    setEditingId(null);
    setFormValues(emptySparePartForm);
    setFormErrors({});
  };

  const handleFieldChange = (field: keyof SparePartFormValues, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = () => {
    const editingPart = editingId ? parts.find((item) => item.id === editingId) : undefined;
    const existingSkus = parts.map((part) => part.sku);
    const errors = validateForm(formValues, existingSkus, editingPart?.sku);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      name: formValues.name.trim(),
      category: formValues.category,
      compatibleDevice: formValues.compatibleDevice.trim(),
      sku: formValues.sku.trim(),
      price: Number(formValues.price),
      quantity: Number(formValues.quantity),
    };

    if (formMode === "edit" && editingId) {
      setParts((current) =>
        current.map((part) => (part.id === editingId ? { ...part, ...payload } : part)),
      );
    } else {
      setParts((current) => [
        { id: generateSparePartId(current), ...payload },
        ...current,
      ]);
    }

    closeForm();
  };

  const handleDelete = (id: string) => {
    setParts((current) => current.filter((part) => part.id !== id));
    if (editingId === id) closeForm();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-primary">قطع الغيار</h1>
            <p className="mt-1 text-sm text-gray-600">
              إدارة مخزون قطع الغيار — إضافة، تعديل، أو حذف القطع المتوفرة في الورشة.
            </p>
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
              <button
                type="button"
                onClick={openAddForm}
                className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-secondary-hover"
              >
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
          values={formValues}
          errors={formErrors}
          onChange={handleFieldChange}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      ) : null}

      <SparePartsTable parts={parts} onEdit={openEditForm} onDelete={handleDelete} />
    </div>
  );
}

export default SparePartsWorkshopPage;
