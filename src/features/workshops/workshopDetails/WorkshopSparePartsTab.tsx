import { Package } from "lucide-react";
import type { WorkshopDetails } from "./types";

type WorkshopSparePartsTabProps = {
  workshop: WorkshopDetails;
};

export function WorkshopSparePartsTab({ workshop }: WorkshopSparePartsTabProps) {
  return (
    <div className="space-y-3">
      {workshop.spareParts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-primary/15 bg-primary-light/30 px-6 py-10 text-center">
          <p className="text-sm font-medium text-primary">لا توجد قطع غيار معروضة حالياً</p>
        </div>
      ) : null}

      {workshop.spareParts.map((part) => (
        <article
          key={part.id}
          className="flex flex-col gap-3 rounded-lg border border-[#ebebeb] bg-[#fafafa] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
          <div className="flex min-w-0 items-center gap-3">
            {part.image ? (
              <img src={part.image} alt={part.name} className="size-12 shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#ffefe4]">
                <Package className="size-5 text-secondary" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#2a2a2a]">{part.name}</p>
              {part.subtitle ? <p className="mt-0.5 text-xs text-[#aaa]">{part.subtitle}</p> : null}
              <p className="mt-1 text-xs text-[#777]">الكمية: {part.quantity}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <p className="text-sm font-medium text-primary">{part.price} ر.س</p>
            {part.isAvailable ? (
              <span className="rounded-full bg-[#10b981] px-2.5 py-1 text-[11px] font-semibold text-white">متوفر</span>
            ) : (
              <span className="rounded-full bg-gray-400 px-2.5 py-1 text-[11px] font-semibold text-white">غير متوفر</span>
            )}
          </div>
        </article>
      ))}

      <div className="rounded bg-secondary px-3 py-3 text-center text-xs text-[#0a0a0a]">
        لا تجد القطعة التي تحتاجها؟ تواصل معنا وسنوفرها خلال 24-48 ساعة
      </div>
    </div>
  );
}
