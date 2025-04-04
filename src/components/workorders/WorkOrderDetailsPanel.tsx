
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, AlertCircle, CheckCircle2, Clock10, Medal } from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import { WorkOrder, ProgressStep } from "@/types";
import { useState } from "react";
import WorkOrderCompletionDialog from "./WorkOrderCompletionDialog";
import WorkOrderProgressTracker from "./WorkOrderProgressTracker";

interface WorkOrderDetailsPanelProps {
  workOrder: WorkOrder;
  onUnassign?: (orderId: string) => void;
  showCompletionOptions?: boolean;
  onStatusUpdate?: () => void;
  onProgressUpdate?: (progressSteps: ProgressStep[], currentStep: string, percentage: number) => void;
}

const WorkOrderDetailsPanel = ({ 
  workOrder, 
  onUnassign, 
  showCompletionOptions = false,
  onStatusUpdate,
  onProgressUpdate
}: WorkOrderDetailsPanelProps) => {
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  
  const getStatusBadge = () => {
    switch (workOrder.status) {
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Completed</Badge>;
      case "pending-completion":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">Pending Completion</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">In Progress</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="bg-sky-50 text-sky-700 hover:bg-sky-50">Scheduled</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">Pending</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Cancelled</Badge>;
      default:
        return null;
    }
  };
  
  const handleOpenCompletionDialog = () => {
    setIsCompletionDialogOpen(true);
  };
  
  const handleCompletionDialogClose = () => {
    setIsCompletionDialogOpen(false);
  };
  
  const handleWorkOrderStatusUpdate = () => {
    if (onStatusUpdate) {
      onStatusUpdate();
    }
  };

  const handleProgressUpdate = (progressSteps: ProgressStep[], currentStep: string, percentage: number) => {
    if (onProgressUpdate) {
      onProgressUpdate(progressSteps, currentStep, percentage);
    }
  };
  
  // Calculate service time if available from progress steps
  const calculateServiceTime = () => {
    if (!workOrder.progressSteps) return null;
    
    const arrivalStep = workOrder.progressSteps.find(step => step.id === "arrival");
    const completionStep = workOrder.progressSteps.find(step => step.id === "completion");
    
    if (!arrivalStep?.timestamp || !completionStep?.timestamp || 
        arrivalStep.status !== "completed" || completionStep.status !== "completed") {
      return null;
    }
    
    const startTime = new Date(arrivalStep.timestamp).getTime();
    const endTime = new Date(completionStep.timestamp).getTime();
    const diffMinutes = Math.round((endTime - startTime) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return `${hours}h ${mins}m`;
    }
  };
  
  const serviceTime = calculateServiceTime();
  
  return (
    <>
      <div className="rounded-md border p-4">
        <div className="flex items-center justify-between">
          <p className="font-medium">#{workOrder.id} - {workOrder.type}</p>
          {getStatusBadge()}
        </div>
        <div className="mt-2 space-y-1.5 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{workOrder.customerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{workOrder.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(new Date(workOrder.scheduledDate))}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(new Date(workOrder.scheduledDate), { timeOnly: true })}</span>
          </div>
          
          {serviceTime && (
            <div className="flex items-center gap-2">
              <Clock10 className="h-4 w-4 text-muted-foreground" />
              <span>Service time: {serviceTime}</span>
            </div>
          )}
          
          {workOrder.status === "pending-completion" && workOrder.pendingReason && (
            <div className="mt-1 flex items-start gap-1.5 text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>Pending: {workOrder.pendingReason}</span>
            </div>
          )}
          
          {workOrder.status === "completed" && (
            <div className="mt-1 flex items-start gap-1.5 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Completed: {workOrder.completedDate ? formatDate(new Date(workOrder.completedDate)) : "N/A"}</span>
            </div>
          )}
          
          {/* Show progress percentage if available */}
          {workOrder.progressPercentage !== undefined && (
            <div className="mt-1 flex items-center gap-1.5 text-sm">
              <progress 
                value={workOrder.progressPercentage} 
                max="100" 
                className="w-full h-2 rounded-full"
              />
              <span className="text-xs">{workOrder.progressPercentage}%</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 justify-end">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowProgressTracker(!showProgressTracker)}
          >
            {showProgressTracker ? "Hide Progress" : "Show Progress"}
          </Button>
          
          {onUnassign && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onUnassign(workOrder.id)}
            >
              Unassign
            </Button>
          )}
          
          {showCompletionOptions && workOrder.status !== "completed" && (
            <Button 
              size="sm" 
              onClick={handleOpenCompletionDialog}
              variant={workOrder.status === "pending-completion" ? "outline" : "default"}
            >
              {workOrder.status === "pending-completion" ? "Update Status" : "Complete Work Order"}
            </Button>
          )}
        </div>
      </div>
      
      {showProgressTracker && (
        <div className="mt-4">
          <WorkOrderProgressTracker 
            workOrder={workOrder} 
            onProgressUpdate={handleProgressUpdate}
          />
        </div>
      )}
      
      <WorkOrderCompletionDialog
        workOrder={workOrder}
        isOpen={isCompletionDialogOpen}
        onClose={handleCompletionDialogClose}
        onComplete={handleWorkOrderStatusUpdate}
      />
    </>
  );
};

export default WorkOrderDetailsPanel;
