import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import WorkshopLayout from "../layouts/WorkshopLayout";
import HomePage from "../features/home/HomePage";
import WorkshopsPage from "../features/workshops/WorkshopsPage";
import AiDiagnosisPage from "../features/ai-diagnosis/AiDiagnosisPage";
import AboutPage from "../features/about/AboutPage";
import ContactPage from "../features/contact/ContactPage";
import LoginPage from "../features/login/LoginPage";
import ForgotPasswordPage from "../features/login/ForgotPasswordPage";
import ResetPasswordPage from "../features/login/ResetPasswordPage";
import VerifyEmailPage from "../features/login/VerifyEmailPage";
import SignupPage from "../features/signup/SignupPage";
import ClientSignupPage from "../features/signup/ClientSignupPage";
import WorkshopSignupPage from "../features/signup/WorkshopSignupPage";
import HomeWorkshopPage from "../features/dashboardWorkshop/pages/HomeWorkshopPage";
import OrdersWorkshopPage from "../features/dashboardWorkshop/pages/OrdersWorkshopPage";
import SparePartsWorkshopPage from "../features/dashboardWorkshop/pages/SparePartsWorkshopPage";
import SettingsWorkshopPage from "../features/dashboardWorkshop/pages/SettingsWorkshopPage";
import ProfilePage from "../features/dashboardWorkshop/pages/ProfilePage";
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
    path: "/workshop-owner",
    element: <WorkshopLayout />,
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
]);
