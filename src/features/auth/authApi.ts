import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ClientLoginRequest,
  ClientLoginResponse,
  ClientLogoutResponse,
  ClientRegisterRequest,
  ClientRegisterResponse,
  Country,
  City,
  District,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  GetAllCountriesResponse,
  GetAllCitiesResponse,
  GetAllDistrictsResponse,
  GetAllServicesResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  Service,
  WorkshopRegisterResponse,
} from "../../types/authTypes";
/** Start Mock API */
import { mockLogin, mockLogout } from "./authMock";

const useMock = import.meta.env.VITE_USE_AUTH_MOCK === "true";

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

function normalizeDistricts(payload: unknown): GetAllDistrictsResponse {
  const body = payload as { data?: unknown; districts?: unknown; message?: string } | unknown[];

  const list = Array.isArray(body) ? body : Array.isArray((body as { data?: unknown }).data) ? (body as { data: unknown[] }).data : Array.isArray((body as { districts?: unknown }).districts) ? (body as { districts: unknown[] }).districts : [];

  const data: District[] = list
    .map((item) => {
      if (typeof item === "string") {
        return { id: item, name: item };
      }

      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        const name = String(row.name ?? row.name_ar ?? row.district_name ?? row.title ?? "");
        const id = (row.id ?? row.code ?? name) as number | string;
        if (!name) return null;
        return { id, name };
      }

      return null;
    })
    .filter((item): item is District => item !== null);

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

export const baseApi = createApi({
  reducerPath: "api",
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
        url: "/shop-owner/get-all-countrys",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeCountries(response),
    }),

    getAllServices: build.query<GetAllServicesResponse, void>({
      query: () => ({
        url: "/shop-owner/get-all-services",
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeServices(response),
    }),

    getAllCities: build.query<GetAllCitiesResponse, string | number>({
      query: (id) => ({
        url: `/shop-owner/get-all-city/${id}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeCities(response),
    }),

    getAllDistricts: build.query<GetAllDistrictsResponse, string | number>({
      query: (id) => ({
        url: `/shop-owner/get-all-district/${id}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => normalizeDistricts(response),
    }),

    registerWorkShop: build.mutation<WorkshopRegisterResponse, FormData>({
      query: (body) => ({
        url: "/shop-owner/store",
        method: "POST",
        body,
      }),
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
  useGetAllDistrictsQuery,
  useGetAllServicesQuery,
  useRegisterWorkShopMutation,
} = baseApi;
