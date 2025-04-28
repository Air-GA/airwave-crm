
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
import { format } from "date-fns";

export function TransferHistory() {
  const { data: transfers, isLoading } = useQuery({
    queryKey: ["inventory-transfers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_transfers")
        .select(`
          *,
          inventory_items (
            name
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading transfer history...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transfers?.map((transfer) => (
          <TableRow key={transfer.id}>
            <TableCell>
              {format(new Date(transfer.created_at), "MMM d, yyyy")}
            </TableCell>
            <TableCell>{transfer.inventory_items?.name}</TableCell>
            <TableCell className="capitalize">{transfer.from_location}</TableCell>
            <TableCell className="capitalize">{transfer.to_location}</TableCell>
            <TableCell>{transfer.quantity}</TableCell>
            <TableCell>{transfer.notes || "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
