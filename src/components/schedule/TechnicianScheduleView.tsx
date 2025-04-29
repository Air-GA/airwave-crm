
// Update the import to use the correct import path 
import { useWorkOrderStore } from "@/services/workOrderService";

import React, { useMemo } from "react";
import { Technician, WorkOrder } from "@/types";
import { formatDate } from "@/lib/date-utils";
import { Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TechnicianScheduleViewProps {
  technician: Technician | null;
  workOrders: WorkOrder[];
  selectedDate: Date;
  showAllAppointments?: boolean;
  onWorkOrderClick?: (workOrder: WorkOrder) => void;
  isLoading?: boolean;
}

const TechnicianScheduleView = ({
  technician,
  workOrders,
  selectedDate,
  showAllAppointments = false,
  onWorkOrderClick,
  isLoading = false,
}: TechnicianScheduleViewProps) => {
  
  const relevantWorkOrders = useMemo(() => {
    if (isLoading) return [];
    
    const filtered = workOrders.filter((order) => {
      // Filter by date
      const orderDate = new Date(order.scheduledDate);
      const dateMatches =
        orderDate.getFullYear() === selectedDate.getFullYear() &&
        orderDate.getMonth() === selectedDate.getMonth() &&
        orderDate.getDate() === selectedDate.getDate();
        
      // Filter by technician if applicable
      const techMatches = showAllAppointments || 
        (technician && order.technicianId === technician.id);
      
      return dateMatches && (techMatches || !order.technicianId);
    });
    
    // Sort by time
    return filtered.sort((a, b) => {
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    });
  }, [workOrders, technician, selectedDate, showAllAppointments, isLoading]);
  
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 7; hour <= 19; hour++) {
      const time = hour < 12 
        ? `${hour}:00 AM` 
        : hour === 12 
          ? `${hour}:00 PM`
          : `${hour - 12}:00 PM`;
      
      const slotOrders = relevantWorkOrders.filter(order => {
        const orderDate = new Date(order.scheduledDate);
        return orderDate.getHours() === hour;
      });
      
      slots.push({
        time,
        hour,
        workOrders: slotOrders,
      });
    }
    return slots;
  }, [relevantWorkOrders]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Loading schedule...</p>
        </div>
      </div>
    );
  }
  
  if (relevantWorkOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-2">No appointments scheduled for this day</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {timeSlots.map((slot) => (
        <div key={slot.hour} className="relative">
          <div className="sticky top-0 bg-background z-10 py-1">
            <div className="flex items-center">
              <div className="w-16 text-sm font-medium">{slot.time}</div>
              <div className="h-px flex-grow bg-border"></div>
            </div>
          </div>
          
          <div className="ml-16 space-y-2">
            {slot.workOrders.length === 0 ? (
              <div className="h-6"></div>
            ) : (
              slot.workOrders.map((order) => (
                <div
                  key={order.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    order.status === "completed"
                      ? "bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30"
                      : order.status === "in-progress"
                      ? "bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30"
                      : order.status === "pending"
                      ? "bg-amber-100 dark:bg-amber-900/20 hover:bg-amber-200 dark:hover:bg-amber-900/30"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                  onClick={() => onWorkOrderClick && onWorkOrderClick(order)}
                >
                  <div className="flex justify-between">
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.scheduledDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <MapPin className="mr-1 h-3 w-3" /> {order.address}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm">
                      {order.type.charAt(0).toUpperCase() + order.type.slice(1)} 
                    </div>
                    {!technician && order.technicianId && (
                      <div className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                        {order.technicianName || "Assigned"}
                      </div>
                    )}
                    {!order.technicianId && showAllAppointments && (
                      <div className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">
                        Unassigned
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TechnicianScheduleView;
