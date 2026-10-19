import statusDot from "../../../assets/profile/status-dot.svg";

type ProfileHeaderProps = {
  fullName: string;
};

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`.toUpperCase();
}

export function ProfileHeader({ fullName }: ProfileHeaderProps) {
  const initials = getInitials(fullName);

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
        <div className="relative size-34.5 shrink-0 rounded-full bg-primary shadow-lg shadow-primary/25 ring-4 ring-white">
          <div className="flex size-full items-center justify-center rounded-full text-4xl font-bold text-white" aria-hidden="true">
            {initials}
          </div>
          <img src={statusDot} alt="" width={26} height={26} className="absolute top-26.5 left-26.5" />
        </div>

        <p className="min-w-0 truncate text-lg font-bold text-[#030000]">{fullName}</p>
      </div>
    </div>
  );
}
