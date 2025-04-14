import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, List, Map as MapIcon, Users } from "lucide-react";
import { format, addHours } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DispatchMap from "@/components/maps/DispatchMap";
import DispatchListView from "./components/DispatchListView";
import DispatchCalendarView from "./components/DispatchCalendarView";
import { getWorkOrders, useWorkOrderStore } from "@/services/workOrderService";
import { Technician, WorkOrder } from "@/types";
import { getTechnicians } from "@/services/technicianService";
import { useToast } from "@/hooks/use-toast";
import { useDndMonitor, DndContext } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

const Dispatch = () => {
  // State
  const [viewMode, setViewMode] = useState("list");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleSlot, setScheduleSlot] = useState<{ start: Date; end: Date; technicianId?: string }>({
    start: new Date(),
    end: addHours(new Date(), 2),
  });
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>(null);
  const [highlightedLocation, setHighlightedLocation] = useState<{lat: number; lng: number} | null>(null);
  
  // Hooks
  const { toast } = useToast();
  const workOrderStore = useWorkOrderStore();
  const workOrders = workOrderStore.workOrders;
  
  // Get all work orders that are either unassigned or belong to the selected technician
  const unassignedWorkOrders = workOrders.filter((order) => !order.technicianId && order.status === "pending");
  const technicianWorkOrders = selectedTechnicianId
    ? workOrders.filter((order) => order.technicianId === selectedTechnicianId)
    : [];
  
  // Update form
  const form = useForm({
    defaultValues: {
      technicianId: "",
      workOrderId: "",
      startTime: "",
      estimatedHours: "2",
      note: "",
    },
  });
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch technicians and work orders
        const [techData, workOrderData] = await Promise.all([
          fetchTechnicians(),
          getWorkOrders(),
        ]);
        
        // Make sure we're only dealing with residential work orders
        const residentialWorkOrders = workOrderData.filter(order => 
          !order.customerType || order.customerType === 'residential'
        );
        
        setTechnicians(techData);
        workOrderStore.setWorkOrders(residentialWorkOrders);
        
        // Sync customer data with work orders
        workOrderStore.syncWithCustomers();
        
      } catch (error) {
        console.error("Error loading dispatch data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load dispatch data",
          description: "Please try again later",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Set up a timer to refresh data every minute for real-time updates
    const refreshTimer = setInterval(() => {
      loadData();
    }, 60000);
    
    return () => clearInterval(refreshTimer);
  }, [toast, workOrderStore]);
  
  // Handle DnD events
  useDndMonitor({
    onDragEnd: (event) => {
      const { active, over } = event;
      
      if (!over) return;
      
      const workOrderId = active.id as string;
      const technicianId = over.id as string;
      
      if (workOrderId && technicianId && technicianId !== "unassigned") {
        handleAssignWorkOrder(workOrderId, technicianId);
      }
    },
  });
  
  // Handle technician selection
  const handleSelectTechnician = (techId: string) => {
    setSelectedTechnicianId(techId);
  };
  
  // Handle work order assignment
  const handleAssignWorkOrder = async (workOrderId: string, technicianId: string) => {
    try {
      // Find the work order and technician
      const workOrder = workOrderStore.getWorkOrderById(workOrderId);
      const technician = technicians.find((t) => t.id === technicianId);
      
      if (!workOrder || !technician) return;
      
      // Update the work order with the technician info
      const updatedWorkOrder: WorkOrder = {
        ...workOrder,
        technicianId: technician.id,
        technicianName: technician.name,
        status: workOrder.status === "pending" ? "scheduled" : workOrder.status,
      };
      
      // Save to database
      const { error } = await supabase.client
        .from("work_orders")
        .update({
          technician_id: technician.id,
          technician_name: technician.name,
          status: updatedWorkOrder.status,
        })
        .eq("id", workOrderId);
      
      if (error) throw error;
      
      // Update local state
      workOrderStore.updateWorkOrder(updatedWorkOrder);
      
      toast({
        title: "Work Order Assigned",
        description: `Assigned to ${technician.name}`,
      });
    } catch (error) {
      console.error("Error assigning work order:", error);
      toast({
        variant: "destructive",
        title: "Failed to assign work order",
        description: "Please try again",
      });
    }
  };
  
  // Handle work order unassignment
  const handleUnassignWorkOrder = async (workOrderId: string) => {
    try {
      const workOrder = workOrderStore.getWorkOrderById(workOrderId);
      if (!workOrder) return;
      
      // Update the work order to remove technician info
      const updatedWorkOrder: WorkOrder = {
        ...workOrder,
        technicianId: undefined,
        technicianName: undefined,
        status: "pending",
      };
      
      // Save to database
      const { error } = await supabase.client
        .from("work_orders")
        .update({
          technician_id: null,
          technician_name: null,
          status: "pending",
        })
        .eq("id", workOrderId);
      
      if (error) throw error;
      
      // Update local state
      workOrderStore.updateWorkOrder(updatedWorkOrder);
      
      toast({
        title: "Work Order Unassigned",
        description: "Work order returned to unassigned pool",
      });
    } catch (error) {
      console.error("Error unassigning work order:", error);
      toast({
        variant: "destructive",
        title: "Failed to unassign work order",
        description: "Please try again",
      });
    }
  };
  
  // Handle date selection in calendar
  const handleDateSelect = (start: Date, end: Date, technicianId?: string) => {
    setScheduleSlot({ start, end, technicianId });
    
    // Pre-fill the form
    form.setValue("startTime", format(start, "yyyy-MM-dd'T'HH:mm"));
    form.setValue("estimatedHours", String(Math.round((end.getTime() - start.getTime()) / 3600000)));
    
    if (technicianId) {
      form.setValue("technicianId", technicianId);
    }
    
    setShowScheduleDialog(true);
  };
  
  // Handle work order selection
  const handleWorkOrderSelect = (workOrderId: string) => {
    setActiveWorkOrderId(workOrderId);
    
    // We need to check if the work order exists first
    const workOrder = workOrderStore.getWorkOrderById(workOrderId);
    if (!workOrder) return;
    
    // For this demo, we'll just create a simulated location to highlight on the map
    setHighlightedLocation({ lat: 37.7749, lng: -122.4194 });
  };
  
  // Handle scheduling a work order
  const handleScheduleWorkOrder = async (data: any) => {
    try {
      // Find the selected work order and technician
      const workOrderId = data.workOrderId;
      const technicianId = data.technicianId;
      const workOrder = workOrderStore.getWorkOrderById(workOrderId);
      const technician = technicians.find((t) => t.id === technicianId);
      
      if (!workOrder || !technician) {
        throw new Error("Work order or technician not found");
      }
      
      // Update the work order with the schedule info
      const startDate = new Date(data.startTime);
      const updatedWorkOrder: WorkOrder = {
        ...workOrder,
        technicianId: technician.id,
        technicianName: technician.name,
        status: "scheduled",
        scheduledDate: startDate.toISOString(),
        estimatedHours: Number(data.estimatedHours),
        notes: [...(workOrder.notes || []), data.note]
      };
      
      // Save to database
      const { error } = await supabase.client
        .from("work_orders")
        .update({
          technician_id: technician.id,
          technician_name: technician.name,
          status: "scheduled",
          scheduled_date: startDate.toISOString(),
          estimated_hours: Number(data.estimatedHours),
          notes: [...(workOrder.notes || []), data.note]
        })
        .eq("id", workOrderId);
      
      if (error) throw error;
      
      // Update local state
      workOrderStore.updateWorkOrder(updatedWorkOrder);
      
      toast({
        title: "Work Order Scheduled",
        description: `Scheduled for ${format(startDate, "PPP p")}`,
      });
      
      setShowScheduleDialog(false);
    } catch (error) {
      console.error("Error scheduling work order:", error);
      toast({
        variant: "destructive",
        title: "Failed to schedule work order",
        description: "Please try again",
      });
    }
  };
  
  return (
    <MainLayout pageName="Dispatch">
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
            <div>
              <CardTitle className="text-2xl">Dispatch Management</CardTitle>
              <p className="text-muted-foreground">Assign and schedule technicians for residential jobs</p>
            </div>
            <Tabs value={viewMode} onValueChange={setViewMode} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="list" className="flex items-center">
                  <List className="mr-2 h-4 w-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center">
                  <MapIcon className="mr-2 h-4 w-4" />
                  Map View
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendar
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <DndContext>
              <TabsContent value="list" className="mt-0">
                <DispatchListView 
                  unassignedWorkOrders={unassignedWorkOrders}
                  technicians={technicians}
                  selectedTechnicianId={selectedTechnicianId}
                  technicianWorkOrders={technicianWorkOrders}
                  activeOrderId={activeWorkOrderId}
                  onSelectTechnician={handleSelectTechnician}
                  onUnassignWorkOrder={handleUnassignWorkOrder}
                />
              </TabsContent>
              
              <TabsContent value="map" className="mt-0">
                <Card>
                  <CardContent className="p-0">
                    <DispatchMap 
                      technicians={technicians}
                      onSelectTechnician={handleSelectTechnician}
                      selectedTechnicianId={selectedTechnicianId}
                      highlightedLocation={highlightedLocation}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="calendar" className="mt-0">
                <DispatchCalendarView
                  workOrders={workOrders}
                  technicians={technicians}
                  selectedTechnicianId={selectedTechnicianId}
                  activeOrderId={activeWorkOrderId}
                  onDateSelect={handleDateSelect}
                  onWorkOrderClick={handleWorkOrderSelect}
                  unassignedWorkOrders={unassignedWorkOrders}
                />
              </TabsContent>
            </DndContext>
          </CardContent>
        </Card>
      </div>
      
      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Work Order</DialogTitle>
            <DialogDescription>
              Assign a work order to a technician for the selected time slot.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleScheduleWorkOrder)} className="space-y-4">
              <FormField
                control={form.control}
                name="workOrderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Order</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a work order" />
                        </SelectTrigger>
                        <SelectContent>
                          {unassignedWorkOrders.map((order) => (
                            <SelectItem key={order.id} value={order.id}>
                              #{order.id.substring(0, 8)} - {order.customerName} - {order.type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="technicianId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technician</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a technician" />
                        </SelectTrigger>
                        <SelectContent>
                          {technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>
                              {tech.name} 
                              <Badge 
                                variant="outline" 
                                className={`ml-2 ${
                                  tech.status === "available" 
                                    ? "bg-green-100 text-green-800" 
                                    : tech.status === "busy" 
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {tech.status}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0.5" step="0.5" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any scheduling notes here..." 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Schedule Work Order</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Dispatch;
