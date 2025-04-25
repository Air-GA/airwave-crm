
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("all-inventory");

  return (
    <MainLayout>
      <div className="space-y-6">
        <InventoryHeader 
          title="Inventory" 
          description="Manage parts and materials inventory" 
        />
        <InventoryTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </div>
    </MainLayout>
  );
};

export default Inventory;
