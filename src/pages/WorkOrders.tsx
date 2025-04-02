import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WorkOrder, workOrders } from "@/data/mockData";
import { AlertCircle, Calendar, ChevronDown, ClipboardCheck, Eye, Filter, MapPin, MoreHorizontal, Plus, Search, UserRound } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDate } from "@/lib/date-utils";

const WorkOrders = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  
  const filteredWorkOrders = workOrders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
            <p className="text-muted-foreground">Manage service requests and job assignments</p>
          </div>
          <Button onClick={() => navigate("/work-orders/create")}>
            <Plus className="mr-2 h-4 w-4" /> Create Work Order
          </Button>
        </div>
        
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
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
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("scheduled")}>
                  Scheduled
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("in-progress")}>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>
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
                  All Priorities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("low")}>
                  Low
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("medium")}>
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("high")}>
                  High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("emergency")}>
                  Emergency
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size={isMobile ? "sm" : "default"}>
              <Filter className="mr-1 h-4 w-4" /> More Filters
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
            <span>{filteredWorkOrders.length} work orders</span>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredWorkOrders.map(workOrder => (
            <WorkOrderCard key={workOrder.id} workOrder={workOrder} />
          ))}
        </div>
        
        {filteredWorkOrders.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No work orders found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filters, or create a new work order.
            </p>
            <Button className="mt-4" onClick={() => navigate("/work-orders/create")}>
              <Plus className="mr-2 h-4 w-4" /> Create Work Order
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

interface WorkOrderCardProps {
  workOrder: WorkOrder;
}

const WorkOrderCard = ({ workOrder }: WorkOrderCardProps) => {
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
              #{workOrder.id} - {workOrder.type.charAt(0).toUpperCase() + workOrder.type.slice(1)}
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
              <DropdownMenuItem>Assign Technician</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
              <DropdownMenuItem>Cancel Work Order</DropdownMenuItem>
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
                    <Button variant="outline">Cancel Work Order</Button>
                    <Button>Mark as Completed</Button>
                  </div>
                )}
              </div>
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
              
              <Button size="sm" variant="outline">
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
