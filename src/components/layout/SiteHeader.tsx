
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomerStore } from '@/services/customerStore';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SiteHeader() {
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { customers, setSearchFilter } = useCustomerStore();

  useEffect(() => {
    setCustomerCount(customers.length);
  }, [customers]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSearchFilter(query); // Update the store with the search query
  };

  return (
    <header className="bg-background border-b">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 font-bold">
          <img 
            src="/lovable-uploads/f169bc97-451d-4387-9c63-d2955fe90926.png" 
            alt="Logo" 
            className="h-8 w-auto" 
          />
          <span>Air Georgia Home Comfort Systems</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="text-sm font-medium">
            Total Customers: {customerCount}
          </div>
        </div>
      </div>
    </header>
  );
}
