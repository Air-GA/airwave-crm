
import { LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomersViewToggleProps {
  viewMode: string;
  setViewMode: (mode: "grid" | "list") => void;
}

export const CustomersViewToggle = ({ viewMode, setViewMode }: CustomersViewToggleProps) => {
  return (
    <div className="border rounded-md flex">
      <Button
        variant={viewMode === "grid" ? "ghost" : "ghost"}
        size="icon"
        className={`rounded-r-none ${viewMode === "grid" ? "bg-muted" : ""}`}
        onClick={() => setViewMode("grid")}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="sr-only">Grid view</span>
      </Button>
      <Button
        variant={viewMode === "list" ? "ghost" : "ghost"}
        size="icon"
        className={`rounded-l-none ${viewMode === "list" ? "bg-muted" : ""}`}
        onClick={() => setViewMode("list")}
      >
        <LayoutList className="h-4 w-4" />
        <span className="sr-only">List view</span>
      </Button>
    </div>
  );
};
