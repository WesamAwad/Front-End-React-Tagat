import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { ClipboardCheck, Boxes, Eye, Tags, Smartphone, Building2, ClipboardList, Flag, MapPin, Globe, Home, LayoutDashboard, ListPlus, LogOut, MessageCircle, Settings, Shield, Star, Store, Package, UserRound, UserX, Wrench, X } from "lucide-react";
import logo from "../../../assets/SwiftFix-Logo.svg";
import { useAppSelector } from "../../../store/hooks";
import { useGetAllComplaintsQuery, useGetAllRepairRequestsQuery, useGetShopOwnerVerificationDataQuery } from "../../auth/authApi";
import { SHOP_REPAIR_REQUEST_CREATED_DOM_EVENT, type ShopRepairRequestCreatedDetail } from "../../../services/listenShopRepairRequests";
import { NEW_SHOP_OWNER_VERIFICATION_DOM_EVENT, type NewShopOwnerVerificationDomDetail } from "../../../services/listenNewShopOwnerVerification";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  disabled?: boolean;
  /** Show pending count badge (e.g. registration requests). */
  badgeKey?: "pendingVerifications" | "pendingRepairs" | "pendingComplaints";
};

const navItems: NavItem[] = [
  { to: "/workshop-owner", label: "لوحة التحكم", icon: LayoutDashboard, end: true },
  { to: "/workshop-owner/orders", label: "طلبات الاصلاح", icon: ClipboardList, badgeKey: "pendingRepairs" },
  { to: "/workshop-owner/reviews", label: "التقييمات", icon: Star },
  { to: "/workshop-owner/spare-parts", label: "قطع الغيار", icon: Package },
  { to: "/workshop-owner/specs", label: "إضافة المواصفات", icon: ListPlus },
  { to: "/admin/contact-messages", label: "تواصل معنا", icon: MessageCircle },
  { to: "/admin/complaints", label: "شكاوى الورش", icon: Flag, badgeKey: "pendingComplaints" },
  { to: "/admin/reviews", label: "إدارة التقييمات", icon: Star },
  { to: "/admin/countries", label: "الدول", icon: Globe },
  { to: "/admin/cities", label: "المدن", icon: MapPin },
  { to: "/admin/companies", label: "الشركات", icon: Building2 },
  { to: "/admin/devices", label: "الأجهزة", icon: Smartphone },
  { to: "/admin/services", label: "إضافة الخدمات", icon: Wrench },
  { to: "/admin/roles", label: "الأدوار والصلاحيات", icon: Shield },
  { to: "/admin/deletion-reasons", label: "أسباب حذف الحساب", icon: UserX },
  { to: "/admin/categories", label: "الفئات", icon: Tags },
  { to: "/admin/products", label: "المنتجات", icon: Boxes },
  { to: "/admin/workshops", label: "الورش", icon: Store },
  { to: "/admin/workshop-owner-requests", label: "طلبات التسجيل", icon: ClipboardCheck, badgeKey: "pendingVerifications" },
  { to: "/workshop-owner/settings", label: "إعدادات الورشة", icon: Settings },
];

const sidebarLinkClass = ({ isActive }: { isActive: boolean }) => `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${isActive ? "bg-secondary text-white" : "text-white/75 hover:bg-primary-hover hover:text-white"}`;

const badgeClassName = "ms-auto inline-flex min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold leading-none text-white";

function SidebarNav({
  onNavigate,
  pendingVerifications,
  pendingRepairs,
  pendingComplaints,
  liveVerificationId,
  showWorkshopPage,
}: {
  onNavigate?: () => void;
  pendingVerifications: number;
  pendingRepairs: number;
  pendingComplaints: number;
  liveVerificationId: string | number | null;
  showWorkshopPage: boolean;
}) {
  const location = useLocation();
  const visibleNavItems = showWorkshopPage
    ? [navItems[0], { to: "/workshop-owner/profile", label: "عرض صفحة الورشة", icon: Eye }, ...navItems.slice(1)]
    : navItems;

  return (
    <nav className="space-y-1">
      {visibleNavItems.map(({ to, label, icon: Icon, end, disabled, badgeKey }) => {
        const isRequestsItem = badgeKey === "pendingVerifications";
        const badgeCount = isRequestsItem ? pendingVerifications : 0;
        const showLiveId = isRequestsItem && liveVerificationId != null;
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
            {showLiveId ? (
              <span className={badgeClassName} aria-label={`إشعار طلب تسجيل رقم ${liveVerificationId}`} title="طلب تسجيل جديد">
                #{liveVerificationId}
              </span>
            ) : badgeCount > 0 ? (
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
  onClose: () => void;
  onLogout: () => void;
};

export function Sidebar({ isOpen, displayName, initials, onClose, onLogout }: SidebarProps) {
  const role = useAppSelector((state) => state.auth.user?.role);
  const { data } = useGetShopOwnerVerificationDataQuery();
  const { data: repairRequests } = useGetAllRepairRequestsQuery(undefined, { skip: role !== "shopOwner" });
  const { data: complaintsData } = useGetAllComplaintsQuery(undefined, { skip: role !== "admin" });
  const pendingVerifications = (data?.data ?? []).filter((request) => request.status === "pending").length;
  const loadedRequests = repairRequests?.data ?? [];
  const pendingRepairIds = loadedRequests.filter((request) => request.status.trim().toLowerCase() === "pending").map((request) => request.id);
  const knownRepairIds = new Set(loadedRequests.map((request) => request.id));
  const [socketRepairIds, setSocketRepairIds] = useState<string[]>([]);
  const unseenSocketRepairs = socketRepairIds.filter((id) => !knownRepairIds.has(id));
  const pendingRepairs = pendingRepairIds.length + unseenSocketRepairs.length;
  const pendingComplaints = (complaintsData?.data ?? []).filter((complaint) => complaint.status.trim().toLowerCase() === "pending").length;
  const [liveVerificationId, setLiveVerificationId] = useState<string | number | null>(null);

  useEffect(() => {
    const handleLiveVerification = (event: Event) => {
      const detail = (event as CustomEvent<NewShopOwnerVerificationDomDetail>).detail;
      if (detail?.verificationId == null || detail.verificationId === "") return;
      setLiveVerificationId(detail.verificationId);
    };

    const handleRepairRequestCreated = (event: Event) => {
      const detail = (event as CustomEvent<ShopRepairRequestCreatedDetail>).detail;
      const repairRequestId = detail?.repairRequestId || `live-${Date.now()}`;
      setSocketRepairIds((current) => (current.includes(repairRequestId) ? current : [...current, repairRequestId]));
    };

    window.addEventListener(NEW_SHOP_OWNER_VERIFICATION_DOM_EVENT, handleLiveVerification);
    window.addEventListener(SHOP_REPAIR_REQUEST_CREATED_DOM_EVENT, handleRepairRequestCreated);
    return () => {
      window.removeEventListener(NEW_SHOP_OWNER_VERIFICATION_DOM_EVENT, handleLiveVerification);
      window.removeEventListener(SHOP_REPAIR_REQUEST_CREATED_DOM_EVENT, handleRepairRequestCreated);
    };
  }, []);

  useEffect(() => {
    if (liveVerificationId == null) return;

    const timeoutId = window.setTimeout(() => {
      setLiveVerificationId(null);
    }, 8000);

    return () => window.clearTimeout(timeoutId);
  }, [liveVerificationId]);

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
        <button type="button" aria-label="إغلاق القائمة" className="rounded-lg p-1.5 text-white/70 transition hover:bg-primary-hover hover:text-white lg:hidden" onClick={onClose}>
          <X className="size-5" />
        </button>
      </div>

      <div className="border-b border-white/10 px-4 py-4">
        <Link to="/workshop-owner/profile" onClick={onClose} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3 transition hover:bg-white/10">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">{initials}</div>
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
        <SidebarNav
          onNavigate={onClose}
          pendingVerifications={pendingVerifications}
          pendingRepairs={pendingRepairs}
          pendingComplaints={pendingComplaints}
          liveVerificationId={liveVerificationId}
          showWorkshopPage={role === "shopOwner"}
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
        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-white/75 transition hover:bg-primary-hover hover:text-white">
          <LogOut className="size-5 shrink-0" aria-hidden="true" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
