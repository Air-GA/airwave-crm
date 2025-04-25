
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { ProfitRhinoSearch } from "@/components/inventory/ProfitRhinoSearch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Warehouse, Bell, Truck, MoveRight } from "lucide-react";

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("all-inventory");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">Manage parts and materials inventory</p>
          </div>
        </div>

        <Tabs defaultValue="all-inventory" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all-inventory">All Inventory</TabsTrigger>
            <TabsTrigger value="warehouse">
              <Warehouse className="mr-2 h-4 w-4" /> Warehouse
            </TabsTrigger>
            <TabsTrigger value="mobile-units">
              <Truck className="mr-2 h-4 w-4" /> Mobile Units
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Bell className="mr-2 h-4 w-4" /> Alerts
            </TabsTrigger>
            <TabsTrigger value="transfers">
              <MoveRight className="mr-2 h-4 w-4" /> Transfers
            </TabsTrigger>
            <TabsTrigger value="profit-rhino">
              <Package className="mr-2 h-4 w-4" /> Parts Catalog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profit-rhino" className="space-y-4">
            <Card className="p-6">
              <ProfitRhinoSearch />
            </Card>
          </TabsContent>

          <TabsContent value="all-inventory">
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                Select "Parts Catalog" to search and add items from the Profit Rhino database
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="warehouse">
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                Warehouse inventory will appear here after adding items
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="mobile-units">
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                Mobile unit inventory will appear here after adding items
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                Inventory alerts will appear here
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="transfers">
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                Transfer history will appear here
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Inventory;
