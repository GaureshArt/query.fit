import DashboardSvg from "@/public/app-svgs/dashboard-svg";
import SettingSvg from "@/public/app-svgs/setting";
import WorkspaceSvg from "@/public/app-svgs/workspace-svg";
export interface ISidebarNavItem {
  title: string;
  url: string;
  isActive: boolean;
  icon: React.JSX.Element;
}
export const SIDEBAR_NAV_MAIN_DATA: ISidebarNavItem[] = [
  {
    title: "Workspace",
    url: "/workspace",
    isActive: false,
    icon: WorkspaceSvg(),
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    isActive: false,
    icon: DashboardSvg(),
  },
  {
    title: "Settings",
    url: "/settings",
    isActive: false,
    icon: SettingSvg(),
  },
];
