
import { Mail, Phone, Home, UserRound, MapPin, ExternalLink } from "lucide-react";
import { Customer } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CustomerListViewProps {
  customers: Customer[];
  onCustomerClick: (customerId: string) => void;
  onViewDetails?: (customer: Customer) => void;
}

export const CustomerListView = ({ 
  customers, 
  onCustomerClick,
  onViewDetails
}: CustomerListViewProps) => {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Billing City</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            {onViewDetails && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow 
              key={customer.id} 
              onClick={() => onCustomerClick(customer.id)}
              className="cursor-pointer hover:bg-muted"
            >
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <UserRound className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{customer.name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="flex items-center">
                    <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Home className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[200px]">
                    {customer.address}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span className="text-sm">
                    {customer.billCity || "Not specified"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {customer.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={customer.status === "active" ? "default" : 
                          customer.status === "inactive" ? "secondary" : "outline"}
                  className="capitalize"
                >
                  {customer.status}
                </Badge>
              </TableCell>
              {onViewDetails && (
                <TableCell className="text-right">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(customer);
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">View Details</span>
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
