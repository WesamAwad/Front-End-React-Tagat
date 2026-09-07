import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import HomePage from "../features/home/HomePage";
import WorkshopsPage from "../features/workshops/WorkshopsPage";
import DetailsWorkShop from "../features/workshops/workshopDetails/Details-WorkShop";
import WorkshopBookingPage from "../features/workshopBooking/WorkshopBookingPage";
import AiDiagnosisPage from "../features/ai-diagnosis/AiDiagnosisPage";
import AboutPage from "../features/about/AboutPage";
import ContactPage from "../features/contact/ContactPage";
import FavoritesPage from "../features/favorites/FavoritesPage";
import LoginPage from "../features/login/LoginPage";
import ForgotPasswordPage from "../features/login/ForgotPasswordPage";
import ResetPasswordPage from "../features/login/ResetPasswordPage";
import ChangePasswordPage from "../features/login/ChangePasswordPage";
import VerifyEmailPage from "../features/login/VerifyEmailPage";
import SignupPage from "../features/signup/SignupPage";
import ClientSignupPage from "../features/signup/ClientSignupPage";
import WorkshopSignupPage from "../features/signup/WorkshopSignupPage";
import HomeWorkshopPage from "../features/dashboardWorkshop/pages/HomeWorkshopPage";
import OrdersWorkshopPage from "../features/dashboardWorkshop/pages/OrdersWorkshopPage";
import SparePartsWorkshopPage from "../features/dashboardWorkshop/spareParts/SparePartsWorkshopPage";
import SettingsWorkshopPage from "../features/dashboardWorkshop/pages/SettingsWorkshopPage";
import ProfilePage from "../features/dashboardWorkshop/pages/ProfilePage";
import CountriesPage from "../features/admin/countries/CountriesPage";
import CitiesPage from "../features/admin/cities/CitiesPage";
import CompaniesPage from "../features/admin/companies/CompaniesPage";
import DevicesPage from "../features/admin/devices/DevicesPage";
import CategoriesPage from "../features/admin/categories/CategoriesPage";
import ProductsPage from "../features/admin/products/ProductsPage";
import WorkshopOwnerRequestsPage from "../features/admin/workshopOwnerRequests/WorkshopOwnerRequestsPage";
import ErrorPage from "../components/ErrorPage";
import { GuestRoute } from "../features/auth/GuestRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,

    errorElement: <ErrorPage />,

    children: [
      {
        index: true, // تعني أن هذا هو المسار الافتراضي (/)
        element: <HomePage />,
      },
      {
        path: "workshops",
        element: <WorkshopsPage />,
      },
      {
        path: "workshops/booking",
        element: <WorkshopBookingPage />,
      },
      {
        path: "workshops/:id",
        element: <DetailsWorkShop />,
      },
      {
        path: "ai-diagnosis",
        element: <AiDiagnosisPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      {
        path: "favorites",
        element: <FavoritesPage />,
      },
    ],
  },
  {
    element: <GuestRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/signup",
        element: <SignupPage />,
      },
      {
        path: "/signup/client",
        element: <ClientSignupPage />,
      },
      {
        path: "/signup/workshop",
        element: <WorkshopSignupPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/reset-password",
        element: <ResetPasswordPage />,
      },
      {
        path: "/verify-email",
        element: <VerifyEmailPage />,
      },
    ],
  },
  {
    path: "/change-password",
    element: <ChangePasswordPage />,
    errorElement: <ErrorPage />,
  },

  {
    path: "/workshop-owner",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <HomeWorkshopPage />,
      },
      {
        path: "orders",
        element: <OrdersWorkshopPage />,
      },
      {
        path: "spare-parts",
        element: <SparePartsWorkshopPage />,
      },
      {
        path: "settings",
        element: <SettingsWorkshopPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: "/admin",
    element: <DashboardLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "countries",
        element: <CountriesPage />,
      },
      {
        path: "cities",
        element: <CitiesPage />,
      },
      {
        path: "companies",
        element: <CompaniesPage />,
      },
      {
        path: "devices",
        element: <DevicesPage />,
      },
      {
        path: "categories",
        element: <CategoriesPage />,
      },
      {
        path: "products",
        element: <ProductsPage />,
      },
      {
        path: "workshop-owner-requests",
        element: <WorkshopOwnerRequestsPage />,
      },
    ],
  },
]);
