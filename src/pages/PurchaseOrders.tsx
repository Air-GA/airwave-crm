
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  FileText, 
  Search, 
  Package, 
  Calendar, 
  DollarSign,
  Plus,
  Filter
} from "lucide-react";

import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Mock data for purchase orders since we don't have this table yet
interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier: string;
  order_date: string;
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  total_amount: number;
  items_count: number;
}

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: "po-001",
    po_number: "PO-2025-001",
    supplier: "HVAC Supply Co.",
    order_date: "2025-03-15",
    status: "received",
    total_amount: 1250.99,
    items_count: 5
  },
  {
    id: "po-002",
    po_number: "PO-2025-002",
    supplier: "Refrigerant Wholesalers",
    order_date: "2025-03-28",
    status: "ordered",
    total_amount: 876.50,
    items_count: 3
  },
  {
    id: "po-003",
    po_number: "PO-2025-003",
    supplier: "Air Filter Specialists",
    order_date: "2025-04-05",
    status: "pending",
    total_amount: 420.75,
    items_count: 8
  },
  {
    id: "po-004",
    po_number: "PO-2025-004",
    supplier: "Motor Components Inc.",
    order_date: "2025-04-08",
    status: "approved",
    total_amount: 1899.00,
    items_count: 2
  },
  {
    id: "po-005",
    po_number: "PO-2025-005",
    supplier: "Compressor World",
    order_date: "2025-04-09",
    status: "pending",
    total_amount: 3450.25,
    items_count: 1
  }
];

const getStatusBadgeVariant = (status: PurchaseOrder['status']) => {
  switch (status) {
    case 'received':
      return { color: 'bg-green-500 hover:bg-green-600', label: 'Received' };
    case 'ordered':
      return { color: 'bg-blue-500 hover:bg-blue-600', label: 'Ordered' };
    case 'approved':
      return { color: 'bg-purple-500 hover:bg-purple-600', label: 'Approved' };
    case 'pending':
      return { color: 'bg-yellow-500 hover:bg-yellow-600', label: 'Pending' };
    case 'cancelled':
      return { color: 'bg-red-500 hover:bg-red-600', label: 'Cancelled' };
    default:
      return { color: 'bg-gray-500 hover:bg-gray-600', label: status };
  }
};

const PurchaseOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Mock query to fetch purchase orders
  const { data: purchaseOrders, isLoading } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockPurchaseOrders;
    },
  });

  // Handle search
  const filteredPOs = purchaseOrders?.filter((po) =>
    po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <MainLayout pageName="Purchase Orders">
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                View and manage purchase orders for inventory items.
              </CardDescription>
            </div>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              New Purchase Order
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by PO number or supplier..."
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[180px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[50px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredPOs?.length ? (
                    filteredPOs.map((po) => {
                      const statusBadge = getStatusBadgeVariant(po.status);
                      
                      return (
                        <TableRow key={po.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{po.po_number}</span>
                            </div>
                          </TableCell>
                          <TableCell>{po.supplier}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{po.order_date}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusBadge.color}>
                              {statusBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span>{po.items_count}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <div className="flex items-center justify-end gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>{formatCurrency(po.total_amount)}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No purchase orders found. Try adjusting your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredPOs?.length || 0} of {purchaseOrders?.length || 0} purchase orders
            </div>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PurchaseOrders;
