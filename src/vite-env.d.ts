/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_MEDIA_BASE_URL: string;
  readonly VITE_USE_AUTH_MOCK: string;
  /** Same value as Laravel REVERB_APP_KEY */
  readonly VITE_REVERB_APP_KEY: string;
  /** Same value as Laravel REVERB_HOST (e.g. localhost) */
  readonly VITE_REVERB_HOST: string;
  /** Same value as Laravel REVERB_PORT (e.g. 8080) */
  readonly VITE_REVERB_PORT: string;
  /** Same value as Laravel REVERB_SCHEME (http | https) */
  readonly VITE_REVERB_SCHEME: string;
  /**
   * Public channel from NewShopOwnerVerificationEvent::broadcastOn()
   * (e.g. admin-notifications — public Channel only for now).
   */
  readonly VITE_REVERB_PUBLIC_CHANNEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
