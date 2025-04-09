import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { InventoryItemActions } from "@/components/inventory/InventoryItemActions";
import { AddInventoryItemDialog } from "@/components/inventory/AddInventoryItemDialog";

export default function Inventory() {
  const { user, userRole } = useAuth();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch inventory data from the database
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("*");

      if (error) {
        console.error("Error fetching inventory:", error);
        return;
      }

      setInventoryItems(data || []);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Filter inventory items based on search query and active tab
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "low" && item.quantity <= item.reorder_level) return matchesSearch;
    if (activeTab === item.category) return matchesSearch;
    
    return false;
  });

  // Handle inventory refresh after actions
  const handleInventoryUpdated = () => {
    fetchInventory();
  };

  // Handle export inventory to CSV
  const handleExportInventory = () => {
    // Implementation will be added later
    console.log("Export inventory functionality will be implemented later");
  };

  // Handle import inventory from CSV
  const handleImportInventory = () => {
    // Implementation will be added later
    console.log("Import inventory functionality will be implemented later");
  };

  // Check if user can add inventory items (admin or manager)
  const canAddInventory = userRole === 'admin' || userRole === 'manager';

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportInventory}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={handleImportInventory}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          {canAddInventory && <AddInventoryItemDialog />}
        </div>
      </div>

      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Inventory Items</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Items</TabsTrigger>
                <TabsTrigger value="low">Low Stock</TabsTrigger>
                <TabsTrigger value="parts">Parts</TabsTrigger>
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
                <TabsTrigger value="supplies">Supplies</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="m-0">
              <div className="border-t">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Location</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          Loading inventory items...
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          No inventory items found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.sku || "—"}</TableCell>
                          <TableCell className="text-right">
                            <span className={`font-medium ${
                              item.quantity <= item.reorder_level ? "text-red-500" : ""
                            }`}>
                              {item.quantity}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            ${parseFloat(item.price).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.location || "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            <InventoryItemActions 
                              item={item} 
                              onItemUpdated={handleInventoryUpdated} 
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
