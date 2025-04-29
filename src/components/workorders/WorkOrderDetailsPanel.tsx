import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User, Phone, Mail, Clock, CheckCircle } from "lucide-react";
import { WorkOrder, Technician } from "@/types";
import { formatDate } from "@/lib/date-utils";
import { WorkOrderProgressTracker } from "@/components/workorders/WorkOrderProgressTracker";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WorkOrderCompletionDialog } from "@/components/workorders/WorkOrderCompletionDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Updated props interface to include optional showAssignOption
export interface WorkOrderDetailsPanelProps {
  workOrder: WorkOrder;
  onClose?: () => void;
  showAssignOption?: boolean; // Make this optional
  technicians?: Technician[];
  onAssign?: (workOrderId: string, technicianId: string) => Promise<void>;
  onUnassign?: (workOrderId: string) => Promise<void>;
}

export function WorkOrderDetailsPanel({
  workOrder,
  onClose = () => {},
  showAssignOption = false, // Default to false
  technicians = [],
  onAssign,
  onUnassign,
}: WorkOrderDetailsPanelProps) {
  const [open, setOpen] = useState(true);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  
  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300); // Allow animation to complete
  };

  const handleComplete = () => {
    setShowCompletionDialog(true);
  };

  const handleTechnicianAssign = async (technicianId: string) => {
    if (onAssign && technicianId) {
      await onAssign(workOrder.id, technicianId);
    }
  };

  const handleTechnicianUnassign = async () => {
    if (onUnassign) {
      await onUnassign(workOrder.id);
    }
  };

  const getPriorityBadge = (priority: WorkOrder["priority"]) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline">Low</Badge>;
      case "medium":
        return <Badge>Medium</Badge>;
      case "high":
        return <Badge className="bg-orange-500">High</Badge>;
      case "emergency":
        return <Badge variant="destructive">Emergency</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: WorkOrder["status"]) => {
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
      case "pending-completion":
        return <Badge className="bg-amber-500">Pending Completion</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(newOpen) => !newOpen && handleClose()}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Work Order Details</SheetTitle>
            <SheetDescription>
              {workOrder.type} - {formatDate(workOrder.scheduledDate)}
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{workOrder.customerName}</h3>
                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {workOrder.address}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getPriorityBadge(workOrder.priority)}
                {getStatusBadge(workOrder.status)}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm">{workOrder.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Scheduled Date</h4>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {formatDate(workOrder.scheduledDate)}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Estimated Hours</h4>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  {workOrder.estimatedHours || "Not specified"}
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Technician</h4>
              {showAssignOption ? (
                <div className="flex items-center space-x-2">
                  <Select 
                    onValueChange={handleTechnicianAssign}
                    value={workOrder.technicianId || ''}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Assign technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {workOrder.technicianId && onUnassign && (
                    <Button variant="ghost" size="sm" onClick={handleTechnicianUnassign}>
                      Remove
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  {workOrder.technicianName || "Not assigned"}
                </div>
              )}
            </div>
            
            {(workOrder.email || workOrder.phoneNumber) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  {workOrder.phoneNumber && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      {workOrder.phoneNumber}
                    </div>
                  )}
                  {workOrder.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      {workOrder.email}
                    </div>
                  )}
                </div>
              </>
            )}
            
            <Separator />
            
            <WorkOrderProgressTracker workOrder={workOrder} />
            
            <div className="flex justify-end space-x-2 pt-4">
              {workOrder.status !== "completed" && workOrder.status !== "cancelled" && (
                <Button onClick={handleComplete}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </Button>
              )}
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      <WorkOrderCompletionDialog
        workOrder={workOrder}
        open={showCompletionDialog}
        onClose={() => setShowCompletionDialog(false)}
        onComplete={() => {
          setShowCompletionDialog(false);
          handleClose();
        }}
      />
    </>
  );
}
