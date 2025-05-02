
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TransferForm } from "./TransferForm";
import { TransferHistory } from "./TransferHistory";

// Define the inventory item type for better type safety
interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  location: string;
}

export function TransfersTab() {
  const [key, setKey] = useState(0);
  
  const { data: items } = useQuery({
    queryKey: ["inventory-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_parts")
        .select("id, name, quantity, location")
        .order("name");
      
      if (error) throw error;
      
      // Explicitly cast the data to ensure it matches our expected type
      return (data || []) as InventoryItem[];
    },
  });

  const handleTransferComplete = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Transfer Items</h3>
        <TransferForm items={items || []} onTransferComplete={handleTransferComplete} />
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Transfer History</h3>
        <TransferHistory key={key} />
      </Card>
    </div>
  );
}
