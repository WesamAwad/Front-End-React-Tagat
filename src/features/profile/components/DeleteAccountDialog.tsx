import { useId, useRef, useState, type FormEvent } from "react";
import closeIcon from "../../../assets/profile/dialog-close.svg";
import checkedIcon from "../../../assets/profile/checkbox-checked.svg";
import uncheckedIcon from "../../../assets/profile/checkbox-unchecked.svg";
import { useGetAccountDeletionReasonsQuery } from "../../auth/authApi";
import type { DeleteUserAccountRequest } from "../../../types/authTypes";
import { useModalDialog } from "./useModalDialog";

type DeleteAccountDialogProps = {
  isLoading: boolean;
  error: string;
  onConfirm: (request: DeleteUserAccountRequest) => void;
  onClose: () => void;
};

export function DeleteAccountDialog({ isLoading, error, onConfirm, onClose }: DeleteAccountDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const { data: reasonsData, isLoading: isReasonsLoading, isError: isReasonsError, refetch: refetchReasons } = useGetAccountDeletionReasonsQuery();
  const [selectedReasonIds, setSelectedReasonIds] = useState<number[]>([]);
  const reasons = (reasonsData?.data ?? []).filter((item) => item.is_active);
  // Ignore selections that are no longer offered, e.g. a reason deactivated while the dialog was open.
  const validReasonIds = selectedReasonIds.filter((id) => reasons.some((item) => item.id === id));

  const closeUnlessDeleting = () => {
    if (!isLoading) onClose();
  };

  useModalDialog(cancelButtonRef, closeUnlessDeleting);

  const toggleReason = (id: number) => {
    setSelectedReasonIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validReasonIds.length === 0) return;
    onConfirm({ reason_id: validReasonIds });
  };

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center p-4" role="presentation">
      <div aria-hidden="true" className="absolute inset-0 bg-[#0a0a0a]/40 backdrop-blur-sm" onClick={closeUnlessDeleting} />

      <div role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} className="relative max-h-full w-full max-w-141 overflow-y-auto rounded-2xl bg-white p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <div className="flex items-center justify-between gap-4">
              <h2 id={titleId} className="text-xl font-bold leading-normal text-[#030000]">
                هل أنت متأكد من حذف حسابك؟
              </h2>
              <button type="button" onClick={onClose} disabled={isLoading} aria-label="إغلاق" className="shrink-0 rounded-md transition hover:opacity-70 disabled:opacity-50">
                <img src={closeIcon} alt="" width={24} height={24} />
              </button>
            </div>
            <p id={descriptionId} className="mt-4 max-w-102 text-sm leading-normal text-[#5b5b5b]">
              سيتم حذف بيانات حسابك ومعلوماتك من سويفت فيكس، ولن تتمكن من استعادتها لاحقًا.
            </p>
          </div>

          <fieldset className="flex flex-col items-start gap-4" disabled={isLoading}>
            <legend className="sr-only">سبب حذف الحساب</legend>
            {isReasonsLoading ? (
              <p className="text-sm text-label" role="status">
                جاري تحميل الأسباب...
              </p>
            ) : isReasonsError ? (
              <div className="flex flex-wrap items-center gap-3 text-sm text-red-700" role="alert">
                <p>تعذر تحميل أسباب الحذف.</p>
                <button type="button" onClick={() => refetchReasons()} className="font-semibold underline-offset-4 hover:underline">
                  إعادة المحاولة
                </button>
              </div>
            ) : reasons.length === 0 ? (
              <p className="text-sm text-label">لا توجد أسباب حذف متاحة حالياً.</p>
            ) : (
              reasons.map((item) => {
                const checked = validReasonIds.includes(item.id);

                return (
                  <label key={item.id} className="flex cursor-pointer items-center gap-3 text-sm leading-normal text-[#030000]">
                    <input type="checkbox" name="reason_id" value={item.id} checked={checked} onChange={() => toggleReason(item.id)} className="peer sr-only" />
                    <img src={checked ? checkedIcon : uncheckedIcon} alt="" width={24} height={24} className="shrink-0 rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40" />
                    {item.reason}
                  </label>
                );
              })
            )}
          </fieldset>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <button
              type="submit"
              disabled={isLoading || validReasonIds.length === 0}
              className="h-12 flex-1 rounded-3xl bg-[#f44336] px-4 text-sm font-bold text-white transition enabled:hover:bg-[#e53935] disabled:opacity-50"
            >
              {isLoading ? "جاري الحذف..." : "حذف الحساب"}
            </button>
            <button ref={cancelButtonRef} type="button" onClick={onClose} disabled={isLoading} className="h-12 flex-1 rounded-3xl bg-[#f7f7f7] px-4 text-sm font-bold text-[#2c2c2c] transition enabled:hover:bg-[#ededed] disabled:opacity-70">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
