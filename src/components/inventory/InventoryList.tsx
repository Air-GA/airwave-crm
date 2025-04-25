
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight } from "lucide-react";
import { useCallback } from "react";

export const InventoryList = ({ onNavigateToPartsTab }: { onNavigateToPartsTab?: () => void }) => {
  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ["inventory-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const handleNavigateToParts = useCallback(() => {
    if (onNavigateToPartsTab) {
      onNavigateToPartsTab();
    }
  }, [onNavigateToPartsTab]);

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">Loading inventory...</p>
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No items in inventory yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Your inventory is empty. Go to the Parts Catalog tab to search and add parts from the Profit Rhino database.
        </p>
        <Button onClick={handleNavigateToParts}>
          Go to Parts Catalog <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Unit Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.sku}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell className="text-right">{item.quantity}</TableCell>
            <TableCell className="text-right">
              ${item.unit_price?.toFixed(2) || "N/A"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
