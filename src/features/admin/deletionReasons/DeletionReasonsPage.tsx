import { useState } from "react";
import { UserX } from "lucide-react";
import SuccessToast from "../../../components/SuccessToast";
import { TableSearch } from "../../../components/TableSearch";
import { useGetAllAccountDeletionReasonsQuery, useToggleAccountDeletionReasonMutation } from "../../auth/authApi";
import type { AccountDeletionReason, AuthValidationErrorResponse } from "../../../types/authTypes";

const EMPTY_REASONS: AccountDeletionReason[] = [];

function DeletionReasonsPage() {
  const { data, isLoading, isError, isFetching, error } = useGetAllAccountDeletionReasonsQuery();
  const [toggleReason] = useToggleAccountDeletionReasonMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const reasons = data?.data ?? EMPTY_REASONS;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredReasons = normalizedQuery ? reasons.filter((reason) => reason.reason.toLowerCase().includes(normalizedQuery)) : reasons;
  const loadError =
    error && typeof error === "object" && "data" in error ? ((error.data as AuthValidationErrorResponse | undefined)?.message ?? "").trim() : "";

  const toggleVisibility = async (reason: AccountDeletionReason) => {
    if (pendingId != null) return;

    setActionError("");
    setPendingId(reason.id);

    try {
      const result = await toggleReason(reason.id).unwrap();
      setSuccessMessage(result.message || (reason.is_active ? "تم إخفاء سبب الحذف." : "تم إظهار سبب الحذف."));
    } catch (toggleError) {
      const errorData = (toggleError as { data?: AuthValidationErrorResponse })?.data;
      setActionError(errorData?.message || "تعذر تحديث ظهور سبب الحذف.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <SuccessToast open={Boolean(successMessage)} message={successMessage} onClose={() => setSuccessMessage("")} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary">أسباب حذف الحساب</h1>
          <p className="mt-1 text-sm text-gray-500">إظهار أو إخفاء الأسباب التي يراها العميل عند حذف حسابه</p>
        </div>
        <TableSearch id="deletion-reasons-search" value={searchQuery} onChange={setSearchQuery} placeholder="ابحث عن سبب..." />
      </div>

      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {actionError}
        </p>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-primary/10 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm text-primary/70" role="status">
            جاري تحميل الأسباب...
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm" role="alert">
          <p className="text-sm font-medium text-red-700">{loadError || "تعذر تحميل أسباب الحذف"}</p>
        </div>
      ) : reasons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
          <UserX className="mx-auto size-8 text-primary/40" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-primary">لا توجد أسباب حذف</p>
        </div>
      ) : filteredReasons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/15 bg-primary-light/40 px-6 py-12 text-center">
          <p className="text-sm font-medium text-primary">لا توجد نتائج للبحث</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
          {isFetching ? (
            <p className="border-b border-primary/10 bg-primary-light/40 px-4 py-2 text-center text-xs text-primary/70" role="status">
              جاري تحديث القائمة...
            </p>
          ) : null}
          <ul className="divide-y divide-primary/5">
            {filteredReasons.map((reason) => {
              const isPending = pendingId === reason.id;

              return (
                <li key={reason.id} className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
                  <p className="text-sm font-medium text-primary">{reason.reason}</p>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className={`text-xs font-medium ${reason.is_active ? "text-emerald-700" : "text-gray-500"}`}>{reason.is_active ? "ظاهر" : "مخفي"}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={reason.is_active}
                      aria-label={reason.is_active ? `إخفاء ${reason.reason}` : `إظهار ${reason.reason}`}
                      disabled={pendingId != null}
                      onClick={() => void toggleVisibility(reason)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 disabled:cursor-not-allowed disabled:opacity-60 ${
                        reason.is_active ? "bg-emerald-600" : "bg-gray-300"
                      }`}
                    >
                      <span className={`inline-block size-5 rounded-full bg-white shadow transition ${reason.is_active ? "ms-auto" : "ms-0"} ${isPending ? "opacity-70" : ""}`} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DeletionReasonsPage;
