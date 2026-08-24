import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

type WorkshopsFiltersSidebarProps = {
  compact?: boolean;
  showHeader?: boolean;
  className?: string;
};

type FilterAccordionProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

function FilterAccordion({ title, defaultOpen = true, children }: FilterAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-gray-100 pt-4">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-2 text-sm font-medium text-primary" aria-expanded={open}>
        <span>{title}</span>
        {open ? <ChevronUp className="size-4 shrink-0 text-gray-400" /> : <ChevronDown className="size-4 shrink-0 text-gray-400" />}
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

function FilterCheckbox({ label }: { label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 py-1.5 text-sm text-gray-600">
      <span>{label}</span>
      <input type="checkbox" className="size-4 rounded border-gray-300 text-secondary focus:ring-secondary" />
    </label>
  );
}

const deviceTypes = ["هواتف ذكية", "لابتوب", "تلفزيونات", "أجهزة لوحية", "طابعات", "أجهزة منزلية"];

const services = ["استبدال شاشة", "تغيير بطارية", "إصلاح لوحة أم", "برمجة وسوفتوير", "استرداد بيانات", "صيانة دورية", "إصلاح شاحن", "إصلاح كاميرا", "ضمان سنة"];

const spareParts = ["شاشة آيفون", "شاشة سامسونج", "بطارية آيفون", "بطارية سامسونج", "شاشة لابتوب", "لوحة مفاتيح ماك بوك", "كاميرا خلفية", "شاشة آيباد"];

const ratingOptions = ["الكل", "3+", "3.5+", "4+", "4.5+"];

export function WorkshopsFiltersSidebar({ compact = false, showHeader = true, className = "" }: WorkshopsFiltersSidebarProps) {
  const [minRating, setMinRating] = useState("الكل");
  const [maxDistance, setMaxDistance] = useState(20);
  const [maxPrice, setMaxPrice] = useState(500);

  return (
    <aside className={`rounded-xl border border-gray-200 bg-white ${className}`}>
      {showHeader ? (
        <div className={`flex items-center gap-2 border-b border-gray-100 px-4 py-3 ${compact ? "py-2.5" : "bg-gray-50"}`}>
          <SlidersHorizontal className="size-4 text-secondary" aria-hidden="true" />
          <span className="text-sm font-medium text-primary">تصفية النتائج</span>
        </div>
      ) : null}

      <div className={`space-y-4 px-4 py-4 ${compact ? "max-h-[min(420px,55vh)] space-y-3 overflow-y-auto py-3" : ""}`}>
        <div className="space-y-3 pb-2">
          <label className="flex cursor-pointer items-center justify-between gap-2 text-sm text-gray-700">
            <span>مفتوح الآن فقط</span>
            <input type="checkbox" className="size-4 rounded border-gray-300 text-secondary focus:ring-secondary" />
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-2 text-sm text-gray-700">
            <span>ورش موثّقة فقط</span>
            <input type="checkbox" className="size-4 rounded border-gray-300 text-secondary focus:ring-secondary" />
          </label>
        </div>

        <FilterAccordion title="نوع الجهاز" defaultOpen={!compact}>
          <div className="space-y-0.5">
            {deviceTypes.map((item) => (
              <FilterCheckbox key={item} label={item} />
            ))}
          </div>
        </FilterAccordion>

        <FilterAccordion title="الخدمة" defaultOpen={!compact}>
          <div className={`space-y-0.5 ${compact ? "" : "max-h-48 overflow-y-auto"}`}>
            {services.map((item) => (
              <FilterCheckbox key={item} label={item} />
            ))}
          </div>
        </FilterAccordion>

        <FilterAccordion title="قطع الغيار المتوفرة" defaultOpen={!compact}>
          <div className={`space-y-0.5 ${compact ? "" : "max-h-48 overflow-y-auto"}`}>
            {spareParts.map((item) => (
              <FilterCheckbox key={item} label={item} />
            ))}
          </div>
        </FilterAccordion>

        <FilterAccordion title="الحد الأدنى للتقييم" defaultOpen={!compact}>
          <div className="flex flex-wrap gap-2">
            {ratingOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMinRating(option)}
                className={`rounded-md px-3 py-1.5 text-xs transition ${minRating === option ? "bg-primary text-white" : "border border-gray-200 text-gray-600 hover:border-primary/30"}`}
              >
                {option}
              </button>
            ))}
          </div>
        </FilterAccordion>

        <FilterAccordion title="المسافة القصوى" defaultOpen={!compact}>
          <div className="space-y-2">
            <p className="text-xs text-gray-500">{maxDistance} كم</p>
            <input type="range" min={1} max={20} value={maxDistance} onChange={(event) => setMaxDistance(Number(event.target.value))} className="h-1.5 w-full cursor-pointer accent-secondary" />
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>1 كم</span>
              <span>20 كم</span>
            </div>
          </div>
        </FilterAccordion>

        <FilterAccordion title="الحد الأقصى للسعر" defaultOpen={!compact}>
          <div className="space-y-2">
            <p className="text-xs text-gray-500">{maxPrice} ر.س</p>
            <input type="range" min={50} max={500} step={10} value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} className="h-1.5 w-full cursor-pointer accent-secondary" />
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>50 ر.س</span>
              <span>500 ر.س</span>
            </div>
          </div>
        </FilterAccordion>
      </div>
    </aside>
  );
}
