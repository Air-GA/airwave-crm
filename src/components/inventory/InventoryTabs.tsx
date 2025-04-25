import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Warehouse, Bell, Truck, MoveRight, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProfitRhinoSearch } from "./ProfitRhinoSearch";
import { InventoryList } from "./InventoryList";

interface InventoryTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const InventoryTabs = ({ activeTab, onTabChange }: InventoryTabsProps) => {
  return (
    <Tabs defaultValue="all-inventory" value={activeTab} onValueChange={onTabChange}>
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
          <InventoryList />
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
  );
};
