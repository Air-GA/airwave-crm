
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfitRhinoPart {
  id: string;
  part_number: string;
  description: string | null;
  category: string | null;
  manufacturer: string | null;
  model_number: string | null;
  list_price: number | null;
  cost: number | null;
}

export const ProfitRhinoSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: parts, isLoading } = useQuery({
    queryKey: ["profit-rhino-parts", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("profit_rhino_parts")
        .select("*");

      if (searchQuery) {
        query = query.or(
          `part_number.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,manufacturer.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      return data as ProfitRhinoPart[];
    },
    enabled: true,
  });

  const handleAddToInventory = async (part: ProfitRhinoPart) => {
    const { error } = await supabase.from("inventory_items").insert({
      name: part.description || part.part_number,
      sku: part.part_number,
      category: part.category,
      unit_price: part.list_price,
      description: `Manufacturer: ${part.manufacturer || 'N/A'}\nModel: ${part.model_number || 'N/A'}`,
    });

    if (error) {
      console.error("Error adding item to inventory:", error);
      return;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by part number, description, or manufacturer..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part Number</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Model</TableHead>
              <TableHead className="text-right">List Price</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : parts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No parts found
                </TableCell>
              </TableRow>
            ) : (
              parts?.map((part) => (
                <TableRow key={part.id}>
                  <TableCell className="font-medium">{part.part_number}</TableCell>
                  <TableCell>{part.description}</TableCell>
                  <TableCell>{part.manufacturer}</TableCell>
                  <TableCell>{part.model_number}</TableCell>
                  <TableCell className="text-right">
                    ${part.list_price?.toFixed(2) || "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAddToInventory(part)}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add to inventory</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
