
import React from 'react';
import { useDroppable } from "@dnd-kit/core";
import { Technician } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface TechnicianDropTargetProps {
  technician: Technician;
  isSelected: boolean;
  onClick: () => void;
  assignedCount: number;
}

const TechnicianDropTarget = ({ 
  technician, 
  isSelected, 
  onClick,
  assignedCount
}: TechnicianDropTargetProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: technician.id,
  });
  
  return (
    <Card 
      ref={setNodeRef}
      className={`
        transition-colors cursor-pointer
        ${isSelected ? 'ring-2 ring-primary/50' : ''}
        ${isOver ? 'ring-2 ring-primary' : ''}
      `}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div 
            className={`
              h-10 w-10 rounded-full flex items-center justify-center text-white
              ${technician.status === 'available' ? 'bg-green-500' : ''}
              ${technician.status === 'busy' ? 'bg-amber-500' : ''}
              ${technician.status === 'off-duty' ? 'bg-gray-500' : ''}
            `}
          >
            <User className="h-5 w-5" />
          </div>
          
          <div>
            <h3 className="font-medium">{technician.name}</h3>
            <div className="flex mt-1 gap-2">
              <Badge
                variant="outline"
                className={`text-xs
                  ${technician.status === 'available' ? 'bg-green-50 text-green-700' : ''}
                  ${technician.status === 'busy' ? 'bg-amber-50 text-amber-700' : ''}
                  ${technician.status === 'off-duty' ? 'bg-gray-50 text-gray-700' : ''}
                `}
              >
                {technician.status}
              </Badge>
              
              <Badge variant="outline" className="text-xs">
                {assignedCount} orders
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicianDropTarget;
