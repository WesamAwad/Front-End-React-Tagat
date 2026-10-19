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
    id?: string | number;
    first_name: string;
    last_name: string;
    role?: string | string[] | { name?: string }[];
    roles?: string[] | { name?: string }[];
  };
  role?: string | string[] | { name?: string }[];
  roles?: string[] | { name?: string }[];
  permissions?: string[];
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

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string | null;
}

export interface GetUserProfileResponse {
  message?: string;
  data: UserProfile | null;
}

export interface UpdateUserProfileRequest {
  first_name: string;
  last_name: string;
  email: string;
}

export interface UpdateUserProfileResponse {
  message?: string;
  requiresEmailVerification: boolean;
}

export interface AccountDeletionReason {
  id: number;
  reason: string;
  is_active: boolean;
}

export interface GetAccountDeletionReasonsResponse {
  data: AccountDeletionReason[];
}

export interface DeleteUserAccountRequest {
  reason_id: number[];
}

export interface DeleteUserAccountResponse {
  message?: string;
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
  created_at?: string | null;
  updated_at?: string | null;
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

/** Admin list item from `/admin/shop-owners/get-all` — keeps every returned field. */
export interface AdminShopOwner {
  id: string | number;
  raw: Record<string, unknown>;
}

export interface GetAdminShopOwnersResponse {
  message?: string;
  data: AdminShopOwner[];
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
  is_verified: boolean;
  average_rating: number;
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

export interface PublicShopDetailsFeature {
  id: string;
  feature: string;
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
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  completed_repair_requests_count: number;
  services: PublicShopDetailsService[];
  products: PublicShopDetailsProduct[];
  features: PublicShopDetailsFeature[];
  working_hours: ShopProfileWorkingHour[];
}

export interface GetAllPublicShopsParams {
  /** Partial shop name search — scopeByName */
  name?: string | null;
  /** City name — scopeByCity (`cityName` query). */
  city_name?: string | null;
  /** Shop status e.g. open — scopeByStatus (needs byStatus in controller). */
  status?: string | null;
  /** Service id — scopeByService */
  service_id?: number | null;
  /** Service price — scopeByPrice (`price` query). */
  price?: number | null;
  /** Spare part / product name — scopeBySparePart (`sparePart` query). */
  product_name?: string | null;
  /** Minimum average rating — scopeByRating */
  rating?: number | null;
  /** Verified shops only — send `1` when filtering verified */
  is_verified?: 1 | null;
}

export interface StoreRepairRequestResponse {
  message?: string;
}

export interface RepairRequestCustomer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface RepairRequestNamedRef {
  id: string;
  name: string;
}

export interface RepairRequest {
  id: string;
  customer: RepairRequestCustomer | null;
  shop_name: string;
  device_model: RepairRequestNamedRef | null;
  service: RepairRequestNamedRef | null;
  description: string;
  image: string;
  status: string;
  phone_number: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface GetAllRepairRequestsResponse {
  message?: string;
  data: RepairRequest[];
}

export interface CustomerRepairRequest {
  id: string;
  shop_name: string;
  status: string;
  device_model_name: string;
  service_name: string;
  created_at: string;
}

export interface GetMyRepairRequestsResponse {
  message?: string;
  data: CustomerRepairRequest[];
}

export interface RepairRequestMutationResponse {
  message?: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  adminReply: string | null;
  repliedAt: string | null;
  date: string;
}

export interface GetAllContactMessagesResponse {
  message?: string;
  data: ContactMessage[];
}

export interface StoreContactMessageRequest {
  full_name: string;
  email: string;
  subject: string;
  message: string;
}

export interface StoreContactMessageResponse {
  message?: string;
}

export interface ReplyContactMessageRequest {
  id: string | number;
  reply: string;
}

export interface ContactMessageMutationResponse {
  message?: string;
}

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  status: string;
  shop_name: string;
  service_name: string;
  device_model_name: string;
  repair_request_id: string;
  read_at: string | null;
  created_at: string;
}

export interface GetCustomerNotificationsResponse {
  message?: string;
  data: CustomerNotification[];
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

export interface ShopFeature {
  id: string;
  feature: string;
  shop_id: string;
}

export interface GetAllShopFeaturesResponse {
  message?: string;
  data: ShopFeature[];
}

export interface StoreShopFeatureRequest {
  feature: string;
  shop_id: string | number;
}

export interface UpdateShopFeatureRequest {
  id: string | number;
  feature: string;
  shop_id: string | number;
}

export interface ShopFeatureMutationResponse {
  message?: string;
}

export interface ReviewUser {
  id: string;
  name: string;
}

export interface ShopReview {
  id: string;
  rating: number;
  comment: string;
  shop_reply: string | null;
  replied_at: string | null;
  created_at: string;
  user: ReviewUser;
}

export interface AdminShopReview extends ShopReview {
  shop_id: string;
  shop_name: string;
}

export interface GetAdminReviewsResponse {
  reviews: AdminShopReview[];
}

export interface ShopReviewsRatingDistribution {
  "5": number;
  "4": number;
  "3": number;
  "2": number;
  "1": number;
}

export interface GetShopReviewsResponse {
  average_rating: number;
  reviews_count: number;
  rating_distribution: ShopReviewsRatingDistribution;
  reviews: ShopReview[];
}

export interface GetShopOwnerReviewsResponse {
  average_rating: number;
  reviews_count: number;
  reviews: ShopReview[];
}

export interface StoreReviewRequest {
  shopId: string | number;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  id: string | number;
  rating: number;
  comment: string;
}

export interface StoreReviewResponse {
  message?: string;
  review: ShopReview;
}

export interface ReviewMutationResponse {
  message?: string;
}

export interface ReplyShopReviewRequest {
  id: string | number;
  reply: string;
}

export interface ReplyShopReviewResponse {
  message?: string;
  review: ShopReview;
}

export interface PlatformReview {
  customer_name: string;
  comment: string;
  rating: number;
}

export interface PlatformStatistics {
  customers_count: number;
  completed_requests_count: number;
  excellent_reviews_count: number;
  verified_shops_count: number;
  reviews: PlatformReview[];
}

export interface SearchShopMapParams {
  latitude?: number | null;
  longitude?: number | null;
  service_id?: number | null;
  product_id?: number | null;
}

export interface MapShopSearchProduct {
  name: string;
  price: string;
  quantity: number | null;
  status: string;
}

export interface MapShopSearchResult {
  id: string;
  shop_name: string;
  cover_image: string;
  city: string;
  district: string;
  street: string;
  status: string;
  is_verified: boolean;
  latitude: number | null;
  longitude: number | null;
  distance: number | null;
  product: MapShopSearchProduct | null;
}

export interface AppRole {
  id: string | number;
  name: string;
  guard_name?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GetAllRolesResponse {
  message?: string;
  roles: AppRole[];
}

export interface GetRolesForSelectResponse {
  message?: string;
  roles: Pick<AppRole, "id" | "name">[];
}

export interface RolePermission {
  id: string | number;
  name: string;
  assigned: boolean;
}

export interface GetRolePermissionsResponse {
  message?: string;
  role: Pick<AppRole, "id" | "name">;
  permissions: RolePermission[];
}

export interface RoleMutationResponse {
  message?: string;
}

export interface ComplaintCustomer {
  id: string;
  name: string;
  email: string;
}

export interface ComplaintShop {
  id: string;
  name: string;
}

export interface Complaint {
  id: string;
  customer: ComplaintCustomer | null;
  shop: ComplaintShop | null;
  subject: string;
  message: string;
  status: string;
  status_name: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

export interface GetAllComplaintsResponse {
  message?: string;
  data: Complaint[];
}

export interface StoreComplaintRequest {
  shop_id: string | number;
  subject: string;
  message: string;
}

export interface StoreComplaintResponse {
  message?: string;
  data?: Complaint | null;
}

export interface ReplyComplaintRequest {
  id: string | number;
  admin_reply: string;
}

export interface ComplaintMutationResponse {
  message?: string;
}
