
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
import { Search, Plus, Check, AlertCircle, Info, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { profitRhinoService, ProfitRhinoPart } from "@/services/profitRhinoService";

export const ProfitRhinoSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["profit-rhino-parts", searchQuery],
    queryFn: async () => {
      try {
        console.log("Searching for parts with query:", searchQuery);
        // Use the service to fetch from API
        const response = await profitRhinoService.searchParts(searchQuery);
        
        if (!response.success) {
          throw new Error(response.error || "Failed to retrieve parts");
        }
        
        console.log("API search successful, found", response.data?.length || 0, "results");
        return {
          parts: response.data || [],
          message: response.message || ""
        };
      } catch (err) {
        console.error("Error in parts search:", err);
        throw err;
      }
    },
    enabled: Boolean(searchQuery.trim()), // Only run query when there's a non-empty search query
  });

  const handleAddToInventory = async (part: ProfitRhinoPart) => {
    try {
      const { error } = await supabase.from("inventory_items").insert({
        name: part.description || part.part_number,
        sku: part.part_number,
        category: part.category,
        unit_price: part.list_price,
        quantity: 1, // Default to 1 quantity
        description: `Manufacturer: ${part.manufacturer || 'N/A'}\nModel: ${part.model_number || 'N/A'}`,
      });

      if (error) {
        console.error("Error adding item to inventory:", error);
        toast({
          title: "Error adding part to inventory",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Mark item as added
      setAddedItems(prev => ({...prev, [part.id]: true}));
      
      // Invalidate the inventory items query to refresh the inventory list
      queryClient.invalidateQueries({queryKey: ["inventory-items"]});
      
      toast({
        title: "Part added to inventory",
        description: `${part.description || part.part_number} has been added to your inventory.`,
      });
    } catch (err) {
      console.error("Error in add to inventory function:", err);
      toast({
        title: "Error adding part",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Trigger a refetch by invalidating the query
      queryClient.invalidateQueries({queryKey: ["profit-rhino-parts", searchQuery]});
    } else {
      toast({
        title: "Search query required",
        description: "Please enter a search term",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
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
        <Button type="submit" variant="default" disabled={isLoading || !searchQuery.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>Search</>
          )}
        </Button>
      </form>

      {isError && (
        <div className="bg-destructive/10 p-4 rounded-md flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p>Error loading parts: {(error as Error)?.message || 'Unknown error'}</p>
        </div>
      )}

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
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-muted-foreground">Loading parts catalog...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : !searchQuery.trim() ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center">
                    <Info className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="font-medium">Enter a search term to find parts</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Search by part number, description, or manufacturer
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.parts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center">
                    <Info className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="font-medium">No parts found</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      {data?.message || "Try adjusting your search criteria"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.parts.map((part) => (
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
                      variant={addedItems[part.id] ? "outline" : "ghost"}
                      size="icon"
                      onClick={() => handleAddToInventory(part)}
                      disabled={addedItems[part.id]}
                    >
                      {addedItems[part.id] ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {addedItems[part.id] ? "Added to inventory" : "Add to inventory"}
                      </span>
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
