
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TransferForm } from "./TransferForm";
import { TransferHistory } from "./TransferHistory";

export function TransfersTab() {
  const [key, setKey] = useState(0);
  
  const { data: items } = useQuery({
    queryKey: ["inventory-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("id, name, quantity, location")
        .order("name");
      
      if (error) throw error;
      return data;
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
