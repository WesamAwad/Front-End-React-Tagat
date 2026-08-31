import { Wrench } from "lucide-react";
import type { WorkshopDetails } from "./types";

type WorkshopServicesTabProps = {
  workshop: WorkshopDetails;
};

export function WorkshopServicesTab({ workshop }: WorkshopServicesTabProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 pb-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <p className="text-sm text-[#888]">قائمة الخدمات المتوفرة</p>
        <p className="text-xs text-[#aaa] sm:text-sm">الأسعار تقريبية وتشمل أجر العمالة</p>
      </div>

      {workshop.services.map((service) => (
        <article
          key={service.id}
          className="flex flex-col gap-3 rounded-lg border border-[#ebebeb] bg-[#fafafa] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#ffefe4]">
              <Wrench className="size-4 text-secondary" aria-hidden="true" />
            </div>
            <p className="text-sm text-[#2a2a2a]">{service.name}</p>
          </div>

          <div className="shrink-0">
            <p className="text-sm font-bold text-primary">
              <span className="text-xs font-normal">ر.س </span>
              {service.priceMin} – {service.priceMax}
            </p>
            {service.includesParts ? (
              <p className="mt-0.5 text-xs text-[#525252]">يشمل قطع الغيار</p>
            ) : null}
          </div>
        </article>
      ))}

      <div className="rounded bg-secondary px-3 py-3 text-center text-xs text-[#0a0a0a]">
        ملاحظة: الأسعار النهائية تُحدد بعد الفحص المجاني للجهاز
      </div>
    </div>
  );
}
