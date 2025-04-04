
import React, { useState } from "react";
import { 
  Button, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WorkOrder } from "@/types";
import { updateWorkOrder } from "@/services/workOrderService";

interface WorkOrderDetailsPanelProps {
  workOrder: WorkOrder;
  onUnassign?: (id: string) => Promise<void>;
  onStatusUpdate?: () => void;
  showCompletionOptions?: boolean;
}

const WorkOrderDetailsPanel: React.FC<WorkOrderDetailsPanelProps> = ({
  workOrder,
  onUnassign,
  onStatusUpdate,
  showCompletionOptions = false
}) => {
  const [completionNotes, setCompletionNotes] = useState("");
  const [pendingReason, setPendingReason] = useState("");

  const handleStatusChange = async (newStatus: WorkOrder['status']) => {
    try {
      await updateWorkOrder(workOrder.id, { status: newStatus });
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error("Error updating work order status:", error);
    }
  };

  const handleUnassign = async () => {
    if (onUnassign) {
      await onUnassign(workOrder.id);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Work Order Details</h3>
        <p className="text-sm text-muted-foreground">
          Manage work order details and status.
        </p>
      </div>

      <div>
        <p><strong>Customer:</strong> {workOrder.customerName}</p>
        <p><strong>Address:</strong> {workOrder.address}</p>
        <p><strong>Type:</strong> {workOrder.type}</p>
        <p><strong>Priority:</strong> {workOrder.priority}</p>
        <p><strong>Scheduled Date:</strong> {workOrder.scheduledDate}</p>
        <p><strong>Status:</strong> {workOrder.status}</p>
      </div>

      {showCompletionOptions && (
        <>
          <div>
            <label htmlFor="completionNotes" className="block text-sm font-medium text-gray-700">
              Completion Notes
            </label>
            <div className="mt-1">
              <Textarea
                id="completionNotes"
                rows={3}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Add completion notes..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="pendingReason" className="block text-sm font-medium text-gray-700">
              Pending Reason
            </label>
            <div className="mt-1">
              <Textarea
                id="pendingReason"
                rows={3}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Reason for pending completion..."
                value={pendingReason}
                onChange={(e) => setPendingReason(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleStatusChange('cancelled')}>
              Cancel Work Order
            </Button>
            {workOrder.technicianId && (
              <Button variant="destructive" onClick={handleUnassign}>
                Unassign Technician
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WorkOrderDetailsPanel;
