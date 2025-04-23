
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerSearch } from "./CustomerSearch";
import { CustomerFilters } from "./CustomerFilters";
import { CustomersViewToggle } from "./CustomersViewToggle";

interface CustomersToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  onOpenFilters: () => void;
  onRefresh: () => void;
}

export const CustomersToolbar = ({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  onOpenFilters,
  onRefresh,
}: CustomersToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
      <CustomerSearch 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
        <CustomerFilters onOpenFilters={onOpenFilters} />
        <CustomersViewToggle 
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>
    </div>
  );
};
