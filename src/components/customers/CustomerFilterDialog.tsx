
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CustomerFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomerFilterDialog = ({ open, onOpenChange }: CustomerFilterDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter Customers</DialogTitle>
          <DialogDescription>
            Apply filters to narrow down your customer list.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Customer Type</h4>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">Residential</Button>
              <Button variant="outline" size="sm" className="flex-1">Commercial</Button>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Status</h4>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">Active</Button>
              <Button variant="outline" size="sm" className="flex-1">Inactive</Button>
              <Button variant="outline" size="sm" className="flex-1">Pending</Button>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Reset
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
