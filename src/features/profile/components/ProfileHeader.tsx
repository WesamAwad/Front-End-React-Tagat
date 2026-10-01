import avatarOverlay from "../../../assets/profile/avatar-overlay.svg";
import cameraIcon from "../../../assets/profile/camera.svg";
import statusDot from "../../../assets/profile/status-dot.svg";

type ProfileHeaderProps = {
  fullName: string;
};

export function ProfileHeader({ fullName }: ProfileHeaderProps) {
  return (
    <div>
      <div
        aria-hidden="true"
        className="relative h-35 overflow-hidden rounded-xl bg-[linear-gradient(171.53deg,#162a4f_3.67%,rgba(91,80,232,0.85)_54.63%,rgba(249,114,22,0.25)_96.33%)]"
      >
        <span className="absolute -top-55 left-37 size-87.5 rounded-full bg-white/15 blur-[2px]" />
        <span className="absolute top-10 left-29.5 size-27.5 rounded-full border-[1.2px] border-white/25 bg-white/8 blur-[2px]" />
      </div>

      <div className="relative -mt-8.75 flex items-center gap-6 ps-6.5">
        <div className="relative size-34.5 shrink-0 rounded-full bg-primary">
          <img src={avatarOverlay} alt="" width={138} height={138} className="absolute inset-0" />
          {/* The profile API has no photo field yet, so photo upload stays disabled until it does. */}
          <button type="button" disabled aria-label="تغيير الصورة الشخصية" title="تغيير الصورة الشخصية غير متاح حالياً" className="absolute inset-0 flex items-center justify-center rounded-full">
            <img src={cameraIcon} alt="" width={25} height={25} />
          </button>
          <img src={statusDot} alt="" width={26} height={26} className="absolute top-26.5 left-26.5" />
        </div>

        <p className="min-w-0 truncate text-lg font-bold text-[#030000]">{fullName}</p>
      </div>
    </div>
  );
}
