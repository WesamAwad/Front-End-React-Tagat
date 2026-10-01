import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/index.ts";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/AppRoutes";
/** Reverb / Laravel Echo — NewShopOwnerVerificationEvent (public channel) */
import "./services/listenNewShopOwnerVerification";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
