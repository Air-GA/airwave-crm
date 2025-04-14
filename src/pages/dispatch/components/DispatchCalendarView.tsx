import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { WorkOrder, Technician } from '@/types';
import { format, addMinutes } from 'date-fns';
import { CalendarCheck, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: 'calendar-drop-area',
  });
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };
  
  // Calculate calendar events for the selected date
  const events = React.useMemo(() => {
    // Filter work orders to show all scheduled/in-progress orders for the selected date
    return workOrders.filter(order => {
      // Check if the order has a scheduled date
      if (!order.scheduledDate) return false;
      
      // Check if the order date matches the selected date
      const orderDate = new Date(order.scheduledDate);
      const isMatchingDate = orderDate.toDateString() === selectedDate.toDateString();
      
      // If a technician is selected, filter orders for that technician
      if (selectedTechnicianId) {
        return isMatchingDate && order.technicianId === selectedTechnicianId;
      }
      
      // Otherwise, return all matching dates for scheduled or in-progress orders
      return isMatchingDate && (order.status === 'scheduled' || order.status === 'in-progress');
    }).sort((a, b) => {
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
  
  // Handle dropping a work order on a time slot
  const handleTimeSlotClick = (hour: number) => {
    if (!onDateSelect) return;
    
    const startTime = new Date(selectedDate);
    startTime.setHours(hour, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(hour + 2, 0, 0, 0);
    
    onDateSelect(startTime, endTime, selectedTechnicianId || undefined);
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
        
        {unassignedWorkOrders && unassignedWorkOrders.length > 0 && (
          <div className="mt-6 border rounded-md p-4">
            <h3 className="font-medium mb-2">Unassigned Work Orders</h3>
            <div className="space-y-2">
              {unassignedWorkOrders.slice(0, 3).map(order => (
                <div 
                  key={order.id}
                  className="p-2 border rounded-md text-sm cursor-pointer hover:bg-muted"
                  onClick={() => onWorkOrderClick && onWorkOrderClick(order.id)}
                >
                  <div className="font-medium">{order.type}</div>
                  <div className="text-muted-foreground">{order.customerName}</div>
                </div>
              ))}
              {unassignedWorkOrders.length > 3 && (
                <div className="text-sm text-muted-foreground text-center">
                  +{unassignedWorkOrders.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <Card className="h-[600px]" ref={setDroppableRef}>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <h3 className="font-medium text-lg">Schedule for {format(selectedDate, 'EEEE, MMMM d')}</h3>
            <p className="text-sm text-muted-foreground">
              {selectedTechnicianId 
                ? `${technicians.find(t => t.id === selectedTechnicianId)?.name}'s assignments` 
                : 'All assignments'}
            </p>
          </div>
          
          <ScrollArea className="h-[516px] p-4">
            {/* Time slots for the day */}
            <div className="space-y-4">
              {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => {
                const timeText = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
                const hourEvents = events.filter(event => {
                  const eventTime = new Date(event.scheduledDate);
                  return eventTime.getHours() === hour;
                });
                
                return (
                  <div key={hour} className="relative">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-medium w-16">{timeText}</div>
                      <div className="h-px bg-gray-200 flex-grow"></div>
                    </div>
                    
                    <div 
                      className="ml-16 h-16 border-l border-gray-200 pl-2 cursor-pointer hover:bg-gray-50 relative" 
                      onClick={() => handleTimeSlotClick(hour)}
                    >
                      {hourEvents.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                          Click to schedule
                        </div>
                      )}
                      
                      {hourEvents.map(event => (
                        <div 
                          key={event.id}
                          className={`p-2 rounded-md border cursor-pointer hover:bg-muted transition-colors mb-1
                            ${event.id === activeOrderId ? 'ring-2 ring-primary' : ''}
                          `}
                          onClick={(e) => {
                            e.stopPropagation();
                            onWorkOrderClick && onWorkOrderClick(event.id);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{event.type} - {event.customerName}</h4>
                            <Badge
                              variant="outline"
                              className={`text-xs
                                ${event.priority === 'low' ? 'bg-gray-100 text-gray-800' : ''}
                                ${event.priority === 'medium' ? 'bg-blue-100 text-blue-800' : ''}
                                ${event.priority === 'high' ? 'bg-orange-100 text-orange-800' : ''}
                                ${event.priority === 'emergency' ? 'bg-red-100 text-red-800' : ''}
                              `}
                            >
                              {event.priority}
                            </Badge>
                          </div>
                          
                          <div className="text-xs flex items-center gap-1 mt-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {format(new Date(event.scheduledDate), 'h:mm a')} - 
                              {format(addMinutes(new Date(event.scheduledDate), (event.estimatedHours || 2) * 60), 'h:mm a')}
                            </span>
                          </div>
                          
                          {event.technicianName && (
                            <div className="mt-1">
                              <Badge variant="outline" className={getTechnicianColor(event.technicianId)}>
                                {event.technicianName}
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {events.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
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
