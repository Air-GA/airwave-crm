
import React from 'react';
import { useDraggable } from "@dnd-kit/core";
import { WorkOrder } from "@/types";
import { Badge } from "@/components/ui/badge";

interface DraggableWorkOrderProps {
  order: WorkOrder;
  isActive: boolean;
  compact?: boolean;
}

const DraggableWorkOrder = ({ order, isActive, compact }: DraggableWorkOrderProps) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: order.id,
  });
  
  if (compact) {
    return (
      <div 
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`rounded-md border p-2 bg-card hover:border-primary ${isActive ? 'opacity-50' : ''} cursor-grab active:cursor-grabbing text-xs`}
        style={{ touchAction: 'none' }}
      >
        <div className="flex items-center justify-between">
          <p className="font-medium truncate">{order.id} - {order.type}</p>
          <Badge
            variant="outline"
            className={`ml-1 text-[10px] px-1
              ${order.priority === 'low' ? 'bg-gray-50 text-gray-700' : ''}
              ${order.priority === 'medium' ? 'bg-blue-50 text-blue-700' : ''}
              ${order.priority === 'high' ? 'bg-amber-50 text-amber-700' : ''}
              ${order.priority === 'emergency' ? 'bg-red-50 text-red-700' : ''}
            `}
          >
            {order.priority}
          </Badge>
        </div>
        <div className="mt-1 text-muted-foreground truncate">{order.customerName}</div>
      </div>
    );
  }
  
  return (
    <div 
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`rounded-md border p-3 bg-card hover:border-primary ${isActive ? 'opacity-50' : ''} cursor-grab active:cursor-grabbing`}
      style={{ touchAction: 'none' }}
    >
      <div className="flex items-center justify-between">
        <p className="font-medium">#{order.id} - {order.type}</p>
        <Badge
          variant="outline"
          className={`
            ${order.priority === 'low' ? 'bg-gray-50 text-gray-700' : ''}
            ${order.priority === 'medium' ? 'bg-blue-50 text-blue-700' : ''}
            ${order.priority === 'high' ? 'bg-amber-50 text-amber-700' : ''}
            ${order.priority === 'emergency' ? 'bg-red-50 text-red-700' : ''}
          `}
        >
          {order.priority}
        </Badge>
      </div>
      <div className="mt-2 space-y-1 text-sm">
        <div className="text-muted-foreground">{order.customerName}</div>
        <div className="text-muted-foreground">{order.address}</div>
      </div>
    </div>
  );
};

export default DraggableWorkOrder;
