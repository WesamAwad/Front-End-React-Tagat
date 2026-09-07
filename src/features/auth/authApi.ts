import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ClientLoginRequest,
  ClientLoginResponse,
  ClientLogoutResponse,
  ClientRegisterRequest,
  ClientRegisterResponse,
  Country,
  City,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  GetAllCountriesResponse,
  GetAllCitiesResponse,
  GetAllServicesResponse,
  GetCategoriesForSelectResponse,
  GetBrandsForSelectResponse,
  GetBrandDetailsResponse,
  GetCategoryDetailsResponse,
  GetAllDeviceModelsResponse,
  GetAllProductsResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  Service,
  Category,
  Brand,
  BrandDevice,
  BrandDetails,
  DeviceModel,
  Product,
  CategoryProduct,
  CategoryDetails,
  ShopProfileData,
  ShopProfileSaveOrUpdateResponse,
  ShopProfileService,
  ShopProfileWorkingHour,
  GetShopProfileResponse,
  UpdateShopStatusResponse,
  StoreShopProductResponse,
  UpdateShopProductResponse,
  DeleteShopProductResponse,
  ShopProduct,
  GetAllShopProductsResponse,
  PublicShop,
  GetAllPublicShopsResponse,
  PublicShopDetails,
  PublicShopDetailsService,
  PublicShopDetailsProduct,
  GetPublicShopDetailsResponse,
  AddFavoriteShopResponse,
  RemoveFavoriteShopResponse,
  FavoriteShop,
  FavoriteShopService,
  GetMyFavoritesResponse,
  WorkshopRegisterResponse,
  ShopOwnerVerificationRequest,
  ShopOwnerVerificationStatus,
  GetShopOwnerVerificationDataResponse,
} from "../../types/authTypes";
/** Start Mock API */
import { mockLogin, mockLogout } from "./authMock";

const useMock = import.meta.env.VITE_USE_AUTH_MOCK === "true";

/** رابط ملفات/صور السيرفر — غيّره من .env عبر VITE_MEDIA_BASE_URL */
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL?.replace(/\/+$/, "") || import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") || "";

function resolveMediaPath(path: string | null | undefined): string {
  if (path == null || path === "") return "";

  const normalizedPath = String(path).replace(/^\/+/, "");
  if (normalizedPath.startsWith("http://") || normalizedPath.startsWith("https://") || normalizedPath.startsWith("blob:") || normalizedPath.startsWith("data:")) {
    return normalizedPath;
  }

  if (!MEDIA_BASE_URL) return normalizedPath;
  return `${MEDIA_BASE_URL}/${normalizedPath}`;
}

function pickNestedName(value: unknown, keys: string[]): string {
  if (!value || typeof value !== "object") return "";

  const row = value as Record<string, unknown>;
  for (const key of keys) {
    if (row[key] != null && row[key] !== "") return String(row[key]);
  }

  return "";
}

function pickNestedId(value: unknown, fallback = ""): string {
  if (!value || typeof value !== "object") return fallback;

  const row = value as Record<string, unknown>;
  if (row.id != null) return String(row.id);
  if (row.code != null) return String(row.code);

  return fallback;
}

const submittedDeviceNames = new Map<string, string>();

function rememberSubmittedDeviceName(params: { shopProductId?: string | number | null; productId: string; deviceModelId: string; deviceModelName: string }) {
  const name = params.deviceModelName.trim();
  if (!name) return;

  if (params.shopProductId) {
    submittedDeviceNames.set(`id:${params.shopProductId}`, name);
  }

  if (params.productId && params.deviceModelId) {
    submittedDeviceNames.set(`product:${params.productId}:device:${params.deviceModelId}`, name);
  }
}

function resolveSubmittedDeviceName(shopProductId: string, productId: string, deviceModelId: string) {
  const byId = submittedDeviceNames.get(`id:${shopProductId}`);
  if (byId) return byId;

  if (productId && deviceModelId) {
    return submittedDeviceNames.get(`product:${productId}:device:${deviceModelId}`) ?? "";
  }

  return "";
}

function readShopProductDeviceFromFormData(formData: FormData) {
  return {
    productId: String(formData.get("product_id") ?? ""),
    deviceModelId: String(formData.get("device_model_id") ?? ""),
    deviceModelName: String(formData.get("device_model_name") ?? ""),
  };
}

function normalizeShopProductStatus(value: unknown): ShopProduct["status"] {
  const status = String(value ?? "available");
  return status === "out_of_stock" ? "out_of_stock" : "available";
}

function normalizeShopProduct(item: unknown): ShopProduct | null {
  if (!item || typeof item !== "object") return null;

  const row = item as Record<string, unknown>;
  const product = row.product ?? row.product_model;
  const category = row.category;
  const brand = row.brand ?? row.company;
  const productRecord = product && typeof product === "object" ? (product as Record<string, unknown>) : null;
  const deviceModelFromProduct = productRecord?.deviceModel ?? productRecord?.device_model;
  const deviceModelFromProductRecord = deviceModelFromProduct && typeof deviceModelFromProduct === "object" ? (deviceModelFromProduct as Record<string, unknown>) : null;
  const device = row.device ?? row.device_model ?? row.deviceModel ?? deviceModelFromProduct;
  const deviceRecord = device && typeof device === "object" ? (device as Record<string, unknown>) : null;
  const categoryFromProduct = productRecord?.category;
  const brandFromProduct = productRecord?.brand;
  const brandFromDevice = deviceRecord?.brand ?? deviceModelFromProductRecord?.brand;

  const id = String(row.id ?? row.shop_product_id ?? "");
  if (!id) return null;

  const productId = toIdString(row.product_id ?? pickNestedId(product));
  const productName = String(row.product_name ?? "") || pickNestedName(product, ["product_name", "name", "name_ar", "title"]) || pickNestedName(row, ["name"]);
  const companyId = toIdString(row.brand_id ?? row.company_id ?? pickNestedId(brand) ?? pickNestedId(brandFromProduct) ?? pickNestedId(brandFromDevice) ?? deviceRecord?.brand_id);
  const companyName =
    pickNestedName(brand, ["name", "name_ar", "brand_name", "title"]) ||
    pickNestedName(brandFromProduct, ["name", "name_ar", "brand_name", "title"]) ||
    pickNestedName(brandFromDevice, ["name", "name_ar", "brand_name", "title"]) ||
    pickNestedName(row, ["brand_name", "company_name"]);
  const categoryId = toIdString(row.category_id ?? pickNestedId(category) ?? pickNestedId(categoryFromProduct) ?? productRecord?.category_id);
  const categoryName = String(row.category_name ?? "") || pickNestedName(category, ["category_name", "name", "name_ar", "title"]) || pickNestedName(categoryFromProduct, ["category_name", "name", "name_ar", "title"]);
  const deviceModelId = toIdString(row.device_model_id ?? deviceModelFromProductRecord?.device_model_id ?? row.device_id ?? pickNestedId(deviceRecord) ?? pickNestedId(deviceModelFromProductRecord));
  const deviceModelName =
    String(row.device_model_name ?? "") ||
    String(deviceModelFromProductRecord?.device_model_name ?? "") ||
    pickNestedName(deviceRecord, ["device_model_name", "name", "name_ar", "title", "model_name", "device_name"]) ||
    pickNestedName(deviceModelFromProductRecord, ["device_model_name", "name", "name_ar", "title", "model_name", "device_name"]) ||
    (typeof productRecord?.device_model === "string" ? String(productRecord.device_model) : "") ||
    pickNestedName(row, ["device_name", "compatible_device", "device_model_name"]) ||
    resolveSubmittedDeviceName(id, productId, deviceModelId);

  return {
    id,
    company: companyId,
    companyName,
    product_id: productId,
    product_name: productName,
    category_id: categoryId,
    category_name: categoryName,
    device_model_id: deviceModelId,
    device_model_name: deviceModelName,
    description: String(row.description ?? ""),
    price: Number(row.price ?? 0),
    quantity: Number(row.quantity ?? row.qty ?? 0),
    image: resolveMediaPath(String(row.image ?? row.image_url ?? row.photo ?? "")),
    status: normalizeShopProductStatus(row.status),
  };
}

function normalizePublicShopServices(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();

        if (item && typeof item === "object") {
          const row = item as Record<string, unknown>;
          return String(row.name ?? row.service_name ?? row.title ?? "").trim();
        }

        return "";
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      return normalizePublicShopServices(JSON.parse(trimmed));
    } catch {
      return trimmed
        .split(/[,،]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function normalizePublicShop(item: unknown): PublicShop | null {
  if (!item || typeof item !== "object") return null;

  const row = item as Record<string, unknown>;
  const id = String(row.id ?? row.shop_id ?? "");
  if (!id) return null;

  const countryValue = row.country ?? row.country_name;
  const cityValue = row.city ?? row.city_name;

  return {
    id,
    shop_name: String(row.shop_name ?? row.name ?? ""),
    cover_image: resolveMediaPath(String(row.cover_image ?? row.image ?? row.cover ?? "")),
    country: typeof countryValue === "object" ? pickNestedName(countryValue, ["name", "name_ar", "country_name"]) : String(countryValue ?? row.country_name ?? "").trim(),
    city: typeof cityValue === "object" ? pickNestedName(cityValue, ["name", "name_ar", "city_name"]) : String(cityValue ?? row.city_name ?? "").trim(),
    district: String(row.district ?? "").trim(),
    street: String(row.street ?? "").trim(),
    status: String(row.status ?? ""),
    services: normalizePublicShopServices(row.services),
  };
}

function normalizePublicShopDetailsServices(value: unknown): PublicShopDetailsService[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index): PublicShopDetailsService | null => {
      if (typeof item === "string" || typeof item === "number") {
        const name = String(item).trim();
        if (!name) return null;
        return { id: `service-${index}`, name, priceMin: 0, priceMax: 0 };
      }

      if (!item || typeof item !== "object") return null;

      const row = item as Record<string, unknown>;
      const nested = row.service && typeof row.service === "object" ? (row.service as Record<string, unknown>) : null;
      const name = String(row.service_name ?? row.name ?? row.title ?? nested?.service_name ?? nested?.name ?? "").trim();
      if (!name) return null;

      const price = Number(row.price ?? row.service_price ?? nested?.price ?? 0);
      const priceMin = Number(row.price_min ?? row.min_price ?? (Number.isFinite(price) ? price : 0));
      const priceMax = Number(row.price_max ?? row.max_price ?? (Number.isFinite(price) ? price : 0));

      return {
        id: String(row.id ?? row.service_id ?? nested?.id ?? `service-${index}`),
        name,
        priceMin: Number.isFinite(priceMin) ? priceMin : 0,
        priceMax: Number.isFinite(priceMax) ? priceMax : 0,
      };
    })
    .filter((item): item is PublicShopDetailsService => item !== null);
}

function normalizePublicShopDetailsProducts(value: unknown): PublicShopDetailsProduct[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index): PublicShopDetailsProduct | null => {
      if (!item || typeof item !== "object") return null;

      const row = item as Record<string, unknown>;
      const product = row.product ?? row.product_model;
      const productRecord = product && typeof product === "object" ? (product as Record<string, unknown>) : null;
      const category = row.category ?? productRecord?.category;
      const categoryRecord = category && typeof category === "object" ? (category as Record<string, unknown>) : null;
      const device = row.device_model ?? row.deviceModel ?? row.device ?? productRecord?.device_model ?? productRecord?.deviceModel;
      const deviceRecord = device && typeof device === "object" ? (device as Record<string, unknown>) : null;
      const brand = row.brand ?? row.company ?? productRecord?.brand ?? deviceRecord?.brand;
      const brandRecord = brand && typeof brand === "object" ? (brand as Record<string, unknown>) : null;

      const id = String(row.shop_product_id ?? row.id ?? row.product_id ?? `product-${index}`);
      const name =
        String(row.product_name ?? "").trim() ||
        pickNestedName(productRecord, ["product_name", "name", "name_ar", "title"]) ||
        String(row.name ?? row.title ?? "").trim() ||
        "قطعة غيار";

      const brandName =
        pickNestedName(brandRecord, ["brand_name", "name", "name_ar", "title"]) ||
        String(row.brand_name ?? row.company_name ?? "").trim();
      const deviceName =
        pickNestedName(deviceRecord, ["device_model_name", "name", "name_ar", "title", "model_name", "device_name"]) ||
        String(row.device_model_name ?? row.device_name ?? "").trim();
      const categoryName =
        String(row.category_name ?? "").trim() ||
        pickNestedName(categoryRecord, ["category_name", "name", "name_ar", "title"]) ||
        String(productRecord?.category_name ?? "").trim();
      const subtitle =
        [brandName, deviceName, categoryName].filter(Boolean).join(" · ") || String(row.description ?? productRecord?.description ?? "").trim();

      const price = Number(row.price ?? row.product_price ?? productRecord?.price ?? 0);
      const status = String(row.status ?? "").trim().toLowerCase();
      const quantityRaw = Number(row.quantity ?? row.qty ?? 0);
      const quantity = Number.isFinite(quantityRaw) ? quantityRaw : 0;
      const isAvailable = !["out_of_stock", "unavailable", "غير متوفر", "0", "false"].includes(status);

      return {
        id,
        name,
        subtitle,
        price: Number.isFinite(price) ? price : 0,
        quantity,
        isAvailable,
        image: resolveMediaPath(String(row.image ?? row.image_url ?? row.photo ?? productRecord?.image ?? "")),
      };
    })
    .filter((item): item is PublicShopDetailsProduct => item !== null);
}

function extractPublicShopDetailsProductsSource(raw: Record<string, unknown>): unknown {
  const source = raw.products ?? raw.shop_products ?? raw.spare_parts;
  if (Array.isArray(source)) return source;

  if (source && typeof source === "object") {
    const nested = source as Record<string, unknown>;
    if (Array.isArray(nested.data)) return nested.data;
    if (Array.isArray(nested.products)) return nested.products;
  }

  const nestedData = raw.data;
  if (nestedData && typeof nestedData === "object" && !Array.isArray(nestedData)) {
    const nested = nestedData as Record<string, unknown>;
    return nested.products ?? nested.shop_products ?? nested.spare_parts;
  }

  return source;
}

function normalizePublicShopDetails(payload: unknown, shopId?: string | number): GetPublicShopDetailsResponse {
  const body = payload as { data?: unknown; shop?: unknown; message?: string } | null;
  const message = body && typeof body === "object" ? body.message : undefined;

  let raw: Record<string, unknown> | null = null;

  if (body && typeof body === "object") {
    if (Array.isArray(body.data)) {
      const list = body.data.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object");
      const matched =
        shopId != null && shopId !== ""
          ? list.find((item) => String(item.id ?? item.shop_id ?? "") === String(shopId))
          : undefined;
      raw = matched ?? list[0] ?? null;
    } else if (body.data && typeof body.data === "object") {
      raw = body.data as Record<string, unknown>;
    } else if (body.shop && typeof body.shop === "object" && !Array.isArray(body.shop)) {
      raw = body.shop as Record<string, unknown>;
    }
  }

  if (!raw) {
    return { message, data: null };
  }

  const id = String(raw.id ?? raw.shop_id ?? shopId ?? "");
  if (!id) {
    return { message, data: null };
  }

  const countryValue = raw.country ?? raw.country_name;
  const cityValue = raw.city ?? raw.city_name;

  const data: PublicShopDetails = {
    id,
    shop_name: String(raw.shop_name ?? raw.name ?? "").trim(),
    description: String(raw.description ?? raw.about ?? "").trim(),
    cover_image: resolveMediaPath(String(raw.cover_image ?? raw.image ?? raw.cover ?? "")),
    country:
      typeof countryValue === "object"
        ? pickNestedName(countryValue, ["name", "name_ar", "country_name"])
        : String(countryValue ?? "").trim(),
    city:
      typeof cityValue === "object"
        ? pickNestedName(cityValue, ["name", "name_ar", "city_name"])
        : String(cityValue ?? "").trim(),
    district: String(raw.district ?? "").trim(),
    street: String(raw.street ?? "").trim(),
    status: String(raw.status ?? "").trim(),
    latitude: String(raw.latitude ?? ""),
    longitude: String(raw.longitude ?? ""),
    services: normalizePublicShopDetailsServices(raw.services ?? raw.service_list),
    products: normalizePublicShopDetailsProducts(extractPublicShopDetailsProductsSource(raw)),
    working_hours: normalizeWorkingHours(raw.working_hours),
  };

  return { message, data };
}

function normalizePublicShops(payload: unknown): GetAllPublicShopsResponse {
  const body = payload as { data?: unknown; shops?: unknown; message?: string } | unknown[];

  const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : Array.isArray(body?.shops) ? body.shops : [];

  const data = list.map((item) => normalizePublicShop(item)).filter((item): item is PublicShop => item !== null);

  return {
    message: Array.isArray(body) ? undefined : body?.message,
    data,
  };
}

function normalizeFavoriteShopServices(value: unknown): FavoriteShopService[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const row = item as Record<string, unknown>;
      const serviceName = String(row.service_name ?? row.name ?? row.title ?? "").trim();
      const id = String(row.id ?? row.service_id ?? serviceName);
      if (!serviceName) return null;

      return { id, service_name: serviceName };
    })
    .filter((item): item is FavoriteShopService => item !== null);
}

function normalizeFavoriteShop(item: unknown): FavoriteShop | null {
  if (!item || typeof item !== "object") return null;

  const row = item as Record<string, unknown>;
  const shop = row.shop;
  const shopRecord = shop && typeof shop === "object" ? (shop as Record<string, unknown>) : null;
  const shopId = String(row.shop_id ?? shopRecord?.id ?? shopRecord?.shop_id ?? "");
  const recordId = String(row.id ?? "");
  const shopName = String(row.shop_name ?? shopRecord?.shop_name ?? shopRecord?.name ?? "").trim();

  if (!shopId && !recordId && !shopName) return null;

  const countryValue = row.country ?? row.country_name ?? shopRecord?.country ?? shopRecord?.country_name;
  const cityValue = row.city ?? row.city_name ?? shopRecord?.city ?? shopRecord?.city_name;

  return {
    id: recordId || shopId || shopName,
    shop_id: shopId,
    shop_name: shopName,
    description: String(row.description ?? shopRecord?.description ?? ""),
    cover_image: resolveMediaPath(String(row.cover_image ?? shopRecord?.cover_image ?? row.image ?? "")),
    country: typeof countryValue === "object" ? pickNestedName(countryValue, ["name", "name_ar", "country_name"]) : String(countryValue ?? "").trim(),
    city: typeof cityValue === "object" ? pickNestedName(cityValue, ["name", "name_ar", "city_name"]) : String(cityValue ?? "").trim(),
    district: String(row.district ?? shopRecord?.district ?? "").trim(),
    street: String(row.street ?? shopRecord?.street ?? "").trim(),
    working_hours: Array.isArray(row.working_hours) ? row.working_hours : Array.isArray(shopRecord?.working_hours) ? shopRecord.working_hours : [],
    services: normalizeFavoriteShopServices(row.services ?? shopRecord?.services),
  };
}

function normalizeMyFavorites(payload: unknown): GetMyFavoritesResponse {
  const body = payload as { favorites?: unknown; data?: unknown; message?: string } | unknown[];

  const list = Array.isArray(body)
    ? body
    : Array.isArray(body?.favorites)
      ? body.favorites
      : Array.isArray(body?.data)
        ? body.data
        : body?.data && typeof body.data === "object" && Array.isArray((body.data as { favorites?: unknown }).favorites)
          ? (body.data as { favorites: unknown[] }).favorites
          : [];

  const favorites = list.map((item) => normalizeFavoriteShop(item)).filter((item): item is FavoriteShop => item !== null);

  return {
    message: Array.isArray(body) ? undefined : body?.message,
    favorites,
  };
}

function normalizeShopProducts(payload: unknown): GetAllShopProductsResponse {
  const body = payload as { data?: unknown; shop_products?: unknown; products?: unknown; message?: string } | unknown[];

  const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : Array.isArray(body?.shop_products) ? body.shop_products : Array.isArray(body?.products) ? body.products : [];

  const data = list.map((item) => normalizeShopProduct(item)).filter((item): item is ShopProduct => item !== null);

  return {
    message: Array.isArray(body) ? undefined : body?.message,
    data,
  };
}

/** End Mock API */

function normalizeCountries(payload: unknown): GetAllCountriesResponse {
  const body = payload as { data?: unknown; countries?: unknown; message?: string } | unknown[];

  const list = Array.isArray(body) ? body : Array.isArray((body as { data?: unknown }).data) ? (body as { data: unknown[] }).data : Array.isArray((body as { countries?: unknown }).countries) ? (body as { countries: unknown[] }).countries : [];

  const data = list
    .map((item): Country | null => {
      if (typeof item === "string") {
        return { id: item, name: item, created_at: null, updated_at: null };
      }

      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        const name = String(row.name ?? row.name_ar ?? row.country_name ?? row.title ?? "");
        const id = (row.id ?? row.code ?? name) as number | string;
        if (!name) return null;
        return {
          id,
          name,
          created_at: row.created_at == null || row.created_at === "" ? null : String(row.created_at),
          updated_at: row.updated_at == null || row.updated_at === "" ? null : String(row.updated_at),
        };
      }

      return null;
    })
    .filter((item): item is Country => item !== null);

  return {
    message: Array.isArray(body) ? undefined : (body as { message?: string }).message,
    data,
  };
}

function normalizeCities(payload: unknown): GetAllCitiesResponse {
  const body = payload as { data?: unknown; cities?: unknown; message?: string } | unknown[];

  const list = Array.isArray(body) ? body : Array.isArray((body as { data?: unknown }).data) ? (body as { data: unknown[] }).data : Array.isArray((body as { cities?: unknown }).cities) ? (body as { cities: unknown[] }).cities : [];

  const data = list
    .map((item): City | null => {
      if (typeof item === "string") {
        return { id: item, name: item, country_id: null, country_name: null, created_at: null, updated_at: null };
      }

      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        const name = String(row.name ?? row.name_ar ?? row.city_name ?? row.title ?? "");
        const id = (row.id ?? row.code ?? name) as number | string;
        if (!name) return null;

        const countryObj = row.country && typeof row.country === "object" ? (row.country as Record<string, unknown>) : null;
        const country_id = (row.country_id ?? countryObj?.id ?? null) as number | string | null;
        const countryNameRaw = row.country_name ?? countryObj?.name ?? countryObj?.name_ar ?? null;
        const country_name = countryNameRaw == null || countryNameRaw === "" ? null : String(countryNameRaw);

        return {
          id,
          name,
          country_id,
          country_name,
          created_at: row.created_at == null || row.created_at === "" ? null : String(row.created_at),
          updated_at: row.updated_at == null || row.updated_at === "" ? null : String(row.updated_at),
        };
      }

      return null;
    })
    .filter((item): item is City => item !== null);

  return {
    message: Array.isArray(body) ? undefined : (body as { message?: string }).message,
    data,
  };
}

function normalizeServices(payload: unknown): GetAllServicesResponse {
  const body = payload as { data?: unknown; services?: unknown; message?: string } | unknown[];

  const list = Array.isArray(body) ? body : Array.isArray((body as { data?: unknown }).data) ? (body as { data: unknown[] }).data : Array.isArray((body as { services?: unknown }).services) ? (body as { services: unknown[] }).services : [];

  const data: Service[] = list
    .map((item) => {
      if (typeof item === "string") {
        return { id: item, name: item };
      }

      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        const name = String(row.name ?? row.name_ar ?? row.service_name ?? row.title ?? "");
        const id = (row.id ?? row.code ?? name) as number | string;
        if (!name) return null;
        return { id, name };
      }

      return null;
    })
    .filter((item): item is Service => item !== null);

  return {
    message: Array.isArray(body) ? undefined : (body as { message?: string }).message,
    data,
  };
}

function normalizeCategories(payload: unknown): GetCategoriesForSelectResponse {
  const body = payload as { data?: unknown; categories?: unknown; message?: string } | unknown[];

  const list = Array.isArray(body) ? body : Array.isArray((body as { data?: unknown }).data) ? (body as { data: unknown[] }).data : Array.isArray((body as { categories?: unknown }).categories) ? (body as { categories: unknown[] }).categories : [];

  const data = list
    .map((item): Category | null => {
      if (typeof item === "string") {
        return { id: item, name: item, created_at: null, updated_at: null };
      }

      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        const name = String(row.name ?? row.name_ar ?? row.category_name ?? row.title ?? "");
        const id = (row.id ?? row.code ?? name) as number | string;
        if (!name) return null;
        return {
          id,
          name,
          created_at: row.created_at == null || row.created_at === "" ? null : String(row.created_at),
          updated_at: row.updated_at == null || row.updated_at === "" ? null : String(row.updated_at),
        };
      }

      return null;
    })
    .filter((item): item is Category => item !== null);

  return {
    message: Array.isArray(body) ? undefined : (body as { message?: string }).message,
    data,
  };
}

function normalizeBrands(payload: unknown): GetBrandsForSelectResponse {
  const body = payload as { data?: unknown; brands?: unknown; message?: string } | unknown[];

  const list = Array.isArray(body) ? body : Array.isArray((body as { data?: unknown }).data) ? (body as { data: unknown[] }).data : Array.isArray((body as { brands?: unknown }).brands) ? (body as { brands: unknown[] }).brands : [];

  const data = list
    .map((item): Brand | null => {
      if (typeof item === "string") {
        return { id: item, name: item, created_at: null, updated_at: null };
      }

      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        const name = String(row.name ?? row.name_ar ?? row.brand_name ?? row.title ?? "");
        const id = (row.id ?? row.code ?? name) as number | string;
        if (!name) return null;
        return {
          id,
          name,
          created_at: row.created_at == null || row.created_at === "" ? null : String(row.created_at),
          updated_at: row.updated_at == null || row.updated_at === "" ? null : String(row.updated_at),
        };
      }

      return null;
    })
    .filter((item): item is Brand => item !== null);

  return {
    message: Array.isArray(body) ? undefined : (body as { message?: string }).message,
    data,
  };
}

function normalizeBrandDevices(value: unknown): BrandDevice[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") {
        return { id: item, name: item };
      }

      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        const name = String(row.device_model_name ?? row.name ?? row.name_ar ?? row.device_name ?? row.model_name ?? row.title ?? "");
        const id = (row.id ?? row.code ?? name) as number | string;
        if (!name) return null;
        return { id, name };
      }

      return null;
    })
    .filter((item): item is BrandDevice => item !== null);
}

function normalizeDeviceModels(payload: unknown): GetAllDeviceModelsResponse {
  const body = payload as { data?: unknown; device_models?: unknown; deviceModels?: unknown; models?: unknown; message?: string } | unknown[];

  const list = Array.isArray(body)
    ? body
    : Array.isArray((body as { data?: unknown }).data)
      ? (body as { data: unknown[] }).data
      : Array.isArray((body as { device_models?: unknown }).device_models)
        ? (body as { device_models: unknown[] }).device_models
        : Array.isArray((body as { deviceModels?: unknown }).deviceModels)
          ? (body as { deviceModels: unknown[] }).deviceModels
          : Array.isArray((body as { models?: unknown }).models)
            ? (body as { models: unknown[] }).models
            : [];

  const data = list
    .map((item): DeviceModel | null => {
      if (typeof item === "string") {
        return { id: item, name: item, brand_id: null, brand_name: null, created_at: null, updated_at: null };
      }

      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        const name = String(row.device_model_name ?? row.name ?? row.name_ar ?? row.device_name ?? row.model_name ?? row.title ?? "");
        const id = (row.id ?? row.code ?? name) as number | string;
        if (!name) return null;

        const brandObj = row.brand && typeof row.brand === "object" ? (row.brand as Record<string, unknown>) : null;
        const brand_id = (row.brand_id ?? brandObj?.id ?? null) as number | string | null;
        const brandNameRaw = row.brand_name ?? brandObj?.name ?? brandObj?.brand_name ?? brandObj?.name_ar ?? null;
        const brand_name = brandNameRaw == null || brandNameRaw === "" ? null : String(brandNameRaw);

        return {
          id,
          name,
          brand_id,
          brand_name,
          created_at: row.created_at == null || row.created_at === "" ? null : String(row.created_at),
          updated_at: row.updated_at == null || row.updated_at === "" ? null : String(row.updated_at),
        };
      }

      return null;
    })
    .filter((item): item is DeviceModel => item !== null);

  return {
    message: Array.isArray(body) ? undefined : (body as { message?: string }).message,
    data,
  };
}

function extractBrandDevicesFromPayload(payload: unknown): BrandDevice[] {
  if (!payload || typeof payload !== "object") return [];

  const body = payload as Record<string, unknown>;
  const deviceSources = [body.deviceModels, body.devices, body.device_list, body.models, body.products];

  for (const source of deviceSources) {
    const devices = normalizeBrandDevices(source);
    if (devices.length > 0) return devices;
  }

  if (body.data && typeof body.data === "object") {
    return extractBrandDevicesFromPayload(body.data);
  }

  if (body.brand && typeof body.brand === "object") {
    return extractBrandDevicesFromPayload(body.brand);
  }

  return [];
}

function normalizeBrandDetails(payload: unknown): GetBrandDetailsResponse {
  const body = payload as { data?: unknown; brand?: unknown; message?: string } | null;
  const raw = body && typeof body === "object" ? ((body.data as Record<string, unknown> | null | undefined) ?? (body.brand as Record<string, unknown> | null | undefined) ?? (body as Record<string, unknown>)) : null;

  const devices = extractBrandDevicesFromPayload(payload);

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      message: body && typeof body === "object" ? body.message : undefined,
      data: devices.length > 0 ? { id: "", name: "", devices } : null,
    };
  }

  const name = String(raw.name ?? raw.name_ar ?? raw.brand_name ?? raw.title ?? "");
  const id = (raw.id ?? raw.code ?? name) as number | string;

  if (!name && devices.length === 0) {
    return {
      message: body && typeof body === "object" ? body.message : undefined,
      data: null,
    };
  }

  const data: BrandDetails = {
    id,
    name,
    devices,
  };

  return {
    message: body && typeof body === "object" ? body.message : undefined,
    data,
  };
}

function normalizeProducts(payload: unknown): GetAllProductsResponse {
  const body = payload as { data?: unknown; products?: unknown; message?: string } | unknown[];

  const list = Array.isArray(body) ? body : Array.isArray((body as { data?: unknown }).data) ? (body as { data: unknown[] }).data : Array.isArray((body as { products?: unknown }).products) ? (body as { products: unknown[] }).products : [];

  const data = list
    .map((item): Product | null => {
      if (typeof item === "string") {
        return { id: item, name: item, category_id: null, category_name: null, created_at: null, updated_at: null };
      }

      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        const name = String(row.product_name ?? row.name ?? row.name_ar ?? row.title ?? "");
        const id = (row.id ?? row.code ?? name) as number | string;
        if (!name) return null;

        const categoryObj = row.category && typeof row.category === "object" ? (row.category as Record<string, unknown>) : null;
        const category_id = (row.category_id ?? categoryObj?.id ?? null) as number | string | null;
        const categoryNameRaw = row.category_name ?? categoryObj?.name ?? categoryObj?.category_name ?? categoryObj?.name_ar ?? null;
        const category_name = categoryNameRaw == null || categoryNameRaw === "" ? null : String(categoryNameRaw);

        return {
          id,
          name,
          category_id,
          category_name,
          created_at: row.created_at == null || row.created_at === "" ? null : String(row.created_at),
          updated_at: row.updated_at == null || row.updated_at === "" ? null : String(row.updated_at),
        };
      }

      return null;
    })
    .filter((item): item is Product => item !== null);

  return {
    message: Array.isArray(body) ? undefined : (body as { message?: string }).message,
    data,
  };
}

function normalizeCategoryProducts(value: unknown): CategoryProduct[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") {
        return { id: item, name: item };
      }

      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        const name = String(row.product_name ?? row.spare_part_name ?? row.part_name ?? row.name ?? row.name_ar ?? row.title ?? "");
        const id = (row.id ?? row.code ?? name) as number | string;
        if (!name) return null;
        return { id, name };
      }

      return null;
    })
    .filter((item): item is CategoryProduct => item !== null);
}

function extractCategoryProductsFromPayload(payload: unknown): CategoryProduct[] {
  if (!payload || typeof payload !== "object") return [];

  const body = payload as Record<string, unknown>;
  const productSources = [body.products, body.productModels, body.spareParts, body.spare_parts, body.items, body.parts];

  for (const source of productSources) {
    const products = normalizeCategoryProducts(source);
    if (products.length > 0) return products;
  }

  if (body.data && typeof body.data === "object") {
    return extractCategoryProductsFromPayload(body.data);
  }

  if (body.category && typeof body.category === "object") {
    return extractCategoryProductsFromPayload(body.category);
  }

  return [];
}

function normalizeCategoryDetails(payload: unknown): GetCategoryDetailsResponse {
  const body = payload as { data?: unknown; category?: unknown; message?: string } | null;
  const raw = body && typeof body === "object" ? ((body.data as Record<string, unknown> | null | undefined) ?? (body.category as Record<string, unknown> | null | undefined) ?? (body as Record<string, unknown>)) : null;

  const products = extractCategoryProductsFromPayload(payload);

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      message: body && typeof body === "object" ? body.message : undefined,
      data: products.length > 0 ? { id: "", name: "", products } : null,
    };
  }

  const name = String(raw.name ?? raw.name_ar ?? raw.category_name ?? raw.title ?? "");
  const id = (raw.id ?? raw.code ?? name) as number | string;

  if (!name && products.length === 0) {
    return {
      message: body && typeof body === "object" ? body.message : undefined,
      data: null,
    };
  }

  const data: CategoryDetails = {
    id,
    name,
    products,
  };

  return {
    message: body && typeof body === "object" ? body.message : undefined,
    data,
  };
}

function toIdString(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "object") {
    const row = value as Record<string, unknown>;
    if (row.id != null) return String(row.id);
  }
  return String(value);
}

function normalizeWorkingHours(value: unknown): ShopProfileWorkingHour[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const day = String(row.day ?? row.day_name ?? row.name ?? "").trim();
      const from = String(row.from ?? row.start ?? row.start_time ?? "").trim();
      const to = String(row.to ?? row.end ?? row.end_time ?? "").trim();
      if (!day) return null;
      return { day, from, to };
    })
    .filter((item): item is ShopProfileWorkingHour => item !== null);
}

function normalizeShopProfileServices(value: unknown): ShopProfileService[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "number" || typeof item === "string") {
        return { service_id: item, price: 0 };
      }

      if (!item || typeof item !== "object") return null;

      const row = item as Record<string, unknown>;
      const nestedService = row.service && typeof row.service === "object" ? (row.service as Record<string, unknown>) : null;
      const pivot = row.pivot && typeof row.pivot === "object" ? (row.pivot as Record<string, unknown>) : null;
      const serviceId = row.service_id ?? row.id ?? nestedService?.id ?? pivot?.service_id;

      if (serviceId == null) return null;

      const rawPrice = row.price ?? pivot?.price ?? 0;
      const price = Number(rawPrice);

      return {
        service_id: serviceId as string | number,
        price: Number.isFinite(price) ? price : 0,
      };
    })
    .filter((item): item is ShopProfileService => item !== null);
}

function normalizeShopProfileStatus(value: unknown): ShopProfileData["status"] {
  if (typeof value === "boolean") return value ? "open" : "closed";
  if (typeof value === "number") return value === 1 ? "open" : "closed";

  const raw = String(value ?? "")
    .trim()
    .toLowerCase();

  if (["closed", "close", "مغلق", "0", "false", "inactive", "off"].includes(raw)) return "closed";
  if (["open", "opened", "مفتوح", "1", "true", "active", "on"].includes(raw)) return "open";
  return "open";
}

function normalizeShopProfile(payload: unknown): GetShopProfileResponse {
  const body = payload as { data?: unknown; message?: string; shop_profile?: unknown } | null;
  const raw = body && typeof body === "object" ? ((body.data as Record<string, unknown> | null | undefined) ?? (body.shop_profile as Record<string, unknown> | null | undefined) ?? (body as Record<string, unknown>)) : null;

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      message: body && typeof body === "object" ? body.message : undefined,
      data: null,
    };
  }

  const coverImage = raw.cover_image ?? raw.cover_image_url ?? raw.cover ?? null;
  const commercialRecordImage = raw.commercial_record_image ?? raw.commercial_record_image_url ?? raw.license_image ?? null;
  const data: ShopProfileData = {
    id: toIdString(raw.id ?? raw.shop_id ?? raw.shop_profile_id),
    shop_name: String(raw.shop_name ?? raw.name ?? ""),
    description: String(raw.description ?? ""),
    cover_image: resolveMediaPath(coverImage == null || coverImage === "" ? null : String(coverImage)) || null,
    commercial_record_image: resolveMediaPath(commercialRecordImage == null || commercialRecordImage === "" ? null : String(commercialRecordImage)) || null,
    country_id: toIdString(raw.country_id ?? raw.country),
    city_id: toIdString(raw.city_id ?? raw.city),
    district: String(raw.district ?? raw.district_id ?? ""),
    street: String(raw.street ?? ""),
    latitude: String(raw.latitude ?? ""),
    longitude: String(raw.longitude ?? ""),
    status: normalizeShopProfileStatus(raw.status ?? raw.shop_status ?? raw.is_open),
    working_hours: normalizeWorkingHours(raw.working_hours),
    services: normalizeShopProfileServices(raw.services ?? raw.service_ids),
  };

  return {
    message: body && typeof body === "object" ? body.message : undefined,
    data,
  };
}

function normalizeShopOwnerVerificationStatus(value: unknown): ShopOwnerVerificationStatus {
  if (typeof value === "number") {
    if (value === 1) return "accepted";
    if (value === 2) return "rejected";
    return "pending";
  }

  const raw = String(value ?? "")
    .trim()
    .toLowerCase();

  if (["accepted", "approved", "approve", "active", "verified", "1", "true"].includes(raw)) return "accepted";
  if (["rejected", "reject", "declined", "denied", "2", "false"].includes(raw)) return "rejected";
  return "pending";
}

function normalizeShopOwnerVerificationServices(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") {
        const name = String(item).trim();
        return name || null;
      }

      if (!item || typeof item !== "object") return null;

      const row = item as Record<string, unknown>;
      const nested = row.service && typeof row.service === "object" ? (row.service as Record<string, unknown>) : null;
      const name = String(row.name ?? row.service_name ?? row.title ?? nested?.name ?? nested?.service_name ?? nested?.title ?? "").trim();
      return name || null;
    })
    .filter((item): item is string => item !== null);
}

function resolveShopOwnerMediaPath(path: string | null | undefined): string | null {
  if (path == null || path === "") return null;

  const normalizedPath = String(path).replace(/^\/+/, "");
  if (normalizedPath.startsWith("http://") || normalizedPath.startsWith("https://") || normalizedPath.startsWith("blob:") || normalizedPath.startsWith("data:")) {
    return normalizedPath;
  }

  const withStorage = normalizedPath.startsWith("storage/") ? normalizedPath : `storage/${normalizedPath}`;
  return resolveMediaPath(withStorage) || null;
}

function normalizeShopOwnerVerificationRequest(item: unknown): ShopOwnerVerificationRequest | null {
  if (!item || typeof item !== "object") return null;

  const row = item as Record<string, unknown>;
  const user = row.user && typeof row.user === "object" ? (row.user as Record<string, unknown>) : null;
  const countryObj = row.country && typeof row.country === "object" ? (row.country as Record<string, unknown>) : null;
  const reviewer = row.reviewed_by && typeof row.reviewed_by === "object" ? (row.reviewed_by as Record<string, unknown>) : null;

  const firstName = String(row.first_name ?? user?.first_name ?? "").trim();
  const lastName = String(row.last_name ?? user?.last_name ?? "").trim();
  const composedName = `${firstName} ${lastName}`.trim();
  const full_name = String(row.full_name ?? row.name ?? (composedName ? composedName : (user?.name ?? user?.full_name ?? ""))).trim();
  const email = String(row.email ?? user?.email ?? "").trim();
  const id = (row.id ?? row.verification_id ?? row.shop_owner_verification_id ?? email) as number | string;

  if (id == null || id === "") return null;

  const nationalIdImage = row.national_id_image ?? row.national_id_image_url ?? row.id_image ?? null;
  const commercialRecordImage = row.commercial_record_image ?? row.commercial_record_image_url ?? row.license_image ?? null;
  const countryName = pickNestedName(countryObj, ["name", "name_ar", "country_name", "title"]) || String(row.country_name ?? (typeof row.country === "string" ? row.country : "") ?? "").trim();

  const reviewedByRaw = row.reviewed_by;
  const reviewed_by = reviewedByRaw == null || reviewedByRaw === "" ? null : typeof reviewedByRaw === "object" ? pickNestedName(reviewer, ["name", "full_name", "email"]) || null : String(reviewedByRaw);

  return {
    id,
    full_name: full_name || "—",
    email: email || "—",
    phone_number: String(row.phone_number ?? row.phone ?? user?.phone_number ?? user?.phone ?? "").trim(),
    national_id_image: resolveShopOwnerMediaPath(nationalIdImage == null ? null : String(nationalIdImage)),
    commercial_record_image: resolveShopOwnerMediaPath(commercialRecordImage == null ? null : String(commercialRecordImage)),
    country: countryName || "—",
    country_id: (row.country_id ?? countryObj?.id ?? null) as number | string | null,
    services: normalizeShopOwnerVerificationServices(row.services ?? row.service_ids ?? row.service_list),
    notes: String(row.notes ?? row.note ?? row.message ?? "").trim(),
    status: normalizeShopOwnerVerificationStatus(row.status ?? row.verification_status ?? row.is_verified ?? row.approved),
    reviewed_by,
    reviewed_at: row.reviewed_at == null || row.reviewed_at === "" ? null : String(row.reviewed_at),
    created_at: row.created_at == null || row.created_at === "" ? null : String(row.created_at),
    updated_at: row.updated_at == null || row.updated_at === "" ? null : String(row.updated_at),
  };
}

function normalizeShopOwnerVerificationData(payload: unknown): GetShopOwnerVerificationDataResponse {
  const body = payload as { data?: unknown; verifications?: unknown; requests?: unknown; message?: string } | unknown[];

  const list = Array.isArray(body)
    ? body
    : Array.isArray((body as { data?: unknown }).data)
      ? (body as { data: unknown[] }).data
      : Array.isArray((body as { verifications?: unknown }).verifications)
        ? (body as { verifications: unknown[] }).verifications
        : Array.isArray((body as { requests?: unknown }).requests)
          ? (body as { requests: unknown[] }).requests
          : [];

  const data = list.map((item) => normalizeShopOwnerVerificationRequest(item)).filter((item): item is ShopOwnerVerificationRequest => item !== null);

  return {
    message: Array.isArray(body) ? undefined : (body as { message?: string }).message,
    data,
  };
}

export const baseApi = createApi({
  reducerPath: "api",
  tagTypes: ["ShopProfile", "ShopProducts", "Favorites", "Countries", "Cities", "Brands", "DeviceModels", "Categories", "Products", "ShopOwnerVerifications"],
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as { auth: { token: string | null } }).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (build) => ({
    registerClient: build.mutation<ClientRegisterResponse, ClientRegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    /** Start Mock API */

    loginClient: build.mutation<ClientLoginResponse, ClientLoginRequest>(
      useMock
        ? { queryFn: mockLogin }
        : {
            query: (body) => ({
              url: "/auth/login",
              method: "POST",
              body,
            }),
          },
    ),
    logoutClient: build.mutation<ClientLogoutResponse, void>(
      useMock
        ? { queryFn: mockLogout }
        : {
            query: () => ({
              url: "/auth/logout",
              method: "POST",
            }),
          },
    ),
    /** End Mock API */
    passwordSendCode: build.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: "/auth/password/send-code",
        method: "POST",
        body,
      }),
    }),
    passwordReset: build.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: "/auth/password/reset",
        method: "POST",
        body,
      }),
    }),

    changePassword: build.mutation<ChangePasswordResponse, ChangePasswordRequest>({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),

    sendVerification: build.mutation<ResendVerificationResponse, ResendVerificationRequest>({
      query: (body) => ({
        url: "/auth/email/send-verification",
        method: "POST",
        body,
      }),
    }),

    resendVerification: build.mutation<ResendVerificationResponse, ResendVerificationRequest>({
      query: (body) => ({
        url: "/auth/email/resend-verification",
        method: "POST",
        body,
      }),
    }),

    getAllCountries: build.query<GetAllCountriesResponse, void>({
      query: () => ({
        url: "/countries/get-for-select",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeCountries(response),
      providesTags: ["Countries"],
    }),

    getCountriesAll: build.query<GetAllCountriesResponse, void>({
      query: () => ({
        url: "/countries/get-all",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeCountries(response),
      providesTags: ["Countries"],
    }),

    storeCountry: build.mutation<{ message?: string }, { name: string }>({
      query: (body) => ({
        url: "/countries/store",
        method: "POST",
        body: { name: body.name },
      }),
      invalidatesTags: ["Countries"],
    }),

    updateCountry: build.mutation<{ message?: string }, { id: string | number; name: string }>({
      query: ({ id, name }) => ({
        url: `/countries/update/${id}`,
        method: "PUT",
        body: { name },
      }),
      invalidatesTags: ["Countries"],
    }),

    deleteCountry: build.mutation<{ message?: string }, string | number>({
      query: (id) => ({
        url: `/countries/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Countries"],
    }),

    getAllServices: build.query<GetAllServicesResponse, void>({
      query: () => ({
        url: "/services/get-for-select",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeServices(response),
    }),

    getCategoriesForSelect: build.query<GetCategoriesForSelectResponse, void>({
      query: () => ({
        url: "/categories/get-for-select",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeCategories(response),
      providesTags: ["Categories"],
    }),

    getCategoriesAll: build.query<GetCategoriesForSelectResponse, void>({
      query: () => ({
        url: "/categories/get-all",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeCategories(response),
      providesTags: ["Categories"],
    }),

    storeCategory: build.mutation<{ message?: string }, { category_name: string }>({
      query: (body) => ({
        url: "/categories/store",
        method: "POST",
        body: { category_name: body.category_name },
      }),
      invalidatesTags: ["Categories"],
    }),

    updateCategory: build.mutation<{ message?: string }, { id: string | number; category_name: string }>({
      query: ({ id, category_name }) => ({
        url: `/categories/update/${id}`,
        method: "PUT",
        body: { category_name },
      }),
      invalidatesTags: ["Categories"],
    }),

    deleteCategory: build.mutation<{ message?: string }, string | number>({
      query: (id) => ({
        url: `/categories/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),

    storeProduct: build.mutation<{ message?: string }, { product_name: string; category_id: string | number }>({
      query: (body) => ({
        url: "/products/store",
        method: "POST",
        body: {
          product_name: body.product_name,
          category_id: body.category_id,
        },
      }),
      invalidatesTags: ["Products"],
    }),

    getProductsAll: build.query<GetAllProductsResponse, void>({
      query: () => ({
        url: "/products/get-all",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeProducts(response),
      providesTags: ["Products"],
    }),

    updateProduct: build.mutation<{ message?: string }, { id: string | number; product_name: string; category_id: string | number }>({
      query: ({ id, product_name, category_id }) => ({
        url: `/products/update/${id}`,
        method: "PUT",
        body: { product_name, category_id },
      }),
      invalidatesTags: ["Products"],
    }),

    deleteProduct: build.mutation<{ message?: string }, string | number>({
      query: (id) => ({
        url: `/products/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),

    getBrandsForSelect: build.query<GetBrandsForSelectResponse, void>({
      query: () => ({
        url: "/brands/get-for-select",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeBrands(response),
      providesTags: ["Brands"],
    }),

    getBrandsAll: build.query<GetBrandsForSelectResponse, void>({
      query: () => ({
        url: "/brands/get-all",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeBrands(response),
      providesTags: ["Brands"],
    }),

    getBrandById: build.query<GetBrandDetailsResponse, string | number>({
      query: (id) => ({
        url: `/brands/show/${id}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeBrandDetails(response),
    }),

    storeBrand: build.mutation<{ message?: string }, { brand_name: string }>({
      query: (body) => ({
        url: "/brands/store",
        method: "POST",
        body: { brand_name: body.brand_name },
      }),
      invalidatesTags: ["Brands"],
    }),

    updateBrand: build.mutation<{ message?: string }, { id: string | number; brand_name: string }>({
      query: ({ id, brand_name }) => ({
        url: `/brands/update/${id}`,
        method: "PUT",
        body: { brand_name },
      }),
      invalidatesTags: ["Brands"],
    }),

    deleteBrand: build.mutation<{ message?: string }, string | number>({
      query: (id) => ({
        url: `/brands/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Brands"],
    }),

    storeDeviceModel: build.mutation<{ message?: string }, { device_model_name: string; brand_id: string | number }>({
      query: (body) => ({
        url: "/device-models/store",
        method: "POST",
        body: {
          device_model_name: body.device_model_name,
          brand_id: body.brand_id,
        },
      }),
      invalidatesTags: ["DeviceModels"],
    }),

    getDeviceModelsAll: build.query<GetAllDeviceModelsResponse, void>({
      query: () => ({
        url: "/device-models/get-all",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeDeviceModels(response),
      providesTags: ["DeviceModels"],
    }),

    updateDeviceModel: build.mutation<{ message?: string }, { id: string | number; device_model_name: string; brand_id: string | number }>({
      query: ({ id, device_model_name, brand_id }) => ({
        url: `/device-models/update/${id}`,
        method: "PUT",
        body: { device_model_name, brand_id },
      }),
      invalidatesTags: ["DeviceModels"],
    }),

    deleteDeviceModel: build.mutation<{ message?: string }, string | number>({
      query: (id) => ({
        url: `/device-models/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DeviceModels"],
    }),

    getCategoryById: build.query<GetCategoryDetailsResponse, string | number>({
      query: (id) => ({
        url: `/categories/show/${id}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeCategoryDetails(response),
    }),

    getAllCities: build.query<GetAllCitiesResponse, string | number>({
      query: (id) => ({
        url: `/cities/get-cities-by-country/${id}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeCities(response),
    }),

    getCitiesAll: build.query<GetAllCitiesResponse, void>({
      query: () => ({
        url: "/cities/get-all",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeCities(response),
      providesTags: ["Cities"],
    }),

    storeCity: build.mutation<{ message?: string }, { name: string; country_id: string | number }>({
      query: (body) => ({
        url: "/cities/store",
        method: "POST",
        body: {
          name: body.name,
          country_id: body.country_id,
        },
      }),
      invalidatesTags: ["Cities"],
    }),

    updateCity: build.mutation<{ message?: string }, { id: string | number; name: string; country_id: string | number }>({
      query: ({ id, name, country_id }) => ({
        url: `/cities/update/${id}`,
        method: "PUT",
        body: { name, country_id },
      }),
      invalidatesTags: ["Cities"],
    }),

    deleteCity: build.mutation<{ message?: string }, string | number>({
      query: (id) => ({
        url: `/cities/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cities"],
    }),

    registerWorkShop: build.mutation<WorkshopRegisterResponse, FormData>({
      query: (body) => ({
        url: "/shop-owner/store/shop-owner-verifications",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ShopOwnerVerifications"],
    }),

    getShopOwnerVerificationData: build.query<GetShopOwnerVerificationDataResponse, void>({
      query: () => ({
        url: "/shop-owner/get-shop-owner-verification-data",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeShopOwnerVerificationData(response),
      providesTags: ["ShopOwnerVerifications"],
    }),

    approveShopOwnerVerification: build.mutation<{ message?: string }, string | number>({
      query: (id) => ({
        url: `/shop-owner/verification/${id}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["ShopOwnerVerifications"],
    }),

    rejectShopOwnerVerification: build.mutation<{ message?: string }, string | number>({
      query: (id) => ({
        url: `/shop-owner/verification/${id}/reject`,
        method: "POST",
      }),
      invalidatesTags: ["ShopOwnerVerifications"],
    }),

    deleteShopOwnerVerification: build.mutation<{ message?: string }, string | number>({
      query: (id) => ({
        url: `/shop-owner/verification/${id}/delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["ShopOwnerVerifications"],
    }),

    saveOrUpdateShopProfile: build.mutation<ShopProfileSaveOrUpdateResponse, FormData>({
      query: (body) => ({
        url: "/shop-owner/shop-profile/save-or-update",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ShopProfile"],
    }),

    getShopProfile: build.query<GetShopProfileResponse, void>({
      query: () => ({
        url: "/shop-owner/get/shop-profile",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeShopProfile(response),
      providesTags: ["ShopProfile"],
    }),

    updateShopStatus: build.mutation<UpdateShopStatusResponse, { id: string | number; status: "open" | "closed" }>({
      query: ({ id, status }) => ({
        url: `/shop-owner/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      async onQueryStarted({ status }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          baseApi.util.updateQueryData("getShopProfile", undefined, (draft) => {
            if (draft.data) {
              draft.data.status = status;
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ["ShopProfile"],
    }),

    storeShopProduct: build.mutation<StoreShopProductResponse, FormData>({
      query: (body) => ({
        url: "/shop-products/store",
        method: "POST",
        body,
      }),
      async onQueryStarted(formData, { queryFulfilled }) {
        try {
          await queryFulfilled;
          const { productId, deviceModelId, deviceModelName } = readShopProductDeviceFromFormData(formData);
          rememberSubmittedDeviceName({ productId, deviceModelId, deviceModelName });
        } catch {
          // ignore
        }
      },
      invalidatesTags: ["ShopProducts"],
    }),

    updateShopProduct: build.mutation<UpdateShopProductResponse, { id: string | number; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/shop-products/update/${id}`,
        method: "PUT",
        body,
      }),
      async onQueryStarted({ id, body }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          const { productId, deviceModelId, deviceModelName } = readShopProductDeviceFromFormData(body);
          rememberSubmittedDeviceName({ shopProductId: id, productId, deviceModelId, deviceModelName });
        } catch {
          // ignore
        }
      },
      invalidatesTags: ["ShopProducts"],
    }),

    deleteShopProduct: build.mutation<DeleteShopProductResponse, string | number>({
      query: (id) => ({
        url: `/shop-products/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ShopProducts"],
    }),

    getAllShopProducts: build.query<GetAllShopProductsResponse, void>({
      query: () => ({
        url: "/shop-products/get-all",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeShopProducts(response),
      providesTags: ["ShopProducts"],
    }),

    getAllPublicShops: build.query<GetAllPublicShopsResponse, void>({
      query: () => ({
        url: "/home/get-all-shop",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizePublicShops(response),
    }),

    getPublicShopDetails: build.query<GetPublicShopDetailsResponse, string | number>({
      query: (id) => ({
        url: `/home/${id}/shop-details`,
        method: "GET",
      }),
      transformResponse: (response: unknown, _meta, id) => normalizePublicShopDetails(response, id),
    }),

    addFavoriteShop: build.mutation<AddFavoriteShopResponse, string | number>({
      query: (shopId) => ({
        url: "/favorites/add",
        method: "POST",
        body: { shop_id: shopId },
      }),
      invalidatesTags: ["Favorites"],
    }),

    removeFavoriteShop: build.mutation<RemoveFavoriteShopResponse, string | number>({
      query: (shopId) => ({
        url: `/favorites/remove/${shopId}`,
        method: "DELETE",
        params: { shop_id: shopId },
      }),
      invalidatesTags: ["Favorites"],
    }),

    getMyFavorites: build.query<GetMyFavoritesResponse, void>({
      query: () => ({
        url: "/favorites/get-my-favorites",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeMyFavorites(response),
      providesTags: ["Favorites"],
    }),
  }),
});

export const {
  useRegisterClientMutation,
  useLoginClientMutation,
  useLogoutClientMutation,
  usePasswordSendCodeMutation,
  usePasswordResetMutation,
  useChangePasswordMutation,
  useSendVerificationMutation,
  useResendVerificationMutation,
  useGetAllCountriesQuery,
  useGetCountriesAllQuery,
  useStoreCountryMutation,
  useUpdateCountryMutation,
  useDeleteCountryMutation,
  useGetAllCitiesQuery,
  useGetCitiesAllQuery,
  useStoreCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
  useGetAllServicesQuery,
  useGetCategoriesForSelectQuery,
  useGetCategoriesAllQuery,
  useStoreCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useStoreProductMutation,
  useGetProductsAllQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetBrandsForSelectQuery,
  useGetBrandsAllQuery,
  useGetBrandByIdQuery,
  useStoreBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useStoreDeviceModelMutation,
  useGetDeviceModelsAllQuery,
  useUpdateDeviceModelMutation,
  useDeleteDeviceModelMutation,
  useGetCategoryByIdQuery,
  useRegisterWorkShopMutation,
  useGetShopOwnerVerificationDataQuery,
  useApproveShopOwnerVerificationMutation,
  useRejectShopOwnerVerificationMutation,
  useDeleteShopOwnerVerificationMutation,
  useSaveOrUpdateShopProfileMutation,
  useGetShopProfileQuery,
  useUpdateShopStatusMutation,
  useStoreShopProductMutation,
  useUpdateShopProductMutation,
  useDeleteShopProductMutation,
  useGetAllShopProductsQuery,
  useGetAllPublicShopsQuery,
  useGetPublicShopDetailsQuery,
  useAddFavoriteShopMutation,
  useRemoveFavoriteShopMutation,
  useGetMyFavoritesQuery,
} = baseApi;
