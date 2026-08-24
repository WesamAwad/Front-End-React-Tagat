import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

type WorkshopHeaderProps = {
  displayName: string;
  initials: string;
  onMenuOpen: () => void;
};

export function WorkshopHeader({ displayName, initials, onMenuOpen }: WorkshopHeaderProps) {
  return (
    <header className="sticky top-0 z-1500 flex h-16 items-center justify-between gap-4 border-b border-primary/10 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button type="button" aria-label="فتح القائمة" className="rounded-lg p-2 text-primary transition hover:bg-primary-light lg:hidden" onClick={onMenuOpen}>
          <Menu className="size-5" />
        </button>
        <div>
          <p className="text-xs text-gray-500">SwiftFix</p>
          <h1 className="text-base font-semibold text-primary sm:text-lg">لوحة صاحب الورشة</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/workshop-owner/profile" className="hidden text-sm text-gray-600 transition hover:text-primary sm:inline">
          {displayName}
        </Link>
        <Link
          to="/workshop-owner/profile"
          aria-label="الملف الشخصي"
          className="flex size-10 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary transition hover:ring-2 hover:ring-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
