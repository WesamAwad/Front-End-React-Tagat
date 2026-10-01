import { useId, type ReactNode } from "react";
import sectionUserIcon from "../../../assets/profile/section-user.svg";

type ProfileSectionProps = {
  title: string;
  /** Bottom padding differs between the cards in the design, so each caller sets it. */
  className: string;
  children: ReactNode;
};

export function ProfileSection({ title, className, children }: ProfileSectionProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className={`rounded-xl border border-[#efefef] bg-white px-6 pt-8 ${className}`}>
      <div className="flex items-center gap-3">
        <img src={sectionUserIcon} alt="" width={20} height={20} className="shrink-0" />
        <h2 id={titleId} className="text-xl leading-normal text-[#0a0a0a]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

type ProfileSaveButtonProps = {
  disabled: boolean;
  isLoading: boolean;
};

export function ProfileSaveButton({ disabled, isLoading }: ProfileSaveButtonProps) {
  return (
    <div className="mt-6 flex justify-end">
      <button
        type="submit"
        disabled={disabled || isLoading}
        className="h-12 w-full rounded-3xl bg-primary px-7 text-base font-medium text-white transition enabled:hover:bg-primary-hover disabled:bg-[#d0d4dc] sm:w-54"
      >
        {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
      </button>
    </div>
  );
}
