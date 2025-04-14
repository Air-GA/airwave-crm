
import React, { useState } from 'react';
import { Calendar, Views, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { Card, CardContent } from '@/components/ui/card';
import { WorkOrder, Technician } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useDroppable } from '@dnd-kit/core';

// Set up the localizer
const localizer = momentLocalizer(moment);

interface DispatchCalendarViewProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  selectedTechnicianId: string | null;
  activeOrderId?: string | null;
  unassignedWorkOrders?: WorkOrder[];
  onDateSelect: (start: Date, end: Date, technicianId?: string) => void;
  onWorkOrderClick: (workOrderId: string) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  workOrder: WorkOrder;
  technicianId: string | null;
  technicianName: string | null;
  statusClass: string;
  priorityClass: string;
}

const DispatchCalendarView = ({
  workOrders,
  technicians,
  selectedTechnicianId,
  activeOrderId,
  unassignedWorkOrders,
  onDateSelect,
  onWorkOrderClick,
}: DispatchCalendarViewProps) => {
  const [viewMode, setViewMode] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filter work orders based on selected technician
  const filteredWorkOrders = selectedTechnicianId
    ? workOrders.filter(order => order.technicianId === selectedTechnicianId)
    : workOrders.filter(order => order.status === 'scheduled' || order.status === 'in-progress');

  // Convert work orders to calendar events
  const calendarEvents: CalendarEvent[] = filteredWorkOrders.map(order => {
    const startTime = new Date(order.scheduledDate);
    
    // Default to 2 hours if estimated hours is not set
    const duration = order.estimatedHours ? order.estimatedHours : 2;
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
    
    // Determine status and priority classes for styling
    let statusClass = '';
    switch (order.status) {
      case 'scheduled': statusClass = 'bg-amber-100 border-amber-400'; break;
      case 'in-progress': statusClass = 'bg-blue-100 border-blue-400'; break;
      case 'completed': statusClass = 'bg-green-100 border-green-400'; break;
      case 'pending': statusClass = 'bg-gray-100 border-gray-400'; break;
      default: statusClass = 'bg-gray-100 border-gray-400';
    }
    
    let priorityClass = '';
    switch (order.priority) {
      case 'low': priorityClass = 'text-gray-700'; break;
      case 'medium': priorityClass = 'text-blue-700'; break;
      case 'high': priorityClass = 'text-amber-700'; break;
      case 'emergency': priorityClass = 'text-red-700'; break;
      default: priorityClass = 'text-gray-700';
    }
    
    return {
      id: order.id,
      title: `#${order.id} - ${order.type} - ${order.customerName}`,
      start: startTime,
      end: endTime,
      workOrder: order,
      technicianId: order.technicianId || null,
      technicianName: order.technicianName || null,
      statusClass,
      priorityClass,
    };
  });

  const { setNodeRef } = useDroppable({
    id: 'calendar-drop-area',
  });

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarEvent }) => (
    <div
      className={`${event.statusClass} p-1 border-l-4 rounded overflow-hidden text-xs cursor-pointer ${activeOrderId === event.id ? 'ring-2 ring-primary' : ''}`}
      onClick={() => onWorkOrderClick(event.id)}
    >
      <div className={`font-medium ${event.priorityClass}`}>{event.title}</div>
      <div className="text-xs mt-0.5 truncate">
        {event.technicianName && `Tech: ${event.technicianName}`}
      </div>
    </div>
  );

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (view: string) => {
    setViewMode(view);
  };

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {selectedTechnicianId 
              ? `Schedule for ${technicians.find(t => t.id === selectedTechnicianId)?.name || 'Technician'}`
              : 'All Scheduled Work Orders'}
          </h3>
          <div className="flex space-x-2">
            <Badge 
              variant="outline" 
              className="bg-amber-100 text-amber-700 hover:bg-amber-100"
            >
              Scheduled
            </Badge>
            <Badge 
              variant="outline" 
              className="bg-blue-100 text-blue-700 hover:bg-blue-100"
            >
              In Progress
            </Badge>
          </div>
        </div>
        
        <div ref={setNodeRef} className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            views={['day', 'week', 'month']}
            defaultView={Views.WEEK}
            date={currentDate}
            onNavigate={handleNavigate}
            onView={(view) => handleViewChange(view)}
            step={30}
            timeslots={2}
            selectable
            onSelectSlot={(slotInfo) => {
              onDateSelect(slotInfo.start, slotInfo.end, selectedTechnicianId || undefined);
            }}
            components={{
              event: EventComponent as any,
            }}
            eventPropGetter={(event) => ({
              className: `${(event as CalendarEvent).statusClass}`,
            })}
            formats={{
              timeGutterFormat: (date, culture, localizer) => 
                localizer.format(date, 'h:mm A', culture),
              dayFormat: (date, culture, localizer) =>
                localizer.format(date, 'ddd D', culture),
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DispatchCalendarView;
