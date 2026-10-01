import Echo from "laravel-echo";
import Pusher, { type Channel, type ChannelAuthorizationCallback } from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

console.log("Reverb key:", import.meta.env.VITE_REVERB_APP_KEY);
console.log("Reverb host:", import.meta.env.VITE_REVERB_HOST);
console.log("Reverb port:", import.meta.env.VITE_REVERB_PORT);

window.Pusher = Pusher;

function broadcastingAuthEndpoint() {
  const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
  const origin = apiBase.replace(/\/api$/i, "");
  return `${origin}/broadcasting/auth`;
}

export const echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY,

  // Cloudflare Tunnel public hostname
  wsHost: import.meta.env.VITE_REVERB_HOST,

  // External WebSocket ports
  wsPort: 443,
  wssPort: 443,

  // Cloudflare uses HTTPS/WSS
  forceTLS: true,

  // Use secure WebSocket only
  enabledTransports: ["wss"],

  // Private channels (shop.{id}) authorize with the logged-in Sanctum token.
  authEndpoint: broadcastingAuthEndpoint(),
  authorizer: (channel: Channel) => ({
    authorize(socketId: string, callback: ChannelAuthorizationCallback) {
      const token = localStorage.getItem("token");

      fetch(broadcastingAuthEndpoint(), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          socket_id: socketId,
          channel_name: channel.name,
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Broadcast auth failed (${response.status})`);
          }
          callback(null, (await response.json()) as { auth: string });
        })
        .catch((error: unknown) => {
          callback(error instanceof Error ? error : new Error("Broadcast auth failed"), null);
        });
    },
  }),
});

export default echo;
