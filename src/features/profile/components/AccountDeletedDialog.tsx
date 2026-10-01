import { useId, useRef } from "react";
import successBadge from "../../../assets/profile/success-badge.webp";
import closeIcon from "../../../assets/profile/success-close.svg";
import { useModalDialog } from "./useModalDialog";

type AccountDeletedDialogProps = {
  onLeave: () => void;
};

export function AccountDeletedDialog({ onLeave }: AccountDeletedDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const leaveButtonRef = useRef<HTMLButtonElement>(null);

  useModalDialog(leaveButtonRef, onLeave);

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center p-4" role="presentation">
      <div aria-hidden="true" className="absolute inset-0 bg-[#0a0a0a]/40 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative flex w-full max-w-163 flex-col items-center gap-7 rounded-2xl border border-[#efeff1] bg-white px-8 py-6 text-center"
      >
        <button type="button" onClick={onLeave} aria-label="إغلاق" className="absolute top-6 inset-e-6 rounded-md transition hover:opacity-70">
          <img src={closeIcon} alt="" width={28} height={28} />
        </button>

        <div aria-hidden="true" className="relative h-23.5 w-28.5 overflow-hidden">
          <img src={successBadge} alt="" className="absolute top-[-20.76%] left-[-48.09%] h-[150.07%] w-[187.55%] max-w-none" />
        </div>

        <h2 id={titleId} className="text-3xl font-bold leading-normal text-[#030000] sm:text-[40px]">
          تم حذف حسابك بنجاح
        </h2>
        <p id={descriptionId} className="text-base leading-normal text-[#5b5b5b]">
          نأسف لرؤيتك تغادرنا، ونتمنى لك كل التوفيق في رحلتك القادمة
        </p>

        <button ref={leaveButtonRef} type="button" onClick={onLeave} className="h-12 w-full rounded-3xl bg-primary px-4 text-base font-bold text-white transition hover:bg-primary-hover">
          عودة للصفحة الرئيسية
        </button>
      </div>
    </div>
  );
}
