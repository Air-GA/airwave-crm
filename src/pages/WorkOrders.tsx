
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { WorkOrder } from "@/types";
import { technicians } from "@/data/mockData";
import { AlertCircle, Calendar, Check, ChevronDown, ClipboardCheck, Eye, Filter, MapPin, MoreHorizontal, MoveHorizontal, Plus, Search, UserRound, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDate } from "@/lib/date-utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SyncButton } from '@/components/SyncButton';
import { syncWorkOrdersFromCRM } from '@/services/crmSyncService';
import { useQueryClient } from '@tanstack/react-query';
import { fetchWorkOrders, assignTechnician, completeWorkOrder, cancelWorkOrder, fetchTechnicians } from "@/services/dataService";

const WorkOrders = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [technicianFilter, setTechnicianFilter] = useState<string>("all");
  const [showUnassignedOnly, setShowUnassignedOnly] = useState<boolean>(false);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [availableTechnicians, setAvailableTechnicians] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadWorkOrders();
  }, []);

  const loadWorkOrders = async () => {
    setIsLoading(true);
    try {
      const orders = await fetchWorkOrders();
      setWorkOrders(orders);
      
      const techNames = Array.from(
        new Set(
          orders
            .filter(order => order.technicianName)
            .map(order => order.technicianName as string)
        )
      );
      setAvailableTechnicians(techNames);
    } catch (error) {
      console.error("Error loading work orders:", error);
      toast({
        title: "Error",
        description: "Failed to load work orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWorkOrders = workOrders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter;
    
    let matchesDate = true;
    const orderDate = new Date(order.scheduledDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dateFilter === "today") {
      matchesDate = orderDate.toDateString() === today.toDateString();
    } else if (dateFilter === "tomorrow") {
      matchesDate = orderDate.toDateString() === tomorrow.toDateString();
    } else if (dateFilter === "this-week") {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      matchesDate = orderDate >= weekStart && orderDate <= weekEnd;
    } else if (dateFilter === "this-month") {
      matchesDate = 
        orderDate.getMonth() === today.getMonth() && 
        orderDate.getFullYear() === today.getFullYear();
    }
    
    const matchesTechnician = technicianFilter === "all" || 
      (order.technicianName && order.technicianName.toLowerCase() === technicianFilter.toLowerCase());
    
    const matchesUnassigned = !showUnassignedOnly || !order.technicianName;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDate && matchesTechnician && matchesUnassigned;
  });
  
  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setDateFilter("all");
    setTechnicianFilter("all");
    setShowUnassignedOnly(false);
  };

  const handleCancelWorkOrder = async (workOrderId: string) => {
    try {
      const success = await cancelWorkOrder(workOrderId);
      if (success) {
        setWorkOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === workOrderId 
              ? { ...order, status: 'cancelled' } 
              : order
          )
        );
        toast({
          title: "Work Order Cancelled",
          description: `Work order #${workOrderId} has been cancelled.`,
        });
      }
    } catch (error) {
      console.error("Error cancelling work order:", error);
      toast({
        title: "Error",
        description: "Failed to cancel work order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsCompleted = async (workOrderId: string) => {
    try {
      const success = await completeWorkOrder(workOrderId);
      if (success) {
        setWorkOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === workOrderId 
              ? { ...order, status: 'completed', completedDate: new Date().toISOString() } 
              : order
          )
        );
        toast({
          title: "Work Order Completed",
          description: `Work order #${workOrderId} has been marked as completed.`,
        });
      }
    } catch (error) {
      console.error("Error completing work order:", error);
      toast({
        title: "Error",
        description: "Failed to mark work order as completed. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleReassignWorkOrder = async (workOrderId: string, technicianId: string | null) => {
    try {
      const tech = technicianId ? technicians.find(t => t.id === technicianId) : null;
      const techName = tech ? tech.name : undefined;
      
      const success = await assignTechnician(workOrderId, technicianId, techName);
      
      if (success) {
        setWorkOrders(prevOrders => 
          prevOrders.map(order => {
            if (order.id === workOrderId) {
              return { 
                ...order, 
                technicianId: technicianId || undefined,
                technicianName: techName,
                status: technicianId ? 'scheduled' : 'pending'
              };
            }
            return order;
          })
        );
        
        if (technicianId && techName) {
          toast({
            title: "Work Order Reassigned",
            description: `Work order #${workOrderId} has been assigned to ${techName}.`,
          });
        } else {
          toast({
            title: "Work Order Unassigned",
            description: `Technician has been removed from work order #${workOrderId}.`,
          });
        }
      }
    } catch (error) {
      console.error("Error reassigning work order:", error);
      toast({
        title: "Error",
        description: "Failed to reassign work order. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSyncWorkOrders = async () => {
    setIsLoading(true);
    try {
      const syncedOrders = await syncWorkOrdersFromCRM();
      if (syncedOrders.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['workOrders'] });
        await loadWorkOrders();
        toast({
          title: "Sync Completed",
          description: `${syncedOrders.length} work orders synced from CRM.`,
        });
      }
      return syncedOrders;
    } catch (error) {
      console.error("Error syncing work orders:", error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync work orders from CRM. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold">Work Orders</h1>
            <SyncButton onSync={handleSyncWorkOrders} label="Work Orders" />
          </div>
          <Link to="/work-orders/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Work Order
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search work orders..."
              className="pl-8 w-full md:max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size={isMobile ? "sm" : "default"}>
                  Status <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  {statusFilter === "all" && <Check className="mr-2 h-4 w-4" />}
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  {statusFilter === "pending" && <Check className="mr-2 h-4 w-4" />}
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("scheduled")}>
                  {statusFilter === "scheduled" && <Check className="mr-2 h-4 w-4" />}
                  Scheduled
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("in-progress")}>
                  {statusFilter === "in-progress" && <Check className="mr-2 h-4 w-4" />}
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                  {statusFilter === "completed" && <Check className="mr-2 h-4 w-4" />}
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>
                  {statusFilter === "cancelled" && <Check className="mr-2 h-4 w-4" />}
                  Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size={isMobile ? "sm" : "default"}>
                  Priority <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setPriorityFilter("all")}>
                  {priorityFilter === "all" && <Check className="mr-2 h-4 w-4" />}
                  All Priorities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("low")}>
                  {priorityFilter === "low" && <Check className="mr-2 h-4 w-4" />}
                  Low
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("medium")}>
                  {priorityFilter === "medium" && <Check className="mr-2 h-4 w-4" />}
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("high")}>
                  {priorityFilter === "high" && <Check className="mr-2 h-4 w-4" />}
                  High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("emergency")}>
                  {priorityFilter === "emergency" && <Check className="mr-2 h-4 w-4" />}
                  Emergency
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size={isMobile ? "sm" : "default"}>
                  <Filter className="mr-1 h-4 w-4" /> More Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="grid gap-3">
                  <div className="space-y-1.5">
                    <h4 className="font-medium leading-none text-sm">Date</h4>
                    <div className="flex flex-wrap gap-1.5">
                      <Button 
                        variant={dateFilter === "all" ? "default" : "outline"} 
                        size="sm" 
                        className="h-7 px-2"
                        onClick={() => setDateFilter("all")}
                      >
                        All
                      </Button>
                      <Button 
                        variant={dateFilter === "today" ? "default" : "outline"} 
                        size="sm"
                        className="h-7 px-2" 
                        onClick={() => setDateFilter("today")}
                      >
                        Today
                      </Button>
                      <Button 
                        variant={dateFilter === "tomorrow" ? "default" : "outline"} 
                        size="sm" 
                        className="h-7 px-2"
                        onClick={() => setDateFilter("tomorrow")}
                      >
                        Tomorrow
                      </Button>
                      <Button 
                        variant={dateFilter === "this-week" ? "default" : "outline"} 
                        size="sm" 
                        className="h-7 px-2"
                        onClick={() => setDateFilter("this-week")}
                      >
                        This Week
                      </Button>
                      <Button 
                        variant={dateFilter === "this-month" ? "default" : "outline"} 
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setDateFilter("this-month")}
                      >
                        This Month
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <h4 className="font-medium leading-none text-sm">Technician</h4>
                    <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                      <div 
                        key="all" 
                        className="flex items-center space-x-2 rounded-md p-1 hover:bg-accent cursor-pointer"
                        onClick={() => setTechnicianFilter("all")}
                      >
                        <Checkbox 
                          checked={technicianFilter === "all"} 
                          onCheckedChange={() => setTechnicianFilter("all")}
                        />
                        <label className="text-sm cursor-pointer flex-1">All Technicians</label>
                      </div>
                      {availableTechnicians.map((technician) => (
                        <div 
                          key={technician} 
                          className="flex items-center space-x-2 rounded-md p-1 hover:bg-accent cursor-pointer"
                          onClick={() => setTechnicianFilter(technician)}
                        >
                          <Checkbox 
                            checked={technicianFilter === technician} 
                            onCheckedChange={() => setTechnicianFilter(technician)}
                          />
                          <label className="text-sm cursor-pointer flex-1">{technician}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 rounded-md p-1 hover:bg-accent cursor-pointer">
                    <Checkbox 
                      checked={showUnassignedOnly} 
                      onCheckedChange={(checked) => {
                        if (typeof checked === 'boolean') {
                          setShowUnassignedOnly(checked);
                        }
                      }}
                      id="unassigned"
                    />
                    <label 
                      htmlFor="unassigned" 
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      Show Unassigned Only
                    </label>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearFilters}
                    >
                      Clear All
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => document.body.click()}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto mt-2 md:mt-0">
            <span>{filteredWorkOrders.length} work orders</span>
          </div>
        </div>
        
        {(statusFilter !== "all" || priorityFilter !== "all" || dateFilter !== "all" || technicianFilter !== "all" || showUnassignedOnly) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium">Active filters:</span>
            {statusFilter !== "all" && (
              <Badge variant="outline" className="flex items-center gap-1">
                Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                <button 
                  onClick={() => setStatusFilter("all")}
                  className="ml-1 rounded-full hover:bg-accent p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {priorityFilter !== "all" && (
              <Badge variant="outline" className="flex items-center gap-1">
                Priority: {priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1)}
                <button 
                  onClick={() => setPriorityFilter("all")}
                  className="ml-1 rounded-full hover:bg-accent p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {dateFilter !== "all" && (
              <Badge variant="outline" className="flex items-center gap-1">
                Date: {
                  dateFilter === "today" ? "Today" :
                  dateFilter === "tomorrow" ? "Tomorrow" :
                  dateFilter === "this-week" ? "This Week" : "This Month"
                }
                <button 
                  onClick={() => setDateFilter("all")}
                  className="ml-1 rounded-full hover:bg-accent p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {technicianFilter !== "all" && (
              <Badge variant="outline" className="flex items-center gap-1">
                Technician: {technicianFilter}
                <button 
                  onClick={() => setTechnicianFilter("all")}
                  className="ml-1 rounded-full hover:bg-accent p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {showUnassignedOnly && (
              <Badge variant="outline" className="flex items-center gap-1">
                Unassigned Only
                <button 
                  onClick={() => setShowUnassignedOnly(false)}
                  className="ml-1 rounded-full hover:bg-accent p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7" 
              onClick={clearFilters}
            >
              Clear All
            </Button>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mt-1">
            {filteredWorkOrders.map(workOrder => (
              <WorkOrderCard 
                key={workOrder.id} 
                workOrder={workOrder} 
                onCancel={handleCancelWorkOrder}
                onComplete={handleMarkAsCompleted}
                onReassign={handleReassignWorkOrder}
              />
            ))}
          </div>
        )}
        
        {!isLoading && filteredWorkOrders.length === 0 && (
          <div className="rounded-lg border border-dashed p-6 text-center my-4">
            <ClipboardCheck className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-lg font-medium">No work orders found</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Try adjusting your search or filters, or create a new work order.
            </p>
            <Button className="mt-3" onClick={() => navigate("/work-orders/create")}>
              <Plus className="mr-1.5 h-4 w-4" /> Create Work Order
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onReassign: (id: string, technicianId: string | null) => void;
}

const WorkOrderCard = ({ workOrder, onCancel, onComplete, onReassign }: WorkOrderCardProps) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(workOrder.technicianId || null);

  const handleReassign = () => {
    onReassign(workOrder.id, selectedTechnicianId);
    setShowReassignDialog(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`
                  ${workOrder.status === 'completed' ? 'bg-green-50 text-green-700' : ''}
                  ${workOrder.status === 'in-progress' ? 'bg-blue-50 text-blue-700' : ''}
                  ${workOrder.status === 'scheduled' ? 'bg-amber-50 text-amber-700' : ''}
                  ${workOrder.status === 'pending' ? 'bg-gray-50 text-gray-700' : ''}
                  ${workOrder.status === 'cancelled' ? 'bg-red-50 text-red-700' : ''}
                `}
              >
                {workOrder.status}
              </Badge>
              <Badge
                variant="outline"
                className={`
                  ${workOrder.priority === 'low' ? 'bg-gray-50 text-gray-700' : ''}
                  ${workOrder.priority === 'medium' ? 'bg-blue-50 text-blue-700' : ''}
                  ${workOrder.priority === 'high' ? 'bg-amber-50 text-amber-700' : ''}
                  ${workOrder.priority === 'emergency' ? 'bg-red-50 text-red-700' : ''}
                `}
              >
                {workOrder.priority}
              </Badge>
            </div>
            <CardTitle className="mt-2 text-lg font-medium">
              #{workOrder.id.substring(0, 8)} - {workOrder.type.charAt(0).toUpperCase() + workOrder.type.slice(1)}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Work Order</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowReassignDialog(true)}>Assign Technician</DropdownMenuItem>
              <DropdownMenuSeparator />
              {workOrder.status !== 'completed' && workOrder.status !== 'cancelled' && (
                <>
                  <DropdownMenuItem onClick={() => setShowCompleteDialog(true)}>Mark as Completed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowCancelDialog(true)}>Cancel Work Order</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{workOrder.customerName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{workOrder.address}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formatDate(new Date(workOrder.scheduledDate), { includeTime: true })}</span>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" className="w-full">
                <Eye className="mr-2 h-4 w-4" /> View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Work Order #{workOrder.id}</DialogTitle>
                <DialogDescription>
                  Created on {formatDate(new Date(workOrder.createdAt))}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div className="flex flex-col space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <div>
                    <Badge
                      variant="outline"
                      className={`
                        ${workOrder.status === 'completed' ? 'bg-green-50 text-green-700' : ''}
                        ${workOrder.status === 'in-progress' ? 'bg-blue-50 text-blue-700' : ''}
                        ${workOrder.status === 'scheduled' ? 'bg-amber-50 text-amber-700' : ''}
                        ${workOrder.status === 'pending' ? 'bg-gray-50 text-gray-700' : ''}
                        ${workOrder.status === 'cancelled' ? 'bg-red-50 text-red-700' : ''}
                      `}
                    >
                      {workOrder.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                  <p>{workOrder.type.charAt(0).toUpperCase() + workOrder.type.slice(1)}</p>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Customer</h4>
                  <p>{workOrder.customerName}</p>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Service Address</h4>
                  <p>{workOrder.address}</p>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Scheduled Date</h4>
                  <p>{formatDate(new Date(workOrder.scheduledDate), { includeTime: true })}</p>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Technician</h4>
                  <p>{workOrder.technicianName || 'Unassigned'}</p>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                  <p>{workOrder.description}</p>
                </div>
                
                {workOrder.partsUsed && workOrder.partsUsed.length > 0 && (
                  <div className="flex flex-col space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Parts Used</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {workOrder.partsUsed.map((part) => (
                        <li key={part.id}>
                          {part.name} (x{part.quantity}) - ${part.price.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {workOrder.status !== 'completed' && workOrder.status !== 'cancelled' && (
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setShowCancelDialog(true)}>Cancel Work Order</Button>
                    <Button onClick={() => setShowCompleteDialog(true)}>Mark as Completed</Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Work Order</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel work order #{workOrder.id}? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">No, Keep It</Button>
                </DialogClose>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    onCancel(workOrder.id);
                    setShowCancelDialog(false);
                  }}
                >
                  Yes, Cancel Work Order
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Complete Work Order</DialogTitle>
                <DialogDescription>
                  Are you sure you want to mark work order #{workOrder.id} as completed?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">No, Not Yet</Button>
                </DialogClose>
                <Button 
                  onClick={() => {
                    onComplete(workOrder.id);
                    setShowCompleteDialog(false);
                  }}
                >
                  Yes, Mark as Completed
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reassign Work Order</DialogTitle>
                <DialogDescription>
                  Select a technician to assign work order #{workOrder.id}
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 space-y-4">
                <Select 
                  value={selectedTechnicianId || undefined} 
                  onValueChange={(value) => setSelectedTechnicianId(value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a technician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassign">-- Unassign --</SelectItem>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleReassign}>
                  Assign Technician
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {workOrder.status !== 'completed' && workOrder.status !== 'cancelled' && (
            <div className="flex items-center justify-between pt-2">
              {workOrder.technicianName ? (
                <span className="text-sm">
                  <span className="font-medium">Technician:</span> {workOrder.technicianName}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-amber-600">
                  <AlertCircle className="h-3.5 w-3.5" /> Unassigned
                </span>
              )}
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowReassignDialog(true)}
              >
                <MoveHorizontal className="mr-1.5 h-3.5 w-3.5" />
                {workOrder.technicianName ? 'Reassign' : 'Assign'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrders;
