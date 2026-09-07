import { useState } from "react";
import { MapPin, Wrench } from "lucide-react";
import { StarRating } from "../components/StarRating";
import type { WorkshopDetails, WorkshopDetailsTab } from "./types";
import { WorkshopReviewsTab } from "./WorkshopReviewsTab";
import { WorkshopServicesTab } from "./WorkshopServicesTab";
import { WorkshopSparePartsTab } from "./WorkshopSparePartsTab";

type WorkshopDetailsMainPanelProps = {
  workshop: WorkshopDetails;
};

const tabs: { id: WorkshopDetailsTab; label: string }[] = [
  { id: "services", label: "الخدمات والأسعار" },
  { id: "spare-parts", label: "قطع الغيار" },
  { id: "reviews", label: "التقييمات" },
  { id: "location", label: "الموقع والساعات" },
];

export function WorkshopDetailsMainPanel({ workshop }: WorkshopDetailsMainPanelProps) {
  const [activeTab, setActiveTab] = useState<WorkshopDetailsTab>("services");

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <section className="rounded border-2 border-[#f5f5f5] bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#ffefe4] sm:size-16">
              <Wrench className="size-6 text-secondary sm:size-7" aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold wrap-break-words text-[#1a1a1a] sm:text-xl lg:text-2xl">{workshop.name}</h1>
              <div className="mt-2 flex flex-col gap-2 text-sm text-[#777] sm:mt-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <StarRating rating={workshop.rating} />
                  <span className="text-xs text-primary">({workshop.rating})</span>
                  <span className="text-sm text-[#999]">({workshop.reviewCount} تقييم)</span>
                </div>
                <span className="hidden text-[#ddd] sm:inline" aria-hidden="true">
                  |
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 shrink-0 text-secondary" aria-hidden="true" />
                  {workshop.location}
                </span>
                <span className="hidden text-[#ddd] sm:inline" aria-hidden="true">
                  |
                </span>
                <span>{workshop.distance}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:shrink-0 sm:flex-col sm:items-center sm:justify-start sm:gap-2">
            {workshop.isOpen ? <span className="rounded-full bg-[#4caf50] px-2.5 py-1 text-[11px] font-semibold text-white">● مفتوح الآن</span> : <span className="rounded-full bg-gray-400 px-2.5 py-1 text-[11px] font-semibold text-white">مغلق</span>}
            <p className="text-sm text-[#999]">يغلق الساعة {workshop.closesAt}</p>
          </div>
        </div>

        <hr className="my-4 border-[#e5e5e5]" />

        <div className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-4 sm:gap-4">
          <div className="px-1 text-center sm:px-2">
            <p className="text-base font-bold text-[#222] sm:text-xl">{workshop.completedRepairs.toLocaleString("ar-SA")}</p>
            <p className="mt-0.5 text-xs text-[#999]">إصلاح مكتمل</p>
          </div>
          <div className="px-1 text-center sm:border-e sm:border-[#f0f0f0] sm:px-2">
            <p className="text-base font-bold text-[#222] sm:text-xl">{workshop.responseTime}</p>
            <p className="mt-0.5 text-xs text-[#999]">وقت الاستجابة</p>
          </div>
          <div className="px-1 text-center sm:border-e sm:border-[#f0f0f0] sm:px-2">
            <p className="text-base font-bold text-[#222] sm:text-xl">{workshop.minPrice} ر.س</p>
            <p className="mt-0.5 text-xs text-[#999]">أدنى سعر</p>
          </div>
          <div className="px-1 text-center sm:border-e sm:border-[#f0f0f0] sm:px-2">
            <p className="text-base font-bold text-[#222] sm:text-xl">{workshop.deviceTypesCount} نوع</p>
            <p className="mt-0.5 text-xs text-[#999]">أنواع الأجهزة</p>
          </div>
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded border-2 border-[#f5f5f5] bg-white">
        <div className="flex overflow-x-auto border-b border-[#e8e8e8] overscroll-x-contain" role="tablist" aria-label="أقسام الورشة">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 border-b-2 px-4 py-3 text-center text-xs whitespace-nowrap transition sm:min-w-45.5 sm:flex-1 ${
                  isActive ? "border-secondary font-bold text-secondary" : "border-transparent font-medium text-[#525252] hover:text-primary"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-6" role="tabpanel">
          {activeTab === "services" ? <WorkshopServicesTab workshop={workshop} /> : null}
          {activeTab === "spare-parts" ? <WorkshopSparePartsTab workshop={workshop} /> : null}
          {activeTab === "location" ? (
            <div className="rounded-lg border border-primary/10 bg-primary-light/30 px-6 py-8">
              <p className="text-sm font-medium text-primary">عنوان الورشة</p>
              <p className="mt-2 flex items-start gap-2 text-sm text-gray-700">
                <MapPin className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden="true" />
                <span>{workshop.location}</span>
              </p>
            </div>
          ) : null}
          {activeTab === "reviews" ? <WorkshopReviewsTab workshop={workshop} /> : null}
        </div>
      </section>
    </div>
  );
}
