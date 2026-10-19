import { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, LogOut, Menu } from "lucide-react";
import { ConfirmDialog } from "../../components/ConfirmDialog";

type WorkshopHeaderProps = {
  title: string;
  displayName: string;
  initials: string;
  profilePath: string;
  onMenuOpen: () => void;
  onLogout: () => void;
};

export function WorkshopHeader({ title, displayName, initials, profilePath, onMenuOpen, onLogout }: WorkshopHeaderProps) {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-1500 border-b border-primary/10 bg-white/90 shadow-[0_8px_30px_rgba(21,42,78,0.06)] backdrop-blur-md">
        <div className="h-1 bg-linear-to-l from-secondary via-secondary/70 to-primary" aria-hidden="true" />

        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:h-17 sm:gap-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="فتح القائمة"
              className="rounded-xl border border-primary/10 bg-primary-light/70 p-2 text-primary transition hover:border-primary/20 hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 lg:hidden"
              onClick={onMenuOpen}
            >
              <Menu className="size-5" />
            </button>

            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/20 sm:flex">
                <LayoutDashboard className="size-5" aria-hidden="true" />
              </div>

              <h1 className="truncate text-base font-bold text-primary sm:text-lg">{title}</h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              to={profilePath}
              className="group flex items-center gap-2.5 rounded-2xl border border-primary/10 bg-linear-to-l from-primary-light to-white py-1.5 pe-1.5 ps-2.5 shadow-sm transition hover:border-secondary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 sm:ps-3.5"
            >
              <span className="hidden max-w-36 truncate text-sm font-semibold text-primary sm:inline">{displayName}</span>
              <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-sm shadow-primary/25 transition group-hover:bg-primary-hover">
                {initials}
              </span>
              <span className="sr-only">الملف الشخصي</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-200/80 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-100 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            >
              <LogOut className="size-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
              <span className="sr-only sm:hidden">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      <ConfirmDialog
        open={isLogoutConfirmOpen}
        title="تسجيل الخروج"
        message="هل تريد تسجيل الخروج من حسابك؟"
        confirmLabel="تسجيل الخروج"
        cancelLabel="إلغاء"
        loadingLabel="جاري الخروج..."
        variant="danger"
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          onLogout();
        }}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />
    </>
  );
}
