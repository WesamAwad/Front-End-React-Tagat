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

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordResponse {
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
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GetAllCountriesResponse {
  message?: string;
  data: Country[];
}

export interface City {
  id: number | string;
  name: string;
  country_id?: number | string | null;
  country_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
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
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GetCategoriesForSelectResponse {
  message?: string;
  data: Category[];
}

export interface Brand {
  id: number | string;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GetBrandsForSelectResponse {
  message?: string;
  data: Brand[];
}

export interface BrandDevice {
  id: number | string;
  name: string;
}

export interface DeviceModel {
  id: number | string;
  name: string;
  brand_id?: number | string | null;
  brand_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GetAllDeviceModelsResponse {
  message?: string;
  data: DeviceModel[];
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

export interface Product {
  id: number | string;
  name: string;
  category_id?: number | string | null;
  category_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GetAllProductsResponse {
  message?: string;
  data: Product[];
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

export type ShopOwnerVerificationStatus = "pending" | "accepted" | "rejected";

export interface ShopOwnerVerificationRequest {
  id: number | string;
  full_name: string;
  email: string;
  phone_number: string;
  national_id_image: string | null;
  commercial_record_image: string | null;
  country: string;
  country_id?: string | number | null;
  services: string[];
  notes: string;
  status: ShopOwnerVerificationStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GetShopOwnerVerificationDataResponse {
  message?: string;
  data: ShopOwnerVerificationRequest[];
}

export interface ShopProfileWorkingHour {
  day: string;
  from: string;
  to: string;
}

export interface ShopProfileService {
  service_id: string | number;
  price: number;
  name?: string;
}

export interface ShopProfileData {
  id: string;
  shop_name: string;
  description: string;
  cover_image: string | null;
  commercial_record_image: string | null;
  country_id: string;
  city_id: string;
  district: string;
  street: string;
  latitude: string;
  longitude: string;
  status: "open" | "closed";
  working_hours: ShopProfileWorkingHour[];
  services: ShopProfileService[];
}

export interface GetShopProfileResponse {
  message?: string;
  data: ShopProfileData | null;
}

export interface ShopProfileSaveOrUpdateResponse {
  message: string;
}

export interface UpdateShopStatusResponse {
  message?: string;
}

export interface StoreShopProductResponse {
  message: string;
}

export interface UpdateShopProductResponse {
  message: string;
}

export interface DeleteShopProductResponse {
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

export interface PublicShop {
  id: string;
  shop_name: string;
  cover_image: string;
  country: string;
  city: string;
  district: string;
  street: string;
  status: string;
  services: string[];
}

export interface PublicShopDetailsService {
  id: string;
  name: string;
  priceMin: number;
  priceMax: number;
}

export interface PublicShopDetailsProduct {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  quantity: number;
  isAvailable: boolean;
  image: string;
}

export interface PublicShopDetails {
  id: string;
  shop_name: string;
  description: string;
  cover_image: string;
  country: string;
  city: string;
  district: string;
  street: string;
  status: string;
  latitude: string;
  longitude: string;
  services: PublicShopDetailsService[];
  products: PublicShopDetailsProduct[];
  working_hours: ShopProfileWorkingHour[];
}

export interface GetAllPublicShopsResponse {
  message?: string;
  data: PublicShop[];
}

export interface GetPublicShopDetailsResponse {
  message?: string;
  data: PublicShopDetails | null;
}

export interface AddFavoriteShopResponse {
  message: string;
}

export interface RemoveFavoriteShopResponse {
  message: string;
}

export interface FavoriteShopService {
  id: string;
  service_name: string;
}

export interface FavoriteShop {
  id: string;
  shop_id: string;
  shop_name: string;
  description: string;
  cover_image: string;
  country: string;
  city: string;
  district: string;
  street: string;
  working_hours: unknown[];
  services: FavoriteShopService[];
}

export interface GetMyFavoritesResponse {
  message?: string;
  favorites: FavoriteShop[];
}
