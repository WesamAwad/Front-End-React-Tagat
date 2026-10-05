import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { logout } from "./authSlice";
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
  GetUserProfileResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  GetAccountDeletionReasonsResponse,
  AccountDeletionReason,
  DeleteUserAccountRequest,
  DeleteUserAccountResponse,
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
  GetAllPublicShopsParams,
  GetAllPublicShopsResponse,
  StoreRepairRequestResponse,
  RepairRequest,
  RepairRequestCustomer,
  RepairRequestNamedRef,
  GetAllRepairRequestsResponse,
  GetMyRepairRequestsResponse,
  CustomerRepairRequest,
  RepairRequestMutationResponse,
  ContactMessage,
  GetAllContactMessagesResponse,
  StoreContactMessageRequest,
  StoreContactMessageResponse,
  ReplyContactMessageRequest,
  ContactMessageMutationResponse,
  CustomerNotification,
  GetCustomerNotificationsResponse,
  PublicShopDetails,
  PublicShopDetailsService,
  PublicShopDetailsProduct,
  PublicShopDetailsFeature,
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
  AdminShopOwner,
  GetAdminShopOwnersResponse,
  ShopFeature,
  GetAllShopFeaturesResponse,
  StoreShopFeatureRequest,
  UpdateShopFeatureRequest,
  ShopFeatureMutationResponse,
  ShopReview,
  ReviewUser,
  GetShopReviewsResponse,
  GetShopOwnerReviewsResponse,
  StoreReviewRequest,
  UpdateReviewRequest,
  StoreReviewResponse,
  ReviewMutationResponse,
  ReplyShopReviewRequest,
  ReplyShopReviewResponse,
  ShopReviewsRatingDistribution,
  PlatformReview,
  PlatformStatistics,
  SearchShopMapParams,
  MapShopSearchProduct,
  MapShopSearchResult,
  AppRole,
  GetAllRolesResponse,
  GetRolesForSelectResponse,
  RolePermission,
  GetRolePermissionsResponse,
  RoleMutationResponse,
  Complaint,
  GetAllComplaintsResponse,
  StoreComplaintRequest,
  StoreComplaintResponse,
  ReplyComplaintRequest,
  ComplaintMutationResponse,
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

function normalizePublicShopVerified(value: unknown): boolean {
  if (value === true || value === 1 || value === "1") return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "verified" || normalized === "موثق";
  }
  return false;
}

function normalizePublicShopAverageRating(value: unknown): number {
  const rating = Number(value);
  if (!Number.isFinite(rating) || rating < 0) return 0;
  return Math.min(5, rating);
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
    is_verified: normalizePublicShopVerified(row.is_verified ?? row.verified ?? row.is_shop_verified ?? row.shop_verified),
    average_rating: normalizePublicShopAverageRating(row.average_rating ?? row.averageRating ?? row.rating),
    services: normalizePublicShopServices(row.services),
  };
}

function normalizePublicShopDetailsFeatures(value: unknown): PublicShopDetailsFeature[] {
  const list = Array.isArray(value) ? value : value && typeof value === "object" && Array.isArray((value as { data?: unknown }).data) ? (value as { data: unknown[] }).data : [];

  return list
    .map((item, index): PublicShopDetailsFeature | null => {
      if (typeof item === "string" || typeof item === "number") {
        const feature = String(item).trim();
        if (!feature) return null;
        return { id: `feature-${index}`, feature };
      }

      if (!item || typeof item !== "object") return null;

      const row = item as Record<string, unknown>;
      const feature = String(row.feature_name ?? row.feature ?? row.name ?? row.title ?? row.text ?? "").trim();
      if (!feature) return null;

      return {
        id: String(row.id ?? row.feature_id ?? `feature-${index}`),
        feature,
      };
    })
    .filter((item): item is PublicShopDetailsFeature => item !== null);
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
      const name = String(row.product_name ?? "").trim() || pickNestedName(productRecord, ["product_name", "name", "name_ar", "title"]) || String(row.name ?? row.title ?? "").trim() || "قطعة غيار";

      const brandName = pickNestedName(brandRecord, ["brand_name", "name", "name_ar", "title"]) || String(row.brand_name ?? row.company_name ?? "").trim();
      const deviceName = pickNestedName(deviceRecord, ["device_model_name", "name", "name_ar", "title", "model_name", "device_name"]) || String(row.device_model_name ?? row.device_name ?? "").trim();
      const categoryName = String(row.category_name ?? "").trim() || pickNestedName(categoryRecord, ["category_name", "name", "name_ar", "title"]) || String(productRecord?.category_name ?? "").trim();
      const subtitle = [brandName, deviceName, categoryName].filter(Boolean).join(" · ") || String(row.description ?? productRecord?.description ?? "").trim();

      const price = Number(row.price ?? row.product_price ?? productRecord?.price ?? 0);
      const status = String(row.status ?? "")
        .trim()
        .toLowerCase();
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
      const matched = shopId != null && shopId !== "" ? list.find((item) => String(item.id ?? item.shop_id ?? "") === String(shopId)) : undefined;
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

  raw = flattenPublicShopDetailsRaw(raw);

  const id = String(raw.id ?? raw.shop_id ?? shopId ?? "");
  if (!id) {
    return { message, data: null };
  }

  const countryValue = raw.country ?? raw.country_name;
  const cityValue = raw.city ?? raw.city_name;

  const { latitude, longitude } = extractShopCoordinates(raw);

  const data: PublicShopDetails = {
    id,
    shop_name: String(raw.shop_name ?? raw.name ?? "").trim(),
    description: String(raw.description ?? raw.about ?? "").trim(),
    cover_image: resolveMediaPath(String(raw.cover_image ?? raw.image ?? raw.cover ?? "")),
    country: typeof countryValue === "object" ? pickNestedName(countryValue, ["name", "name_ar", "country_name"]) : String(countryValue ?? "").trim(),
    city: typeof cityValue === "object" ? pickNestedName(cityValue, ["name", "name_ar", "city_name"]) : String(cityValue ?? "").trim(),
    district: String(raw.district ?? raw.district_name ?? "").trim(),
    street: String(raw.street ?? "").trim(),
    status: String(raw.status ?? "").trim(),
    latitude,
    longitude,
    phone: String(raw.phone ?? raw.phone_number ?? raw.mobile ?? "").trim(),
    whatsapp: String(raw.whatsapp ?? raw.whatsapp_number ?? raw.phone ?? raw.phone_number ?? "").trim(),
    email: String(raw.email ?? raw.shop_email ?? "").trim(),
    website: String(raw.website ?? raw.website_url ?? raw.site ?? "").trim(),
    services: normalizePublicShopDetailsServices(raw.services ?? raw.service_list),
    products: normalizePublicShopDetailsProducts(extractPublicShopDetailsProductsSource(raw)),
    features: normalizePublicShopDetailsFeatures(raw.featuresShop ?? raw.features_shop ?? raw.features),
    working_hours: normalizeWorkingHours(raw.working_hours ?? raw.workingHours ?? raw.hours ?? raw.schedule),
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

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function pickCount(row: Record<string, unknown>, key: string) {
  const value = Number(row[key]);
  return Number.isFinite(value) ? value : 0;
}

function normalizePlatformReview(value: unknown): PlatformReview | null {
  const row = asObject(value);
  if (!row) return null;

  const comment = String(row.comment ?? "").trim();
  if (!comment) return null;

  const rating = Number(row.rating);

  return {
    customer_name: String(row.customer_name ?? "").trim() || "عميل",
    comment,
    rating: Number.isFinite(rating) ? rating : 0,
  };
}

function normalizePlatformStatistics(payload: unknown): PlatformStatistics {
  const root = asObject(payload);
  const nested = root ? asObject(root.data) : null;
  const source = nested && ("customers_count" in nested || "reviews" in nested || "completed_requests_count" in nested) ? nested : (root ?? {});

  const reviewsRaw = Array.isArray(source.reviews) ? source.reviews : [];

  return {
    customers_count: pickCount(source, "customers_count"),
    completed_requests_count: pickCount(source, "completed_requests_count"),
    excellent_reviews_count: pickCount(source, "excellent_reviews_count"),
    verified_shops_count: pickCount(source, "verified_shops_count"),
    reviews: reviewsRaw.map(normalizePlatformReview).filter((item): item is PlatformReview => item !== null),
  };
}

/** The user may be returned as `data`, `data.user`, `user` or the body itself. */
function findUserRecord(body: Record<string, unknown> | null, key: string) {
  const data = asObject(body?.data);
  return [data, asObject(data?.user), asObject(body?.user), body].find((item) => item != null && key in item) ?? null;
}

function normalizeUserProfile(payload: unknown): GetUserProfileResponse {
  const body = asObject(payload);
  const message = typeof body?.message === "string" ? body.message : undefined;
  const raw = findUserRecord(body, "email");

  if (!raw) return { message, data: null };

  return {
    message,
    data: {
      id: raw.id == null ? "" : String(raw.id),
      first_name: String(raw.first_name ?? "").trim(),
      last_name: String(raw.last_name ?? "").trim(),
      email: String(raw.email ?? "").trim(),
      created_at: raw.created_at == null || raw.created_at === "" ? null : String(raw.created_at),
    },
  };
}

function normalizeUpdateUserProfileResponse(payload: unknown): UpdateUserProfileResponse {
  const body = asObject(payload);
  const user = findUserRecord(body, "email_verified_at");

  return {
    message: typeof body?.message === "string" ? body.message : undefined,
    // Changing the email resets email_verified_at to null until the new address is verified.
    requiresEmailVerification: user !== null && user.email_verified_at === null,
  };
}

function parseOptionalCoordinate(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(String(value).trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeMapShopProduct(row: Record<string, unknown>): MapShopSearchProduct | null {
  const direct = asObject(row.product);
  if (direct) {
    const name = String(direct.name ?? direct.product_name ?? direct.title ?? "").trim();
    if (!name) return null;
    const quantityRaw = Number(direct.quantity);
    return {
      name,
      price: String(direct.price ?? "").trim(),
      quantity: Number.isFinite(quantityRaw) ? quantityRaw : null,
      status: String(direct.status ?? "").trim(),
    };
  }

  const shopProducts = Array.isArray(row.shopProducts) ? row.shopProducts : Array.isArray(row.shop_products) ? row.shop_products : [];
  const first = asObject(shopProducts[0]);
  if (!first) return null;

  const nested = asObject(first.product);
  const name = String(nested?.name ?? nested?.product_name ?? first.name ?? first.product_name ?? "").trim();
  if (!name) return null;

  const quantityRaw = Number(first.quantity ?? nested?.quantity);
  return {
    name,
    price: String(first.price ?? nested?.price ?? "").trim(),
    quantity: Number.isFinite(quantityRaw) ? quantityRaw : null,
    status: String(first.status ?? nested?.status ?? "").trim(),
  };
}

function normalizeMapShopSearchResult(item: unknown): MapShopSearchResult | null {
  if (!item || typeof item !== "object") return null;

  const row = item as Record<string, unknown>;
  const id = String(row.id ?? row.shop_id ?? "").trim();
  if (!id) return null;

  const cityValue = row.city ?? row.city_name;
  const distanceRaw = row.distance;
  const distance = distanceRaw == null || distanceRaw === "" ? null : Number(distanceRaw);

  return {
    id,
    shop_name: String(row.shop_name ?? row.name ?? "").trim() || "ورشة بدون اسم",
    cover_image: resolveMediaPath(String(row.cover_image ?? row.image ?? row.cover ?? "")),
    city: typeof cityValue === "object" ? pickNestedName(cityValue, ["name", "name_ar", "city_name"]) : String(cityValue ?? "").trim(),
    district: String(row.district ?? "").trim(),
    street: String(row.street ?? "").trim(),
    status: String(row.status ?? "").trim(),
    is_verified: normalizePublicShopVerified(row.is_verified ?? row.verified ?? row.is_shop_verified),
    latitude: parseOptionalCoordinate(row.latitude ?? row.lat),
    longitude: parseOptionalCoordinate(row.longitude ?? row.lng ?? row.lon),
    distance: Number.isFinite(distance) ? distance : null,
    product: normalizeMapShopProduct(row),
  };
}

function normalizeSearchShopMapResponse(payload: unknown): MapShopSearchResult[] {
  const root = asObject(payload);
  const list = Array.isArray(payload) ? payload : Array.isArray(root?.shops) ? root.shops : Array.isArray(root?.data) ? root.data : [];

  return list.map(normalizeMapShopSearchResult).filter((item): item is MapShopSearchResult => item !== null);
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

function normalizeRole(item: unknown): AppRole | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  const id = row.id;
  const name = String(row.name ?? "").trim();
  if (id == null || id === "" || !name) return null;

  return {
    id: id as string | number,
    name,
    guard_name: row.guard_name != null ? String(row.guard_name) : undefined,
    created_at: row.created_at != null ? String(row.created_at) : null,
    updated_at: row.updated_at != null ? String(row.updated_at) : null,
  };
}

function normalizeRoles(payload: unknown): GetAllRolesResponse {
  const body = payload as { roles?: unknown; data?: unknown; message?: string } | unknown[];
  const list = Array.isArray(body) ? body : Array.isArray((body as { roles?: unknown }).roles) ? (body as { roles: unknown[] }).roles : Array.isArray((body as { data?: unknown }).data) ? (body as { data: unknown[] }).data : [];

  return {
    message: Array.isArray(body) ? undefined : (body as { message?: string }).message,
    roles: list.map((item) => normalizeRole(item)).filter((item): item is AppRole => item !== null),
  };
}

function normalizeRolesForSelect(payload: unknown): GetRolesForSelectResponse {
  const normalized = normalizeRoles(payload);
  return {
    message: normalized.message,
    roles: normalized.roles.map((role) => ({ id: role.id, name: role.name })),
  };
}

function normalizeRolePermissions(payload: unknown): GetRolePermissionsResponse {
  const body = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const roleRaw = body.role && typeof body.role === "object" ? (body.role as Record<string, unknown>) : {};
  const list = Array.isArray(body.permissions) ? body.permissions : [];

  const permissions = list
    .map((item): RolePermission | null => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const id = row.id;
      const name = String(row.name ?? "").trim();
      if (id == null || id === "" || !name) return null;
      return {
        id: id as string | number,
        name,
        assigned: Boolean(row.assigned),
      };
    })
    .filter((item): item is RolePermission => item !== null);

  return {
    message: typeof body.message === "string" ? body.message : undefined,
    role: {
      id: (roleRaw.id as string | number) ?? "",
      name: String(roleRaw.name ?? "").trim(),
    },
    permissions,
  };
}

function normalizeServices(payload: unknown): GetAllServicesResponse {
  const body = payload as { data?: unknown; services?: unknown; message?: string } | unknown[];

  const list = Array.isArray(body) ? body : Array.isArray((body as { data?: unknown }).data) ? (body as { data: unknown[] }).data : Array.isArray((body as { services?: unknown }).services) ? (body as { services: unknown[] }).services : [];

  const data = list
    .map((item): Service | null => {
      if (typeof item === "string") {
        return { id: item, name: item, created_at: null, updated_at: null };
      }

      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        const name = String(row.name ?? row.name_ar ?? row.service_name ?? row.title ?? "");
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
    .filter((item): item is NonNullable<typeof item> => item !== null);

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

function parseWorkingHoursSource(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      return parseWorkingHoursSource(JSON.parse(trimmed));
    } catch {
      return [];
    }
  }

  if (value && typeof value === "object") {
    const row = value as Record<string, unknown>;
    if (Array.isArray(row.data)) return row.data;
    if (Array.isArray(row.hours)) return row.hours;
    if (Array.isArray(row.working_hours)) return row.working_hours;
  }

  return [];
}

function normalizeWorkingHours(value: unknown): ShopProfileWorkingHour[] {
  const list = parseWorkingHoursSource(value);
  const dayByIndex = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

  return list
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;

      let day = String(row.day ?? row.day_name ?? row.name ?? row.weekday ?? "").trim();
      if (!day && row.day_of_week != null && row.day_of_week !== "") {
        const index = Number(row.day_of_week);
        if (Number.isInteger(index) && index >= 0 && index <= 6) {
          day = dayByIndex[index];
        }
      }
      if (!day) return null;

      const isClosed = row.is_closed === true || row.closed === true || row.is_open === false || String(row.status ?? "").toLowerCase() === "closed";

      const from = isClosed ? "" : String(row.from ?? row.start ?? row.start_time ?? row.open_time ?? row.open ?? "").trim();
      const to = isClosed ? "" : String(row.to ?? row.end ?? row.end_time ?? row.close_time ?? row.close ?? "").trim();

      return { day, from, to };
    })
    .filter((item): item is ShopProfileWorkingHour => item !== null);
}

function pickCoordinateValue(...values: unknown[]): string {
  for (const value of values) {
    if (value == null || value === "") continue;
    if (typeof value === "object") continue;
    const normalized = String(value).trim().replace(",", ".");
    if (!normalized || normalized.toLowerCase() === "null" || normalized.toLowerCase() === "undefined") continue;
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) continue;
    return String(parsed);
  }
  return "";
}

function extractShopCoordinates(raw: Record<string, unknown>) {
  const location = raw.location && typeof raw.location === "object" && !Array.isArray(raw.location) ? (raw.location as Record<string, unknown>) : null;
  const geo = raw.geo && typeof raw.geo === "object" && !Array.isArray(raw.geo) ? (raw.geo as Record<string, unknown>) : null;
  const coordinatesObject = raw.coordinates && typeof raw.coordinates === "object" && !Array.isArray(raw.coordinates) ? (raw.coordinates as Record<string, unknown>) : null;
  const coordinatesArray = Array.isArray(raw.coordinates) ? raw.coordinates : Array.isArray(raw.latlng) ? raw.latlng : null;

  const latitude = pickCoordinateValue(raw.latitude, raw.lat, raw.shop_latitude, location?.latitude, location?.lat, geo?.latitude, geo?.lat, coordinatesObject?.latitude, coordinatesObject?.lat, coordinatesArray?.[0]);

  const longitude = pickCoordinateValue(
    raw.longitude,
    raw.lng,
    raw.lon,
    raw.long,
    raw.shop_longitude,
    location?.longitude,
    location?.lng,
    location?.lon,
    geo?.longitude,
    geo?.lng,
    coordinatesObject?.longitude,
    coordinatesObject?.lng,
    coordinatesArray?.[1],
  );

  return { latitude, longitude };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

/** Merge nested shop/profile payloads so public shop-details can expose lat/lng + hours. */
function flattenPublicShopDetailsRaw(raw: Record<string, unknown>): Record<string, unknown> {
  const nestedCandidates = [raw.shop_profile, raw.shop, raw.profile, raw.details, raw.location].map(asRecord).filter(Boolean) as Record<string, unknown>[];

  if (nestedCandidates.length === 0) return raw;

  const merged: Record<string, unknown> = { ...raw };
  for (const nested of nestedCandidates) {
    for (const [key, value] of Object.entries(nested)) {
      const current = merged[key];
      const currentEmpty = current == null || current === "" || (Array.isArray(current) && current.length === 0) || (typeof current === "object" && !Array.isArray(current) && Object.keys(current as object).length === 0);

      if (currentEmpty && value != null && value !== "") {
        merged[key] = value;
      }
    }
  }

  return merged;
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
  const { latitude, longitude } = extractShopCoordinates(raw);
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
    latitude,
    longitude,
    status: normalizeShopProfileStatus(raw.status ?? raw.shop_status ?? raw.is_open),
    working_hours: normalizeWorkingHours(raw.working_hours ?? raw.workingHours ?? raw.hours ?? raw.schedule),
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

function normalizeAdminShopOwner(item: unknown, index: number): AdminShopOwner | null {
  if (!item || typeof item !== "object") return null;

  const raw = item as Record<string, unknown>;
  const id = (raw.id ?? raw.shop_id ?? raw.user_id ?? raw.owner_id ?? `shop-owner-${index}`) as string | number;

  if (id == null || id === "") return null;

  return { id, raw };
}

function normalizeAdminShopOwners(payload: unknown): GetAdminShopOwnersResponse {
  const body = payload as
    | {
        data?: unknown;
        shop_owners?: unknown;
        shopOwners?: unknown;
        owners?: unknown;
        shops?: unknown;
        message?: string;
      }
    | unknown[];

  const list = Array.isArray(body)
    ? body
    : Array.isArray((body as { data?: unknown }).data)
      ? (body as { data: unknown[] }).data
      : Array.isArray((body as { shop_owners?: unknown }).shop_owners)
        ? (body as { shop_owners: unknown[] }).shop_owners
        : Array.isArray((body as { shopOwners?: unknown }).shopOwners)
          ? (body as { shopOwners: unknown[] }).shopOwners
          : Array.isArray((body as { owners?: unknown }).owners)
            ? (body as { owners: unknown[] }).owners
            : Array.isArray((body as { shops?: unknown }).shops)
              ? (body as { shops: unknown[] }).shops
              : [];

  const data = list.map((item, index) => normalizeAdminShopOwner(item, index)).filter((item): item is AdminShopOwner => item !== null);

  return {
    message: Array.isArray(body) ? undefined : (body as { message?: string }).message,
    data,
  };
}

function normalizeShopFeature(item: unknown): ShopFeature | null {
  if (!item || typeof item !== "object") return null;

  const row = item as Record<string, unknown>;
  const id = String(row.id ?? row.feature_id ?? "").trim();
  const feature = String(row.feature ?? row.name ?? row.title ?? row.text ?? "").trim();
  const shop_id = String(row.shop_id ?? row.shopId ?? "").trim();

  if (!id || !feature) return null;

  return { id, feature, shop_id };
}

function normalizeShopFeatures(payload: unknown): GetAllShopFeaturesResponse {
  const body = payload as { data?: unknown; features?: unknown; featuresShop?: unknown; message?: string } | unknown[];

  const list = Array.isArray(body)
    ? body
    : Array.isArray((body as { featuresShop?: unknown }).featuresShop)
      ? (body as { featuresShop: unknown[] }).featuresShop
      : Array.isArray((body as { data?: unknown }).data)
        ? (body as { data: unknown[] }).data
        : Array.isArray((body as { features?: unknown }).features)
          ? (body as { features: unknown[] }).features
          : [];

  const data = list.map((item) => normalizeShopFeature(item)).filter((item): item is ShopFeature => item !== null);

  return {
    message: Array.isArray(body) ? undefined : (body as { message?: string }).message,
    data,
  };
}

function normalizeReviewUser(value: unknown): ReviewUser {
  if (!value || typeof value !== "object") {
    return { id: "", name: "مستخدم" };
  }

  const row = value as Record<string, unknown>;
  const first = String(row.first_name ?? row.firstName ?? "").trim();
  const last = String(row.last_name ?? row.lastName ?? "").trim();
  const fullName = String(row.name ?? row.full_name ?? row.fullName ?? "").trim();
  const name = fullName || [first, last].filter(Boolean).join(" ") || "مستخدم";

  return {
    id: String(row.id ?? row.user_id ?? "").trim(),
    name,
  };
}

function normalizeShopReview(item: unknown): ShopReview | null {
  if (!item || typeof item !== "object") return null;

  const row = item as Record<string, unknown>;
  const id = String(row.id ?? "").trim();
  if (!id) return null;

  const ratingRaw = Number(row.rating ?? 0);
  const rating = Number.isFinite(ratingRaw) ? Math.min(5, Math.max(0, ratingRaw)) : 0;

  return {
    id,
    rating,
    comment: String(row.comment ?? row.text ?? row.message ?? "").trim(),
    shop_reply: row.shop_reply == null || row.shop_reply === "" ? null : String(row.shop_reply),
    replied_at: row.replied_at == null || row.replied_at === "" ? null : String(row.replied_at),
    created_at: String(row.created_at ?? row.createdAt ?? row.date ?? "").trim(),
    user: normalizeReviewUser(row.user ?? row.customer ?? row.author),
  };
}

function normalizeRepairRequestNamedRef(value: unknown): RepairRequestNamedRef | null {
  if (!value || typeof value !== "object") return null;

  const row = value as Record<string, unknown>;
  const name = String(row.name ?? row.device_model_name ?? row.service_name ?? row.title ?? "").trim();
  const id = String(row.id ?? "").trim();
  if (!name && !id) return null;

  return { id, name };
}

function normalizeRepairRequestCustomer(value: unknown): RepairRequestCustomer | null {
  if (!value || typeof value !== "object") return null;

  const row = value as Record<string, unknown>;
  const firstName = String(row.first_name ?? "").trim();
  const lastName = String(row.last_name ?? "").trim();
  const email = String(row.email ?? "").trim();
  const id = String(row.id ?? "").trim();
  if (!firstName && !lastName && !email && !id) return null;

  return { id, first_name: firstName, last_name: lastName, email };
}

function normalizeRepairRequest(item: unknown): RepairRequest | null {
  if (!item || typeof item !== "object") return null;

  const row = item as Record<string, unknown>;
  const id = String(row.id ?? "").trim();
  if (!id) return null;

  const shop = row.shop && typeof row.shop === "object" ? (row.shop as Record<string, unknown>) : null;

  return {
    id,
    customer: normalizeRepairRequestCustomer(row.customer ?? row.user),
    shop_name: String(shop?.shop_name ?? "").trim(),
    device_model: normalizeRepairRequestNamedRef(row.device_model ?? row.deviceModel),
    service: normalizeRepairRequestNamedRef(row.service),
    description: String(row.description ?? "").trim(),
    image: resolveShopOwnerMediaPath(String(row.image ?? "")) ?? "",
    status: String(row.status ?? "").trim(),
    phone_number: String(row.phone_number ?? "").trim(),
    address: String(row.address ?? "").trim(),
    created_at: String(row.created_at ?? "").trim(),
    updated_at: String(row.updated_at ?? "").trim(),
  };
}

function readNamedValue(value: unknown, fallbackKeys: string[]) {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (!value || typeof value !== "object") return "";
  const row = value as Record<string, unknown>;
  for (const key of fallbackKeys) {
    const candidate = row[key];
    if (typeof candidate === "string" || typeof candidate === "number") {
      const text = String(candidate).trim();
      if (text) return text;
    }
  }
  return "";
}

function normalizeCustomerRepairRequest(item: unknown, index: number): CustomerRepairRequest | null {
  if (!item || typeof item !== "object") return null;

  const row = item as Record<string, unknown>;
  const shop = row.shop && typeof row.shop === "object" ? (row.shop as Record<string, unknown>) : null;
  const shopName = String(row.shop_name ?? shop?.shop_name ?? "").trim();
  const deviceName = readNamedValue(row.device_model_name, []) || readNamedValue(row.device_model ?? row.deviceModel, ["name", "device_model_name"]);
  const serviceName = readNamedValue(row.service_name, []) || readNamedValue(row.service, ["name", "service_name"]);
  const status = String(row.status ?? "").trim();
  const createdAt = String(row.created_at ?? "").trim();

  if (!shopName && !deviceName && !serviceName && !status && !createdAt) return null;

  const id = String(row.id ?? "").trim() || `${index}-${createdAt}-${shopName}`;

  return {
    id,
    shop_name: shopName,
    status,
    device_model_name: deviceName,
    service_name: serviceName,
    created_at: createdAt,
  };
}

function normalizeMyRepairRequests(payload: unknown): GetMyRepairRequestsResponse {
  const body = payload as { data?: unknown; message?: string } | unknown[];
  const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];

  return {
    message: Array.isArray(body) ? undefined : body?.message,
    data: list.map((item, index) => normalizeCustomerRepairRequest(item, index)).filter((item): item is CustomerRepairRequest => item !== null),
  };
}

function normalizeRepairRequests(payload: unknown): GetAllRepairRequestsResponse {
  const body = payload as { data?: unknown; repair_requests?: unknown; message?: string } | unknown[];

  const list = Array.isArray(body)
    ? body
    : Array.isArray((body as { data?: unknown }).data)
      ? (body as { data: unknown[] }).data
      : Array.isArray((body as { repair_requests?: unknown }).repair_requests)
        ? (body as { repair_requests: unknown[] }).repair_requests
        : [];

  return {
    message: Array.isArray(body) ? undefined : (body as { message?: string }).message,
    data: list.map((item) => normalizeRepairRequest(item)).filter((item): item is RepairRequest => item !== null),
  };
}

function normalizeContactMessage(item: unknown): ContactMessage | null {
  if (!item || typeof item !== "object") return null;

  const row = item as Record<string, unknown>;
  const id = String(row.id ?? "").trim();
  if (!id) return null;

  const reply = String(row.reply ?? row.admin_reply ?? row.adminReply ?? "").trim();
  const repliedAt = String(row.replied_at ?? row.repliedAt ?? "").trim();

  return {
    id,
    fullName: String(row.full_name ?? row.fullName ?? "").trim(),
    email: String(row.email ?? "").trim(),
    subject: String(row.subject ?? "").trim(),
    message: String(row.message ?? "").trim(),
    status:
      String(row.status ?? "")
        .trim()
        .toLowerCase() || "pending",
    adminReply: reply || null,
    repliedAt: repliedAt || null,
    date: String(row.created_at ?? row.createdAt ?? row.date ?? "").trim(),
  };
}

function normalizeContactMessages(payload: unknown): GetAllContactMessagesResponse {
  const body = payload as { data?: unknown; contact_messages?: unknown; message?: string } | unknown[];

  const list = Array.isArray(body)
    ? body
    : Array.isArray((body as { data?: unknown }).data)
      ? (body as { data: unknown[] }).data
      : Array.isArray((body as { contact_messages?: unknown }).contact_messages)
        ? (body as { contact_messages: unknown[] }).contact_messages
        : [];

  return {
    message: Array.isArray(body) ? undefined : (body as { message?: string }).message,
    data: list.map((item) => normalizeContactMessage(item)).filter((item): item is ContactMessage => item !== null),
  };
}

function extractComplaintList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const body = payload as Record<string, unknown>;
  if (Array.isArray(body.data)) return body.data;
  if (body.data && typeof body.data === "object") {
    const nested = body.data as Record<string, unknown>;
    if (Array.isArray(nested.data)) return nested.data;
  }
  if (Array.isArray(body.complaints)) return body.complaints;
  return [];
}

function normalizeComplaint(item: unknown): Complaint | null {
  if (!item || typeof item !== "object") return null;

  const row = item as Record<string, unknown>;
  const id = String(row.id ?? "").trim();
  if (!id) return null;

  const customerRaw = row.customer && typeof row.customer === "object" ? (row.customer as Record<string, unknown>) : null;
  const shopRaw = row.shop && typeof row.shop === "object" ? (row.shop as Record<string, unknown>) : null;
  const reply = String(row.admin_reply ?? row.adminReply ?? "").trim();
  const repliedAt = String(row.replied_at ?? row.repliedAt ?? "").trim();
  const status =
    String(row.status ?? "")
      .trim()
      .toLowerCase() || "pending";

  return {
    id,
    customer: customerRaw
      ? {
          id: String(customerRaw.id ?? "").trim(),
          name: String(customerRaw.name ?? `${customerRaw.first_name ?? ""} ${customerRaw.last_name ?? ""}`).trim(),
          email: String(customerRaw.email ?? "").trim(),
        }
      : null,
    shop: shopRaw
      ? {
          id: String(shopRaw.id ?? "").trim(),
          name: String(shopRaw.name ?? shopRaw.shop_name ?? "").trim(),
        }
      : null,
    subject: String(row.subject ?? "").trim(),
    message: String(row.message ?? "").trim(),
    status,
    status_name: String(row.status_name ?? (status === "replied" ? "تم الرد" : "قيد الانتظار")).trim(),
    admin_reply: reply || null,
    replied_at: repliedAt || null,
    created_at: String(row.created_at ?? row.createdAt ?? "").trim(),
  };
}

function normalizeComplaints(payload: unknown): GetAllComplaintsResponse {
  const body = payload && typeof payload === "object" ? (payload as { message?: string }) : null;
  return {
    message: body?.message,
    data: extractComplaintList(payload)
      .map((item) => normalizeComplaint(item))
      .filter((item): item is Complaint => item !== null),
  };
}

function parseNotificationData(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    } catch {
      return { message: value };
    }
  }
  if (typeof value === "object") return value as Record<string, unknown>;
  return {};
}

function notificationTitleFromStatus(status: string) {
  const key = status.trim().toLowerCase();
  if (key === "accepted" || key === "approved") return "تم قبول طلب الإصلاح";
  if (key === "rejected") return "تم رفض طلب الإصلاح";
  if (key === "completed") return "تم إكمال طلب الإصلاح";
  if (key === "canceled" || key === "cancelled") return "تم إلغاء طلب الإصلاح";
  if (key === "pending") return "طلب الإصلاح قيد المراجعة";
  return "";
}

function normalizeCustomerNotification(item: unknown): CustomerNotification | null {
  if (!item || typeof item !== "object") return null;

  const row = item as Record<string, unknown>;
  const id = String(row.id ?? "").trim();
  if (!id) return null;

  const data = parseNotificationData(row.data);
  const nestedRequest = data.repair_request && typeof data.repair_request === "object" ? (data.repair_request as Record<string, unknown>) : null;
  const nestedShop = data.shop && typeof data.shop === "object" ? (data.shop as Record<string, unknown>) : null;
  const nestedService = data.service && typeof data.service === "object" ? (data.service as Record<string, unknown>) : null;
  const nestedDevice = data.device_model && typeof data.device_model === "object" ? (data.device_model as Record<string, unknown>) : null;
  const status = String(data.status ?? nestedRequest?.status ?? "").trim();
  const shopName = String(data.shop_name ?? nestedShop?.shop_name ?? data.shopName ?? "").trim();
  const serviceName = String(nestedService?.service_name ?? nestedService?.name ?? data.service_name ?? "").trim();
  const deviceModelName = String(nestedDevice?.device_model_name ?? nestedDevice?.name ?? data.device_model_name ?? "").trim();
  const title = String(data.title ?? data.subject ?? notificationTitleFromStatus(status) ?? "").trim() || "إشعار جديد";
  const message = String(data.message ?? data.body ?? data.content ?? data.text ?? "").trim();

  return {
    id,
    title,
    message,
    status,
    shop_name: shopName,
    service_name: serviceName,
    device_model_name: deviceModelName,
    repair_request_id: String(data.repair_request_id ?? data.repairRequestId ?? nestedRequest?.id ?? data.request_id ?? "").trim(),
    read_at: row.read_at == null || row.read_at === "" ? null : String(row.read_at),
    created_at: String(row.created_at ?? row.createdAt ?? "").trim(),
  };
}

function normalizeCustomerNotifications(payload: unknown): GetCustomerNotificationsResponse {
  const body = payload as { data?: unknown; notifications?: unknown; message?: string } | unknown[];

  const list = Array.isArray(body)
    ? body
    : Array.isArray((body as { data?: unknown }).data)
      ? (body as { data: unknown[] }).data
      : Array.isArray((body as { notifications?: unknown }).notifications)
        ? (body as { notifications: unknown[] }).notifications
        : [];

  return {
    message: Array.isArray(body) ? undefined : (body as { message?: string }).message,
    data: list.map((item) => normalizeCustomerNotification(item)).filter((item): item is CustomerNotification => item !== null),
  };
}

function normalizeRatingDistribution(value: unknown): ShopReviewsRatingDistribution {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const read = (key: string) => {
    const n = Number(row[key] ?? 0);
    return Number.isFinite(n) ? n : 0;
  };

  return {
    "5": read("5"),
    "4": read("4"),
    "3": read("3"),
    "2": read("2"),
    "1": read("1"),
  };
}

function normalizeShopReviewsResponse(payload: unknown): GetShopReviewsResponse {
  const body = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;
  const list = Array.isArray(body.reviews) ? body.reviews : Array.isArray(body.data) ? body.data : [];
  const reviews = list.map((item) => normalizeShopReview(item)).filter((item): item is ShopReview => item !== null);
  const average = Number(body.average_rating ?? body.averageRating ?? 0);
  const count = Number(body.reviews_count ?? body.reviewsCount ?? reviews.length);

  return {
    average_rating: Number.isFinite(average) ? average : 0,
    reviews_count: Number.isFinite(count) ? count : reviews.length,
    rating_distribution: normalizeRatingDistribution(body.rating_distribution ?? body.ratingDistribution),
    reviews,
  };
}

function normalizeShopOwnerReviewsResponse(payload: unknown): GetShopOwnerReviewsResponse {
  const body = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;
  const list = Array.isArray(body.reviews) ? body.reviews : Array.isArray(body.data) ? body.data : [];
  const reviews = list.map((item) => normalizeShopReview(item)).filter((item): item is ShopReview => item !== null);
  const average = Number(body.average_rating ?? body.averageRating ?? 0);
  const count = Number(body.reviews_count ?? body.reviewsCount ?? reviews.length);

  return {
    average_rating: Number.isFinite(average) ? average : 0,
    reviews_count: Number.isFinite(count) ? count : reviews.length,
    reviews,
  };
}

function normalizeStoreReviewResponse(payload: unknown): StoreReviewResponse {
  const body = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;
  const review = normalizeShopReview(body.review ?? body.data);
  return {
    message: body.message == null ? undefined : String(body.message),
    review: review ?? {
      id: "",
      rating: 0,
      comment: "",
      shop_reply: null,
      replied_at: null,
      created_at: "",
      user: { id: "", name: "مستخدم" },
    },
  };
}

function normalizeReplyShopReviewResponse(payload: unknown): ReplyShopReviewResponse {
  const body = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;
  const review = normalizeShopReview(body.review ?? body.data);
  return {
    message: body.message == null ? undefined : String(body.message),
    review: review ?? {
      id: "",
      rating: 0,
      comment: "",
      shop_reply: null,
      replied_at: null,
      created_at: "",
      user: { id: "", name: "مستخدم" },
    },
  };
}

function isActiveFlag(value: unknown) {
  if (value === true || value === 1 || value === "1") return true;
  if (value === false || value === 0 || value === "0") return false;
  return null;
}

function isDeletionReasonActive(row: Record<string, unknown>) {
  const active = isActiveFlag(row.is_active);
  if (active != null) return active;

  const hidden = isActiveFlag(row.is_hidden);
  if (hidden != null) return !hidden;

  const visible = isActiveFlag(row.is_visible ?? row.visible);
  if (visible != null) return visible;

  return true;
}

function normalizeAccountDeletionReason(item: unknown): AccountDeletionReason | null {
  if (!item || typeof item !== "object") return null;

  const row = item as Record<string, unknown>;
  const id = Number(row.id);
  const reason = String(row.reason ?? row.name ?? "").trim();
  if (!Number.isFinite(id) || !reason) return null;

  return {
    id,
    reason,
    is_active: isDeletionReasonActive(row),
  };
}

function normalizeAccountDeletionReasons(payload: unknown): GetAccountDeletionReasonsResponse {
  const body = payload as { data?: unknown } | unknown[];
  const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];

  return {
    data: list.map((item) => normalizeAccountDeletionReason(item)).filter((item): item is AccountDeletionReason => item !== null),
  };
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: { token: string | null } }).auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: "api",
  tagTypes: [
    "UserProfile",
    "AccountDeletionReasons",
    "AllAccountDeletionReasons",
    "ShopProfile",
    "ShopProducts",
    "Favorites",
    "Countries",
    "Cities",
    "Brands",
    "DeviceModels",
    "Categories",
    "Products",
    "Services",
    "ShopOwnerVerifications",
    "AdminShopOwners",
    "ShopFeatures",
    "ShopReviews",
    "ShopOwnerReviews",
    "RepairRequests",
    "Notifications",
    "ContactMessages",
    "Roles",
    "RolePermissions",
    "Complaints",
  ],
  baseQuery: (async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
      const token = (api.getState() as { auth: { token: string | null } }).auth.token;
      if (token) {
        api.dispatch(logout());
        api.dispatch(baseApi.util.resetApiState());
      }
    }

    return result;
  }) satisfies BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
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

    getUserProfile: build.query<GetUserProfileResponse, void>({
      query: () => ({
        url: "/user-settings/profile",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeUserProfile(response),
      providesTags: ["UserProfile"],
    }),

    updateUserProfile: build.mutation<UpdateUserProfileResponse, UpdateUserProfileRequest>({
      query: (body) => ({
        url: "/user-settings/profile",
        method: "PUT",
        body,
      }),
      transformResponse: (response: unknown) => normalizeUpdateUserProfileResponse(response),
      // No refetch when the user is about to be logged out to verify the new email.
      invalidatesTags: (result) => (result?.requiresEmailVerification ? [] : ["UserProfile"]),
    }),

    getAccountDeletionReasons: build.query<GetAccountDeletionReasonsResponse, void>({
      query: () => ({
        url: "/user-settings/get/deletion-reasons",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeAccountDeletionReasons(response),
      providesTags: ["AccountDeletionReasons"],
    }),

    getAllAccountDeletionReasons: build.query<GetAccountDeletionReasonsResponse, void>({
      query: () => ({
        url: "/user-settings/get/all-deletion-reasons",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeAccountDeletionReasons(response),
      providesTags: ["AllAccountDeletionReasons"],
    }),

    toggleAccountDeletionReason: build.mutation<{ message?: string }, number>({
      query: (id) => ({
        url: `/user-settings/deletion-reasons/${id}/toggle`,
        method: "POST",
      }),
      invalidatesTags: ["AccountDeletionReasons", "AllAccountDeletionReasons"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          baseApi.util.updateQueryData("getAllAccountDeletionReasons", undefined, (draft) => {
            const reason = draft.data.find((item) => item.id === id);
            if (reason) reason.is_active = !reason.is_active;
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    deleteUserAccount: build.mutation<DeleteUserAccountResponse, DeleteUserAccountRequest>({
      query: (body) => ({
        url: "/user-settings/account",
        method: "DELETE",
        body,
      }),
      // A failure may mean one of the chosen reasons was deactivated, so reload the list.
      invalidatesTags: (_result, error) => (error ? ["AccountDeletionReasons"] : []),
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
      providesTags: ["Services"],
    }),

    getServicesAll: build.query<GetAllServicesResponse, void>({
      query: () => ({
        url: "/services/get-all",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeServices(response),
      providesTags: ["Services"],
    }),

    storeService: build.mutation<{ message?: string }, { service_name: string }>({
      query: (body) => ({
        url: "/services/store",
        method: "POST",
        body: { service_name: body.service_name },
      }),
      invalidatesTags: ["Services"],
    }),

    updateService: build.mutation<{ message?: string }, { id: string | number; service_name: string }>({
      query: ({ id, service_name }) => ({
        url: `/services/update/${id}`,
        method: "PUT",
        body: { service_name },
      }),
      invalidatesTags: ["Services"],
    }),

    deleteService: build.mutation<{ message?: string }, string | number>({
      query: (id) => ({
        url: `/services/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Services"],
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
        url: "/device-models/for-select",
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

    getAdminShopOwnersAll: build.query<GetAdminShopOwnersResponse, void>({
      query: () => ({
        url: "/admin/shop-owners/get-all",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeAdminShopOwners(response),
      providesTags: ["AdminShopOwners"],
    }),

    freezeAdminShopOwner: build.mutation<{ message?: string }, string | number>({
      query: (id) => ({
        url: `/admin/shop-owners/freeze/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminShopOwners"],
    }),

    unfreezeAdminShopOwner: build.mutation<{ message?: string }, string | number>({
      query: (id) => ({
        url: `/admin/shop-owners/unfreeze/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["AdminShopOwners"],
    }),

    deleteAdminShopOwner: build.mutation<{ message?: string }, string | number>({
      query: (id) => ({
        url: `/admin/shop-owners/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminShopOwners"],
    }),

    verifyAdminShopOwner: build.mutation<{ message?: string }, string | number>({
      query: (shopId) => ({
        url: `/shop-owner/${shopId}/verify`,
        method: "POST",
      }),
      invalidatesTags: ["AdminShopOwners"],
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

    getAllPublicShops: build.query<GetAllPublicShopsResponse, GetAllPublicShopsParams | void>({
      query: (params) => {
        const filters = params && typeof params === "object" ? params : {};
        const searchParams = new URLSearchParams();

        const setIfPresent = (key: string, value: string | number | null | undefined) => {
          if (value == null || value === "") return;
          searchParams.set(key, String(value));
        };

        setIfPresent("name", filters.name);
        setIfPresent("cityName", filters.city_name);
        setIfPresent("status", filters.status);
        setIfPresent("service_id", filters.service_id);
        setIfPresent("price", filters.price);
        setIfPresent("sparePart", filters.product_name);
        setIfPresent("rating", filters.rating);
        setIfPresent("is_verified", filters.is_verified);

        const query = searchParams.toString();
        return {
          url: query ? `/home/get-all-shop?${query}` : "/home/get-all-shop",
          method: "GET",
        };
      },
      transformResponse: (response: unknown) => normalizePublicShops(response),
    }),

    getPlatformStatistics: build.query<PlatformStatistics, void>({
      query: () => ({
        url: "/platform/statistics",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizePlatformStatistics(response),
    }),

    searchShopsMap: build.query<MapShopSearchResult[], SearchShopMapParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();

        const setIfPresent = (key: string, value: string | number | null | undefined) => {
          if (value == null || value === "") return;
          searchParams.set(key, String(value));
        };

        setIfPresent("latitude", params.latitude);
        setIfPresent("longitude", params.longitude);
        setIfPresent("service_id", params.service_id);
        setIfPresent("product_id", params.product_id);

        const query = searchParams.toString();
        return {
          url: query ? `/shops/search?${query}` : "/shops/search",
          method: "GET",
        };
      },
      transformResponse: (response: unknown) => normalizeSearchShopMapResponse(response),
    }),

    storeRepairRequest: build.mutation<StoreRepairRequestResponse, FormData>({
      query: (body) => ({
        url: "/repair-requests/store",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RepairRequests", "Notifications"],
    }),

    getAllRepairRequests: build.query<GetAllRepairRequestsResponse, void>({
      query: () => ({
        url: "/repair-requests/get-all-data",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeRepairRequests(response),
      providesTags: ["RepairRequests"],
    }),

    getMyRepairRequests: build.query<GetMyRepairRequestsResponse, void>({
      query: () => ({
        url: "/customer/repair-requests",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeMyRepairRequests(response),
      providesTags: ["RepairRequests"],
    }),

    approveRepairRequest: build.mutation<RepairRequestMutationResponse, string | number>({
      query: (id) => ({
        url: `/repair-requests/approve/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["RepairRequests"],
    }),

    rejectRepairRequest: build.mutation<RepairRequestMutationResponse, string | number>({
      query: (id) => ({
        url: `/repair-requests/reject/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["RepairRequests"],
    }),

    completeRepairRequest: build.mutation<RepairRequestMutationResponse, string | number>({
      query: (id) => ({
        url: `/repair-requests/customer-repair-requests/${id}/complete`,
        method: "POST",
      }),
      invalidatesTags: ["RepairRequests", "Notifications"],
    }),

    deleteRepairRequest: build.mutation<RepairRequestMutationResponse, string | number>({
      query: (id) => ({
        url: `/repair-requests/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RepairRequests"],
    }),

    storeContactMessage: build.mutation<StoreContactMessageResponse, StoreContactMessageRequest>({
      query: (body) => ({
        url: "/contact/store",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ContactMessages"],
    }),

    getAllContactMessages: build.query<GetAllContactMessagesResponse, void>({
      query: () => ({
        url: "/contact/get-all",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeContactMessages(response),
      providesTags: ["ContactMessages"],
    }),

    replyContactMessage: build.mutation<ContactMessageMutationResponse, ReplyContactMessageRequest>({
      query: ({ id, reply }) => ({
        url: `/contact/reply/${id}`,
        method: "POST",
        body: { reply },
      }),
      invalidatesTags: ["ContactMessages"],
      async onQueryStarted({ id, reply }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          const repliedAt = new Date().toISOString();
          dispatch(
            baseApi.util.updateQueryData("getAllContactMessages", undefined, (draft) => {
              const item = draft.data.find((message) => message.id === String(id));
              if (!item) return;
              item.status = "replied";
              item.adminReply = reply;
              item.repliedAt = repliedAt;
            }),
          );
        } catch {
          // keep current list if the reply request fails
        }
      },
    }),

    deleteContactMessage: build.mutation<ContactMessageMutationResponse, string | number>({
      query: (id) => ({
        url: `/contact/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ContactMessages"],
    }),

    getCustomerNotifications: build.query<GetCustomerNotificationsResponse, void>({
      query: () => ({
        url: "/repair-requests/notifications",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeCustomerNotifications(response),
      providesTags: ["Notifications"],
    }),

    markCustomerNotificationRead: build.mutation<RepairRequestMutationResponse, string>({
      query: (id) => ({
        url: `/repair-requests/notifications/${id}/read`,
        method: "POST",
      }),
      invalidatesTags: ["Notifications"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          baseApi.util.updateQueryData("getCustomerNotifications", undefined, (draft) => {
            const notification = draft.data.find((item) => item.id === id);
            if (notification && !notification.read_at) {
              notification.read_at = new Date().toISOString();
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    markAllCustomerNotificationsRead: build.mutation<RepairRequestMutationResponse, void>({
      query: () => ({
        url: "/repair-requests/notifications/read-all",
        method: "POST",
      }),
      invalidatesTags: ["Notifications"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const readAt = new Date().toISOString();
        const patchResult = dispatch(
          baseApi.util.updateQueryData("getCustomerNotifications", undefined, (draft) => {
            draft.data.forEach((notification) => {
              if (!notification.read_at) notification.read_at = readAt;
            });
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
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

    getAllShopFeatures: build.query<GetAllShopFeaturesResponse, void>({
      query: () => ({
        url: "/features-shop/get-all",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeShopFeatures(response),
      providesTags: ["ShopFeatures"],
    }),

    storeShopFeature: build.mutation<ShopFeatureMutationResponse, StoreShopFeatureRequest>({
      query: (body) => ({
        url: "/features-shop/store",
        method: "POST",
        body: {
          feature: body.feature,
          shop_id: body.shop_id,
        },
      }),
      invalidatesTags: ["ShopFeatures"],
    }),

    updateShopFeature: build.mutation<ShopFeatureMutationResponse, UpdateShopFeatureRequest>({
      query: ({ id, feature, shop_id }) => ({
        url: `/features-shop/update/${id}`,
        method: "PUT",
        body: {
          feature,
          shop_id,
        },
      }),
      invalidatesTags: ["ShopFeatures"],
    }),

    deleteShopFeature: build.mutation<ShopFeatureMutationResponse, string | number>({
      query: (id) => ({
        url: `/features-shop/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ShopFeatures"],
    }),

    getShopReviews: build.query<GetShopReviewsResponse, string | number>({
      query: (shopId) => ({
        url: `/shops/${shopId}/reviews`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeShopReviewsResponse(response),
      providesTags: (_result, _error, shopId) => [{ type: "ShopReviews", id: String(shopId) }],
    }),

    storeReview: build.mutation<StoreReviewResponse, StoreReviewRequest>({
      query: ({ shopId, rating, comment }) => ({
        url: `/reviews/${shopId}/reviews/store`,
        method: "POST",
        body: { rating, comment },
      }),
      transformResponse: (response: unknown) => normalizeStoreReviewResponse(response),
      invalidatesTags: (_result, _error, arg) => [{ type: "ShopReviews", id: String(arg.shopId) }, "ShopOwnerReviews"],
    }),

    updateReview: build.mutation<ReviewMutationResponse, UpdateReviewRequest & { shopId: string | number }>({
      query: ({ id, rating, comment }) => ({
        url: `/reviews/update/${id}`,
        method: "PUT",
        body: { rating, comment },
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "ShopReviews", id: String(arg.shopId) }, "ShopOwnerReviews"],
    }),

    deleteReview: build.mutation<ReviewMutationResponse, { id: string | number; shopId: string | number }>({
      query: ({ id }) => ({
        url: `/reviews/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "ShopReviews", id: String(arg.shopId) }, "ShopOwnerReviews"],
    }),

    getShopOwnerReviews: build.query<GetShopOwnerReviewsResponse, void>({
      query: () => ({
        url: "/shop-owner/reviews/get-all",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeShopOwnerReviewsResponse(response),
      providesTags: ["ShopOwnerReviews"],
    }),

    replyShopOwnerReview: build.mutation<ReplyShopReviewResponse, ReplyShopReviewRequest>({
      query: ({ id, reply }) => ({
        url: `/shop-owner/reviews/reply/${id}`,
        method: "PATCH",
        body: { reply },
      }),
      transformResponse: (response: unknown) => normalizeReplyShopReviewResponse(response),
      invalidatesTags: ["ShopOwnerReviews", "ShopReviews"],
    }),

    deleteAdminReview: build.mutation<ReviewMutationResponse, { id: string | number; shopId?: string | number }>({
      query: ({ id }) => ({
        url: `/admin/reviews/delete/${id}`,
        method: "PUT",
      }),
      invalidatesTags: (_result, _error, arg) => ["ShopOwnerReviews", ...(arg.shopId != null ? [{ type: "ShopReviews" as const, id: String(arg.shopId) }] : ["ShopReviews" as const])],
    }),

    getAllRoles: build.query<GetAllRolesResponse, void>({
      query: () => ({
        url: "/roles",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeRoles(response),
      providesTags: ["Roles"],
    }),

    getRolesForSelect: build.query<GetRolesForSelectResponse, void>({
      query: () => ({
        url: "/roles/select",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeRolesForSelect(response),
      providesTags: ["Roles"],
    }),

    storeRole: build.mutation<RoleMutationResponse, { name: string }>({
      query: (body) => ({
        url: "/roles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Roles"],
    }),

    updateRole: build.mutation<RoleMutationResponse, { id: string | number; name: string }>({
      query: ({ id, name }) => ({
        url: `/roles/${id}`,
        method: "PUT",
        body: { name },
      }),
      invalidatesTags: ["Roles", "RolePermissions"],
    }),

    deleteRole: build.mutation<RoleMutationResponse, string | number>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Roles", "RolePermissions"],
    }),

    getRolePermissions: build.query<GetRolePermissionsResponse, string | number>({
      query: (roleId) => ({
        url: `/roles/${roleId}/permissions`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeRolePermissions(response),
      providesTags: (_result, _error, roleId) => [{ type: "RolePermissions", id: String(roleId) }],
    }),

    giveRolePermission: build.mutation<RoleMutationResponse, { roleId: string | number; permissionId: string | number }>({
      query: ({ roleId, permissionId }) => ({
        url: `/roles/${roleId}/permissions/${permissionId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "RolePermissions", id: String(arg.roleId) }],
    }),

    revokeRolePermission: build.mutation<RoleMutationResponse, { roleId: string | number; permissionId: string | number }>({
      query: ({ roleId, permissionId }) => ({
        url: `/roles/${roleId}/permissions/${permissionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: "RolePermissions", id: String(arg.roleId) }],
    }),

    storeComplaint: build.mutation<StoreComplaintResponse, StoreComplaintRequest>({
      query: (body) => ({
        url: "/complaints/store",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Complaints"],
    }),

    getMyComplaints: build.query<GetAllComplaintsResponse, void>({
      query: () => ({
        url: "/complaints/my-complaints",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeComplaints(response),
      providesTags: ["Complaints"],
    }),

    getAllComplaints: build.query<GetAllComplaintsResponse, void>({
      query: () => ({
        url: "/complaints/get-all",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeComplaints(response),
      providesTags: ["Complaints"],
    }),

    replyComplaint: build.mutation<ComplaintMutationResponse, ReplyComplaintRequest>({
      query: ({ id, admin_reply }) => ({
        url: `/complaints/reply/${id}`,
        method: "POST",
        body: { admin_reply },
      }),
      invalidatesTags: ["Complaints"],
    }),

    deleteComplaint: build.mutation<ComplaintMutationResponse, string | number>({
      query: (id) => ({
        url: `/complaints/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Complaints"],
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
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetAccountDeletionReasonsQuery,
  useGetAllAccountDeletionReasonsQuery,
  useToggleAccountDeletionReasonMutation,
  useDeleteUserAccountMutation,
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
  useGetServicesAllQuery,
  useStoreServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
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
  useGetAdminShopOwnersAllQuery,
  useFreezeAdminShopOwnerMutation,
  useUnfreezeAdminShopOwnerMutation,
  useDeleteAdminShopOwnerMutation,
  useVerifyAdminShopOwnerMutation,
  useSaveOrUpdateShopProfileMutation,
  useGetShopProfileQuery,
  useUpdateShopStatusMutation,
  useStoreShopProductMutation,
  useUpdateShopProductMutation,
  useDeleteShopProductMutation,
  useGetAllShopProductsQuery,
  useGetAllPublicShopsQuery,
  useGetPlatformStatisticsQuery,
  useLazySearchShopsMapQuery,
  useGetPublicShopDetailsQuery,
  useStoreRepairRequestMutation,
  useGetAllRepairRequestsQuery,
  useGetMyRepairRequestsQuery,
  useApproveRepairRequestMutation,
  useRejectRepairRequestMutation,
  useCompleteRepairRequestMutation,
  useDeleteRepairRequestMutation,
  useStoreContactMessageMutation,
  useGetAllContactMessagesQuery,
  useReplyContactMessageMutation,
  useDeleteContactMessageMutation,
  useGetCustomerNotificationsQuery,
  useMarkCustomerNotificationReadMutation,
  useMarkAllCustomerNotificationsReadMutation,
  useAddFavoriteShopMutation,
  useRemoveFavoriteShopMutation,
  useGetMyFavoritesQuery,
  useGetAllShopFeaturesQuery,
  useStoreShopFeatureMutation,
  useUpdateShopFeatureMutation,
  useDeleteShopFeatureMutation,
  useGetShopReviewsQuery,
  useStoreReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useGetShopOwnerReviewsQuery,
  useReplyShopOwnerReviewMutation,
  useDeleteAdminReviewMutation,
  useGetAllRolesQuery,
  useGetRolesForSelectQuery,
  useStoreRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRolePermissionsQuery,
  useGiveRolePermissionMutation,
  useRevokeRolePermissionMutation,
  useStoreComplaintMutation,
  useGetMyComplaintsQuery,
  useGetAllComplaintsQuery,
  useReplyComplaintMutation,
  useDeleteComplaintMutation,
} = baseApi;
