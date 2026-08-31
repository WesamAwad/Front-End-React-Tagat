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
  ResetPasswordRequest,
  ResetPasswordResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  Service,
  Category,
  Brand,
  BrandDevice,
  BrandDetails,
  CategoryProduct,
  CategoryDetails,
  ShopProfileData,
  ShopProfileSaveOrUpdateResponse,
  ShopProfileWorkingHour,
  GetShopProfileResponse,
  StoreShopProductResponse,
  UpdateShopProductResponse,
  ShopProduct,
  GetAllShopProductsResponse,
  WorkshopRegisterResponse,
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

function normalizeShopProductStatus(value: unknown): ShopProduct["status"] {
  const status = String(value ?? "available");
  return status === "out_of_stock" ? "out_of_stock" : "available";
}

function normalizeShopProduct(item: unknown): ShopProduct | null {
  if (!item || typeof item !== "object") return null;

  const row = item as Record<string, unknown>;
  const product = row.product ?? row.product_model;
  const category = row.category;
  const device = row.device ?? row.device_model;
  const brand = row.brand ?? row.company;
  const productRecord = product && typeof product === "object" ? (product as Record<string, unknown>) : null;
  const deviceRecord = device && typeof device === "object" ? (device as Record<string, unknown>) : null;
  const categoryFromProduct = productRecord?.category;
  const brandFromProduct = productRecord?.brand;
  const brandFromDevice = deviceRecord?.brand;

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
  const deviceModelName = String(row.device_model_name ?? "") || pickNestedName(device, ["device_model_name", "name", "name_ar", "title"]) || pickNestedName(row, ["device_name", "compatible_device"]);

  return {
    id,
    company: companyId,
    companyName,
    product_id: productId,
    product_name: productName,
    category_id: categoryId,
    category_name: categoryName,
    device_model_id: toIdString(row.device_model_id ?? row.device_id ?? pickNestedId(device)),
    device_model_name: deviceModelName,
    description: String(row.description ?? ""),
    price: Number(row.price ?? 0),
    quantity: Number(row.quantity ?? row.qty ?? 0),
    image: resolveMediaPath(String(row.image ?? row.image_url ?? row.photo ?? "")),
    status: normalizeShopProductStatus(row.status),
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

  const data: Country[] = list
    .map((item) => {
      if (typeof item === "string") {
        return { id: item, name: item };
      }

      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        const name = String(row.name ?? row.name_ar ?? row.country_name ?? row.title ?? "");
        const id = (row.id ?? row.code ?? name) as number | string;
        if (!name) return null;
        return { id, name };
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

  const data: City[] = list
    .map((item) => {
      if (typeof item === "string") {
        return { id: item, name: item };
      }

      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        const name = String(row.name ?? row.name_ar ?? row.city_name ?? row.title ?? "");
        const id = (row.id ?? row.code ?? name) as number | string;
        if (!name) return null;
        return { id, name };
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

  const data: Category[] = list
    .map((item) => {
      if (typeof item === "string") {
        return { id: item, name: item };
      }

      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        const name = String(row.name ?? row.name_ar ?? row.category_name ?? row.title ?? "");
        const id = (row.id ?? row.code ?? name) as number | string;
        if (!name) return null;
        return { id, name };
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

  const data: Brand[] = list
    .map((item) => {
      if (typeof item === "string") {
        return { id: item, name: item };
      }

      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        const name = String(row.name ?? row.name_ar ?? row.brand_name ?? row.title ?? "");
        const id = (row.id ?? row.code ?? name) as number | string;
        if (!name) return null;
        return { id, name };
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

function normalizeServiceIds(value: unknown): Array<string | number> {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "number" || typeof item === "string") return item;
      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        if (row.id != null) return row.id as string | number;
        if (row.service_id != null) return row.service_id as string | number;
      }
      return null;
    })
    .filter((item): item is string | number => item !== null);
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
  const data: ShopProfileData = {
    shop_name: String(raw.shop_name ?? raw.name ?? ""),
    description: String(raw.description ?? ""),
    cover_image: resolveMediaPath(coverImage == null || coverImage === "" ? null : String(coverImage)) || null,
    country_id: toIdString(raw.country_id ?? raw.country),
    city_id: toIdString(raw.city_id ?? raw.city),
    district: String(raw.district ?? raw.district_id ?? ""),
    street: String(raw.street ?? ""),
    latitude: String(raw.latitude ?? ""),
    longitude: String(raw.longitude ?? ""),
    working_hours: normalizeWorkingHours(raw.working_hours),
    service_ids: normalizeServiceIds(raw.service_ids ?? raw.services),
  };

  return {
    message: body && typeof body === "object" ? body.message : undefined,
    data,
  };
}

export const baseApi = createApi({
  reducerPath: "api",
  tagTypes: ["ShopProfile", "ShopProducts"],
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
    }),

    getBrandsForSelect: build.query<GetBrandsForSelectResponse, void>({
      query: () => ({
        url: "/brands/get-for-select",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeBrands(response),
    }),

    getBrandById: build.query<GetBrandDetailsResponse, string | number>({
      query: (id) => ({
        url: `/brands/show/${id}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeBrandDetails(response),
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

    registerWorkShop: build.mutation<WorkshopRegisterResponse, FormData>({
      query: (body) => ({
        url: "/shop-owner/store/shop-owner-verifications",
        method: "POST",
        body,
      }),
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

    storeShopProduct: build.mutation<StoreShopProductResponse, FormData>({
      query: (body) => ({
        url: "/shop-products/store",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ShopProducts"],
    }),

    updateShopProduct: build.mutation<UpdateShopProductResponse, { id: string | number; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/shop-products/update/${id}`,
        method: "PUT",
        body,
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
  }),
});

export const {
  useRegisterClientMutation,
  useLoginClientMutation,
  useLogoutClientMutation,
  usePasswordSendCodeMutation,
  usePasswordResetMutation,
  useSendVerificationMutation,
  useResendVerificationMutation,
  useGetAllCountriesQuery,
  useGetAllCitiesQuery,
  useGetAllServicesQuery,
  useGetCategoriesForSelectQuery,
  useGetBrandsForSelectQuery,
  useGetBrandByIdQuery,
  useGetCategoryByIdQuery,
  useRegisterWorkShopMutation,
  useSaveOrUpdateShopProfileMutation,
  useGetShopProfileQuery,
  useStoreShopProductMutation,
  useUpdateShopProductMutation,
  useGetAllShopProductsQuery,
} = baseApi;
