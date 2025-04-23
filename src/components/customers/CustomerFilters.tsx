
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerFiltersProps {
  onOpenFilters: () => void;
}

export const CustomerFilters = ({ onOpenFilters }: CustomerFiltersProps) => {
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={onOpenFilters}
    >
      <Filter className="h-4 w-4 mr-1" />
      Filter
    </Button>
  );
};
