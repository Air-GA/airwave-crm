import { useState } from "react";
import { Download, Filter, FileText, Plus } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SyncWithQuickBooks } from "@/components/SyncWithQuickBooks";

export default function PurchaseOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSyncComplete = () => {
    // Refresh purchase orders data
    console.log("Refreshing purchase orders after sync");
  };

  return (
    <MainLayout pageName="Purchase Orders">
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                Manage purchase orders for inventory and equipment
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <SyncWithQuickBooks 
                entityType="purchaseOrders" 
                onSyncComplete={handleSyncComplete}
              />
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Purchase Order
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex justify-between">
              <div className="relative w-full max-w-sm">
                <Input
                  type="search"
                  placeholder="Search purchase orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
            
            {/* Placeholder for purchase orders list */}
            <div className="mt-6 rounded-md border p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No purchase orders</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first purchase order to get started.
              </p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                New Purchase Order
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Showing 0 purchase orders
            </p>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
