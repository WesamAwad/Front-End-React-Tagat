import { Link, NavLink, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  Boxes,
  Tags,
  Smartphone,
  Building2,
  ClipboardList,
  MapPin,
  Globe,
  Home,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Settings,
  Store,
  Package,
  X,
} from "lucide-react";
import logo from "../../../assets/SwiftFix-Logo.svg";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  disabled?: boolean;
};

const navItems: NavItem[] = [
  { to: "/workshop-owner", label: "لوحة التحكم", icon: LayoutDashboard, end: true },
  { to: "/workshop-owner/orders", label: "الطلبات", icon: ClipboardList },
  { to: "/workshop-owner/spare-parts", label: "قطع الغيار", icon: Package },
  { to: "/admin/countries", label: "الدول", icon: Globe },
  { to: "/admin/cities", label: "المدن", icon: MapPin },
  { to: "/admin/companies", label: "الشركات", icon: Building2 },
  { to: "/admin/devices", label: "الأجهزة", icon: Smartphone },
  { to: "/admin/categories", label: "الفئات", icon: Tags },
  { to: "/admin/products", label: "المنتجات", icon: Boxes },
  { to: "/admin/workshop-owner-requests", label: "طلبات التسجيل", icon: ClipboardCheck },
  { to: "/workshop-owner/settings", label: "إعدادات الورشة", icon: Settings },
];

const sidebarLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
    isActive ? "bg-secondary text-white" : "text-white/75 hover:bg-primary-hover hover:text-white"
  }`;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {navItems.map(({ to, label, icon: Icon, end, disabled }) =>
        disabled ? (
          <span
            key={to}
            aria-disabled="true"
            className="flex cursor-not-allowed items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-white/35"
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span>{label}</span>
            <span className="ms-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px]">قريباً</span>
          </span>
        ) : (
          <NavLink key={to} to={to} end={end} className={sidebarLinkClass} onClick={onNavigate}>
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ),
      )}
    </nav>
  );
}

type SidebarProps = {
  isOpen: boolean;
  displayName: string;
  initials: string;
  onClose: () => void;
  onLogout: () => void;
};

export function Sidebar({ isOpen, displayName, initials, onClose, onLogout }: SidebarProps) {
  const location = useLocation();

  const handleLogout = () => {
    onClose();
    onLogout();
  };

  return (
    <aside
      className={`fixed inset-y-0 inset-s-0 z-1600 flex w-72 flex-col bg-primary text-white shadow-xl transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:shadow-none ${
        isOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full lg:rtl:translate-x-0"
      }`}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-5">
        <Link to="/workshop-owner" className="flex items-center gap-3" onClick={onClose}>
          <img src={logo} alt="SwiftFix" className="h-9 w-auto brightness-0 invert" />
        </Link>
        <button
          type="button"
          aria-label="إغلاق القائمة"
          className="rounded-lg p-1.5 text-white/70 transition hover:bg-primary-hover hover:text-white lg:hidden"
          onClick={onClose}
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="border-b border-white/10 px-4 py-4">
        <Link
          to="/workshop-owner/profile"
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3 transition hover:bg-white/10"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="flex items-center gap-1 text-xs text-white/60">
              <Store className="size-3.5 shrink-0" aria-hidden="true" />
              لوحة صاحب الورشة
            </p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarNav onNavigate={onClose} />
      </div>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          to="/change-password"
          state={{ from: location.pathname }}
          className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-white/75 transition hover:bg-primary-hover hover:text-white"
          onClick={onClose}
        >
          <KeyRound className="size-5 shrink-0" aria-hidden="true" />
          <span>تغيير كلمة المرور</span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-white/75 transition hover:bg-primary-hover hover:text-white"
          onClick={onClose}
        >
          <Home className="size-5 shrink-0" aria-hidden="true" />
          <span>العودة للموقع</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-white/75 transition hover:bg-primary-hover hover:text-white"
        >
          <LogOut className="size-5 shrink-0" aria-hidden="true" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
