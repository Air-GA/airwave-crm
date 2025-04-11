
import { useState } from "react";
import { Menu, Bell, UserCircle, Sun, Moon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/theme-provider";
import { ReactNode } from "react";
import { toast } from "sonner";

interface TopBarProps {
  setSidebarOpen: (open: boolean) => void;
  children?: ReactNode;
}

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  link: string;
}

const TopBar = ({ setSidebarOpen, children }: TopBarProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();
  
  // Sample notifications data
  const notifications: Notification[] = [
    {
      id: 1,
      title: "New work order assigned",
      description: "Work order #wo7 has been assigned to you",
      time: "5 minutes ago",
      link: "/work-orders"
    },
    {
      id: 2,
      title: "Inventory alert: Low stock on R-410A",
      description: "Current stock level is below the minimum threshold",
      time: "1 hour ago",
      link: "/inventory"
    },
    {
      id: 3,
      title: "Customer feedback received",
      description: "New feedback from Peachtree Office Center",
      time: "Yesterday",
      link: "/customers"
    }
  ];
  
  const handleNotificationClick = (notification: Notification) => {
    setShowNotifications(false);
    toast.success(`Navigating to ${notification.title}`);
    navigate(notification.link);
  };
  
  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };
  
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button
        variant="outline"
        size="icon"
        className="md:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      
      <div className="w-full flex items-center justify-between gap-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <img src="/lovable-uploads/f169bc97-451d-4387-9c63-d2955fe90926.png" alt="Air Georgia Home Comfort Systems" className="h-8 w-8" />
            <h1 className="hidden text-xl font-semibold md:block">Air Georgia Home Comfort Systems</h1>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {children}
          
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full relative">
                <Bell className="h-4 w-4" />
                <Badge
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                  variant="destructive"
                >
                  {notifications.length}
                </Badge>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2 font-medium">Notifications</div>
              <DropdownMenuSeparator />
              <div className="p-2 text-sm">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className="mb-2 rounded-md p-2 hover:bg-muted cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.description}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/notifications" className="w-full cursor-pointer justify-center">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {user?.name && <p className="font-medium">{user.name}</p>}
                  {user?.email && (
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
