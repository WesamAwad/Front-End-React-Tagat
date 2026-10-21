export type AiChatRole = "user" | "assistant";

export type ShopRecommendation = {
  shop_id: string;
  rank: number;
  reason: string;
  shop_name: string;
};

export type AiChatMessage = {
  id: string;
  role: AiChatRole;
  content: string;
  recommendations?: ShopRecommendation[];
};

export type ShopRecommendationReply = {
  content: string;
  recommendations: ShopRecommendation[];
};

export async function sendMessage(messages: AiChatMessage[]): Promise<ShopRecommendationReply> {
  const prompt =
    [...messages]
      .reverse()
      .find((message) => message.role === "user")
      ?.content.trim() ?? "";
  if (!prompt) return { content: "", recommendations: [] };

  const token = localStorage.getItem("token");
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/ai/shop-recommendations`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    let apiMessage = "";
    try {
      const payload: unknown = await response.json();
      if (payload && typeof payload === "object") {
        apiMessage = String((payload as { message?: unknown }).message ?? "").trim();
      }
    } catch {
      // Response body may be empty or non-JSON.
    }
    throw new Error(apiMessage || "تعذر الحصول على الرد. حاول مرة أخرى.");
  }

  return normalizeShopRecommendationReply(await response.json());
}

function normalizeShopRecommendationReply(payload: unknown): ShopRecommendationReply {
  const body = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const data = body.data && typeof body.data === "object" ? (body.data as Record<string, unknown>) : body;
  const list = Array.isArray(data.recommendations) ? data.recommendations : [];

  const recommendations = list
    .map(normalizeRecommendation)
    .filter((item): item is ShopRecommendation => item !== null)
    .sort((a, b) => a.rank - b.rank);

  const content = String(data.message ?? body.message ?? "").trim();

  return { content, recommendations };
}

function normalizeRecommendation(value: unknown): ShopRecommendation | null {
  if (!value || typeof value !== "object") return null;

  const row = value as Record<string, unknown>;
  const shop = row.shop && typeof row.shop === "object" ? (row.shop as Record<string, unknown>) : null;
  const shopId = String(row.shop_id ?? row.id ?? shop?.id ?? "").trim();
  const reason = String(row.reason ?? "").trim();
  if (!shopId) return null;

  const rank = Number(row.rank);

  return {
    shop_id: shopId,
    rank: Number.isFinite(rank) ? rank : 0,
    reason,
    shop_name: String(row.shop_name ?? shop?.shop_name ?? "").trim(),
  };
}
