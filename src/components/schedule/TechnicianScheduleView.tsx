
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/date-utils";
import { Calendar, Clock, MapPin, UserRound, AlertCircle, CheckCircle2 } from "lucide-react";
import { Technician, WorkOrder } from "@/types";
import { Badge } from "@/components/ui/badge";

interface TechnicianScheduleViewProps {
  technician: Technician | null;
  workOrders: WorkOrder[];
  selectedDate: Date;
  showAllAppointments?: boolean;
}

const TechnicianScheduleView = ({
  technician,
  workOrders,
  selectedDate,
  showAllAppointments = false,
}: TechnicianScheduleViewProps) => {
  // Filter work orders for this technician on the selected date
  // If showAllAppointments is true, show all appointments for the date
  const filteredWorkOrders = workOrders.filter(order => {
    const orderDate = new Date(order.scheduledDate);
    return (
      (showAllAppointments || (!technician || order.technicianId === technician.id)) &&
      orderDate.getFullYear() === selectedDate.getFullYear() &&
      orderDate.getMonth() === selectedDate.getMonth() &&
      orderDate.getDate() === selectedDate.getDate()
    );
  });

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
          <div className="text-sm text-muted-foreground">
            {formatDate(selectedDate)}
          </div>
        </div>
      )}

      {filteredWorkOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredWorkOrders.map((order) => (
            <Card key={order.id} className="border border-border">
              <CardHeader className="p-3 pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {formatDate(new Date(order.scheduledDate), { timeOnly: true })}
                  </CardTitle>
                  {getStatusBadge(order)}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <div className="space-y-1 text-sm">
                  <div className="font-medium">
                    #{order.id} - {order.type}
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
                    <div className="mt-1 flex items-start gap-1.5 text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5" />
                      <span>Pending: {order.pendingReason}</span>
                    </div>
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
        </div>
      )}
    </div>
  );
};

export default TechnicianScheduleView;
