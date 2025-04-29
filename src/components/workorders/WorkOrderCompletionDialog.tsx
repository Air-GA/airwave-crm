
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { WorkOrder } from "@/types";
import { completeWorkOrder } from "@/services/dataService";
import { markOrderPendingCompletion } from "@/services/dataService";
import { toast } from "sonner";

interface WorkOrderCompletionDialogProps {
  workOrder: WorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const WorkOrderCompletionDialog = ({ 
  workOrder, 
  isOpen, 
  onClose, 
  onComplete 
}: WorkOrderCompletionDialogProps) => {
  const [completionStatus, setCompletionStatus] = useState<"completed" | "pending">("completed");
  const [notes, setNotes] = useState("");
  const [pendingReason, setPendingReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!workOrder) return;
    
    try {
      setIsSubmitting(true);
      
      if (completionStatus === "completed") {
        await completeWorkOrder(workOrder.id);
        toast.success("Work order marked as completed");
      } else {
        if (!pendingReason) {
          toast.error("Please provide a reason for pending completion");
          return;
        }
        await markOrderPendingCompletion(workOrder.id, pendingReason);
        toast.info("Work order marked as pending completion");
      }
      
      onComplete();
      onClose();
    } catch (error) {
      console.error("Error updating work order completion status:", error);
      toast.error("Failed to update work order status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCompletionStatus("completed");
    setNotes("");
    setPendingReason("");
  };

  // Reset the form when the dialog opens with a new work order
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Work Order</DialogTitle>
          <DialogDescription>
            {workOrder && (
              <span>
                #{workOrder.id} - {workOrder.type} for {workOrder.customerName} at {workOrder.address}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <RadioGroup 
            value={completionStatus} 
            onValueChange={(value) => setCompletionStatus(value as "completed" | "pending")}
            className="space-y-3"
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="completed" id="completed" />
              <div className="grid gap-1.5">
                <Label htmlFor="completed" className="font-medium">
                  Work order completed
                </Label>
                <p className="text-sm text-muted-foreground">
                  All tasks have been finished successfully
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <RadioGroupItem value="pending" id="pending" />
              <div className="grid gap-1.5">
                <Label htmlFor="pending" className="font-medium">
                  Work order pending completion
                </Label>
                <p className="text-sm text-muted-foreground">
                  Work cannot be completed at this time
                </p>
              </div>
            </div>
          </RadioGroup>

          {completionStatus === "completed" ? (
            <div className="space-y-2">
              <Label htmlFor="notes">Completion Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Enter any notes about the completed work..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="pendingReason">Reason for Pending Completion <span className="text-red-500">*</span></Label>
              <Textarea
                id="pendingReason"
                placeholder="Explain why the work cannot be completed at this time..."
                value={pendingReason}
                onChange={(e) => setPendingReason(e.target.value)}
                rows={3}
                required
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || (completionStatus === "pending" && !pendingReason)}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkOrderCompletionDialog;
