import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { Check, ChevronDown, LocateFixed, MapPin, Search } from "lucide-react";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useGetAllServicesQuery, useGetProductsAllQuery, useLazySearchShopsMapQuery } from "../../auth/authApi";
import type { AuthValidationErrorResponse, MapShopSearchProduct, MapShopSearchResult, Product, Service } from "../../../types/authTypes";

const DEFAULT_LAT = 31.9539;
const DEFAULT_LNG = 35.9106;
const EMPTY_PRODUCTS: Product[] = [];
const EMPTY_SERVICES: Service[] = [];
const EMPTY_SHOPS: MapShopSearchResult[] = [];

type Coordinates = {
  lat: number;
  lng: number;
};

type LocationStatus = "idle" | "loading" | "ready" | "denied" | "unsupported";

type SelectOption = {
  id: number | string;
  name: string;
};

// Leaflet default marker paths break under Vite unless configured explicitly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const shopMarkerIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#ea580c;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -10],
});

function MapViewportSync({ lat, lng, enabled }: { lat: number; lng: number; enabled: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;
    map.setView({ lat, lng }, map.getZoom(), { animate: true });
    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [enabled, lat, lng, map]);

  return null;
}

function MapClickPicker({ onPick }: { onPick: (coords: Coordinates) => void }) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}

function FitShopMarkers({ shops, center }: { shops: MapShopSearchResult[]; center: Coordinates }) {
  const map = useMap();

  useEffect(() => {
    const points: L.LatLngExpression[] = [[center.lat, center.lng]];

    for (const shop of shops) {
      if (shop.latitude != null && shop.longitude != null) {
        points.push([shop.latitude, shop.longitude]);
      }
    }

    if (points.length <= 1) return;

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14, animate: true });
  }, [center.lat, center.lng, map, shops]);

  return null;
}

function matchesSearch(label: string, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return label.toLowerCase().includes(q);
}

function formatDistance(distance: number | null) {
  if (distance == null || !Number.isFinite(distance)) return null;
  if (distance < 1) return `${Math.round(distance * 1000)} م`;
  return `${distance.toFixed(1)} كم`;
}

function formatProductPrice(price: string) {
  const trimmed = price.trim();
  if (!trimmed) return "—";
  const numeric = Number(trimmed);
  if (Number.isFinite(numeric)) {
    return `${numeric.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₪`;
  }
  return `${trimmed} ₪`;
}

function formatProductStatus(status: string) {
  const value = status.trim().toLowerCase();
  if (!value) return { label: "—", className: "bg-gray-100 text-gray-600" };
  if (value === "available" || value === "متوفر" || value === "in_stock") {
    return { label: "متوفر", className: "bg-emerald-50 text-emerald-700" };
  }
  if (value === "unavailable" || value === "غير متوفر" || value === "out_of_stock") {
    return { label: "غير متوفر", className: "bg-red-50 text-red-700" };
  }
  return { label: status.trim(), className: "bg-primary-light text-primary" };
}

function ShopProductDetails({ product }: { product: MapShopSearchProduct }) {
  const status = formatProductStatus(product.status);

  return (
    <div className="mt-2 space-y-1.5 rounded-lg bg-primary-light/50 px-2.5 py-2">
      <p className="text-xs font-semibold text-primary">{product.name}</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        <p className="text-gray-500">
          السعر: <span className="font-medium text-primary">{formatProductPrice(product.price)}</span>
        </p>
        <p className="text-gray-500">
          الكمية: <span className="font-medium text-primary">{product.quantity ?? "—"}</span>
        </p>
        <p className="col-span-2 flex items-center gap-1.5 text-gray-500">
          الحالة:
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}>{status.label}</span>
        </p>
      </div>
    </div>
  );
}

function SearchableSelect({
  value,
  onChange,
  options,
  isLoading,
  isError,
  placeholder,
  searchPlaceholder,
  listLabel,
  loadingLabel,
  errorLabel,
  disabled,
}: {
  value: SelectOption | null;
  onChange: (option: SelectOption | null) => void;
  options: SelectOption[];
  isLoading: boolean;
  isError: boolean;
  placeholder: string;
  searchPlaceholder: string;
  listLabel: string;
  loadingLabel: string;
  errorLabel: string;
  disabled?: boolean;
}) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = useMemo(() => options.filter((option) => matchesSearch(option.name, searchQuery)), [options, searchQuery]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setSearchQuery("");
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      searchInputRef.current?.focus();
    }
  }, [open]);

  return (
    <div ref={rootRef} className={`relative min-w-0 ${open ? "z-1200" : "z-10"} ${disabled ? "opacity-55" : ""}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-primary transition hover:border-primary/30 focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/20 disabled:cursor-not-allowed"
      >
        <span className={`min-w-0 truncate text-start ${value ? "text-primary" : "text-gray-400"}`}>{value?.name ?? placeholder}</span>
        <ChevronDown className={`size-4 shrink-0 text-gray-400 transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && !disabled ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.35rem)] z-1200 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-2">
            <div className="flex items-center gap-2 rounded-md border border-gray-200 px-2.5 py-2 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20">
              <Search className="size-3.5 shrink-0 text-gray-400" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-gray-400"
                aria-label={`بحث داخل ${listLabel}`}
              />
            </div>
          </div>

          <div id={listboxId} role="listbox" aria-label={listLabel} className="max-h-56 min-h-20 overflow-y-auto py-1">
            {isLoading ? (
              <p className="px-3 py-3 text-sm text-gray-500" role="status">
                {loadingLabel}
              </p>
            ) : isError ? (
              <p className="px-3 py-3 text-sm text-red-600" role="alert">
                {errorLabel}
              </p>
            ) : filteredOptions.length === 0 ? (
              <p className="px-3 py-3 text-sm text-gray-500">{options.length === 0 ? "لا توجد خيارات متاحة" : "لا نتائج مطابقة"}</p>
            ) : (
              filteredOptions.map((option) => {
                const selected = value != null && String(value.id) === String(option.id);
                return (
                  <button
                    key={String(option.id)}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(option);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-start text-sm transition hover:bg-primary-light/60 ${selected ? "bg-primary-light/80 font-medium text-primary" : "text-gray-700"}`}
                  >
                    <span className="min-w-0 truncate">{option.name}</span>
                    {selected ? <Check className="size-4 shrink-0 text-secondary" aria-hidden="true" /> : null}
                  </button>
                );
              })
            )}
          </div>

          {value ? (
            <div className="border-t border-gray-100 p-2">
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                  setSearchQuery("");
                }}
                className="w-full rounded-md px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-primary"
              >
                مسح الاختيار
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function WorkshopsMapSearch() {
  const [center, setCenter] = useState<Coordinates>({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [hasPickedLocation, setHasPickedLocation] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const { data: servicesData, isLoading: isServicesLoading, isError: isServicesError, isFetching: isServicesFetching } = useGetAllServicesQuery();
  const { data: productsData, isLoading: isProductsLoading, isError: isProductsError, isFetching: isProductsFetching } = useGetProductsAllQuery();
  const [triggerSearch, { data: shopsData, isFetching: isSearching, isError: isSearchError, error: searchError }] = useLazySearchShopsMapQuery();

  const services = servicesData?.data ?? EMPTY_SERVICES;
  const products = productsData?.data ?? EMPTY_PRODUCTS;
  const shops = shopsData ?? EMPTY_SHOPS;

  const applyCoordinates = useCallback((coords: Coordinates) => {
    setCenter(coords);
    setHasPickedLocation(true);
    setStatus("ready");
  }, []);

  const requestDeviceLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      return;
    }

    setStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (result) => {
        applyCoordinates({
          lat: result.coords.latitude,
          lng: result.coords.longitude,
        });
      },
      () => {
        setStatus("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [applyCoordinates]);

  const handleSelectService = (option: SelectOption | null) => {
    setSelectedService(option as Service | null);
    if (option) setSelectedProduct(null);
    setFormError("");
  };

  const handleSelectProduct = (option: SelectOption | null) => {
    setSelectedProduct(option as Product | null);
    if (option) setSelectedService(null);
    setFormError("");
  };

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    if (!selectedService && !selectedProduct) {
      setFormError("يجب تحديد خدمة أو قطعة غيار للبحث.");
      return;
    }

    if (selectedService && selectedProduct) {
      setFormError("يمكن البحث عن خدمة أو قطعة غيار وليس الاثنين معًا.");
      return;
    }

    const serviceId = selectedService != null ? Number(selectedService.id) : null;
    const productId = selectedProduct != null ? Number(selectedProduct.id) : null;

    if (selectedService && !Number.isFinite(serviceId)) {
      setFormError("معرّف الخدمة غير صالح.");
      return;
    }

    if (selectedProduct && !Number.isFinite(productId)) {
      setFormError("معرّف قطعة الغيار غير صالح.");
      return;
    }

    try {
      setHasSearched(true);
      await triggerSearch({
        latitude: center.lat,
        longitude: center.lng,
        service_id: serviceId,
        product_id: productId,
      }).unwrap();
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      const searchMessage = errorData?.errors?.search?.[0];
      setFormError(searchMessage || errorData?.message || "تعذر البحث عن الورش، حاول مرة أخرى.");
    }
  };

  const apiErrorMessage = useMemo(() => {
    if (!isSearchError || formError) return "";
    const errorData = (searchError as { data?: AuthValidationErrorResponse } | undefined)?.data;
    return errorData?.errors?.search?.[0] || errorData?.message || "تعذر البحث عن الورش.";
  }, [formError, isSearchError, searchError]);

  const hint = useMemo(() => {
    if (status === "loading") return "جاري تحديد موقعك الحالي...";
    if (status === "denied") return "تعذر الوصول لموقعك. يمكنك النقر على الخريطة لتحديد موقعك يدوياً.";
    if (status === "unsupported") return "المتصفح لا يدعم تحديد الموقع. انقر على الخريطة لتحديد موقعك يدوياً.";
    if (hasPickedLocation) return "حرّك الدبوس إن لزم، ثم اختر خدمة أو قطعة غيار واضغط بحث.";
    return "يرجى الضغط على «استخدام موقعي» لنظهر لك أفضل الورش القريبة منك.";
  }, [hasPickedLocation, status]);

  const shopsWithCoords = shops.filter((shop) => shop.latitude != null && shop.longitude != null);
  const showLocationPrompt = !hasPickedLocation && status !== "loading";

  return (
    <section className="mx-auto max-w-7xl px-4 pb-2 sm:px-6 lg:px-8" aria-labelledby="workshops-map-search-title">
      <div className="rounded-xl border border-primary/10 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-primary/10 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="size-5 shrink-0 text-secondary" aria-hidden="true" />
              <h2 id="workshops-map-search-title" className="text-base font-bold text-primary sm:text-lg">
                ابحث عبر الخريطة
              </h2>
            </div>
            <p className="mt-1 text-sm text-gray-600">{hint}</p>
          </div>

          <button
            type="button"
            onClick={requestDeviceLocation}
            disabled={status === "loading"}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-secondary/25 transition hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LocateFixed className="size-4 shrink-0" aria-hidden="true" />
            {status === "loading" ? "جاري التحديد..." : "استخدام موقعي"}
          </button>
        </div>

        <div className="relative z-0 h-72 w-full overflow-hidden sm:h-96">
          <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full z-0" aria-label="خريطة البحث عن الورش">
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapViewportSync lat={center.lat} lng={center.lng} enabled={shopsWithCoords.length === 0} />
            <FitShopMarkers shops={shopsWithCoords} center={center} />
            <MapClickPicker onPick={applyCoordinates} />
            <Marker
              position={[center.lat, center.lng]}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const { lat, lng } = event.target.getLatLng();
                  applyCoordinates({ lat, lng });
                },
              }}
            >
              <Popup>موقع البحث</Popup>
            </Marker>

            {shopsWithCoords.map((shop) => (
              <Marker key={shop.id} position={[shop.latitude as number, shop.longitude as number]} icon={shopMarkerIcon}>
                <Tooltip direction="top" offset={[0, -8]} opacity={1} className="workshop-map-shop-tooltip">
                  <div className="min-w-40 text-sm" dir="rtl">
                    <p className="font-bold text-primary">{shop.shop_name}</p>
                    {formatDistance(shop.distance) ? <p className="mt-0.5 text-[11px] text-secondary">{formatDistance(shop.distance)}</p> : null}
                    {shop.product ? <ShopProductDetails product={shop.product} /> : null}
                    <Link to={`/workshops/${shop.id}`} className="mt-2 inline-block text-[11px] font-semibold text-secondary hover:underline">
                      عرض الورشة
                    </Link>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>

          {showLocationPrompt ? (
            <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-3">
              <p className="max-w-md rounded-lg bg-white/95 px-4 py-2.5 text-center text-sm font-medium leading-relaxed text-primary shadow-md ring-1 ring-primary/10">يرجى الضغط على «استخدام موقعي» لنظهر لك أفضل الورش القريبة منك</p>
            </div>
          ) : null}

          {status === "loading" || isSearching ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/55">
              <p className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm">{isSearching ? "جاري البحث عن الورش..." : "جاري تحديد موقعك..."}</p>
            </div>
          ) : null}
        </div>

        <form className="relative z-1100 border-t border-primary/10 px-4 py-4 sm:px-5" onSubmit={handleSearch}>
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-primary">الخدمة</label>
              <SearchableSelect
                value={selectedService}
                onChange={handleSelectService}
                options={services}
                isLoading={isServicesLoading || isServicesFetching}
                isError={isServicesError}
                disabled={selectedProduct != null}
                placeholder="اختر خدمة..."
                searchPlaceholder="ابحث عن خدمة..."
                listLabel="الخدمات"
                loadingLabel="جاري تحميل الخدمات..."
                errorLabel="تعذر تحميل الخدمات"
              />
            </div>

            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-primary">قطعة الغيار</label>
              <SearchableSelect
                value={selectedProduct}
                onChange={handleSelectProduct}
                options={products}
                isLoading={isProductsLoading || isProductsFetching}
                isError={isProductsError}
                disabled={selectedService != null}
                placeholder="اختر قطعة غيار..."
                searchPlaceholder="ابحث عن قطعة غيار..."
                listLabel="قطع الغيار"
                loadingLabel="جاري تحميل قطع الغيار..."
                errorLabel="تعذر تحميل قطع الغيار"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="inline-flex h-10.5 shrink-0 items-center justify-center gap-2 rounded-lg bg-secondary px-5 text-sm font-semibold text-white transition hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search className="size-4 shrink-0" aria-hidden="true" />
              {isSearching ? "جاري البحث..." : "بحث"}
            </button>
          </div>

          {formError || apiErrorMessage ? (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {formError || apiErrorMessage}
            </p>
          ) : null}

          <p className="mt-2 text-xs text-gray-400">اختر خدمة أو قطعة غيار واحدة فقط مع موقعك على الخريطة.</p>
        </form>

        {hasSearched && !isSearching && !formError && !apiErrorMessage ? (
          <div className="border-t border-primary/10 px-4 py-4 sm:px-5">
            {shops.length === 0 ? (
              <p className="text-sm text-gray-500">لا توجد ورش مطابقة ضمن النطاق المتاح.</p>
            ) : (
              <ul className="space-y-2">
                <li className="mb-1 text-sm font-medium text-primary">{shops.length} ورشة مطابقة</li>
                {shops.map((shop) => (
                  <li key={shop.id}>
                    <Link to={`/workshops/${shop.id}`} className="block rounded-lg border border-gray-100 px-3 py-2.5 transition hover:border-secondary/40 hover:bg-primary-light/40">
                      <div className="flex items-center justify-between gap-3">
                        <span className="min-w-0 truncate text-sm font-medium text-primary">{shop.shop_name}</span>
                        <span className="shrink-0 text-xs text-secondary">{formatDistance(shop.distance) || shop.city || "—"}</span>
                      </div>
                      {shop.product ? <ShopProductDetails product={shop.product} /> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
