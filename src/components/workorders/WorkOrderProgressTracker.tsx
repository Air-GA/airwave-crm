
import React from 'react';
import { WorkOrder } from '@/types';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface WorkOrderProgressTrackerProps {
  workOrder: WorkOrder;
}

export function WorkOrderProgressTracker({ workOrder }: WorkOrderProgressTrackerProps) {
  // Calculate progress based on status
  const getProgressPercentage = () => {
    switch (workOrder.status) {
      case 'pending':
        return 0;
      case 'scheduled':
        return 25;
      case 'in-progress':
        return 50;
      case 'pending-completion':
        return 75;
      case 'completed':
        return 100;
      case 'cancelled':
        return 100;
      default:
        return 0;
    }
  };

  const getStatusIcon = () => {
    switch (workOrder.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
      case 'pending-completion':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const progress = getProgressPercentage();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Progress</h4>
        <div className="flex items-center">
          {getStatusIcon()}
          <span className="ml-2 text-sm">{progress}% Complete</span>
        </div>
      </div>
      
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${
            workOrder.status === 'cancelled' 
              ? 'bg-red-500' 
              : workOrder.status === 'completed' 
                ? 'bg-green-500' 
                : 'bg-blue-500'
          }`} 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Created</span>
        <span>Scheduled</span>
        <span>In Progress</span>
        <span>Completed</span>
      </div>
    </div>
  );
}

export default WorkOrderProgressTracker;
