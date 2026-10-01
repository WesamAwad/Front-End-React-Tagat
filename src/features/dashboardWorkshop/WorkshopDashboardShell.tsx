import { useEffect, useState, type ReactNode } from "react";
import { startShopRepairRequestListener } from "../../services/listenShopRepairRequests";
import { useAppSelector } from "../../store/hooks";
import { useWorkshopOwnerSession } from "./hooks/useWorkshopOwnerSession";
import { Sidebar } from "./sidebar/Sidebar";
import { WorkshopHeader } from "./WorkshopHeader";

type WorkshopDashboardShellProps = {
  children: ReactNode;
};

export function WorkshopDashboardShell({ children }: WorkshopDashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const { displayName, initials, handleLogout } = useWorkshopOwnerSession();

  useEffect(() => {
    console.log("🔍 Repair listener effect:", {
      userId: user?.id,
      role: user?.role,
    });

    if (user?.role !== "shopOwner" || user.id == null || user.id === "") {
      console.log("❌ Repair listener skipped");
      return;
    }

    console.log("✅ Starting repair listener:", user.id);

    return startShopRepairRequestListener(user.id);
  }, [user?.id, user?.role]);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-primary-light">
      {isSidebarOpen ? <button type="button" aria-label="إغلاق القائمة" className="fixed inset-0 z-40 bg-primary/40 lg:hidden" onClick={closeSidebar} /> : null}

      <Sidebar isOpen={isSidebarOpen} displayName={displayName} initials={initials} onClose={closeSidebar} onLogout={handleLogout} />

      <div className="flex min-w-0 flex-1 flex-col">
        <WorkshopHeader displayName={displayName} initials={initials} onMenuOpen={() => setIsSidebarOpen(true)} />
        <main className="grow p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
