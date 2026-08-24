import { useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import { mockWorkshops } from "../data/workshops.mock";
import { WorkshopCard } from "./WorkshopCard";

const sortOptions = ["التقييمات", "السعر", "المسافة", "التقييم"] as const;

export function WorkshopsResultsSection() {
  const [activeSort, setActiveSort] = useState<(typeof sortOptions)[number]>("التقييمات");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const totalWorkshops = mockWorkshops.length;

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-primary">{totalWorkshops} ورشة</span>
          <span className="mx-1 text-gray-400">·</span>
          في كل المدن
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">ترتيب حسب:</span>
            <div className="flex flex-wrap gap-1">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setActiveSort(option)}
                  className={`rounded-md px-3 py-1.5 text-xs transition ${
                    activeSort === option
                      ? "bg-primary text-white"
                      : "border border-gray-200 text-gray-600 hover:border-primary/30"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex overflow-hidden rounded-md border border-gray-200">
            <button
              type="button"
              aria-label="عرض شبكي"
              onClick={() => setViewMode("grid")}
              className={`flex h-8 w-9 items-center justify-center transition ${
                viewMode === "grid" ? "bg-primary text-white" : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              aria-label="عرض قائمة"
              onClick={() => setViewMode("list")}
              className={`flex h-8 w-9 items-center justify-center border-s border-gray-200 transition ${
                viewMode === "list" ? "bg-primary text-white" : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
            : "flex flex-col gap-4"
        }
      >
        {mockWorkshops.map((workshop) => (
          <WorkshopCard key={workshop.id} workshop={workshop} />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          عرض {totalWorkshops} من {totalWorkshops} ورشة
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="الصفحة السابقة"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition ${
                currentPage === page
                  ? "bg-primary text-white"
                  : "border border-gray-200 text-gray-600 hover:border-primary/30"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            aria-label="الصفحة التالية"
            disabled={currentPage === 3}
            onClick={() => setCurrentPage((page) => Math.min(3, page + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
