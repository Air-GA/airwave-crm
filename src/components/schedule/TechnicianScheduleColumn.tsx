
import React from "react";
import { Technician, WorkOrder } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDroppable } from "@dnd-kit/core";
import { formatDate } from "@/lib/date-utils";
import { Calendar } from "lucide-react";

interface ScheduledWorkOrderProps {
  workOrder: WorkOrder;
}

const ScheduledWorkOrder: React.FC<ScheduledWorkOrderProps> = ({ workOrder }) => {
  return (
    <Card className="mb-2 p-2 bg-white border-l-4 border-l-green-500">
      <div className="text-sm font-medium">{workOrder.description}</div>
      <div className="text-xs text-muted-foreground">{workOrder.customerName}</div>
      <div className="text-xs mt-1 flex items-center">
        <Calendar className="h-3 w-3 mr-1" />
        {workOrder.scheduledDate || "No time set"}
      </div>
    </Card>
  );
};

interface TechnicianScheduleColumnProps {
  technician: Technician;
  date: Date;
  workOrders: WorkOrder[];
  isLoading: boolean;
}

const TechnicianScheduleColumn: React.FC<TechnicianScheduleColumnProps> = ({ 
  technician, 
  date, 
  workOrders,
  isLoading
}) => {
  const formattedDate = formatDate(date);
  const { setNodeRef, isOver } = useDroppable({
    id: `${technician.id}-${formattedDate}`,
    data: { 
      technicianId: technician.id, 
      technicianName: technician.name,
      date: formattedDate
    },
  });

  const statusColor = technician.status === "available" 
    ? "bg-green-500" 
    : technician.status === "busy" 
    ? "bg-amber-500" 
    : "bg-gray-400";

  return (
    <Card className={`h-full ${isOver ? 'bg-blue-50' : ''}`}>
      <CardHeader className="py-3 px-3">
        <CardTitle className="text-sm flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${statusColor}`}></div>
          {technician.name}
        </CardTitle>
      </CardHeader>
      <CardContent 
        ref={setNodeRef} 
        className="pt-0 px-2 pb-2 min-h-[200px]"
      >
        {isLoading ? (
          <div className="text-xs text-center text-muted-foreground">Loading...</div>
        ) : workOrders.length === 0 ? (
          <div className="text-xs text-center text-muted-foreground p-4 border border-dashed rounded-md">
            Drop work orders here
          </div>
        ) : (
          workOrders.map(workOrder => (
            <ScheduledWorkOrder key={workOrder.id} workOrder={workOrder} />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default TechnicianScheduleColumn;
