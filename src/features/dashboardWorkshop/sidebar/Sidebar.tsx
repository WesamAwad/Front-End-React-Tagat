import { Link, NavLink, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { ClipboardCheck, Boxes, Eye, Tags, Smartphone, Building2, ClipboardList, Flag, MapPin, Globe, Home, LayoutDashboard, ListPlus, MessageCircle, Shield, Star, Store, Package, UserRound, UserX, Wrench, X } from "lucide-react";
import logo from "../../../assets/SwiftFix-Logo.svg";
import { useAppSelector } from "../../../store/hooks";
import { useGetAllComplaintsQuery, useGetAllRepairRequestsQuery, useGetShopOwnerVerificationDataQuery } from "../../auth/authApi";
import { getPostLoginPath } from "../../auth/authRoles";
import { hasPermission, type AppPermission } from "../../auth/permissions";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  disabled?: boolean;
  /** Show pending count badge (e.g. registration requests). */
  badgeKey?: "pendingVerifications" | "pendingRepairs" | "pendingComplaints";
  /** Backend permission the user needs for this item to be shown. */
  permission?: AppPermission;
};

const navItems: NavItem[] = [
  { to: "/workshop-owner/profile", label: "عرض صفحة الورشة", icon: Eye, permission: "عرض ملف الورشة" },
  { to: "/workshop-owner/orders", label: "طلبات الاصلاح", icon: ClipboardList, badgeKey: "pendingRepairs", permission: "عرض طلبات الصيانة" },
  { to: "/workshop-owner/reviews", label: "التقييمات", icon: Star, permission: "عرض تقييمات الورشة" },
  { to: "/workshop-owner/spare-parts", label: "قطع الغيار", icon: Package, permission: "عرض منتجات الورشة" },
  { to: "/workshop-owner/specs", label: "إضافة المواصفات", icon: ListPlus, permission: "عرض ميزات المتجر" },
  { to: "/admin/contact-messages", label: "تواصل معنا", icon: MessageCircle, permission: "عرض رسائل التواصل" },
  { to: "/admin/complaints", label: "شكاوى الورش", icon: Flag, badgeKey: "pendingComplaints", permission: "عرض الشكاوى" },
  { to: "/admin/reviews", label: "إدارة التقييمات", icon: Star, permission: "عرض تقييمات جميع الورش" },
  { to: "/admin/countries", label: "الدول", icon: Globe, permission: "عرض الدول" },
  { to: "/admin/cities", label: "المدن", icon: MapPin, permission: "عرض المدن" },
  { to: "/admin/companies", label: "الشركات", icon: Building2, permission: "عرض العلامات التجارية" },
  { to: "/admin/devices", label: "الأجهزة", icon: Smartphone, permission: "عرض الأجهزة" },
  { to: "/admin/services", label: "إضافة الخدمات", icon: Wrench, permission: "عرض الخدمات" },
  { to: "/admin/roles", label: "الأدوار والصلاحيات", icon: Shield, permission: "عرض الأدوار" },
  { to: "/admin/deletion-reasons", label: "أسباب حذف الحساب", icon: UserX, permission: "تفعيل وإلغاء تفعيل أسباب حذف الحساب" },
  { to: "/admin/categories", label: "الفئات", icon: Tags, permission: "عرض الفئات" },
  { to: "/admin/products", label: "المنتجات", icon: Boxes, permission: "عرض المنتجات" },
  { to: "/admin/workshops", label: "الورش", icon: Store, permission: "عرض أصحاب الورش" },
  { to: "/admin/workshop-owner-requests", label: "طلبات التسجيل", icon: ClipboardCheck, badgeKey: "pendingVerifications", permission: "عرض طلبات تحقق أصحاب الورش" },
];

const sidebarLinkClass = ({ isActive }: { isActive: boolean }) => `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${isActive ? "bg-secondary text-white" : "text-white/75 hover:bg-primary-hover hover:text-white"}`;

const badgeClassName = "ms-auto inline-flex min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold leading-none text-white";

function SidebarNav({
  items,
  onNavigate,
  pendingVerifications,
  pendingRepairs,
  pendingComplaints,
}: {
  items: NavItem[];
  onNavigate?: () => void;
  pendingVerifications: number;
  pendingRepairs: number;
  pendingComplaints: number;
}) {
  const location = useLocation();

  return (
    <nav className="space-y-1">
      {items.map(({ to, label, icon: Icon, end, disabled, badgeKey }) => {
        const isRequestsItem = badgeKey === "pendingVerifications";
        const badgeCount = isRequestsItem ? pendingVerifications : 0;
        const repairCount = badgeKey === "pendingRepairs" ? pendingRepairs : 0;
        const complaintCount = badgeKey === "pendingComplaints" ? pendingComplaints : 0;
        const iconBadgeCount = repairCount || complaintCount;
        const ordersActive = location.pathname === "/workshop-owner/orders" || location.pathname.startsWith("/workshop-owner/orders/");
        const complaintsActive = location.pathname === "/admin/complaints" || location.pathname.startsWith("/admin/complaints/");
        const iconBadgeActive = badgeKey === "pendingRepairs" ? ordersActive : badgeKey === "pendingComplaints" ? complaintsActive : false;

        if (disabled) {
          return (
            <span key={to} aria-disabled="true" className="flex cursor-not-allowed items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-white/35">
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span>{label}</span>
              <span className="ms-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px]">قريباً</span>
            </span>
          );
        }

        return (
          <NavLink key={to} to={to} end={end} className={sidebarLinkClass} onClick={onNavigate}>
            <span className="relative shrink-0">
              <Icon className="size-5" aria-hidden="true" />
              {iconBadgeCount > 0 ? (
                <span
                  className={`absolute -top-2.5 -inset-e-2.5 flex min-h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ${iconBadgeActive ? "bg-white text-secondary" : "bg-secondary text-white"}`}
                  aria-label={
                    badgeKey === "pendingComplaints" ? `${complaintCount} شكوى بانتظار الرد` : `${repairCount} طلب بانتظار المراجعة`
                  }
                >
                  {iconBadgeCount > 9 ? "9+" : iconBadgeCount}
                </span>
              ) : null}
            </span>
            <span className="min-w-0 flex-1 truncate">{label}</span>
            {badgeCount > 0 ? (
              <span className={badgeClassName} aria-label={`${badgeCount} طلب قيد المراجعة`}>
                {badgeCount > 99 ? "99+" : badgeCount}
              </span>
            ) : null}
          </NavLink>
        );
      })}
    </nav>
  );
}

type SidebarProps = {
  isOpen: boolean;
  displayName: string;
  initials: string;
  profilePath: string;
  onClose: () => void;
};

export function Sidebar({ isOpen, displayName, initials, profilePath, onClose }: SidebarProps) {
  const role = useAppSelector((state) => state.auth.user?.role);
  const permissions = useAppSelector((state) => state.auth.user?.permissions);
  const homePath = getPostLoginPath(role);
  const permittedNavItems = navItems.filter((item) => !item.permission || hasPermission(permissions, item.permission));
  // Badge counts load only when the item showing them is visible, so no request is sent without the permission.
  const showsBadge = (badgeKey: NonNullable<NavItem["badgeKey"]>) => permittedNavItems.some((item) => item.badgeKey === badgeKey);
  const { data } = useGetShopOwnerVerificationDataQuery(undefined, { skip: !showsBadge("pendingVerifications") });
  const { data: repairRequests } = useGetAllRepairRequestsQuery(undefined, { skip: !showsBadge("pendingRepairs") });
  const { data: complaintsData } = useGetAllComplaintsQuery(undefined, { skip: !showsBadge("pendingComplaints") });
  const pendingVerifications = (data?.data ?? []).filter((request) => request.status === "pending").length;
  const pendingRepairs = (repairRequests?.data ?? []).filter((request) => request.status.trim().toLowerCase() === "pending").length;
  const pendingComplaints = (complaintsData?.data ?? []).filter((complaint) => complaint.status.trim().toLowerCase() === "pending").length;

  return (
    <aside
      className={`fixed inset-y-0 inset-s-0 z-1600 flex w-72 flex-col bg-primary text-white shadow-xl transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:shadow-none ${
        isOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full lg:rtl:translate-x-0"
      }`}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-5">
        <Link to={homePath} className="flex items-center gap-3" onClick={onClose}>
          <img src={logo} alt="SwiftFix" className="h-9 w-auto brightness-0 invert" />
        </Link>
        <button type="button" aria-label="إغلاق القائمة" className="rounded-lg p-1.5 text-white/70 transition hover:bg-primary-hover hover:text-white lg:hidden" onClick={onClose}>
          <X className="size-5" />
        </button>
      </div>

      <div className="border-b border-white/10 px-4 py-4">
        <Link to={profilePath} onClick={onClose} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3 transition hover:bg-white/10">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">{initials}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="flex items-center gap-1 text-xs text-white/60">
              <Store className="size-3.5 shrink-0" aria-hidden="true" />
              {role === "admin" ? "لوحة تحكم الأدمن" : "لوحة صاحب الورشة"}
            </p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarNav
          items={[{ to: homePath, label: "لوحة التحكم", icon: LayoutDashboard, end: true }, ...permittedNavItems]}
          onNavigate={onClose}
          pendingVerifications={pendingVerifications}
          pendingRepairs={pendingRepairs}
          pendingComplaints={pendingComplaints}
        />
      </div>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link to="/profile" className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-white/75 transition hover:bg-primary-hover hover:text-white" onClick={onClose}>
          <UserRound className="size-5 shrink-0" aria-hidden="true" />
          <span>ملفي الشخصي</span>
        </Link>
        <Link to="/" className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-white/75 transition hover:bg-primary-hover hover:text-white" onClick={onClose}>
          <Home className="size-5 shrink-0" aria-hidden="true" />
          <span>العودة للموقع</span>
        </Link>
      </div>
    </aside>
  );
}
