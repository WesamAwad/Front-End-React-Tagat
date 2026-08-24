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

export interface WorkshopRegisterResponse {
  message: string;
}
