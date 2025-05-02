
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CustomerSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const CustomerSearch = ({ 
  searchQuery,
  setSearchQuery 
}: CustomerSearchProps) => {
  return (
    <>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search customers by name, email or address..."
        className="pl-8 w-full"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </>
  );
};
