import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, Plus, UserRound, CalendarClock, RefreshCw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/lib/date-utils";
import TechnicianScheduleView from "@/components/schedule/TechnicianScheduleView";
import WorkOrderDetailsPanel from "@/components/workorders/WorkOrderDetailsPanel";
import { Technician, WorkOrder } from "@/types";
import { fetchTechnicians } from "@/services/technicianService";
import { 
  fetchWorkOrders, 
  useWorkOrderStore, 
  updateWorkOrder, 
  createWorkOrder,
  createMaintenanceWorkOrder,
  rescheduleMaintenanceWorkOrder
} from "@/services/workOrderService";
import { useToast } from "@/hooks/use-toast";
import { SyncThreeCustomersButton } from "@/components/SyncThreeCustomersButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiIntegrationService } from "@/services/apiIntegrationService";
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

const maintenanceOrderSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  address: z.string().min(5, "Valid address is required"),
  phoneNumber: z.string().optional(),
  email: z.string().email("Valid email is required").optional(),
  technicianId: z.string().optional(),
  scheduledDate: z.date({
    required_error: "Please select a date",
  }),
  timeSlot: z.string().min(1, "Please select a time slot"),
  notes: z.string().optional(),
});

type MaintenanceOrderFormValues = z.infer<typeof maintenanceOrderSchema>;

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
  
  const workOrders = useWorkOrderStore(state => state.workOrders);
  const setWorkOrders = useWorkOrderStore(state => state.setWorkOrders);
  const updateWorkOrderInStore = useWorkOrderStore(state => state.updateWorkOrder);
  
  const defaultValues: Partial<QuickWorkOrderFormValues> = {
    type: "maintenance",
    priority: "medium",
  };

  const form = useForm<QuickWorkOrderFormValues>({
    resolver: zodResolver(quickWorkOrderSchema),
    defaultValues,
  });
  
  const maintenanceForm = useForm<MaintenanceOrderFormValues>({
    resolver: zodResolver(maintenanceOrderSchema),
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setSyncError(null);
      console.log("Loading schedule data...");
      
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
          console.error("Error syncing work orders:", syncError);
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
  
  const dateWorkOrders = workOrders.filter(order => {
    const orderDate = new Date(order.scheduledDate);
    return (
      orderDate.getFullYear() === date.getFullYear() &&
      orderDate.getMonth() === date.getMonth() &&
      orderDate.getDate() === date.getDate()
    );
  });
  
  dateWorkOrders.sort((a, b) => 
    new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );
  
  const selectedTechnician = technicians.find(tech => tech.id === selectedTechnicianId);

  const handleWorkOrderClick = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setIsWorkOrderDetailOpen(true);
  };

  const handleWorkOrderStatusUpdate = async () => {
    if (selectedWorkOrder) {
      try {
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
        await loadData();
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

  const handleNewAppointment = () => {
    navigate('/work-orders/create');
  };

  const handleQuickCreate = () => {
    setIsCreateWorkOrderOpen(true);
  };

  const onSubmitQuickCreate = async (data: QuickWorkOrderFormValues) => {
    try {
      const scheduledDate = new Date(date);
      scheduledDate.setHours(10, 0, 0, 0);
      
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

      await loadData();
      
      setIsCreateWorkOrderOpen(false);
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
  
  const handleMaintenanceDragStart = (item: any) => {
    console.log("Maintenance drag started:", item);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (over.id === "calendar-drop-area") {
      const maintenanceItem = active.data.current;
      setSelectedMaintenanceItem(maintenanceItem);
      
      const scheduledDate = new Date(date);
      
      let timeSlot = maintenanceItem.preferredTime || "8:00 AM - 11:00 AM";
      
      maintenanceForm.reset({
        customerName: maintenanceItem.customerName,
        address: maintenanceItem.address,
        phoneNumber: "",
        email: "",
        scheduledDate: scheduledDate,
        timeSlot: timeSlot,
        notes: ""
      });
      
      setIsMaintenanceOrderOpen(true);
    }
  };
  
  const handleMaintenanceSchedule = (item: any) => {
    setSelectedMaintenanceItem(item);
    
    const scheduledDate = new Date(date);
    
    maintenanceForm.reset({
      customerName: item.customerName,
      address: item.address,
      phoneNumber: "",
      email: "",
      scheduledDate: scheduledDate,
      timeSlot: item.preferredTime || "8:00 AM - 11:00 AM",
      notes: ""
    });
    
    setIsMaintenanceOrderOpen(true);
  };
  
  const onSubmitMaintenanceCreate = async (data: MaintenanceOrderFormValues) => {
    try {
      const timeSlot = data.timeSlot;
      const startTimeMatch = timeSlot.match(/(\d+):(\d+)\s*([AP]M)/);
      
      if (!startTimeMatch) {
        toast({
          title: "Error",
          description: "Invalid time format",
          variant: "destructive",
        });
        return;
      }
      
      let hours = parseInt(startTimeMatch[1]);
      const minutes = parseInt(startTimeMatch[2]);
      const isPM = startTimeMatch[3] === "PM" && hours !== 12;
      
      if (isPM) hours += 12;
      if (startTimeMatch[3] === "AM" && hours === 12) hours = 0;
      
      const scheduledDate = new Date(data.scheduledDate);
      scheduledDate.setHours(hours, minutes, 0, 0);
      
      const technicianName = data.technicianId 
        ? technicians.find(t => t.id === data.technicianId)?.name 
        : undefined;
      
      const workOrder = await createMaintenanceWorkOrder(
        selectedMaintenanceItem,
        data.technicianId,
        technicianName,
        scheduledDate.toISOString()
      );

      await loadData();
      
      setIsMaintenanceOrderOpen(false);
      
      maintenanceForm.reset();

      toast({
        title: "Maintenance Scheduled",
        description: `HVAC maintenance for ${data.customerName} has been scheduled for ${formatDate(scheduledDate)}.`,
      });
    } catch (error) {
      console.error("Failed to schedule maintenance:", error);
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
            <div className="grid gap-6 md:grid-cols-[300px_1fr_350px]">
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
              </div>
              
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
              
              <MaintenancePlanList 
                onDragStart={handleMaintenanceDragStart}
                onSchedule={handleMaintenanceSchedule}
              />
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
                        <FormLabel>Phone Number (Optional)</FormLabel>
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
                        <FormLabel>Email (Optional)</FormLabel>
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
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  formatDate(field.value)
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={maintenanceForm.control}
                    name="timeSlot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Slot</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time slot" />
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any special instructions or notes" 
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
