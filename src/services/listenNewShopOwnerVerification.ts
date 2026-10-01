/**
 * Public-channel listener for NewShopOwnerVerificationEvent
 *
 * Backend:
 * - channel: admin-notifications
 * - broadcastAs: new-shop-owner-verification
 * - payload: { verification_id }
 */
import { baseApi } from "../features/auth/authApi";
import { store } from "../store";
import { echo } from "./echo";

export type NewShopOwnerVerificationPayload = {
  verification_id?: string | number;
  [key: string]: unknown;
};

export const NEW_SHOP_OWNER_VERIFICATION_CHANNEL = import.meta.env.VITE_REVERB_PUBLIC_CHANNEL?.trim() || "admin-notifications";

export const NEW_SHOP_OWNER_VERIFICATION_EVENT = "new-shop-owner-verification";

/** Browser event so UI (sidebar badge toast) can react without coupling to Echo. */
export const NEW_SHOP_OWNER_VERIFICATION_DOM_EVENT = "swiftfix:new-shop-owner-verification";

export type NewShopOwnerVerificationDomDetail = {
  verificationId: string | number;
};

function readVerificationId(event: NewShopOwnerVerificationPayload) {
  return event.verification_id ?? (event as { data?: { verification_id?: string | number } }).data?.verification_id ?? null;
}

function handleNewShopOwnerVerification(event: NewShopOwnerVerificationPayload) {
  const verificationId = readVerificationId(event);

  console.log(`[new-shop-owner-verification] channel=${NEW_SHOP_OWNER_VERIFICATION_CHANNEL}`, {
    verification_id: verificationId,
    raw: event,
  });

  if (verificationId != null && verificationId !== "") {
    window.dispatchEvent(
      new CustomEvent<NewShopOwnerVerificationDomDetail>(NEW_SHOP_OWNER_VERIFICATION_DOM_EVENT, {
        detail: { verificationId },
      }),
    );
  }

  store.dispatch(baseApi.util.invalidateTags(["ShopOwnerVerifications"]));
}

/**
 * Starts listening on the public Reverb channel.
 * Safe to call once at app bootstrap.
 */
export function startNewShopOwnerVerificationListener() {
  if (!import.meta.env.VITE_REVERB_APP_KEY) {
    console.warn("[Echo] Missing VITE_REVERB_APP_KEY — copy REVERB_APP_KEY from Laravel .env into React .env as VITE_REVERB_APP_KEY.");
    return () => undefined;
  }

  const channel = echo.channel(NEW_SHOP_OWNER_VERIFICATION_CHANNEL);

  // broadcastAs(): 'new-shop-owner-verification' → listen with leading "."
  channel.listen(`.${NEW_SHOP_OWNER_VERIFICATION_EVENT}`, (event: NewShopOwnerVerificationPayload) => {
    handleNewShopOwnerVerification(event);
  });

  console.log(`[Echo] Listening on "${NEW_SHOP_OWNER_VERIFICATION_CHANNEL}" for .${NEW_SHOP_OWNER_VERIFICATION_EVENT}`);

  return () => {
    echo.leave(NEW_SHOP_OWNER_VERIFICATION_CHANNEL);
  };
}

startNewShopOwnerVerificationListener();
