import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({
  children,
  title = "Dashboard",
}: DashboardLayoutProps) {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="app-main">
        <TopNavbar title={title} />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
