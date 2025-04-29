import React from "react";
import { useWorkOrderStore } from "@/services/workOrderService";
import { useTechnicianStore } from "@/services/technicianService";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/date-utils";
import { WorkOrder, Technician } from "@/types";

interface TechnicianScheduleViewProps {
  technicianId?: string;
  date?: Date;
  onSelectWorkOrder?: (workOrder: WorkOrder) => void;
}

const TechnicianScheduleView = ({
  technicianId,
  date = new Date(),
  onSelectWorkOrder,
}: TechnicianScheduleViewProps) => {
  const workOrders = useWorkOrderStore((state) => state.workOrders);
  const technicians = useTechnicianStore((state) => state.technicians);
  
  // Filter work orders for the selected technician and date
  const technicianWorkOrders = React.useMemo(() => {
    if (!technicianId) return [];
    
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    return workOrders.filter((order) => {
      // Check if assigned to this technician
      if (order.technicianId !== technicianId) return false;
      
      // Check if scheduled for the selected date
      const orderDate = new Date(order.scheduledDate);
      orderDate.setHours(0, 0, 0, 0);
      
      return orderDate.getTime() === selectedDate.getTime();
    });
  }, [workOrders, technicianId, date]);
  
  // Get technician details
  const technician = React.useMemo(() => {
    if (!technicianId) return null;
    return technicians.find((tech) => tech.id === technicianId) || null;
  }, [technicians, technicianId]);
  
  // Sort work orders by scheduled time
  const sortedWorkOrders = React.useMemo(() => {
    return [...technicianWorkOrders].sort((a, b) => {
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    });
  }, [technicianWorkOrders]);
  
  if (!technicianId || !technician) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technician Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Select a technician to view their schedule
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{technician.name}'s Schedule</span>
          <Badge className={
            technician.status === 'available' ? 'bg-green-500' :
            technician.status === 'busy' ? 'bg-orange-500' : 'bg-gray-500'
          }>
            {technician.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{formatDate(date)}</span>
        </div>
        
        {sortedWorkOrders.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No work orders scheduled for this day
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {sortedWorkOrders.map((order) => (
                <div 
                  key={order.id}
                  className="p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onSelectWorkOrder && onSelectWorkOrder(order)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{order.customerName}</h4>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {order.address}
                      </div>
                    </div>
                    <Badge className={
                      order.priority === 'low' ? 'bg-blue-500' :
                      order.priority === 'medium' ? 'bg-yellow-500' :
                      order.priority === 'high' ? 'bg-orange-500' : 'bg-red-500'
                    }>
                      {order.priority}
                    </Badge>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                      {new Date(order.scheduledDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="capitalize">{order.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default TechnicianScheduleView;
