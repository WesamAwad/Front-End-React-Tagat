export interface ClientRegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  password_confirmation: string;
}

export interface ClientRegisterResponse {
  message: string;
}

export interface ClientLoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface ClientLoginResponse {
  message: string;
  data: {
    first_name: string;
    last_name: string;
  };
  token: string;
}

export interface AuthValidationErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ClientLogoutResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
}

export interface Country {
  id: number | string;
  name: string;
}

export interface GetAllCountriesResponse {
  message?: string;
  data: Country[];
}

export interface City {
  id: number | string;
  name: string;
}

export interface GetAllCitiesResponse {
  message?: string;
  data: City[];
}

export interface District {
  id: number | string;
  name: string;
}

export interface GetAllDistrictsResponse {
  message?: string;
  data: District[];
}

export interface Service {
  id: number | string;
  name: string;
}

export interface GetAllServicesResponse {
  message?: string;
  data: Service[];
}

export interface Category {
  id: number | string;
  name: string;
}

export interface GetCategoriesForSelectResponse {
  message?: string;
  data: Category[];
}

export interface Brand {
  id: number | string;
  name: string;
}

export interface GetBrandsForSelectResponse {
  message?: string;
  data: Brand[];
}

export interface BrandDevice {
  id: number | string;
  name: string;
}

export interface BrandDetails {
  id: number | string;
  name: string;
  devices: BrandDevice[];
}

export interface GetBrandDetailsResponse {
  message?: string;
  data: BrandDetails | null;
}

export interface CategoryProduct {
  id: number | string;
  name: string;
}

export interface CategoryDetails {
  id: number | string;
  name: string;
  products: CategoryProduct[];
}

export interface GetCategoryDetailsResponse {
  message?: string;
  data: CategoryDetails | null;
}

export interface WorkshopRegisterResponse {
  message: string;
}

export interface ShopProfileWorkingHour {
  day: string;
  from: string;
  to: string;
}

export interface ShopProfileData {
  shop_name: string;
  description: string;
  cover_image: string | null;
  country_id: string;
  city_id: string;
  district: string;
  street: string;
  latitude: string;
  longitude: string;
  working_hours: ShopProfileWorkingHour[];
  service_ids: Array<string | number>;
}

export interface GetShopProfileResponse {
  message?: string;
  data: ShopProfileData | null;
}

export interface ShopProfileSaveOrUpdateResponse {
  message: string;
}

export interface StoreShopProductResponse {
  message: string;
}

export interface UpdateShopProductResponse {
  message: string;
}

export type ShopProductStatus = "available" | "out_of_stock";

export interface ShopProduct {
  id: string;
  company: string;
  companyName: string;
  product_id: string;
  product_name: string;
  category_id: string;
  category_name: string;
  device_model_id: string;
  device_model_name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  status: ShopProductStatus;
}

export interface GetAllShopProductsResponse {
  message?: string;
  data: ShopProduct[];
}
