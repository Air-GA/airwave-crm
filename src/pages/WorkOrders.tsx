import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  User,
  AlarmClock,
  Clock,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWorkOrders } from "@/services/workOrderService";
import { WorkOrder } from "@/types";
import { syncWorkOrdersFromCRM } from "@/services/crmSyncService";
import { useToast } from "@/components/ui/use-toast";
import { SyncWithQuickBooks } from "@/components/SyncWithQuickBooks";

export default function WorkOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  // Fetch work orders
  const { data: workOrders, isLoading, refetch } = useQuery({
    queryKey: ["work-orders", refreshTrigger],
    queryFn: fetchWorkOrders,
  });

  // Handle CRM sync
  const handleSyncFromCRM = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    toast({
      title: "Syncing...",
      description: "Syncing work orders from CRM...",
    });

    try {
      await syncWorkOrdersFromCRM();
      toast({
        title: "Sync Complete",
        description: "Successfully synced work orders with CRM",
      });
      refetch();
    } catch (error) {
      console.error("Error syncing work orders:", error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync work orders from CRM",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle data sync completion
  const handleDataSyncComplete = () => {
    setRefreshTrigger(prev => prev + 1);
    refetch();
  };

  // Filter work orders based on search query and filters
  const filteredWorkOrders = workOrders
    ? workOrders.filter((order) => {
        // Apply search filter
        const matchesSearch =
          order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Apply status filter
        const matchesStatus =
          statusFilter === "all" || order.status === statusFilter;

        // Apply type filter
        const matchesType = typeFilter === "all" || order.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
      })
    : [];

  // Map priority to badge variant
  const getPriorityBadge = (priority: WorkOrder["priority"]) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline">Low</Badge>;
      case "medium":
        return <Badge>Medium</Badge>;
      case "high":
        return <Badge className="bg-orange-500">High</Badge>;
      case "emergency":
        return <Badge variant="destructive">Emergency</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Map status to badge variant
  const getStatusBadge = (status: WorkOrder["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case "in-progress":
        return <Badge className="bg-purple-500">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <MainLayout pageName="Work Orders">
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Work Orders</CardTitle>
              <CardDescription>
                Manage service requests and scheduled work
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncFromCRM}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <>
                    <Skeleton className="h-4 w-4 rounded-full mr-2 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <span className="mr-2">↓</span>
                    <span>Sync from CRM</span>
                  </>
                )}
              </Button>
              
              <SyncWithQuickBooks 
                entityType="workOrders"
                onSyncComplete={handleDataSyncComplete}
              />
              
              <Button asChild>
                <Link to="/work-orders/create">
                  <Plus className="mr-2 h-4 w-4" />
                  New Work Order
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, address, or description..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="installation">Installation</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service Address</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Technician</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Loading state
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`loading-${i}`}>
                        <TableCell>
                          <Skeleton className="h-5 w-[120px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[180px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[70px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[90px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[120px]" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredWorkOrders.length === 0 ? (
                    // No results found
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No work orders found. Try adjusting your filters or
                        search query.
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Results
                    filteredWorkOrders.map((order) => (
                      <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {order.customerName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{order.address}</TableCell>
                        <TableCell className="capitalize">{order.type}</TableCell>
                        <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(order.scheduledDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.technicianName ? (
                            <div className="flex items-center gap-2">
                              <span>{order.technicianName}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">
                              Not assigned
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredWorkOrders.length} of {workOrders?.length || 0}{" "}
              work orders
            </div>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
