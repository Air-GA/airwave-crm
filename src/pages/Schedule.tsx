import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, Plus, UserRound } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/lib/date-utils";
import TechnicianScheduleView from "@/components/schedule/TechnicianScheduleView";
import WorkOrderDetailsPanel from "@/components/workorders/WorkOrderDetailsPanel";
import { Technician, WorkOrder } from "@/types";
import { fetchTechnicians } from "@/services/technicianService";
import { fetchWorkOrders, useWorkOrderStore, updateWorkOrder, createWorkOrder } from "@/services/workOrderService";
import { useToast } from "@/hooks/use-toast";
import { SyncButton } from "@/components/SyncButton";
import { syncWorkOrdersFromCRM } from "@/services/crmSyncService";  
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MaintenancePlanList from "@/components/schedule/MaintenancePlanList";
import { 
  DndContext, 
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from "@dnd-kit/core";

// Quick work order schema for the dialog
const quickWorkOrderSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  address: z.string().min(5, "Valid address is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  type: z.enum(["repair", "maintenance", "installation", "inspection"]),
  priority: z.enum(["low", "medium", "high", "emergency"]),
  description: z.string().min(10, "Description is required"),
  technicianId: z.string().optional(),
  maintenanceTimePreference: z.string().optional(),
});

type QuickWorkOrderFormValues = z.infer<typeof quickWorkOrderSchema>;

const Schedule = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isWorkOrderDetailOpen, setIsWorkOrderDetailOpen] = useState(false);
  const [isCreateWorkOrderOpen, setIsCreateWorkOrderOpen] = useState(false);
  const [isMaintenanceOrderOpen, setIsMaintenanceOrderOpen] = useState(false);
  const [selectedMaintenanceItem, setSelectedMaintenanceItem] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Setup drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );
  
  // Use the work orders from the store
  const workOrders = useWorkOrderStore(state => state.workOrders);
  const setWorkOrders = useWorkOrderStore(state => state.setWorkOrders);
  const updateWorkOrderInStore = useWorkOrderStore(state => state.updateWorkOrder);
  
  // Default values for the quick work order form
  const defaultValues: Partial<QuickWorkOrderFormValues> = {
    type: "maintenance",
    priority: "medium",
  };

  // Form for quick work order creation
  const form = useForm<QuickWorkOrderFormValues>({
    resolver: zodResolver(quickWorkOrderSchema),
    defaultValues,
  });
  
  // Form for maintenance appointment creation
  const maintenanceForm = useForm<QuickWorkOrderFormValues>({
    resolver: zodResolver(quickWorkOrderSchema),
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setSyncError(null);
      console.log("Loading schedule data...");
      
      // Load technicians and work orders in parallel
      const [techData, ordersData] = await Promise.all([
        fetchTechnicians().catch(error => {
          console.error("Error fetching technicians:", error);
          return [];
        }),
        fetchWorkOrders().catch(error => {
          console.error("Error fetching work orders:", error);
          return [];
        })
      ]);
      
      // Even if one of the requests failed, we can still update the UI with what we have
      if (techData && techData.length > 0) {
        console.log(`Loaded ${techData.length} technicians`);
        setTechnicians(techData);
      } else {
        console.warn("No technicians data loaded");
      }
      
      if (ordersData && ordersData.length > 0) {
        console.log(`Loaded ${ordersData.length} work orders`);
        setWorkOrders(ordersData);
      } else {
        console.warn("No work orders data loaded");
        
        // If we failed to load work orders from the regular fetch, attempt to sync from CRM
        try {
          console.log("Attempting to sync work orders from CRM...");
          const syncedOrders = await syncWorkOrdersFromCRM();
          if (syncedOrders && syncedOrders.length > 0) {
            console.log(`Successfully synced ${syncedOrders.length} work orders from CRM`);
            setWorkOrders(syncedOrders);
          } else {
            setSyncError("Unable to load work orders. Please try syncing manually.");
          }
        } catch (syncError) {
          console.error("Error syncing work orders from CRM:", syncError);
          setSyncError("Unable to load work orders. Please try syncing manually.");
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "Error",
        description: "Failed to load schedule data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [toast]);

  // Sync function for work orders
  const handleSyncWorkOrders = async () => {
    try {
      const syncedOrders = await syncWorkOrdersFromCRM();
      if (syncedOrders && syncedOrders.length > 0) {
        setWorkOrders(syncedOrders);
        setSyncError(null);
        console.log(`Successfully synced ${syncedOrders.length} work orders`);
        return { success: true, orders: syncedOrders };
      }
      return { success: false };
    } catch (error) {
      console.error("Error syncing work orders:", error);
      throw error;
    }
  };
  
  // Filter work orders for the selected date, but preserve the original time
  const dateWorkOrders = workOrders.filter(order => {
    const orderDate = new Date(order.scheduledDate);
    return (
      orderDate.getFullYear() === date.getFullYear() &&
      orderDate.getMonth() === date.getMonth() &&
      orderDate.getDate() === date.getDate()
    );
  });
  
  // Sort work orders by time
  dateWorkOrders.sort((a, b) => 
    new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );
  
  // Get the selected technician
  const selectedTechnician = technicians.find(tech => tech.id === selectedTechnicianId);

  // Handle work order click to show details
  const handleWorkOrderClick = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setIsWorkOrderDetailOpen(true);
  };

  // Handle status update for work order
  const handleWorkOrderStatusUpdate = async () => {
    if (selectedWorkOrder) {
      try {
        // Refresh data after status change
        await loadData();
        toast({
          title: "Success",
          description: `Work order status updated successfully`,
        });
      } catch (error) {
        console.error("Failed to update work order:", error);
        toast({
          title: "Error",
          description: "Failed to update work order status",
          variant: "destructive",
        });
      }
    }
  };

  // Handle unassign technician
  const handleUnassignTechnician = async (workOrderId: string) => {
    try {
      const currentOrder = workOrders.find(order => order.id === workOrderId);
      if (!currentOrder) return;

      const updatedOrder = await updateWorkOrder(workOrderId, {
        technicianId: undefined,
        technicianName: undefined,
        status: 'pending'
      });
      
      if (updatedOrder) {
        updateWorkOrderInStore(updatedOrder);
        await loadData(); // Reload data to reflect changes
        toast({
          title: "Success",
          description: `Work order unassigned successfully`,
        });
      }
    } catch (error) {
      console.error("Failed to unassign work order:", error);
      toast({
        title: "Error",
        description: "Failed to unassign technician",
        variant: "destructive",
      });
    }
  };

  // Navigate to create new appointment
  const handleNewAppointment = () => {
    navigate('/work-orders/create');
  };

  // Open quick create dialog
  const handleQuickCreate = () => {
    setIsCreateWorkOrderOpen(true);
  };

  // Handle quick create form submission
  const onSubmitQuickCreate = async (data: QuickWorkOrderFormValues) => {
    try {
      // Set the time part of the date
      const scheduledDate = new Date(date);
      scheduledDate.setHours(10, 0, 0, 0); // Default to 10:00 AM
      
      // Create the work order
      const newWorkOrder = await createWorkOrder({
        customerName: data.customerName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
        type: data.type,
        description: data.description,
        priority: data.priority,
        scheduledDate: scheduledDate.toISOString(),
        status: data.technicianId ? 'scheduled' : 'pending',
        technicianId: data.technicianId || undefined,
        technicianName: data.technicianId 
          ? technicians.find(t => t.id === data.technicianId)?.name 
          : undefined
      });

      // Refresh work orders
      await loadData();
      
      // Close the dialog
      setIsCreateWorkOrderOpen(false);
      
      // Reset the form
      form.reset();

      toast({
        title: "Work Order Created",
        description: `New work order for ${data.customerName} has been created.`,
      });
    } catch (error) {
      console.error("Failed to create work order:", error);
      toast({
        title: "Error",
        description: "Failed to create work order. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle maintenance item drag start
  const handleMaintenanceDragStart = (item: any) => {
    console.log("Maintenance drag started:", item);
  };
  
  // Handle maintenance item drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // Check if we dropped onto the calendar area
    if (over.id === "calendar-drop-area") {
      const maintenanceItem = active.data.current;
      setSelectedMaintenanceItem(maintenanceItem);
      
      // Pre-populate the maintenance form
      maintenanceForm.reset({
        customerName: maintenanceItem.customerName,
        address: maintenanceItem.address,
        phoneNumber: "", // This would come from your customer data
        email: "", // This would come from your customer data
        type: "maintenance",
        priority: "medium",
        description: "Biannual HVAC maintenance service",
        maintenanceTimePreference: maintenanceItem.preferredTime
      });
      
      setIsMaintenanceOrderOpen(true);
    }
  };
  
  // Handle maintenance schedule click
  const handleMaintenanceSchedule = (item: any) => {
    setSelectedMaintenanceItem(item);
    
    // Pre-populate the maintenance form
    maintenanceForm.reset({
      customerName: item.customerName,
      address: item.address,
      phoneNumber: "", // This would come from your customer data
      email: "", // This would come from your customer data
      type: "maintenance",
      priority: "medium",
      description: "Biannual HVAC maintenance service",
      maintenanceTimePreference: item.preferredTime
    });
    
    setIsMaintenanceOrderOpen(true);
  };
  
  // Handle maintenance form submission
  const onSubmitMaintenanceCreate = async (data: QuickWorkOrderFormValues) => {
    try {
      // Parse the preferred time to get start time
      let scheduledDate = new Date(date);
      const timePreference = data.maintenanceTimePreference || "8:00 AM - 11:00 AM";
      const startHour = parseInt(timePreference.split(':')[0]);
      const isPM = timePreference.includes('PM') && startHour !== 12;
      
      // Set the scheduled time
      scheduledDate.setHours(isPM ? startHour + 12 : startHour, 0, 0, 0);
      
      // Create the maintenance work order
      const newWorkOrder = await createWorkOrder({
        customerName: data.customerName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
        type: "maintenance",
        description: data.description,
        priority: data.priority,
        scheduledDate: scheduledDate.toISOString(),
        status: data.technicianId ? 'scheduled' : 'pending',
        technicianId: data.technicianId || undefined,
        technicianName: data.technicianId 
          ? technicians.find(t => t.id === data.technicianId)?.name 
          : undefined,
        estimatedHours: 3, // 3 hours for HVAC maintenance
        isMaintenancePlan: true,
        maintenanceTimePreference: data.maintenanceTimePreference
      });

      // Refresh work orders
      await loadData();
      
      // Close the dialog
      setIsMaintenanceOrderOpen(false);
      
      // Reset the form
      maintenanceForm.reset();

      toast({
        title: "Maintenance Scheduled",
        description: `HVAC maintenance for ${data.customerName} has been scheduled.`,
      });
    } catch (error) {
      console.error("Failed to create maintenance order:", error);
      toast({
        title: "Error",
        description: "Failed to schedule maintenance. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
            <p className="text-muted-foreground">Manage appointments and technician schedules</p>
          </div>
          <div className="flex gap-2">
            <SyncButton onSync={handleSyncWorkOrders} label="Work Orders" />
            <Button onClick={handleQuickCreate} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Quick Create
            </Button>
            <Button onClick={handleNewAppointment}>
              <Plus className="mr-2 h-4 w-4" /> New Appointment
            </Button>
          </div>
        </div>
        
        {syncError && (
          <Alert variant="destructive">
            <AlertDescription>{syncError}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground">Loading schedule data...</p>
            </div>
          </div>
        ) : (
          <DndContext 
            sensors={sensors} 
            onDragEnd={handleDragEnd}
          >
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
                      className="rounded-md border pointer-events-auto"
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
                      <div
                        className={`cursor-pointer p-3 transition-colors hover:bg-muted ${
                          selectedTechnicianId === null ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedTechnicianId(null)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          <p>All Technicians</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <MaintenancePlanList 
                  onDragStart={handleMaintenanceDragStart}
                  onSchedule={handleMaintenanceSchedule}
                />
              </div>
              
              <div className="space-y-6">
                <Card id="calendar-drop-area" className="relative">
                  <CardHeader className="pb-2">
                    <CardTitle>
                      {selectedTechnician 
                        ? `${selectedTechnician.name}'s Schedule - ${formatDate(date)}`
                        : `All Appointments - ${formatDate(date)}`
                      }
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TechnicianScheduleView
                      technician={selectedTechnician}
                      workOrders={workOrders}
                      selectedDate={date}
                      showAllAppointments={!selectedTechnician}
                      onWorkOrderClick={handleWorkOrderClick}
                      isLoading={loading}
                    />
                  </CardContent>
                  <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-transparent transition-colors duration-200 rounded-lg data-[droppable=true]:border-primary data-[droppable=true]:bg-primary/5" data-droppable="true" />
                </Card>
              </div>
            </div>
          </DndContext>
        )}

        <Dialog open={isWorkOrderDetailOpen} onOpenChange={setIsWorkOrderDetailOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Work Order Details</DialogTitle>
            </DialogHeader>
            {selectedWorkOrder && (
              <WorkOrderDetailsPanel 
                workOrder={selectedWorkOrder}
                onUnassign={handleUnassignTechnician} 
                showCompletionOptions={true}
                onStatusUpdate={handleWorkOrderStatusUpdate}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateWorkOrderOpen} onOpenChange={setIsCreateWorkOrderOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Quick Create Work Order</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitQuickCreate)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="customer@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="installation">Installation</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="repair">Repair</SelectItem>
                            <SelectItem value="inspection">Inspection</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="technicianId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Technician (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a technician" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>
                              {tech.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the service needed" 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateWorkOrderOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Work Order</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isMaintenanceOrderOpen} onOpenChange={setIsMaintenanceOrderOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule HVAC Maintenance</DialogTitle>
            </DialogHeader>
            <Form {...maintenanceForm}>
              <form onSubmit={maintenanceForm.handleSubmit(onSubmitMaintenanceCreate)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={maintenanceForm.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={maintenanceForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={maintenanceForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="customer@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={maintenanceForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={maintenanceForm.control}
                    name="maintenanceTimePreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select preferred time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="8:00 AM - 11:00 AM">8:00 AM - 11:00 AM</SelectItem>
                            <SelectItem value="11:00 AM - 2:00 PM">11:00 AM - 2:00 PM</SelectItem>
                            <SelectItem value="2:00 PM - 5:00 PM">2:00 PM - 5:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={maintenanceForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || "medium"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={maintenanceForm.control}
                  name="technicianId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Technician</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a technician" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>
                              {tech.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={maintenanceForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Details about the maintenance service" 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsMaintenanceOrderOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Schedule Maintenance</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Schedule;
