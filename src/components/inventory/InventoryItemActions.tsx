
import React from "react";
import { MoreHorizontal, Edit, Plus, ArrowRightLeft, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

interface InventoryItemActionsProps {
  item: {
    id: string;
    name: string;
    quantity: number;
  };
  onItemUpdated: () => void;
}

export function InventoryItemActions({ item, onItemUpdated }: InventoryItemActionsProps) {
  const { user, hasPermission } = useAuth();
  const [openAddStock, setOpenAddStock] = React.useState(false);
  const [openTransfer, setOpenTransfer] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [quantity, setQuantity] = React.useState(0);
  const [transferLocation, setTransferLocation] = React.useState("");

  const canEdit = hasPermission?.("inventory.edit") || true;
  const canDelete = hasPermission?.("inventory.delete") || true;

  const handleAddStock = async () => {
    try {
      const { error } = await supabase
        .from("inventory")
        .update({ quantity: item.quantity + quantity })
        .eq("id", item.id);

      if (error) {
        toast.error("Failed to add stock: " + error.message);
        return;
      }

      toast.success(`Added ${quantity} units to ${item.name}`);
      setOpenAddStock(false);
      onItemUpdated();
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error adding stock:", error);
    }
  };

  const handleTransfer = async () => {
    toast.success(`Transferred item to ${transferLocation}`);
    setOpenTransfer(false);
    onItemUpdated();
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("inventory")
        .delete()
        .eq("id", item.id);

      if (error) {
        toast.error("Failed to delete item: " + error.message);
        return;
      }

      toast.success(`Deleted ${item.name}`);
      setOpenDelete(false);
      onItemUpdated();
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error deleting item:", error);
    }
  };

  const handleViewHistory = () => {
    toast.info("Viewing history is not implemented yet");
  };

  const handleEdit = () => {
    setOpenEdit(true);
    toast.info("Edit functionality will be implemented soon");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canEdit && (
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setOpenAddStock(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenTransfer(true)}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Transfer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewHistory}>
            <History className="mr-2 h-4 w-4" />
            View History
          </DropdownMenuItem>
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => setOpenDelete(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Stock Dialog */}
      <Dialog open={openAddStock} onOpenChange={setOpenAddStock}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity to Add</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAddStock(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStock}>Add Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={openTransfer} onOpenChange={setOpenTransfer}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Transfer Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="location">Destination Location</Label>
              <Input
                id="location"
                value={transferLocation}
                onChange={(e) => setTransferLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer-quantity">Quantity</Label>
              <Input
                id="transfer-quantity"
                type="number"
                min="1"
                max={item.quantity}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenTransfer(false)}>
              Cancel
            </Button>
            <Button onClick={handleTransfer}>Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete <strong>{item.name}</strong>? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
