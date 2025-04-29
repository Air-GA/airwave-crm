import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import TechLocationMap from "@/components/maps/TechLocationMap";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { 
  fetchTechnicians, 
  updateTechnicianLocation 
} from "@/services/technicianService";
import { 
  fetchWorkOrders, 
  assignWorkOrder, 
  unassignWorkOrder, 
  useWorkOrderStore 
} from "@/services/workOrderService";
import { WorkOrder, Technician } from "@/types";
import { WorkOrderDetailsPanel } from "@/components/workorders/WorkOrderDetailsPanel";

interface TechFilterProps {
  selectedTechnicianId: string; // Changed from any to string
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
    setSelectedWorkOrder(workOrder);
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
            <TechLocationMap selectedTechnicianId={selectedTechnicianId} />

            <Card>
              <CardHeader>
                <CardTitle>{`Schedule - ${formatDate(date)}`}</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTechnicianId && (
                  <TechnicianScheduleView
                    technician={technicians.find(t => t.id === selectedTechnicianId) || null}
                    workOrders={workOrders}
                    selectedDate={date}
                    onWorkOrderClick={handleWorkOrderClick}
                    isLoading={loading}
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
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Dispatch;
