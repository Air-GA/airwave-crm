
import { Grid, List } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface CustomersViewToggleProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

export const CustomersViewToggle = ({ viewMode, setViewMode }: CustomersViewToggleProps) => {
  return (
    <ToggleGroup
      type="single" 
      variant="outline"
      value={viewMode}
      onValueChange={(value) => {
        if (value) setViewMode(value as "grid" | "list");
      }}
      className="border rounded-md"
    >
      <ToggleGroupItem value="grid" className="data-[state=on]:bg-muted">
        <Grid className="h-4 w-4" />
        <span className="sr-only">Grid View</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="list" className="data-[state=on]:bg-muted">
        <List className="h-4 w-4" />
        <span className="sr-only">List View</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
