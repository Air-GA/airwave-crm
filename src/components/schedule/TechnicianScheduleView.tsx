
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/date-utils";
import { Calendar, Clock, MapPin, UserRound, AlertCircle, CheckCircle2, Loader2, CalendarClock } from "lucide-react";
import { Technician, WorkOrder } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  isLoading = false
}: TechnicianScheduleViewProps) => {
  // Filter work orders for this technician on the selected date
  // If showAllAppointments is true, show all appointments for the date
  const filteredWorkOrders = workOrders.filter(order => {
    const orderDate = new Date(order.scheduledDate);
    
    // Debug logs to help diagnose why orders aren't showing
    console.log(`Filtering order: ${order.id}, date: ${orderDate}, selected date: ${selectedDate}`);
    console.log(`Tech match: ${!technician || order.technicianId === technician.id}, Date match: ${
      orderDate.getFullYear() === selectedDate.getFullYear() &&
      orderDate.getMonth() === selectedDate.getMonth() &&
      orderDate.getDate() === selectedDate.getDate()
    }`);
    
    return (
      (showAllAppointments || (!technician || order.technicianId === technician.id)) &&
      orderDate.getFullYear() === selectedDate.getFullYear() &&
      orderDate.getMonth() === selectedDate.getMonth() &&
      orderDate.getDate() === selectedDate.getDate()
    );
  });

  console.log(`Total work orders: ${workOrders.length}, Filtered: ${filteredWorkOrders.length}`);

  // Sort by scheduled time
  filteredWorkOrders.sort((a, b) => 
    new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );

  const getStatusBadge = (order: WorkOrder) => {
    switch (order.status) {
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Completed</Badge>;
      case "pending-completion":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">Pending Completion</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">In Progress</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="bg-sky-50 text-sky-700 hover:bg-sky-50">Scheduled</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">Pending</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Cancelled</Badge>;
      default:
        return null;
    }
  };

  // Get time description for the scheduled event
  const getTimeDescription = (date: string) => {
    const scheduledTime = new Date(date);
    return formatDate(scheduledTime, { timeOnly: true });
  };

  const handleCardClick = (order: WorkOrder) => {
    if (onWorkOrderClick) {
      onWorkOrderClick(order);
    }
  };

  return (
    <div className="space-y-4">
      {!showAllAppointments && technician && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                technician.status === "available"
                  ? "bg-green-500"
                  : technician.status === "busy"
                  ? "bg-amber-500"
                  : "bg-gray-500"
              }`}
            />
            <h3 className="text-lg font-semibold">{technician.name}'s Schedule</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="h-4 w-4" />
            {formatDate(selectedDate)}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading schedule...</span>
        </div>
      ) : filteredWorkOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredWorkOrders.map((order) => (
            <Card 
              key={order.id} 
              className={`border ${
                order.status === "scheduled" ? "border-sky-200 bg-sky-50/30" : 
                order.status === "in-progress" ? "border-blue-200 bg-blue-50/30" :
                order.status === "completed" ? "border-green-200 bg-green-50/30" :
                order.status === "pending-completion" ? "border-amber-200 bg-amber-50/30" :
                order.status === "cancelled" ? "border-red-200 bg-red-50/30" :
                "border-border"
              } ${onWorkOrderClick ? 'cursor-pointer hover:border-primary hover:shadow-sm transition-all' : ''}`}
              onClick={() => handleCardClick(order)}
            >
              <CardHeader className="p-3 pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">
                      {getTimeDescription(order.scheduledDate)}
                    </CardTitle>
                  </div>
                  {getStatusBadge(order)}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <div className="space-y-1 text-sm">
                  <div className="font-medium">
                    #{order.id.substring(0, 8)} - {order.type}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <UserRound className="h-3.5 w-3.5" />
                    {order.customerName}
                  </div>
                  {order.technicianName && showAllAppointments && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UserRound className="h-3.5 w-3.5" />
                      Tech: {order.technicianName}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {order.address}
                  </div>
                  
                  {order.status === "pending-completion" && order.pendingReason && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="mt-1 flex items-start gap-1.5 text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
                            <AlertCircle className="h-3.5 w-3.5 mt-0.5" />
                            <span className="truncate">
                              Pending: {order.pendingReason.length > 40 ? 
                                `${order.pendingReason.substring(0, 40)}...` : 
                                order.pendingReason}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{order.pendingReason}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {order.status === "completed" && (
                    <div className="mt-1 flex items-start gap-1.5 text-xs text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Completed: {order.completedDate ? formatDate(new Date(order.completedDate)) : "N/A"}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
          <Calendar className="mx-auto h-8 w-8 opacity-50" />
          <p className="mt-2 text-sm">No appointments scheduled for this date</p>
          <p className="text-xs mt-1">Select another date or technician</p>
        </div>
      )}
    </div>
  );
};

export default TechnicianScheduleView;
