import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { WorkOrder, Technician } from '@/types';
import { format, addMinutes } from 'date-fns';
import { CalendarCheck, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DispatchCalendarViewProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  selectedTechnicianId: string | null;
  activeOrderId?: string | null;
  onDateSelect?: (start: Date, end: Date, technicianId?: string) => void;
  onWorkOrderClick?: (workOrderId: string) => void;
  unassignedWorkOrders?: WorkOrder[];
}

const DispatchCalendarView = ({
  workOrders,
  technicians,
  selectedTechnicianId,
  activeOrderId,
  onDateSelect,
  onWorkOrderClick,
  unassignedWorkOrders
}: DispatchCalendarViewProps) => {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };
  
  // Calculate calendar events for the selected date
  const events = React.useMemo(() => {
    const filtered = workOrders.filter(order => {
      // Check if the order date matches the selected date
      const orderDate = new Date(order.scheduledDate);
      const isMatchingDate = orderDate.toDateString() === selectedDate.toDateString();
      
      // If a technician is selected, filter orders for that technician
      if (selectedTechnicianId) {
        return isMatchingDate && order.technicianId === selectedTechnicianId;
      }
      
      // Otherwise, return all matching dates
      return isMatchingDate;
    });
    
    return filtered.sort((a, b) => {
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    });
  }, [workOrders, selectedDate, selectedTechnicianId]);
  
  // Function to find technician for color coding
  const getTechnicianColor = (technicianId: string) => {
    const colors = [
      'bg-red-100 text-red-800',
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-amber-100 text-amber-800',
      'bg-cyan-100 text-cyan-800',
      'bg-pink-100 text-pink-800',
      'bg-teal-100 text-teal-800'
    ];
    
    // Find the technician index for consistent coloring
    const techIndex = technicians.findIndex(t => t.id === technicianId);
    if (techIndex === -1) return '';
    
    return colors[techIndex % colors.length];
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-6">
      <div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="rounded-md border"
        />
      </div>
      
      <Card className="h-[500px]">
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <h3 className="font-medium text-lg">Schedule for {format(selectedDate, 'EEEE, MMMM d')}</h3>
            <p className="text-sm text-muted-foreground">
              {selectedTechnicianId 
                ? `${technicians.find(t => t.id === selectedTechnicianId)?.name}'s assignments` 
                : 'All assignments'}
            </p>
          </div>
          
          <ScrollArea className="h-[416px] p-4">
            {events.length > 0 ? (
              <div className="space-y-3">
                {events.map(event => {
                  const startTime = new Date(event.scheduledDate);
                  const endTime = addMinutes(startTime, (event.estimatedHours || 2) * 60);
                  
                  return (
                    <div 
                      key={event.id}
                      className={`p-3 rounded-md border cursor-pointer hover:bg-muted transition-colors
                        ${event.id === activeOrderId ? 'ring-2 ring-primary' : ''}
                      `}
                      onClick={() => onWorkOrderClick && onWorkOrderClick(event.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{event.type} - {event.customerName}</h4>
                        <Badge
                          variant="outline"
                          className={`
                            ${event.priority === 'low' ? 'bg-gray-100 text-gray-800' : ''}
                            ${event.priority === 'medium' ? 'bg-blue-100 text-blue-800' : ''}
                            ${event.priority === 'high' ? 'bg-orange-100 text-orange-800' : ''}
                            ${event.priority === 'emergency' ? 'bg-red-100 text-red-800' : ''}
                          `}
                        >
                          {event.priority}
                        </Badge>
                      </div>
                      
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}</span>
                        </div>
                        <div className="mt-1 flex items-start gap-1">
                          <span className="flex-shrink-0 mt-0.5">📍</span>
                          <span className="text-muted-foreground">{event.address}</span>
                        </div>
                      </div>
                      
                      {event.technicianName && (
                        <div className="mt-2">
                          <Badge variant="outline" className={getTechnicianColor(event.technicianId)}>
                            {event.technicianName}
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <CalendarCheck className="h-12 w-12 mb-2 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">No assignments for this day</h3>
                <p className="text-sm max-w-sm">
                  {selectedTechnicianId 
                    ? 'Try selecting a different technician or date'
                    : 'Select a different date or drag work orders to schedule them'}
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default DispatchCalendarView;
