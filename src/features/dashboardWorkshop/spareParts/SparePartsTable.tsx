import { Pencil, Trash2 } from "lucide-react";
import type { SparePart } from "./types";
import { SPARE_PART_STATUS_OPTIONS } from "./types";

type SparePartsTableProps = {
  parts: SparePart[];
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(price);
}

function quantityBadge(quantity: number) {
  if (quantity === 0) {
    return "bg-red-50 text-red-700 ring-red-200";
  }
  if (quantity <= 5) {
    return "bg-amber-50 text-amber-800 ring-amber-200";
  }
  return "bg-emerald-50 text-emerald-800 ring-emerald-200";
}

function quantityLabel(quantity: number) {
  if (quantity === 0) return "نفدت الكمية";
  if (quantity <= 5) return "كمية منخفضة";
  return "متوفر";
}

function statusLabel(status: SparePart["status"]) {
  return SPARE_PART_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

function statusBadge(status: SparePart["status"]) {
  if (status === "out_of_stock") {
    return "bg-red-50 text-red-700 ring-red-200";
  }
  return "bg-emerald-50 text-emerald-800 ring-emerald-200";
}

export function SparePartsTable({ parts, isLoading = false, isFetching = false, isError = false, onEdit, onDelete }: SparePartsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-primary/10 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-sm text-primary/70" role="status">
          جاري تحميل قطع الغيار...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm" role="alert">
        <p className="text-sm font-medium text-red-700">تعذر تحميل قطع الغيار</p>
        <p className="mt-1 text-xs text-red-600">حاول تحديث الصفحة أو المحاولة لاحقاً.</p>
      </div>
    );
  }

  if (parts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
        <p className="text-sm font-medium text-primary">{isFetching ? "جاري تحديث القائمة..." : "لا توجد قطع غيار"}</p>
        <p className="mt-1 text-xs text-gray-500">ابدأ بإضافة أول قطعة من الزر أعلاه</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
      {isFetching ? (
        <p className="border-b border-primary/10 bg-primary-light/40 px-4 py-2 text-xs text-primary/70" role="status">
          جاري تحديث القائمة...
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-primary/10 bg-primary-light/60 text-start text-xs font-semibold uppercase tracking-wide text-primary">
              <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                اسم المنتج
              </th>
              <th scope="col" className="hidden whitespace-nowrap px-4 py-3.5 md:table-cell sm:px-6">
                الفئة
              </th>
              <th scope="col" className="hidden whitespace-nowrap px-4 py-3.5 lg:table-cell sm:px-6">
                الجهاز
              </th>
              <th scope="col" className="hidden whitespace-nowrap px-4 py-3.5 xl:table-cell sm:px-6">
                الوصف
              </th>
              <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                الكمية
              </th>
              <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                السعر
              </th>
              <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                الحالة
              </th>
              <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                الصورة
              </th>
              <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {parts.map((part) => (
              <tr key={part.id} className="transition hover:bg-primary-light/30">
                <td className="px-4 py-4 font-medium text-gray-800 sm:px-6">{part.product_name}</td>
                <td className="hidden whitespace-nowrap px-4 py-4 text-gray-600 md:table-cell sm:px-6">{part.category_name}</td>
                <td className="hidden whitespace-nowrap px-4 py-4 text-gray-600 lg:table-cell sm:px-6">{part.device_model_name || "—"}</td>
                <td className="hidden max-w-xs px-4 py-4 text-gray-600 xl:table-cell sm:px-6">
                  <p className="line-clamp-2">{part.description || "—"}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-primary">{part.quantity}</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${quantityBadge(part.quantity)}`}>{quantityLabel(part.quantity)}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-gray-700 sm:px-6">{formatPrice(part.price)}</td>
                <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadge(part.status)}`}>{statusLabel(part.status)}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                  {part.image ? <img src={part.image} alt={part.product_name} className="size-12 rounded-lg border border-primary/10 object-cover" /> : <span className="text-xs text-gray-400">—</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      aria-label={`تعديل ${part.product_name}`}
                      onClick={() => onEdit(part.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary-light"
                    >
                      <Pencil className="size-3.5 shrink-0" aria-hidden="true" />
                      تعديل
                    </button>
                    <button
                      type="button"
                      aria-label={`حذف ${part.product_name}`}
                      onClick={() => onDelete(part.id)}
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
    </div>
  );
}
