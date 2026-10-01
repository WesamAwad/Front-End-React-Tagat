import { useState } from "react";
import { BadgeCheck, Lock, LockOpen, Store, Trash2 } from "lucide-react";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { Pagination } from "../../../components/Pagination";
import SuccessToast from "../../../components/SuccessToast";
import { TableSearch } from "../../../components/TableSearch";
import { getPageSlice } from "../../../utils/getPageSlice";
import {
  useDeleteAdminShopOwnerMutation,
  useFreezeAdminShopOwnerMutation,
  useGetAdminShopOwnersAllQuery,
  useUnfreezeAdminShopOwnerMutation,
  useVerifyAdminShopOwnerMutation,
} from "../../auth/authApi";
import type { AdminShopOwner, AuthValidationErrorResponse } from "../../../types/authTypes";

const EMPTY_OWNERS: AdminShopOwner[] = [];
const PAGE_SIZE = 10;

const FIELD_LABELS: Record<string, string> = {
  id: "المعرف",
  shop_id: "معرّف الورشة",
  user_id: "معرّف المستخدم",
  owner_id: "معرّف المالك",
  shop_name: "اسم الورشة",
  name: "الاسم",
  full_name: "الاسم الكامل",
  first_name: "الاسم الأول",
  last_name: "اسم العائلة",
  email: "البريد الإلكتروني",
  phone: "الهاتف",
  phone_number: "رقم الجوال",
  whatsapp: "واتساب",
  status: "الحالة",
  shop_status: "الحالة",
  country: "الدولة",
  country_id: "معرّف الدولة",
  city: "المدينة",
  city_id: "معرّف المدينة",
  district: "الحي",
  street: "الشارع",
  description: "الوصف",
  cover_image: "صورة الغلاف",
  commercial_record_image: "السجل التجاري",
  national_id_image: "صورة الهوية",
  latitude: "خط العرض",
  longitude: "خط الطول",
  created_at: "تاريخ الإنشاء",
  updated_at: "تاريخ التحديث",
  services: "الخدمات",
  notes: "ملاحظات",
  complaints_count: "عدد الشكاوى",
};

const PREFERRED_COLUMNS = [
  "id",
  "shop_name",
  "full_name",
  "name",
  "first_name",
  "last_name",
  "email",
  "phone_number",
  "phone",
  "whatsapp",
  "country",
  "city",
  "district",
  "street",
  "status",
  "shop_status",
  "complaints_count",
  "services",
  "created_at",
  "updated_at",
];

/** Hidden from the workshops table only; still used for actions (verify, etc.). */
const HIDDEN_COLUMNS = new Set(["is_verified", "shop_id", "shopId"]);

const MEDIA_BASE_URL =
  import.meta.env.VITE_MEDIA_BASE_URL?.replace(/\/+$/, "") ||
  import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") ||
  "";

type ConfirmActionType = "freeze" | "unfreeze" | "delete" | "verify";

type ConfirmAction = {
  type: ConfirmActionType;
  owner: AdminShopOwner;
};

const CONFIRM_COPY: Record<
  ConfirmActionType,
  { title: string; message: (name: string) => string; confirmLabel: string; variant: "danger" | "primary"; loadingLabel: string }
> = {
  freeze: {
    title: "تأكيد التجميد",
    message: (name) => `هل تريد تجميد حساب «${name}»؟ لن يتمكن صاحب الورشة من استخدام الحساب حتى يتم فك التجميد.`,
    confirmLabel: "تجميد",
    variant: "primary",
    loadingLabel: "جاري التجميد...",
  },
  unfreeze: {
    title: "تأكيد فك التجميد",
    message: (name) => `هل تريد فك التجميد عن حساب «${name}» وإعادة تفعيله؟`,
    confirmLabel: "فك التجميد",
    variant: "primary",
    loadingLabel: "جاري فك التجميد...",
  },
  delete: {
    title: "تأكيد حذف الحساب",
    message: (name) => `هل تريد حذف حساب «${name}» نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`,
    confirmLabel: "حذف",
    variant: "danger",
    loadingLabel: "جاري الحذف...",
  },
  verify: {
    title: "تأكيد توثيق الحساب",
    message: (name) => `هل تريد توثيق حساب «${name}»؟`,
    confirmLabel: "توثيق",
    variant: "primary",
    loadingLabel: "جاري التوثيق...",
  },
};

function resolveMediaUrlMaybe(path: string) {
  const trimmed = path.trim();
  if (!trimmed) return "";
  if (/^(https?:|blob:|data:)/i.test(trimmed)) return trimmed;
  if (!MEDIA_BASE_URL) return trimmed;
  return `${MEDIA_BASE_URL}/${trimmed.replace(/^\/+/, "")}`;
}

function formatFieldValue(value: unknown): string {
  if (value == null || value === "") return "—";

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value
      .map((item) => {
        if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") return String(item);
        if (item && typeof item === "object") {
          const row = item as Record<string, unknown>;
          return String(row.name ?? row.service_name ?? row.title ?? row.feature ?? JSON.stringify(item));
        }
        return String(item);
      })
      .join("، ");
  }

  if (typeof value === "object") {
    const row = value as Record<string, unknown>;
    const nested = row.name ?? row.full_name ?? row.shop_name ?? row.email ?? row.title ?? row.name_ar ?? row.label;
    if (nested != null && nested !== "") return String(nested);
    try {
      return JSON.stringify(value);
    } catch {
      return "—";
    }
  }

  return String(value);
}

function isImageField(key: string, value: unknown) {
  if (typeof value !== "string" || !value.trim()) return false;
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes("image") || lowerKey.includes("photo") || lowerKey.includes("cover") || lowerKey.includes("avatar")) {
    return true;
  }
  return /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(value) || value.includes("/storage/");
}

function buildColumns(owners: AdminShopOwner[]) {
  const keys = new Set<string>();
  for (const owner of owners) {
    for (const key of Object.keys(owner.raw)) {
      if (!HIDDEN_COLUMNS.has(key)) keys.add(key);
    }
  }

  const preferred = PREFERRED_COLUMNS.filter((key) => keys.has(key));
  const rest = [...keys].filter((key) => !preferred.includes(key)).sort((a, b) => a.localeCompare(b));
  return [...preferred, ...rest];
}

function ownerSearchText(owner: AdminShopOwner) {
  return Object.values(owner.raw)
    .map((value) => formatFieldValue(value))
    .join(" ")
    .toLowerCase();
}

/** Unfreeze only when blocked; open/closed both show Freeze. */
function isShopFrozen(owner: AdminShopOwner, statusOverride?: string) {
  const status = String(statusOverride ?? owner.raw.shop_status ?? owner.raw.status ?? "")
    .trim()
    .toLowerCase();

  return status === "blocked" || status === "محظور" || status === "مجمد";
}

function getOwnerShopId(owner: AdminShopOwner) {
  const value = owner.raw.shop_id ?? owner.raw.shopId;
  if (value == null || value === "") return null;
  return value as string | number;
}

function isShopVerified(owner: AdminShopOwner, verifiedOverride?: boolean) {
  if (verifiedOverride === true) return true;
  if (verifiedOverride === false) return false;

  const raw = owner.raw;
  if (raw.is_verified === true || raw.is_verified === 1 || raw.is_verified === "1") return true;
  if (raw.verified === true || raw.verified === 1 || raw.verified === "1") return true;
  if (raw.is_shop_verified === true || raw.is_shop_verified === 1 || raw.is_shop_verified === "1") return true;
  if (raw.shop_verified === true || raw.shop_verified === 1 || raw.shop_verified === "1") return true;

  const status = String(raw.verification_status ?? raw.verify_status ?? raw.verified_status ?? "")
    .trim()
    .toLowerCase();

  return status === "verified" || status === "موثق" || status === "approved";
}

function ownerDisplayName(owner: AdminShopOwner) {
  const raw = owner.raw;
  const composedName = `${String(raw.first_name ?? "")} ${String(raw.last_name ?? "")}`.trim();
  const candidates = [raw.shop_name, raw.full_name, raw.name, composedName || undefined, raw.email, `ورشة #${owner.id}`];
  const matched = candidates.find((value) => value != null && String(value).trim() !== "");
  return String(matched);
}

function formatShopStatus(value: unknown) {
  const status = String(value ?? "")
    .trim()
    .toLowerCase();

  if (status === "open" || status === "مفتوح") {
    return { label: "مفتوح", className: "bg-emerald-50 text-emerald-800 ring-emerald-200" };
  }

  if (status === "close" || status === "closed" || status === "مغلق") {
    return { label: "مغلق", className: "bg-red-50 text-red-700 ring-red-200" };
  }

  if (status === "blocked" || status === "محظور" || status === "مجمد") {
    return { label: "مجمّد", className: "bg-amber-50 text-amber-800 ring-amber-200" };
  }

  if (!status) {
    return { label: "—", className: "bg-gray-50 text-gray-600 ring-gray-200" };
  }

  return { label: String(value), className: "bg-primary-light text-primary ring-primary/15" };
}

function CellValue({ column, value }: { column: string; value: unknown }) {
  if (column === "status" || column === "shop_status") {
    const status = formatShopStatus(value);
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${status.className}`}>
        {status.label}
      </span>
    );
  }

  if (isImageField(column, value)) {
    const imageUrl = resolveMediaUrlMaybe(String(value));
    if (!imageUrl) return <span className="text-gray-400">—</span>;

    return (
      <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
        <img src={imageUrl} alt={FIELD_LABELS[column] ?? column} className="mx-auto size-12 rounded-lg border border-primary/10 object-cover" />
      </a>
    );
  }

  return <span className="line-clamp-2 max-w-56 inline-block align-middle">{formatFieldValue(value)}</span>;
}

function WorkshopsPage() {
  const { data, isLoading, isError, isFetching } = useGetAdminShopOwnersAllQuery();
  const [freezeAdminShopOwner, { isLoading: isFreezing }] = useFreezeAdminShopOwnerMutation();
  const [unfreezeAdminShopOwner, { isLoading: isUnfreezing }] = useUnfreezeAdminShopOwnerMutation();
  const [deleteAdminShopOwner, { isLoading: isDeleting }] = useDeleteAdminShopOwnerMutation();
  const [verifyAdminShopOwner, { isLoading: isVerifying }] = useVerifyAdminShopOwnerMutation();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [shopStatusOverrides, setShopStatusOverrides] = useState<Record<string, string>>({});
  const [verifiedOverrides, setVerifiedOverrides] = useState<Record<string, boolean>>({});
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmError, setConfirmError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isConfirmLoading = isFreezing || isUnfreezing || isDeleting || isVerifying;
  const owners = (data?.data ?? EMPTY_OWNERS).map((owner) => {
    const override = shopStatusOverrides[String(owner.id)];
    if (!override) return owner;
    return { ...owner, raw: { ...owner.raw, shop_status: override } };
  });
  const columns = buildColumns(owners);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredOwners = normalizedQuery ? owners.filter((owner) => ownerSearchText(owner).includes(normalizedQuery)) : owners;
  const { pageItems, currentPage } = getPageSlice(filteredOwners, page, PAGE_SIZE);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const openConfirm = (type: ConfirmActionType, owner: AdminShopOwner) => {
    if (isConfirmLoading) return;
    setConfirmError("");
    setConfirmAction({ type, owner });
  };

  const closeConfirm = () => {
    if (isConfirmLoading) return;
    setConfirmError("");
    setConfirmAction(null);
  };

  const handleConfirm = async () => {
    if (!confirmAction || isConfirmLoading) return;

    const { type, owner } = confirmAction;
    setConfirmError("");

    try {
      if (type === "freeze") {
        const result = await freezeAdminShopOwner(owner.id).unwrap();
        setShopStatusOverrides((current) => ({ ...current, [String(owner.id)]: "blocked" }));
        setSuccessMessage(result.message || "تم تجميد الحساب بنجاح");
      } else if (type === "unfreeze") {
        const result = await unfreezeAdminShopOwner(owner.id).unwrap();
        setShopStatusOverrides((current) => ({ ...current, [String(owner.id)]: "open" }));
        setSuccessMessage(result.message || "تم فك التجميد بنجاح");
      } else if (type === "delete") {
        const result = await deleteAdminShopOwner(owner.id).unwrap();
        setShopStatusOverrides((current) => {
          const next = { ...current };
          delete next[String(owner.id)];
          return next;
        });
        setVerifiedOverrides((current) => {
          const next = { ...current };
          delete next[String(owner.id)];
          return next;
        });
        setSuccessMessage(result.message || "تم حذف الحساب بنجاح");
      } else {
        const shopId = getOwnerShopId(owner);
        if (shopId == null) {
          setConfirmError("لا يوجد shop_id لهذا الحساب، تعذر التوثيق.");
          return;
        }

        const result = await verifyAdminShopOwner(shopId).unwrap();
        setVerifiedOverrides((current) => ({ ...current, [String(owner.id)]: true }));
        setSuccessMessage(result.message || "تم توثيق الحساب بنجاح");
      }

      setConfirmAction(null);
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      const fallback =
        type === "freeze"
          ? "تعذر تجميد الحساب، حاول مرة أخرى."
          : type === "unfreeze"
            ? "تعذر فك التجميد، حاول مرة أخرى."
            : type === "delete"
              ? "تعذر حذف الحساب، حاول مرة أخرى."
              : "تعذر توثيق الحساب، حاول مرة أخرى.";
      setConfirmError(errorData?.message || fallback);
    }
  };

  const confirmCopy = confirmAction ? CONFIRM_COPY[confirmAction.type] : null;
  const confirmName = confirmAction ? ownerDisplayName(confirmAction.owner) : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary">الورش</h1>
          <p className="mt-1 text-sm text-gray-500">جميع بيانات أصحاب الورش المسجّلين في المنصة</p>
        </div>
        <div className="flex flex-nowrap items-center gap-3">
          <TableSearch id="workshops-search" value={searchQuery} onChange={handleSearchChange} placeholder="ابحث في الورش..." />
          <div className="rounded-lg border border-primary/10 bg-primary-light/50 px-4 py-2 text-center">
            <p className="text-xs text-gray-500">الإجمالي</p>
            <p className="text-sm font-bold text-primary">{owners.length}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-primary/10 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm text-primary/70" role="status">
            جاري تحميل الورش...
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm" role="alert">
          <p className="text-sm font-medium text-red-700">تعذر تحميل بيانات الورش</p>
          <p className="mt-1 text-xs text-red-600">تحقق من صلاحيات الأدمن أو حاول لاحقاً.</p>
        </div>
      ) : owners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
          <Store className="mx-auto size-8 text-secondary" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-primary">{isFetching ? "جاري تحديث القائمة..." : "لا توجد ورش حالياً"}</p>
        </div>
      ) : filteredOwners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
          <p className="text-sm font-medium text-primary">لا توجد نتائج للبحث</p>
          <p className="mt-1 text-xs text-gray-500">جرّب كلمة بحث أخرى أو امسح البحث</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
          {isFetching ? (
            <p className="border-b border-primary/10 bg-primary-light/40 px-4 py-2 text-center text-xs text-primary/70" role="status">
              جاري تحديث القائمة...
            </p>
          ) : null}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10 bg-primary-light/60 text-center text-xs font-semibold text-primary">
                  {columns.map((column) => (
                    <th key={column} scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                      {FIELD_LABELS[column] ?? column}
                    </th>
                  ))}
                  <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {pageItems.map((owner) => {
                  const frozen = isShopFrozen(owner, shopStatusOverrides[String(owner.id)]);
                  const verified = isShopVerified(owner, verifiedOverrides[String(owner.id)]);
                  const name = ownerDisplayName(owner);

                  return (
                    <tr key={String(owner.id)} className="transition hover:bg-primary-light/30">
                      {columns.map((column) => (
                        <td key={column} className="whitespace-nowrap px-4 py-4 text-center text-gray-700 sm:px-6">
                          <CellValue
                            column={column}
                            value={column === "shop_status" || column === "status" ? owner.raw.shop_status ?? owner.raw.status : owner.raw[column]}
                          />
                        </td>
                      ))}
                      <td className="whitespace-nowrap px-4 py-4 text-center sm:px-6">
                        <div className="inline-flex flex-wrap items-center justify-center gap-2" role="group" aria-label={`إجراءات ${name}`}>
                          {frozen ? (
                            <button
                              type="button"
                              aria-label={`فك تجميد ${name}`}
                              disabled={isConfirmLoading}
                              onClick={() => openConfirm("unfreeze", owner)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <LockOpen className="size-3.5 shrink-0" aria-hidden="true" />
                              فك التجميد
                            </button>
                          ) : (
                            <button
                              type="button"
                              aria-label={`تجميد ${name}`}
                              disabled={isConfirmLoading}
                              onClick={() => openConfirm("freeze", owner)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <Lock className="size-3.5 shrink-0" aria-hidden="true" />
                              تجميد
                            </button>
                          )}
                          {verified ? (
                            <span
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800"
                              aria-label={`${name} موثّق`}
                            >
                              <BadgeCheck className="size-3.5 shrink-0" aria-hidden="true" />
                              موثق
                            </span>
                          ) : (
                            <button
                              type="button"
                              aria-label={`توثيق حساب ${name}`}
                              disabled={isConfirmLoading}
                              onClick={() => openConfirm("verify", owner)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <BadgeCheck className="size-3.5 shrink-0" aria-hidden="true" />
                              توثيق الحساب
                            </button>
                          )}
                          <button
                            type="button"
                            aria-label={`حذف حساب ${name}`}
                            disabled={isConfirmLoading}
                            onClick={() => openConfirm("delete", owner)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <Trash2 className="size-3.5 shrink-0" aria-hidden="true" />
                            حذف الحساب
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination page={currentPage} totalItems={filteredOwners.length} pageSize={PAGE_SIZE} itemLabel="ورشة" onPageChange={setPage} />
        </div>
      )}

      <SuccessToast open={Boolean(successMessage)} message={successMessage} onClose={() => setSuccessMessage("")} />

      <ConfirmDialog
        open={Boolean(confirmAction && confirmCopy)}
        title={confirmCopy?.title ?? ""}
        message={confirmCopy ? confirmCopy.message(confirmName) : ""}
        confirmLabel={isConfirmLoading && confirmCopy ? confirmCopy.loadingLabel : confirmCopy?.confirmLabel}
        variant={confirmCopy?.variant ?? "primary"}
        isLoading={isConfirmLoading}
        error={confirmError}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}

export default WorkshopsPage;
