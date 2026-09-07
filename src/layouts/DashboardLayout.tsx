import { Outlet } from "react-router-dom";
import { WorkshopDashboardShell } from "../features/dashboardWorkshop/WorkshopDashboardShell";

export default function DashboardLayout() {
  return (
    <WorkshopDashboardShell>
      <Outlet />
    </WorkshopDashboardShell>
  );
}
