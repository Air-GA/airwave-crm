
import React, { useState } from "react";
import { Technician, WorkOrder } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DndContext, 
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor, 
  useSensors,
  PointerSensor
} from "@dnd-kit/core";
import { format } from "date-fns";
import { addDays } from "date-fns";
import UnassignedWorkOrders from "./UnassignedWorkOrders";
import TechnicianScheduleColumn from "./TechnicianScheduleColumn";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MoveHorizontal } from "lucide-react";

interface DragAndDropSchedulerProps {
  technicians: Technician[];
  workOrders: WorkOrder[];
  selectedDate: Date;
  isLoading: boolean;
  onWorkOrderUpdated: () => void;
}

const DragAndDropScheduler: React.FC<DragAndDropSchedulerProps> = ({
  technicians,
  workOrders,
  selectedDate,
  isLoading,
  onWorkOrderUpdated
}) => {
  const [activeWorkOrder, setActiveWorkOrder] = useState<WorkOrder | null>(null);

  // Set up drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Split work orders into unassigned and assigned for current date range
  const unassignedWorkOrders = workOrders.filter(
    (wo) => !wo.technicianId && wo.status !== "completed" && wo.status !== "cancelled"
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveWorkOrder(active.data.current?.workOrder || null);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Reset active drag item
    setActiveWorkOrder(null);
    
    if (!over) return;

    const workOrderId = active.id as string;
    const dropTarget = over.data.current;

    if (!dropTarget || !workOrderId) return;

    // Extract info from drop target
    const { technicianId, technicianName, date } = dropTarget;
    
    try {
      // Record the original work order for reference
      const workOrder = workOrders.find(wo => wo.id === workOrderId);
      if (!workOrder) return;

      // Parse the date string
      const scheduledDate = new Date(date);
      
      // Update the work order in Supabase
      const { error } = await supabase
        .from('work_orders')
        .update({
          technician_id: technicianId,
          scheduled_date: format(scheduledDate, 'yyyy-MM-dd'),
          status_id: workOrder.status === 'pending' ? 
            // Find the ID for "scheduled" status if we can
            '40e6215d-b5c6-4896-987c-f30f3678f608' : // This is a placeholder UUID, replace with actual ID
            undefined
        })
        .eq('id', workOrderId);
      
      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Work Order Scheduled",
        description: `Assigned to ${technicianName} on ${format(scheduledDate, 'MMM d, yyyy')}`,
      });

      // Refresh data
      onWorkOrderUpdated();
    } catch (error) {
      console.error("Failed to update work order:", error);
      toast({
        title: "Error",
        description: "Failed to schedule work order. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Generate dates for the schedule
  const dates = [0, 1, 2, 3, 4].map(offset => addDays(selectedDate, offset));

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 h-full">
        <Card className="h-[calc(100vh-220px)] overflow-hidden flex flex-col">
          <CardHeader className="py-3">
            <CardTitle className="flex items-center text-sm font-medium">
              <MoveHorizontal className="h-4 w-4 mr-2" />
              Unassigned Work Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-2">
            <UnassignedWorkOrders 
              workOrders={unassignedWorkOrders} 
              isLoading={isLoading} 
            />
          </CardContent>
        </Card>

        <div className="h-[calc(100vh-220px)] overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 mb-3 overflow-x-auto pb-2">
            {dates.map((date) => (
              <div key={date.toString()} className="text-center min-w-[120px]">
                <div className="text-xs font-semibold">
                  {format(date, 'EEEE')}
                </div>
                <div className="text-sm">
                  {format(date, 'MMM d')}
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-auto">
            <div className="grid gap-4" style={{ minHeight: "100%" }}>
              {technicians.map((technician) => (
                <div key={technician.id} className="grid grid-cols-5 gap-3">
                  {dates.map((date) => {
                    // Filter work orders for this technician and date
                    const techWorkOrders = workOrders.filter(wo => 
                      wo.technicianId === technician.id && 
                      wo.scheduledDate && 
                      format(new Date(wo.scheduledDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                    );

                    return (
                      <TechnicianScheduleColumn
                        key={`${technician.id}-${format(date, 'yyyy-MM-dd')}`}
                        technician={technician}
                        date={date}
                        workOrders={techWorkOrders}
                        isLoading={isLoading}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeWorkOrder && (
            <Card className="w-[250px] p-3 shadow-lg">
              <div className="font-medium">{activeWorkOrder.description}</div>
              <div className="text-sm text-muted-foreground">{activeWorkOrder.customerName}</div>
            </Card>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default DragAndDropScheduler;
