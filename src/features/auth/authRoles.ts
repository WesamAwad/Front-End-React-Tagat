export type AppUserRole = "customer" | "shopOwner" | "admin";

function collectRoleNames(value: unknown): string[] {
  if (value == null || value === "") return [];

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectRoleNames(item));
  }

  if (typeof value === "object") {
    const row = value as Record<string, unknown>;
    return collectRoleNames(row.name ?? row.role ?? row.title ?? row.slug);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim().toLowerCase().replace(/[\s_-]+/g, ""))
    .filter(Boolean);
}

export function normalizeUserRole(value: unknown): AppUserRole {
  const roles = collectRoleNames(value);

  if (roles.some((role) => role === "admin")) return "admin";
  if (roles.some((role) => role === "shopowner" || role === "workshop" || role === "workshopowner")) return "shopOwner";

  return "customer";
}

export function extractRoleFromLoginResponse(payload: unknown): AppUserRole {
  const body = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const data = body.data && typeof body.data === "object" ? (body.data as Record<string, unknown>) : {};
  const user = data.user && typeof data.user === "object" ? (data.user as Record<string, unknown>) : {};

  return normalizeUserRole(body.role ?? data.role ?? user.role ?? body.roles ?? data.roles ?? user.roles);
}

export function getPostLoginPath(role: AppUserRole | null | undefined) {
  if (role === "admin") return "/admin";
  if (role === "shopOwner") return "/workshop-owner";
  return "/";
}

export function isCustomerSession(role: AppUserRole | null | undefined) {
  return role === "customer";
}
