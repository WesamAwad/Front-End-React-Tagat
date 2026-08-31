import { Calendar, Heart, MessageCircle, Share2 } from "lucide-react";
import type { WorkshopDetails } from "./types";

type WorkshopDetailsContactSidebarProps = {
  workshop: WorkshopDetails;
};

export function WorkshopDetailsContactSidebar({ workshop }: WorkshopDetailsContactSidebarProps) {
  return (
    <aside className="flex flex-col gap-4">
      <div className="rounded border border-[#f5f5f5] bg-white p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#ffefe4]">
            <MessageCircle className="size-4.5 text-secondary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#2a2a2a]">تواصل مع الورشة</h2>
            <p className="mt-0.5 text-xs text-[#999]">يرد خلال &lt; 30 دقيقة عادةً</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" className="flex flex-1 items-center justify-center gap-1 rounded bg-primary px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-primary-hover">
            <Calendar className="size-4 shrink-0" aria-hidden="true" />
            <span>احجز موعد</span>
          </button>
          <button type="button" className="flex flex-1 items-center justify-center gap-1 rounded bg-primary-light px-4 py-2.5 text-[13px] font-semibold text-primary transition hover:bg-primary/10">
            <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
            <span>ابدأ المحادثة</span>
          </button>
        </div>
      </div>

      <div className="rounded bg-[#f5f5f5] p-4">
        <h3 className="mb-3 text-sm text-[#888]">{workshop.whyChooseTitle}</h3>
        <ul className="space-y-3">
          {workshop.whyChooseItems.map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs text-[#666]">
              <span className="text-xs font-bold text-secondary" aria-hidden="true">
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2">
        <button type="button" className="flex flex-1 items-center justify-center gap-1.5 rounded border border-[#f5f5f5] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#333] transition hover:bg-primary-light">
          <Share2 className="size-4 shrink-0" aria-hidden="true" />
          مشاركة
        </button>
        <button type="button" className="flex flex-1 items-center justify-center gap-1.5 rounded border border-[#f5f5f5] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#333] transition hover:bg-primary-light">
          <Heart className="size-4 shrink-0" aria-hidden="true" />
          حفظ
        </button>
      </div>
    </aside>
  );
}
