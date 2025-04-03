import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface TopBarProps {
  setSidebarOpen: (open: boolean) => void;
}

const TopBar = ({ setSidebarOpen }: TopBarProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { userRole, permissions } = useAuth();
  
  const getFilteredNotifications = () => {
    const allNotifications = [
      {
        id: 1,
        title: "Work Order #wo7 Updated",
        description: "Status changed to \"In Progress\"",
        type: "workorder",
        link: "/work-orders",
        requiredPermission: "canViewAllWorkOrders"
      },
      {
        id: 2,
        title: "Inventory Alert",
        description: "Refrigerant R-410A is low on stock",
        type: "inventory",
        link: "/inventory",
        requiredPermission: "canDispatchTechnicians"
      },
      {
        id: 3,
        title: "Appointment Reminder",
        description: "Service appointment at Midtown Office Plaza in 2 hours",
        type: "schedule",
        link: "/schedule",
        requiredPermission: "canViewAllWorkOrders"
      }
    ];

    // Filter notifications based on user permissions
    return allNotifications.filter(notification => {
      if (!permissions) return false;
      return permissions[notification.requiredPermission as keyof typeof permissions];
    });
  };

  const handleNotificationClick = (path: string) => {
    navigate(path);
    toast.success("Navigating to notification");
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="flex h-16 items-center px-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Logo - centered and enlarged for mobile */}
        {isMobile ? (
          <div className="flex-1 flex justify-center">
            <img 
              src="/lovable-uploads/4150f513-0a64-4f43-9f7c-aded810cf322.png" 
              alt="Air Georgia Logo" 
              className="h-20 w-auto" 
            />
          </div>
        ) : (
          /* Logo for desktop - added to the left side with larger size */
          <div className="mr-4">
            <img 
              src="/lovable-uploads/4150f513-0a64-4f43-9f7c-aded810cf322.png" 
              alt="Air Georgia Logo" 
              className="h-12 w-auto" 
            />
          </div>
        )}
        
        {/* Search - hidden on mobile when logo is centered */}
        <div className={`${isMobile ? "hidden" : "flex-1"}`}>
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-md border bg-background pl-8 md:w-80"
            />
          </div>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                {filteredNotifications.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {filteredNotifications.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map(notification => (
                  <DropdownMenuItem 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.link)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{notification.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {notification.description}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  No notifications available
                </DropdownMenuItem>
              )}
              {filteredNotifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-center text-sm font-medium text-primary"
                    onClick={() => navigate("/notifications")}
                  >
                    View all notifications
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {!isMobile && (
            <Button 
              variant="default" 
              className="ml-2"
              onClick={() => navigate("/work-orders/create")}
            >
              + New Work Order
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
