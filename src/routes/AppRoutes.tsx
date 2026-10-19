import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import HomePage from "../features/home/HomePage";
import WorkshopsPage from "../features/workshops/WorkshopsPage";
import DetailsWorkShop from "../features/workshops/workshopDetails/Details-WorkShop";
import WorkshopBookingPage from "../features/workshopBooking/WorkshopBookingPage";
import AboutPage from "../features/about/AboutPage";
import TermsPage from "../features/legal/TermsPage";
import PrivacyPage from "../features/legal/PrivacyPage";
import ContactPage from "../features/contact/ContactPage";
import FavoritesPage from "../features/favorites/FavoritesPage";
import BookingsPage from "../features/booking/BookingsPage";
import CustomerProfilePage from "../features/profile/CustomerProfilePage";
import LoginPage from "../features/login/LoginPage";
import ForgotPasswordPage from "../features/login/ForgotPasswordPage";
import ResetPasswordPage from "../features/login/ResetPasswordPage";
import VerifyEmailPage from "../features/login/VerifyEmailPage";
import SignupPage from "../features/signup/SignupPage";
import ClientSignupPage from "../features/signup/ClientSignupPage";
import WorkshopSignupPage from "../features/signup/WorkshopSignupPage";
import HomeWorkshopPage from "../features/dashboardWorkshop/pages/HomeWorkshopPage";
import OrdersWorkshopPage from "../features/dashboardWorkshop/pages/OrdersWorkshopPage";
import SparePartsWorkshopPage from "../features/dashboardWorkshop/spareParts/SparePartsWorkshopPage";
import SpecsWorkshopPage from "../features/dashboardWorkshop/specification/SpecsWorkshopPage";
import ProfilePage from "../features/dashboardWorkshop/pages/ProfilePage";
import ReviewsWorkshopPage from "../features/dashboardWorkshop/pages/ReviewsWorkshopPage";
import ContactMessagesPage from "../features/admin/contactUs/ContactMessagesPage";
import ComplaintsPage from "../features/admin/complaints/ComplaintsPage";
import AdminReviewsPage from "../features/admin/reviews/AdminReviewsPage";
import CountriesPage from "../features/admin/countries/CountriesPage";
import CitiesPage from "../features/admin/cities/CitiesPage";
import CompaniesPage from "../features/admin/companies/CompaniesPage";
import DevicesPage from "../features/admin/devices/DevicesPage";
import ServicesPage from "../features/admin/services/ServicesPage";
import CategoriesPage from "../features/admin/categories/CategoriesPage";
import ProductsPage from "../features/admin/products/ProductsPage";
import WorkshopOwnerRequestsPage from "../features/admin/workshopOwnerRequests/WorkshopOwnerRequestsPage";
import AdminWorkshopsPage from "../features/admin/workshop/workshops";
import AdminHomePage from "../features/admin/AdminHomePage";
import RolesPage from "../features/admin/roles/RolesPage";
import DeletionReasonsPage from "../features/admin/deletionReasons/DeletionReasonsPage";
import ErrorPage from "../components/ErrorPage";
import { GuestRoute } from "../features/auth/GuestRoute";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";

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
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "terms",
        element: <TermsPage />,
      },
      {
        path: "privacy",
        element: <PrivacyPage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      {
        path: "favorites",
        element: <FavoritesPage />,
      },
      {
        path: "bookings",
        element: <BookingsPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "profile",
            element: <CustomerProfilePage />,
          },
        ],
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
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
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
            path: "reviews",
            element: <ReviewsWorkshopPage />,
          },
          {
            path: "spare-parts",
            element: <SparePartsWorkshopPage />,
          },
          {
            path: "specs",
            element: <SpecsWorkshopPage />,
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
        children: [
          {
            index: true,
            element: <AdminHomePage />,
          },
          {
            path: "contact-messages",
            element: <ContactMessagesPage />,
          },
          {
            path: "complaints",
            element: <ComplaintsPage />,
          },
          {
            path: "reviews",
            element: <AdminReviewsPage />,
          },
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
            path: "services",
            element: <ServicesPage />,
          },
          {
            path: "roles",
            element: <RolesPage />,
          },
          {
            path: "deletion-reasons",
            element: <DeletionReasonsPage />,
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
            path: "workshops",
            element: <AdminWorkshopsPage />,
          },
          {
            path: "workshop-owner-requests",
            element: <WorkshopOwnerRequestsPage />,
          },
        ],
      },
    ],
  },
]);
