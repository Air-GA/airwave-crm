import {
  BarChart3,
  Calendar,
  ClipboardList,
  Clock,
  FileSpreadsheet,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Package,
  Receipt,
  Settings,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: any;
}

// Update the navigation items to include the import data page
export const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Work Orders",
    href: "/work-orders",
    icon: ClipboardList,
  },
  {
    title: "Schedule",
    href: "/schedule",
    icon: Calendar,
  },
  {
    title: "Dispatch",
    href: "/dispatch",
    icon: MapPin,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package,
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: Receipt,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Messages",
    href: "/messages",
    icon: MessageSquare,
  },
  {
    title: "Timesheets",
    href: "/timesheets",
    icon: Clock,
  },
  {
    title: "Import Data",
    href: "/import-data",
    icon: FileSpreadsheet,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

const SideNav = () => {
  return (
    <div className="flex flex-col space-y-0.5">
      {navigationItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "group flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:bg-secondary hover:text-foreground",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground"
            )
          }
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default SideNav;
