/**
 * Private-channel listener for CustomerRepairRequestCreated.
 *
 * Backend:
 * - channel: PrivateChannel shop.{shop.user_id}
 * - broadcastAs: repair-request.created
 * - payload: repair_request_id, shop_id, customer_id, service_id, message
 */
import { baseApi } from "../features/auth/authApi";
import { store } from "../store";
import { echo } from "./echo";

export const SHOP_REPAIR_REQUEST_CREATED_DOM_EVENT = "swiftfix:repair-request-created";

export type ShopRepairRequestCreatedDetail = {
  message: string;
  repairRequestId: string;
};

type RepairRequestCreatedPayload = {
  message?: unknown;
  repair_request_id?: unknown;
  data?: { message?: unknown; repair_request_id?: unknown };
};

function readText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function readMessage(event: RepairRequestCreatedPayload) {
  return readText(event.message) || readText(event.data?.message) || "لديك طلب صيانة جديد.";
}

function readRepairRequestId(event: RepairRequestCreatedPayload) {
  return readText(event.repair_request_id) || readText(event.data?.repair_request_id);
}

export function startShopRepairRequestListener(userId: string | number) {
  const channelName = `shop.${userId}`;

  console.log("🚀 Starting repair request listener:", channelName);

  const channel = echo.private(channelName);

  channel.listen(".repair-request.created", (event: RepairRequestCreatedPayload) => {
    console.log("🔥 REALTIME EVENT RECEIVED:", event);

    const message = readMessage(event);
    const repairRequestId = readRepairRequestId(event);

    console.log(`[repair-request.created] channel=${channelName}`, {
      message,
      repair_request_id: repairRequestId,
      raw: event,
    });

    window.dispatchEvent(
      new CustomEvent<ShopRepairRequestCreatedDetail>(SHOP_REPAIR_REQUEST_CREATED_DOM_EVENT, {
        detail: {
          message,
          repairRequestId,
        },
      }),
    );

    store.dispatch(baseApi.util.invalidateTags(["RepairRequests"]));
  });

  return () => {
    console.log("🛑 Leaving channel:", channelName);
    echo.leave(channelName);
  };
}
