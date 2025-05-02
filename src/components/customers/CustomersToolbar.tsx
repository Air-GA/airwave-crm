
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  RefreshCw
} from "lucide-react";
import { CustomerSearch } from "./CustomerSearch";
import { CustomersViewToggle } from "./CustomersViewToggle";
import { SyncButton } from "../SyncButton";
import { handleSyncClick } from "@/services/customerSyncService";

interface CustomersToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  onOpenFilters: () => void;
  onRefresh: () => void;
  customerCount?: number;
}

export const CustomersToolbar = ({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  onOpenFilters,
  onRefresh,
  customerCount = 0,
}: CustomersToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="w-full sm:w-auto flex-1 relative">
        <CustomerSearch 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
        />
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-sm text-muted-foreground mr-2">
          {customerCount > 0 ? `${customerCount.toLocaleString()} customers` : "No customers"}
        </span>
      
        <Button 
          onClick={onOpenFilters}
          variant="outline" 
          size="sm"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        
        <SyncButton
          onSync={handleSyncClick}
          label="Customers"
        />
        
        <CustomersViewToggle 
          viewMode={viewMode} 
          setViewMode={setViewMode} 
        />
        
        <Button
          onClick={onRefresh}
          variant="ghost"
          size="sm"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>
    </div>
  );
};
