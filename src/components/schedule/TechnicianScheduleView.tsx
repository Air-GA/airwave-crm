
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import { useWorkOrderStore } from "@/services/workOrderStore";

interface TechnicianScheduleViewProps {
  technician?: any;
  workOrders?: any[];
  selectedDate?: Date;
  onWorkOrderClick?: (workOrder: any) => void;
  isLoading?: boolean;
}

const TechnicianScheduleView: React.FC<TechnicianScheduleViewProps> = ({
  technician,
  selectedDate,
  onWorkOrderClick,
  isLoading = false
}) => {
  const allWorkOrders = useWorkOrderStore((state) => state.workOrders);
  
  // Filter work orders for the selected technician and date
  const filteredWorkOrders = React.useMemo(() => {
    if (!selectedDate) return [];
    
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    
    return allWorkOrders.filter(wo => {
      // Check if assigned to selected technician
      const techMatch = technician ? wo.technicianId === technician.id : true;
      
      // Check if scheduled on selected date
      const woDate = wo.scheduledDate?.split('T')[0];
      const dateMatch = woDate === selectedDateStr;
      
      return techMatch && dateMatch;
    });
  }, [allWorkOrders, technician, selectedDate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case "in-progress":
        return <Badge className="bg-purple-500">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-8 bg-muted/60 rounded animate-pulse" />
            <div className="h-20 bg-muted/60 rounded animate-pulse" />
            <div className="h-20 bg-muted/60 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredWorkOrders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No scheduled work orders</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {selectedDate 
                ? `No work orders scheduled for ${formatDate(selectedDate)}`
                : "Select a date to view scheduled work orders"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
          {selectedDate ? formatDate(selectedDate) : "Schedule"}
          {technician && (
            <span className="ml-2">
              - {technician.name}
            </span>
          )}
        </h3>
        
        <div className="space-y-3">
          {filteredWorkOrders.map((workOrder) => (
            <div
              key={workOrder.id}
              onClick={() => onWorkOrderClick && onWorkOrderClick(workOrder)}
              className="border rounded-md p-4 cursor-pointer hover:bg-accent transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{workOrder.customerName}</h4>
                  <p className="text-sm text-muted-foreground">{workOrder.address}</p>
                  <div className="flex items-center text-sm mt-1">
                    <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <span className="text-xs">
                      {workOrder.estimatedHours
                        ? `${workOrder.estimatedHours} hours`
                        : "No time estimate"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(workOrder.status)}
                  <span className="text-xs text-muted-foreground capitalize">
                    {workOrder.type}
                  </span>
                </div>
              </div>
              
              {workOrder.technicianName && (
                <div className="flex items-center mt-3 text-sm">
                  <User className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <span className="text-xs">{workOrder.technicianName}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicianScheduleView;
