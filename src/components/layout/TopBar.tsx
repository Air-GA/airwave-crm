
import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
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
  
  const handleNotificationClick = (path: string) => {
    navigate(path);
    toast.success("Navigating to notification");
  };

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
        {isMobile && (
          <div className="flex-1 flex justify-center">
            <img 
              src="/lovable-uploads/4150f513-0a64-4f43-9f7c-aded810cf322.png" 
              alt="Air Georgia Logo" 
              className="h-20 w-auto" 
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
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">3</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleNotificationClick("/work-orders")}>
                <div className="flex flex-col">
                  <span className="font-medium">Work Order #wo7 Updated</span>
                  <span className="text-xs text-muted-foreground">Status changed to "In Progress"</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNotificationClick("/inventory")}>
                <div className="flex flex-col">
                  <span className="font-medium">Inventory Alert</span>
                  <span className="text-xs text-muted-foreground">Refrigerant R-410A is low on stock</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNotificationClick("/schedule")}>
                <div className="flex flex-col">
                  <span className="font-medium">Appointment Reminder</span>
                  <span className="text-xs text-muted-foreground">Service appointment at Midtown Office Plaza in 2 hours</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-center text-sm font-medium text-primary"
                onClick={() => navigate("/notifications")}
              >
                View all notifications
              </DropdownMenuItem>
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
