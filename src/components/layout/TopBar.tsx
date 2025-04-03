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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { WorkOrder } from "@/types";
import { fetchWorkOrders } from "@/services/workOrderService";
import WorkOrderDetailsPanel from "@/components/workorders/WorkOrderDetailsPanel";

interface TopBarProps {
  setSidebarOpen: (open: boolean) => void;
}

interface Notification {
  id: number | string;
  title: string;
  description: string;
  type: string;
  link: string;
  timestamp: string;
  isNew: boolean;
  requiredPermission: string;
  relatedId?: string; // Add relatedId to track related work order or entity
}

const TopBar = ({ setSidebarOpen }: TopBarProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { userRole, permissions } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    const loadWorkOrders = async () => {
      try {
        const orders = await fetchWorkOrders();
        setWorkOrders(orders);
        
        const currentTime = new Date();
        if (lastFetchTime) {
          const newOrders = orders.filter(order => {
            const orderCreatedAt = new Date(order.createdAt);
            return orderCreatedAt > lastFetchTime;
          });
          
          if (newOrders.length > 0) {
            const newNotifications = newOrders.map((order, index) => ({
              id: `new-wo-${order.id}`,
              title: `New Work Order #${order.id}`,
              description: `${order.type} at ${order.address}`,
              type: "workorder",
              link: "/work-orders",
              timestamp: new Date().toISOString(),
              isNew: true,
              requiredPermission: "canViewAllWorkOrders",
              relatedId: order.id
            }));
            
            setNotifications(prev => [...newNotifications, ...prev].slice(0, 10));
          }
          
          const scheduledOrders = orders.filter(order => {
            return order.status === "scheduled" && 
                  order.technicianId && 
                  order.scheduledDate > lastFetchTime.toISOString();
          });
          
          if (scheduledOrders.length > 0) {
            const scheduleNotifications = scheduledOrders.map((order, index) => ({
              id: `schedule-${order.id}`,
              title: `Schedule Update`,
              description: `Work order #${order.id} assigned to ${order.technicianName}`,
              type: "schedule",
              link: "/schedule",
              timestamp: new Date().toISOString(),
              isNew: true,
              requiredPermission: "canDispatchTechnicians",
              relatedId: order.id
            }));
            
            setNotifications(prev => [...scheduleNotifications, ...prev].slice(0, 10));
          }
        }
        
        setLastFetchTime(currentTime);
      } catch (error) {
        console.error("Error fetching notifications data:", error);
      }
    };
    
    loadWorkOrders();
    
    const intervalId = setInterval(loadWorkOrders, 60000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [lastFetchTime]);
  
  const getFilteredNotifications = () => {
    const allNotifications = notifications.length > 0 ? notifications : [
      {
        id: 1,
        title: "Work Order Updates",
        description: "No new updates at this time",
        type: "workorder",
        link: "/work-orders",
        timestamp: new Date().toISOString(),
        isNew: false,
        requiredPermission: "canViewAllWorkOrders"
      }
    ];

    return allNotifications.filter(notification => {
      if (!permissions) return false;
      return permissions[notification.requiredPermission as keyof typeof permissions];
    });
  };

  const handleNotificationClick = (path: string, notificationId: string | number, type: string, relatedId?: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isNew: false } 
          : notification
      )
    );
    
    const baseUrl = window.location.origin;
    let targetUrl = `${baseUrl}${path}`;
    
    if (type === "workorder" && relatedId) {
      targetUrl = `${baseUrl}/work-orders?id=${relatedId}`;
      window.open(targetUrl, '_blank');
      toast.success(`Opening work order #${relatedId} details in new window`);
      return;
    }
    
    if (type === "schedule" && relatedId) {
      const workOrder = workOrders.find(wo => wo.id === relatedId);
      if (workOrder && workOrder.scheduledDate) {
        const scheduledDate = new Date(workOrder.scheduledDate);
        const dateString = scheduledDate.toISOString().split('T')[0];
        
        targetUrl = `${baseUrl}/schedule?date=${dateString}&tech=${workOrder.technicianId || ''}`;
        window.open(targetUrl, '_blank');
        toast.success(`Opening schedule for work order #${workOrder.id} in new window`);
        return;
      }
    }
    
    window.open(`${baseUrl}${path}`, '_blank');
    toast.success("Opening notification page in new window");
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedWorkOrder(null);
  };

  const viewWorkOrderDetails = () => {
    if (selectedWorkOrder) {
      const baseUrl = window.location.origin;
      window.open(`${baseUrl}/work-orders?id=${selectedWorkOrder.id}`, '_blank');
      setIsDialogOpen(false);
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const newNotificationsCount = filteredNotifications.filter(n => n.isNew).length;

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="flex h-16 items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {isMobile ? (
          <div className="flex-1 flex justify-center">
            <img 
              src="/lovable-uploads/4150f513-0a64-4f43-9f7c-aded810cf322.png" 
              alt="Air Georgia Logo" 
              className="h-20 w-auto" 
            />
          </div>
        ) : (
          <div className="mr-4">
            <img 
              src="/lovable-uploads/4150f513-0a64-4f43-9f7c-aded810cf322.png" 
              alt="Air Georgia Logo" 
              className="h-12 w-auto" 
            />
          </div>
        )}
        
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
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className={`h-5 w-5 ${newNotificationsCount > 0 ? 'text-primary' : ''}`} />
                {newNotificationsCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white animate-pulse">
                    {newNotificationsCount}
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
                    onClick={() => handleNotificationClick(
                      notification.link, 
                      notification.id,
                      notification.type,
                      notification.relatedId
                    )}
                    className={`cursor-pointer ${notification.isNew ? "bg-accent/20" : ""}`}
                  >
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between">
                        <span className={`${notification.isNew ? 'font-medium text-primary' : 'font-medium'}`}>
                          {notification.title}
                        </span>
                        {notification.isNew && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {notification.description}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
                    onClick={() => {
                      window.open(`${window.location.origin}/notifications`, '_blank');
                    }}
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

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) closeDialog();
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Work Order Details</DialogTitle>
          </DialogHeader>
          {selectedWorkOrder && (
            <div className="space-y-4">
              <WorkOrderDetailsPanel workOrder={selectedWorkOrder} />
              <div className="flex justify-end">
                <Button onClick={viewWorkOrderDetails}>
                  View Full Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default TopBar;
