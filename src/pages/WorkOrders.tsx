
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WorkOrder } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { SyncWithQuickBooks } from "@/components/SyncWithQuickBooks";
import { getWorkOrders, useWorkOrderStore } from "@/services/workOrderService";
import { FileText, Plus, Search, Activity, Truck, Calendar, Filter } from "lucide-react";
import { Badge as BadgeIcon } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Home, ClipboardCheck, Tool } from "lucide-react";

// Function to get icon based on work order type
const getTypeIcon = (type: string) => {
  switch (type) {
    case "repair":
      return <Wrench className="h-4 w-4 mr-1" />;
    case "maintenance":
      return <Tool className="h-4 w-4 mr-1" />;
    case "installation":
      return <Home className="h-4 w-4 mr-1" />;
    case "inspection":
      return <ClipboardCheck className="h-4 w-4 mr-1" />;
    default:
      return <Activity className="h-4 w-4 mr-1" />;
  }
};

const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const navigate = useNavigate();
  const { toast } = useToast();
  const workOrderStore = useWorkOrderStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getWorkOrders();
        
        // Filter out any commercial jobs, we only want residential
        const residentialJobs = data.filter(order => {
          // In a real implementation, this would check the customer type directly
          // For now, we'll enforce residential-only as per the service configuration
          return order.customerType !== 'commercial'; // Check customerType instead of type
        });
        
        setWorkOrders(residentialJobs);
        setFilteredWorkOrders(residentialJobs);
        
        // Update the global store so other components have access to the same data
        workOrderStore.setWorkOrders(residentialJobs);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching work orders:", error);
        toast({
          variant: "destructive",
          title: "Error fetching work orders",
          description: "Could not load work orders. Please try again later.",
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, workOrderStore]);

  useEffect(() => {
    let result = workOrders;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          order.customerName?.toLowerCase().includes(term) ||
          order.address?.toLowerCase().includes(term) ||
          order.description?.toLowerCase().includes(term) ||
          order.id?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((order) => order.type === typeFilter);
    }

    setFilteredWorkOrders(result);
  }, [searchTerm, statusFilter, typeFilter, workOrders]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-amber-100 text-amber-800";
      case "emergency":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Pending
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            Scheduled
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case "pending-completion":
        return (
          <Badge variant="outline" className="bg-violet-100 text-violet-800">
            Pending Completion
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        );
    }
  };

  const handleViewWorkOrder = (workOrderId: string) => {
    navigate(`/work-orders/${workOrderId}`);
  };

  const handleCreateWorkOrder = () => {
    navigate("/work-orders/create");
  };

  return (
    <MainLayout pageName="Work Orders">
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Work Orders</CardTitle>
              <CardDescription>View and manage all residential customer work orders</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateWorkOrder}>
                <Plus className="mr-2 h-4 w-4" /> Create Work Order
              </Button>
              <SyncWithQuickBooks 
                entityType="workOrders" 
                onSyncComplete={() => {
                  // Refresh data after sync
                  getWorkOrders().then(data => {
                    const residentialJobs = data.filter(order => 
                      order.customerType !== 'commercial'
                    );
                    setWorkOrders(residentialJobs);
                    setFilteredWorkOrders(residentialJobs);
                    workOrderStore.setWorkOrders(residentialJobs);
                  });
                }} 
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search work orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filter:</span>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="pending-completion">Pending Completion</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
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
              </div>
            </div>

            <div className="mt-6 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={8} className="h-16 animate-pulse bg-gray-100"></TableCell>
                        </TableRow>
                      ))
                  ) : filteredWorkOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">No work orders found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredWorkOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">{order.address}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getTypeIcon(order.type)}
                            <span className="capitalize">{order.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{order.description}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          {order.scheduledDate ? format(new Date(order.scheduledDate), "MMM d, yyyy") : "Not scheduled"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleViewWorkOrder(order.id)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default WorkOrders;
