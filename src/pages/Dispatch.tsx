
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { 
  RefreshCw, 
  Calendar as CalendarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { WorkOrderDetailsPanel } from "@/components/workorders/WorkOrderDetailsPanel";
import { useToast } from "@/hooks/use-toast";
import { Technician, WorkOrder } from "@/types";
import DragAndDropScheduler from "@/components/schedule/DragAndDropScheduler";

const Dispatch = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isWorkOrderDetailOpen, setIsWorkOrderDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("schedule");
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // We're clearing the data as requested, so just set empty arrays
      setTechnicians([]);
      setWorkOrders([]);
      
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

  const handleWorkOrderUpdated = () => {
    loadData();
  };

  const handleUnassignWorkOrder = async (workOrderId: string) => {
    console.log("Unassigning work order:", workOrderId);
    await loadData();
    toast({
      title: "Work Order Unassigned",
      description: "The technician has been unassigned from this work order.",
    });
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dispatch</h1>
            <p className="text-muted-foreground">
              Manage technician schedules and work orders
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDate(date)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Button onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="schedule" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
          </TabsList>
          <TabsContent value="schedule" className="space-y-4 mt-2">
            <Card className="flex-1">
              <CardHeader className="py-3">
                <CardTitle>Technician Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <DragAndDropScheduler
                  technicians={technicians}
                  workOrders={workOrders}
                  selectedDate={date}
                  isLoading={loading}
                  onWorkOrderUpdated={handleWorkOrderUpdated}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Technician Locations</CardTitle>
              </CardHeader>
              <CardContent className="h-[600px]">
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Map view is ready for data to be uploaded
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isWorkOrderDetailOpen} onOpenChange={setIsWorkOrderDetailOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Work Order Details</DialogTitle>
            </DialogHeader>
            {selectedWorkOrder && (
              <WorkOrderDetailsPanel 
                workOrder={selectedWorkOrder}
                showAssignOption={true}
                technicians={technicians}
                onAssign={async () => {
                  await handleWorkOrderUpdated();
                  setIsWorkOrderDetailOpen(false);
                }}
                onUnassign={handleUnassignWorkOrder}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Dispatch;
