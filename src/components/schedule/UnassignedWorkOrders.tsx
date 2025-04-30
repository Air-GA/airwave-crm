
import React from "react";
import { WorkOrder } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDraggable } from "@dnd-kit/core";
import { formatDate } from "@/lib/date-utils";
import { AlertCircle, Calendar, MapPin } from "lucide-react";

interface UnassignedWorkOrdersProps {
  workOrders: WorkOrder[];
  isLoading: boolean;
}

const WorkOrderItem = ({ workOrder }: { workOrder: WorkOrder }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: workOrder.id,
    data: { workOrder },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
    zIndex: isDragging ? 100 : "auto",
  } : {};

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="mb-2 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow"
      {...attributes} 
      {...listeners}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-sm">{workOrder.description}</h3>
            <p className="text-xs text-muted-foreground">{workOrder.customerName}</p>
          </div>
          <Badge className={`${
            workOrder.priority === 'high' ? 'bg-red-500' : 
            workOrder.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
          }`}>
            {workOrder.priority}
          </Badge>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground grid grid-cols-2 gap-1">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{workOrder.scheduledDate ? formatDate(new Date(workOrder.scheduledDate)) : "Unscheduled"}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate">{workOrder.address}</span>
          </div>
          <div className="flex items-center col-span-2">
            <AlertCircle className="h-3 w-3 mr-1" />
            <span>{workOrder.type}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const UnassignedWorkOrders: React.FC<UnassignedWorkOrdersProps> = ({ workOrders, isLoading }) => {
  if (isLoading) {
    return <div className="p-4">Loading unassigned work orders...</div>;
  }

  if (workOrders.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No unassigned work orders
      </div>
    );
  }

  return (
    <div className="p-1">
      {workOrders.map((workOrder) => (
        <WorkOrderItem key={workOrder.id} workOrder={workOrder} />
      ))}
    </div>
  );
};

export default UnassignedWorkOrders;
