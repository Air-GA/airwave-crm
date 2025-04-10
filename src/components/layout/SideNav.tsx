import {
  BarChart3,
  Building2,
  Calendar,
  ClipboardList,
  ClipboardCheck,
  Clock,
  FileText,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Package,
  Receipt,
  Settings,
  Users,
  X
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  href: string;
  icon: any;
}

export const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Customers",
    href: "/customers-list",
    icon: Users,
  },
  {
    title: "Service Addresses",
    href: "/service-addresses",
    icon: MapPin,
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
    title: "Purchase Orders",
    href: "/purchase-orders",
    icon: FileText,
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
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SideNavProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const SideNav = ({ open = false, setOpen }: SideNavProps) => {
  const handleClose = () => {
    if (setOpen) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Mobile sidebar */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-black/80 md:hidden",
          open ? "block" : "hidden"
        )}
        onClick={handleClose}
      />
      
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border md:hidden transform transition-transform duration-200 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <img 
            src="/lovable-uploads/f169bc97-451d-4387-9c63-d2955fe90926.png" 
            alt="Air Georgia Home Comfort Systems" 
            className="h-10 w-auto" 
          />
          <button onClick={handleClose}>
            <X className="h-5 w-5 text-sidebar-foreground" />
          </button>
        </div>
        <SideNav.Menu />
      </div>
      
      {/* Desktop sidebar */}
      <Sidebar 
        className="hidden md:block md:w-64 md:flex-shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
        collapsible="none"
      >
        <SidebarHeader className="flex h-16 items-center px-4 border-b border-sidebar-border">
          <img 
            src="/lovable-uploads/f169bc97-451d-4387-9c63-d2955fe90926.png" 
            alt="Air Georgia Home Comfort Systems" 
            className="h-10 w-auto" 
          />
        </SidebarHeader>
        <SidebarContent>
          <SideNav.Menu />
        </SidebarContent>
      </Sidebar>
    </>
  );
};

SideNav.Menu = function SideNavMenu() {
  return (
    <SidebarMenu className="flex flex-col space-y-0.5 p-2">
      {navigationItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild>
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export default SideNav;
