
import { Link, useLocation } from "react-router-dom";
import { 
  Users, Clipboard, Calendar, MapPin, BarChart3, 
  Package, FileText, Clock, Settings, MessageSquare, 
  Home, X, Menu 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface SideNavProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SideNav = ({ open, setOpen }: SideNavProps) => {
  const location = useLocation();
  const { userRole } = useAuth();
  
  const navItems = [
    { name: "Dashboard", icon: Home, href: "/", roles: ["admin", "manager", "csr", "sales", "hr", "tech", "customer"] },
    { name: "Customers", icon: Users, href: "/customers", roles: ["admin", "manager", "csr", "sales"] },
    { name: "Work Orders", icon: Clipboard, href: "/work-orders", roles: ["admin", "manager", "csr", "tech"] },
    { name: "Dispatch", icon: MapPin, href: "/dispatch", roles: ["admin", "manager", "csr"] },
    { name: "Schedule", icon: Calendar, href: "/schedule", roles: ["admin", "manager", "csr", "tech", "customer"] },
    { name: "Inventory", icon: Package, href: "/inventory", roles: ["admin", "manager"] },
    { name: "Invoices", icon: FileText, href: "/invoices", roles: ["admin", "manager", "customer"] },
    { name: "Timesheets", icon: Clock, href: "/timesheets", roles: ["admin", "manager", "hr", "tech"] },
    { name: "Reports", icon: BarChart3, href: "/reports", roles: ["admin", "manager", "csr", "sales", "hr", "tech", "customer"] },
    { name: "Messages", icon: MessageSquare, href: "/messages", roles: ["admin", "manager", "csr", "sales", "tech", "customer"] },
    { name: "Settings", icon: Settings, href: "/settings", roles: ["admin"] }
  ];
  
  // Filter menu items based on user role
  const filteredItems = navItems.filter(item => 
    item.roles.includes(userRole || "customer")
  );
  
  return (
    <>
      {/* Mobile sidebar overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar shadow-lg transition-transform md:relative md:z-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo and close button */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <img 
              src="/lovable-uploads/4150f513-0a64-4f43-9f7c-aded810cf322.png" 
              alt="Air Georgia Logo" 
              className="h-10 w-auto"
            />
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setOpen(false)}
            className="md:hidden text-sidebar-foreground hover:bg-sidebar-border hover:text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Navigation links */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-border"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        {/* User info */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-medium text-sidebar-accent-foreground">
                {userRole === "customer" ? "C" : userRole?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">
                {userRole === "customer" ? "Customer Portal" : userRole ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} View` : "User"}
              </p>
              <p className="text-xs text-sidebar-foreground/70">
                {userRole === "customer" ? "Limited Access" : "Staff Account"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SideNav;
