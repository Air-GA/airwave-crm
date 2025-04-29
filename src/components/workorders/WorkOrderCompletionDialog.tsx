
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { markOrderPendingCompletion, updateWorkOrder } from "@/services/workOrderService";
import { WorkOrder } from "@/types";

interface WorkOrderCompletionDialogProps {
  workOrder: WorkOrder;
  open: boolean; 
  onClose: () => void;
  onComplete: () => void;
}

export function WorkOrderCompletionDialog({
  workOrder,
  open,
  onClose,
  onComplete,
}: WorkOrderCompletionDialogProps) {
  const [notes, setNotes] = useState("");
  const [hoursWorked, setHoursWorked] = useState("1");
  const [partsUsed, setPartsUsed] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Build completion details
      const completionDetails = {
        notes,
        hoursWorked: parseFloat(hoursWorked),
        partsUsed: partsUsed.split(",").map(part => part.trim()).filter(Boolean),
        completedBy: "Current User", // In a real app, this would come from auth context
        completedAt: new Date().toISOString()
      };

      // Update the work order with completion details
      await updateWorkOrder(workOrder.id, {
        status: "completed",
        completedDate: new Date().toISOString()
      });
      
      toast({
        title: "Work Order Completed",
        description: "The work order has been marked as completed.",
      });
      
      onComplete();
      onClose();
      
    } catch (error) {
      console.error("Error completing work order:", error);
      toast({
        title: "Error",
        description: "Failed to complete the work order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Work Order</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hours" className="text-right">
              Hours
            </Label>
            <Input
              id="hours"
              type="number"
              min="0"
              step="0.5"
              value={hoursWorked}
              onChange={(e) => setHoursWorked(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="parts" className="text-right">
              Parts Used
            </Label>
            <Input
              id="parts"
              placeholder="Part1, Part2, Part3..."
              value={partsUsed}
              onChange={(e) => setPartsUsed(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Describe the work completed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Complete Work Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
