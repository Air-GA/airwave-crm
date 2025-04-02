
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/date-utils";
import { Calendar, Clock, MapPin, UserRound } from "lucide-react";
import { Technician, WorkOrder } from "@/types";

interface TechnicianScheduleViewProps {
  technician: Technician;
  workOrders: WorkOrder[];
  selectedDate: Date;
}

const TechnicianScheduleView = ({
  technician,
  workOrders,
  selectedDate,
}: TechnicianScheduleViewProps) => {
  // Filter work orders for this technician on the selected date
  const technicianWorkOrders = workOrders.filter(order => {
    const orderDate = new Date(order.scheduledDate);
    return (
      order.technicianId === technician.id &&
      orderDate.getFullYear() === selectedDate.getFullYear() &&
      orderDate.getMonth() === selectedDate.getMonth() &&
      orderDate.getDate() === selectedDate.getDate()
    );
  });

  // Sort by scheduled time
  technicianWorkOrders.sort((a, b) => 
    new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );

  return (
    <div className="space-y-4">
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

      {technicianWorkOrders.length > 0 ? (
        <div className="space-y-3">
          {technicianWorkOrders.map((order) => (
            <Card key={order.id} className="border border-border">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm font-medium">
                  {formatDate(new Date(order.scheduledDate), { timeOnly: true })}
                </CardTitle>
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
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {order.address}
                  </div>
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
