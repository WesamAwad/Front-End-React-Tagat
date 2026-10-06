import { useId, useState, type FormEvent, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from "lucide-react";
import { useGetCitiesAllQuery, useGetAllServicesQuery, useGetProductsAllQuery } from "../../auth/authApi";
import type { GetAllPublicShopsParams } from "../../../types/authTypes";

export type WorkshopsUiFilters = GetAllPublicShopsParams & {
  verified_only?: boolean;
};

type WorkshopsFiltersSidebarProps = {
  compact?: boolean;
  showHeader?: boolean;
  className?: string;
  filters: WorkshopsUiFilters;
  onFiltersChange: (filters: WorkshopsUiFilters) => void;
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

function FilterCheckbox({ label, checked, onChange }: { label: string; checked?: boolean; onChange?: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 py-1.5 text-sm text-gray-600">
      <span className="min-w-0 truncate">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange?.(event.target.checked)} className="size-4 shrink-0 rounded border-gray-300 text-secondary focus:ring-secondary" />
    </label>
  );
}

function FilterListSearch({ value, onChange, placeholder, label }: { value: string; onChange: (value: string) => void; placeholder: string; label: string }) {
  const inputId = useId();

  return (
    <div className="relative mb-2">
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <Search className="pointer-events-none absolute inset-e-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-white py-2 pe-8 ps-3 text-xs text-primary outline-none transition placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
      />
    </div>
  );
}

function matchesSearch(label: string, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return label.toLowerCase().includes(q);
}

const ratingOptions: { label: string; value: number | null }[] = [
  { label: "الكل", value: null },
  { label: "3+", value: 3 },
  { label: "3.5+", value: 3.5 },
  { label: "4+", value: 4 },
  { label: "4.5+", value: 4.5 },
];

const EMPTY_CITIES: never[] = [];
const EMPTY_SERVICES: never[] = [];
const EMPTY_PRODUCTS: never[] = [];

function parsePriceInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

export function WorkshopsFiltersSidebar({ compact = false, showHeader = true, className = "", filters, onFiltersChange }: WorkshopsFiltersSidebarProps) {
  const [cityQuery, setCityQuery] = useState("");
  const [serviceQuery, setServiceQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [priceDraft, setPriceDraft] = useState(() => (filters.price != null ? String(filters.price) : ""));

  const { data: citiesData, isLoading: isCitiesLoading, isError: isCitiesError, isFetching: isCitiesFetching } = useGetCitiesAllQuery();
  const { data: servicesData, isLoading: isServicesLoading, isError: isServicesError, isFetching: isServicesFetching } = useGetAllServicesQuery();
  const { data: productsData, isLoading: isProductsLoading, isError: isProductsError, isFetching: isProductsFetching } = useGetProductsAllQuery();

  const cities = citiesData?.data ?? EMPTY_CITIES;
  const services = servicesData?.data ?? EMPTY_SERVICES;
  const products = productsData?.data ?? EMPTY_PRODUCTS;

  const filteredCities = cities.filter((city) => matchesSearch(city.name, cityQuery));
  const filteredServices = services.filter((service) => matchesSearch(service.name, serviceQuery));
  const filteredProducts = products.filter((product) => matchesSearch(product.name, productQuery));

  const openOnly = filters.status === "open";
  const committedPriceDraft = filters.price != null ? String(filters.price) : "";
  const canApplyPrice = priceDraft.trim() !== committedPriceDraft;

  const patchFilters = (patch: Partial<WorkshopsUiFilters>) => {
    onFiltersChange({ ...filters, ...patch });
  };

  const applyPriceFilter = () => {
    if (!canApplyPrice) return;
    patchFilters({ price: parsePriceInput(priceDraft) });
  };

  const clearPriceFilter = () => {
    setPriceDraft("");
    if (filters.price != null) patchFilters({ price: null });
  };

  const onPriceFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyPriceFilter();
  };

  const selectExclusive = (key: "city_name" | "service_id" | "product_name", value: string | number, enabled: boolean) => {
    patchFilters({ [key]: enabled ? value : null });
  };

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
          <FilterCheckbox label="مفتوح الآن فقط" checked={openOnly} onChange={(checked) => patchFilters({ status: checked ? "open" : null })} />
          <FilterCheckbox label="ورش موثّقة فقط" checked={Boolean(filters.verified_only)} onChange={(checked) => patchFilters({ verified_only: checked })} />
        </div>

        <FilterAccordion title="المدينة" defaultOpen={!compact}>
          {isCitiesLoading || isCitiesFetching ? (
            <p className="py-1 text-xs text-gray-500" role="status">
              جاري تحميل المدن...
            </p>
          ) : null}

          {isCitiesError ? (
            <p className="py-1 text-xs text-red-600" role="alert">
              تعذر تحميل المدن
            </p>
          ) : null}

          {!isCitiesLoading && !isCitiesError && cities.length === 0 ? <p className="py-1 text-xs text-gray-500">لا توجد مدن متاحة</p> : null}

          {!isCitiesError && cities.length > 0 ? (
            <>
              <FilterListSearch value={cityQuery} onChange={setCityQuery} placeholder="ابحث عن مدينة..." label="بحث المدن" />
              {filteredCities.length === 0 ? (
                <p className="py-1 text-xs text-gray-500">لا نتائج مطابقة</p>
              ) : (
                <div className={`space-y-0.5 ${compact ? "" : "max-h-48 overflow-y-auto"}`}>
                  {filteredCities.map((city) => {
                    const cityName = city.name.trim();
                    return <FilterCheckbox key={String(city.id)} label={cityName} checked={filters.city_name === cityName} onChange={(checked) => selectExclusive("city_name", cityName, checked)} />;
                  })}
                </div>
              )}
            </>
          ) : null}
        </FilterAccordion>

        <FilterAccordion title="الخدمة" defaultOpen={!compact}>
          {isServicesLoading || isServicesFetching ? (
            <p className="py-1 text-xs text-gray-500" role="status">
              جاري تحميل الخدمات...
            </p>
          ) : null}

          {isServicesError ? (
            <p className="py-1 text-xs text-red-600" role="alert">
              تعذر تحميل الخدمات
            </p>
          ) : null}

          {!isServicesLoading && !isServicesError && services.length === 0 ? <p className="py-1 text-xs text-gray-500">لا توجد خدمات متاحة</p> : null}

          {!isServicesError && services.length > 0 ? (
            <>
              <FilterListSearch value={serviceQuery} onChange={setServiceQuery} placeholder="ابحث عن خدمة..." label="بحث الخدمات" />
              {filteredServices.length === 0 ? (
                <p className="py-1 text-xs text-gray-500">لا نتائج مطابقة</p>
              ) : (
                <div className={`space-y-0.5 ${compact ? "" : "max-h-48 overflow-y-auto"}`}>
                  {filteredServices.map((service) => {
                    const serviceId = Number(service.id);
                    return <FilterCheckbox key={String(service.id)} label={service.name} checked={filters.service_id === serviceId} onChange={(checked) => selectExclusive("service_id", serviceId, checked)} />;
                  })}
                </div>
              )}
            </>
          ) : null}
        </FilterAccordion>

        <FilterAccordion title="قطع الغيار المتوفرة" defaultOpen={!compact}>
          {isProductsLoading || isProductsFetching ? (
            <p className="py-1 text-xs text-gray-500" role="status">
              جاري تحميل قطع الغيار...
            </p>
          ) : null}

          {isProductsError ? (
            <p className="py-1 text-xs text-red-600" role="alert">
              تعذر تحميل قطع الغيار
            </p>
          ) : null}

          {!isProductsLoading && !isProductsError && products.length === 0 ? <p className="py-1 text-xs text-gray-500">لا توجد قطع غيار متاحة</p> : null}

          {!isProductsError && products.length > 0 ? (
            <>
              <FilterListSearch value={productQuery} onChange={setProductQuery} placeholder="ابحث عن قطعة غيار..." label="بحث قطع الغيار" />
              {filteredProducts.length === 0 ? (
                <p className="py-1 text-xs text-gray-500">لا نتائج مطابقة</p>
              ) : (
                <div className={`space-y-0.5 ${compact ? "" : "max-h-48 overflow-y-auto"}`}>
                  {filteredProducts.map((product) => {
                    const productName = product.name.trim();
                    return <FilterCheckbox key={String(product.id)} label={productName} checked={filters.product_name === productName} onChange={(checked) => selectExclusive("product_name", productName, checked)} />;
                  })}
                </div>
              )}
            </>
          ) : null}
        </FilterAccordion>

        <FilterAccordion title="الحد الأدنى للتقييم" defaultOpen={!compact}>
          <div className="flex flex-wrap gap-2" role="group" aria-label="الحد الأدنى للتقييم">
            {ratingOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => patchFilters({ rating: option.value })}
                aria-pressed={filters.rating === option.value || (option.value == null && filters.rating == null)}
                className={`rounded-md px-3 py-1.5 text-xs transition ${(filters.rating ?? null) === option.value ? "bg-primary text-white" : "border border-gray-200 text-gray-600 hover:border-primary/30"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FilterAccordion>

        <FilterAccordion title="السعر" defaultOpen={!compact}>
          <form className="space-y-2" onSubmit={onPriceFormSubmit}>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="workshops-price" className="text-xs text-gray-500">
                أدخل السعر (₪)
              </label>
              {filters.price != null || priceDraft.trim() !== "" ? (
                <button type="button" onClick={clearPriceFilter} className="text-[11px] text-secondary hover:underline">
                  إلغاء
                </button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <input
                id="workshops-price"
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                placeholder="مثال: 150"
                value={priceDraft}
                onChange={(event) => setPriceDraft(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-primary outline-none transition placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
              <button type="submit" disabled={!canApplyPrice} className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">
                بحث
              </button>
            </div>
          </form>
        </FilterAccordion>
      </div>
    </aside>
  );
}
