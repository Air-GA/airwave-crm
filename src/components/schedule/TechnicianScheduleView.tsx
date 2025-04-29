
import React from 'react';
import { Technician, WorkOrder, Customer } from '@/types';
import { useWorkOrderStore } from '@/services/workOrderStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate, formatTime } from '@/lib/date-utils';
import { ArrowRight, AlertCircle, CalendarClock, MapPin, PhoneCall } from 'lucide-react';

interface TechnicianScheduleViewProps {
  technician: Technician | null;
  selectedDate: Date;
  onWorkOrderClick: (workOrder: WorkOrder) => void;
  isLoading?: boolean;
  customerData?: Record<string, Customer>;
}

const TechnicianScheduleView: React.FC<TechnicianScheduleViewProps> = ({
  technician,
  selectedDate,
  onWorkOrderClick,
  isLoading = false,
  customerData = {}
}) => {
  const workOrders = useWorkOrderStore((state) => state.workOrders);
  
  if (isLoading) {
    return <div className="flex justify-center py-6">Loading schedule...</div>;
  }

  if (!technician) {
    return <div className="text-center py-6">Select a technician to view their schedule</div>;
  }

  // Filter work orders for the selected technician and date
  const selectedDateStr = formatDate(selectedDate, 'yyyy-MM-dd');
  const technicianWorkOrders = workOrders.filter((wo) => {
    const woDate = wo.scheduledDate ? formatDate(new Date(wo.scheduledDate), 'yyyy-MM-dd') : '';
    return wo.technicianId === technician.id && woDate === selectedDateStr;
  });

  if (technicianWorkOrders.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No work orders scheduled for this technician on {formatDate(selectedDate)}
      </div>
    );
  }

  // Sort work orders by time
  const sortedWorkOrders = [...technicianWorkOrders].sort((a, b) => {
    if (!a.scheduledDate) return 1;
    if (!b.scheduledDate) return -1;
    return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
  });

  return (
    <div className="space-y-4">
      {sortedWorkOrders.map((workOrder) => {
        // Get customer information if available
        const customer = customerData[workOrder.customerId];
        
        return (
          <Card 
            key={workOrder.id} 
            className="p-4 hover:shadow-md cursor-pointer"
            onClick={() => onWorkOrderClick(workOrder)}
          >
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{workOrder.description}</h3>
                  <div className="text-sm text-muted-foreground">
                    {customer ? customer.name : workOrder.customerName}
                  </div>
                </div>
                <Badge className={`${
                  workOrder.status === 'pending' ? 'bg-amber-600' : 
                  workOrder.status === 'in-progress' ? 'bg-blue-600' : 
                  workOrder.status === 'completed' ? 'bg-green-600' : 'bg-gray-600'
                }`}>
                  {workOrder.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {workOrder.scheduledDate ? formatTime(new Date(workOrder.scheduledDate)) : 'Not scheduled'}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="truncate">{customer ? customer.address : workOrder.address}</span>
                </div>
                
                {(customer?.phone || workOrder.phoneNumber) && (
                  <div className="flex items-center">
                    <PhoneCall className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{customer?.phone || workOrder.phoneNumber}</span>
                  </div>
                )}
                
                {workOrder.priority && (
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="capitalize">{workOrder.priority} priority</span>
                  </div>
                )}
              </div>
              
              <Button 
                variant="ghost" 
                className="w-full justify-between mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onWorkOrderClick(workOrder);
                }}
              >
                <span>View Details</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default TechnicianScheduleView;
