
import { useState } from "react";
import { Download, Filter, FileText, Plus, FileSpreadsheet, Printer } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PurchaseOrderDialog } from "@/components/purchases/PurchaseOrderDialog";
import { useToast } from "@/hooks/use-toast";

export default function PurchaseOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewPurchaseOrderDialog, setShowNewPurchaseOrderDialog] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your purchase orders are being exported to Excel."
    });
    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your purchase orders have been exported successfully."
      });
    }, 1500);
  };

  const handlePrint = () => {
    toast({
      title: "Print Preview",
      description: "Preparing purchase orders for printing."
    });
    // In a real application, this would trigger the browser print dialog
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handlePurchaseOrderCreated = () => {
    // Refresh the list of purchase orders
    // In a real application, you would fetch the updated list from the server
    toast({
      title: "Purchase Order Created",
      description: "The purchase order has been created successfully."
    });
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
            <div>
              <Button onClick={() => setShowNewPurchaseOrderDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Purchase Order
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-wrap gap-2 justify-between">
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export to Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>
            
            {/* Placeholder for purchase orders list */}
            <div className="mt-6 rounded-md border p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No purchase orders</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first purchase order to get started.
              </p>
              <Button className="mt-4" onClick={() => setShowNewPurchaseOrderDialog(true)}>
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
      
      <PurchaseOrderDialog 
        open={showNewPurchaseOrderDialog} 
        onOpenChange={setShowNewPurchaseOrderDialog}
        onPurchaseOrderCreated={handlePurchaseOrderCreated}
      />
    </MainLayout>
  );
}
