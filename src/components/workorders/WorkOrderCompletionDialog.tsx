import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WorkOrder } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { updateWorkOrder } from "@/services/workOrderService";
import {
  markOrderPendingCompletion,
} from "@/services/workOrderUtils";

const formSchema = z.object({
  notes: z.string().optional(),
  partsUsed: z.string().optional(),
  laborHours: z.string().refine(value => {
    const numValue = Number(value);
    return !isNaN(numValue) && numValue >= 0;
  }, {
    message: "Labor hours must be a non-negative number",
  }).optional(),
});

interface WorkOrderCompletionDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  workOrder: WorkOrder | null;
  onCompletion: () => void;
}

const WorkOrderCompletionDialog = ({
  open,
  setOpen,
  workOrder,
  onCompletion,
}: WorkOrderCompletionDialogProps) => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
      partsUsed: "",
      laborHours: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!workOrder) return;
    
    try {
      // Mark order as pending completion first
      await markOrderPendingCompletion(workOrder.id);
      
      // Continue with the rest of the processing
      const completionDetails = {
        notes: data.notes,
        partsUsed: data.partsUsed,
        laborHours: data.laborHours ? parseFloat(data.laborHours) : 0,
        completedAt: new Date().toISOString(),
      };
      
      // Update the work order with completion details
      await updateWorkOrder(workOrder.id, {
        status: "pending-completion",
        completionDetails: completionDetails,
      });
      
      toast({
        title: "Work Order Updated",
        description: "Work order marked as pending completion.",
      });
      
      onCompletion();
      setOpen(false);
    } catch (error) {
      console.error("Failed to update work order:", error);
      toast({
        title: "Error",
        description: "Failed to update work order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Work Order</DialogTitle>
          <DialogDescription>
            Enter completion details for work order.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completion Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any notes about the completion of this work order."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="partsUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parts Used</FormLabel>
                  <FormControl>
                    <Input placeholder="List of parts used" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="laborHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Labor Hours</FormLabel>
                  <FormControl>
                    <Input placeholder="Number of labor hours" type="number" step="0.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Completion</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkOrderCompletionDialog;
