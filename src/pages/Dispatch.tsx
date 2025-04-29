import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import MapView from "@/components/maps/MapView";
import TechnicianScheduleView from "@/components/schedule/TechnicianScheduleView";
import { 
  RefreshCw, 
  Calendar as CalendarIcon, 
  MapPin, 
  ChevronDown 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/lib/date-utils";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription
} from "@/components/ui/alert";
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
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { WorkOrderDetailsPanel } from "@/components/workorders/WorkOrderDetailsPanel";
import { useToast } from "@/hooks/use-toast";
import { useWorkOrderStore } from "@/services/workOrderStore";
import { fetchTechnicians, assignWorkOrder, unassignWorkOrder } from "@/services/technicianService";
import { getCustomerById } from "@/services/customerStore";
import { Technician, WorkOrder, Customer } from "@/types";

interface TechFilterProps {
  selectedTechnicianId: string; 
  onTechSelect: (techId: string) => void;
  technicians: Technician[];
}

const TechFilter = ({ selectedTechnicianId, onTechSelect, technicians }: TechFilterProps) => {
  return (
    <Select value={selectedTechnicianId} onValueChange={onTechSelect}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by technician" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Technicians</SelectItem>
        {technicians.map((tech) => (
          <SelectItem key={tech.id} value={tech.id}>
            {tech.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const Dispatch = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isWorkOrderDetailOpen, setIsWorkOrderDetailOpen] = useState(false);
  const [customerData, setCustomerData] = useState<Record<string, Customer>>({});
  const { toast } = useToast();

  const workOrders = useWorkOrderStore(state => state.workOrders);
  const setWorkOrders = useWorkOrderStore(state => state.setWorkOrders);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load technicians
      const techData = await fetchTechnicians();
      setTechnicians(techData);
      
      // Load customers for any work orders
      const workOrdersData = useWorkOrderStore.getState().workOrders;
      const customerIds = [...new Set(workOrdersData.map(wo => wo.customerId))];
      
      // Fetch customer data for each work order
      const customersMap: Record<string, Customer> = {};
      for (const customerId of customerIds) {
        try {
          const customer = await getCustomerById(customerId);
          if (customer) {
            customersMap[customerId] = customer;
          }
        } catch (err) {
          console.error(`Failed to load customer data for ID ${customerId}:`, err);
        }
      }
      
      setCustomerData(customersMap);
      
      // Check if we need a more refined view
      if (techData.length > 0 && !selectedTechnicianId) {
        setSelectedTechnicianId(techData[0].id);
      }
      
    } catch (error) {
      console.error("Failed to load dispatch data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    await loadData();
    toast({
      title: "Refreshed",
      description: "The dispatch data has been refreshed.",
    });
  };

  const handleWorkOrderClick = (workOrder: WorkOrder) => {
    // Enhance the work order with customer info if available
    if (customerData[workOrder.customerId]) {
      const enhancedWorkOrder = {
        ...workOrder,
        customerDetails: customerData[workOrder.customerId]
      };
      setSelectedWorkOrder(enhancedWorkOrder as any);
    } else {
      setSelectedWorkOrder(workOrder);
    }
    setIsWorkOrderDetailOpen(true);
  };

  const handleAssignWorkOrder = async (workOrderId: string, technicianId: string) => {
    try {
      const technician = technicians.find(t => t.id === technicianId);
      if (!technician) return;
      
      await assignWorkOrder(workOrderId, technicianId, technician.name);
      
      await loadData();
      
      toast({
        title: "Work Order Assigned",
        description: `Successfully assigned to ${technician.name}.`,
      });
    } catch (error) {
      console.error("Failed to assign work order:", error);
      toast({
        title: "Error",
        description: "Failed to assign work order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnassignWorkOrder = async (workOrderId: string) => {
    try {
      await unassignWorkOrder(workOrderId);
      
      await loadData();
      
      toast({
        title: "Work Order Unassigned",
        description: "Successfully removed technician assignment.",
      });
    } catch (error) {
      console.error("Failed to unassign work order:", error);
      toast({
        title: "Error",
        description: "Failed to unassign work order. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dispatch</h1>
            <p className="text-muted-foreground">
              Manage technician locations and service calls
            </p>
          </div>
          <Button onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technicians</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {technicians.map((technician) => (
                    <div
                      key={technician.id}
                      className={`cursor-pointer p-3 transition-colors hover:bg-muted ${
                        technician.id === selectedTechnicianId ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedTechnicianId(technician.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            technician.status === "available"
                              ? "bg-green-500"
                              : technician.status === "busy"
                              ? "bg-amber-500"
                              : "bg-gray-500"
                          }`}
                        />
                        <p>{technician.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6">
            {/* Remove the selectedTechnicianId prop from MapView if it doesn't accept it */}
            <MapView />

            <Card>
              <CardHeader>
                <CardTitle>{`Schedule - ${formatDate(date)}`}</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTechnicianId && (
                  <TechnicianScheduleView
                    technician={technicians.find(t => t.id === selectedTechnicianId) || null}
                    selectedDate={date}
                    onWorkOrderClick={handleWorkOrderClick}
                    isLoading={loading}
                    customerData={customerData}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={isWorkOrderDetailOpen} onOpenChange={setIsWorkOrderDetailOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Work Order Details</DialogTitle>
            </DialogHeader>
            {selectedWorkOrder && (
              <WorkOrderDetailsPanel 
                workOrder={selectedWorkOrder}
                onUnassign={handleUnassignWorkOrder}
                showAssignOption={true}
                technicians={technicians}
                onAssign={handleAssignWorkOrder}
                customerData={customerData[selectedWorkOrder.customerId]}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Dispatch;
