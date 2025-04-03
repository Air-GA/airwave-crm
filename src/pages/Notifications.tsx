
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, AlertCircle, Bell, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Work Order #wo7 Updated",
      description: "Status changed to \"In Progress\"",
      time: "2 hours ago",
      type: "update",
      read: false,
      link: "/work-orders"
    },
    {
      id: 2,
      title: "Inventory Alert",
      description: "Refrigerant R-410A is low on stock",
      time: "4 hours ago",
      type: "alert",
      read: false,
      link: "/inventory"
    },
    {
      id: 3,
      title: "Appointment Reminder",
      description: "Service appointment at Midtown Office Plaza in 2 hours",
      time: "5 hours ago",
      type: "reminder",
      read: false,
      link: "/schedule"
    },
    {
      id: 4,
      title: "New Customer Added",
      description: "Atlantic Properties added to your customer list",
      time: "1 day ago",
      type: "update",
      read: true,
      link: "/customers"
    },
    {
      id: 5,
      title: "Invoice #INV-2023 Paid",
      description: "Payment of $1,250.00 received",
      time: "2 days ago",
      type: "update",
      read: true,
      link: "/invoices"
    }
  ]);

  const handleNotificationClick = (id: number, link: string) => {
    // Update the notification status to read
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
    
    // Show success toast and open in new window
    toast.success("Navigating to notification source");
    window.open(link, '_blank');
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    toast.success("All notifications marked as read");
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success("All notifications cleared");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "update":
        return <Check className="h-5 w-5 text-blue-500" />;
      case "reminder":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "alert":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">View and manage your notifications</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
              Mark all as read
            </Button>
            <Button variant="outline" onClick={clearAllNotifications} disabled={notifications.length === 0}>
              <Trash2 className="mr-1 h-4 w-4" /> Clear all
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">
              All
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-2">{notifications.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors ${notification.read ? 'bg-background' : 'bg-accent/20'}`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-muted-foreground">{notification.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">{notification.time}</div>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No notifications</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You don't have any notifications at the moment.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="unread" className="mt-4">
            {unreadCount > 0 ? (
              <div className="space-y-2">
                {notifications.filter(n => !n.read).map((notification) => (
                  <div 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                    className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors bg-accent/20"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-muted-foreground">{notification.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">{notification.time}</div>
                    </div>
                    <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Check className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">All caught up!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You've read all your notifications.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Notifications;
