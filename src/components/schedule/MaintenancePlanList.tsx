
// Update the import to use the correct import path
import { useWorkOrderStore } from "@/services/workOrderService";

// Let's create the MaintenancePlanList component with default export
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarPlus } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";

interface MaintenancePlanListProps {
  onDragStart?: (item: any) => void;
  onSchedule?: (item: any) => void;
}

const MaintenancePlanList = ({ onDragStart, onSchedule }: MaintenancePlanListProps) => {
  const workOrders = useWorkOrderStore((state) => state.workOrders);
  
  // Find all maintenance plans that haven't been scheduled yet
  const maintenancePlans = useMemo(() => {
    return workOrders.filter(order => 
      order.isMaintenancePlan && !order.scheduledDate
    );
  }, [workOrders]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Plans</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {maintenancePlans.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground">No maintenance plans to schedule</p>
            </div>
          ) : (
            maintenancePlans.map((plan) => (
              <MaintenancePlanItem 
                key={plan.id} 
                plan={plan}
                onDragStart={onDragStart}
                onSchedule={onSchedule}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const MaintenancePlanItem = ({ plan, onDragStart, onSchedule }: { 
  plan: any, 
  onDragStart?: (item: any) => void,
  onSchedule?: (item: any) => void
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `maintenance-plan-${plan.id}`,
    data: plan,
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 1000 : 1,
  } : undefined;
  
  const handleDragStart = () => {
    if (onDragStart) {
      onDragStart(plan);
    }
  };
  
  const handleScheduleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onSchedule) {
      onSchedule(plan);
    }
  };
  
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="cursor-grab p-3 transition-colors hover:bg-muted relative"
      onDragStart={handleDragStart}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{plan.customerName}</p>
          <p className="text-sm text-muted-foreground">{plan.address}</p>
          {plan.preferredTime && (
            <p className="text-xs text-muted-foreground mt-1">
              Preferred: {plan.preferredTime}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={handleScheduleClick}>
          <CalendarPlus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MaintenancePlanList;
