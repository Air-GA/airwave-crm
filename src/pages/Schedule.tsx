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
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import MaintenancePlanList, { MaintenanceMember } from "@/components/schedule/MaintenancePlanList";
import { DropArea } from "@/components/schedule/DropArea";

const quickWorkOrderSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  address: z.string().min(5, "Valid address is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  type: z.enum(["repair", "maintenance", "installation", "inspection"]),
  priority: z.enum(["low", "medium", "high", "emergency"]),
  description: z.string().min(10, "Description is required"),
  technicianId: z.string().optional(),
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
  const [draggedMaintenance, setDraggedMaintenance] = useState<MaintenanceMember | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.data.current?.type === 'maintenance-member') {
      const member = active.data.current.member as MaintenanceMember;
      
      if (over.id === 'calendar-drop-area') {
        setDraggedMaintenance(member);
        setIsCreateWorkOrderOpen(true);
        
        form.reset({
          customerName: member.customerName,
          address: member.address,
          phoneNumber: member.phoneNumber || '',
          email: member.email || '',
          type: 'maintenance',
          priority: 'medium',
          description: `Biannual maintenance service for ${member.customerName}`,
          technicianId: selectedTechnicianId || undefined
        });
      }
    }
  };

  const onSubmitQuickCreate = async (data: QuickWorkOrderFormValues) => {
    try {
      let scheduledDate = new Date(date);
      if (draggedMaintenance?.preferredTimeSlot) {
        const timeMatch = draggedMaintenance.preferredTimeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          const meridian = timeMatch[3].toUpperCase();
          
          if (meridian === 'PM' && hours < 12) hours += 12;
          if (meridian === 'AM' && hours === 12) hours = 0;
          
          scheduledDate.setHours(hours, minutes, 0, 0);
        } else {
          scheduledDate.setHours(10, 0, 0, 0);
        }
      } else {
        scheduledDate.setHours(10, 0, 0, 0);
      }
      
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
          : undefined,
        estimatedHours: 3
      });

      await loadData();
      
      setIsCreateWorkOrderOpen(false);
      setDraggedMaintenance(null);
      
      form.reset();

      toast({
        title: "Maintenance Appointment Created",
        description: `New maintenance appointment for ${data.customerName} has been scheduled.`,
      });
    } catch (error) {
      console.error("Failed to create maintenance appointment:", error);
      toast({
        title: "Error",
        description: "Failed to create maintenance appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const findNearbyMaintenanceMembers = (address: string) => {
    const streetMatch = address.match(/\d+\s+([A-Za-z]+)/);
    if (!streetMatch) return [];
    
    const street = streetMatch[1];
    return `Look for other maintenance members on ${street} Street to optimize technician routes`;
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
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
            <div className="grid gap-6 md:grid-cols-[280px_1fr_280px]">
              <div className="space-y-6">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle>Calendar</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pb-2">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      className="rounded-md border mx-auto w-full"
                      classNames={{
                        month: "space-y-4 w-full"
                      }}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Technicians</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y max-h-[300px] overflow-y-auto">
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
              
              <DropArea id="calendar-drop-area" className="h-full">
                <Card className="h-full border-2 border-dashed hover:border-primary transition-colors">
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
                      className="h-full"
                    />
                  </CardContent>
                </Card>
              </DropArea>
              
              <div className="space-y-6">
                <MaintenancePlanList />
              </div>
            </div>
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

          <Dialog open={isCreateWorkOrderOpen} onOpenChange={(open) => {
            setIsCreateWorkOrderOpen(open);
            if (!open) setDraggedMaintenance(null);
          }}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {draggedMaintenance ? "Schedule Maintenance Appointment" : "Quick Create Work Order"}
                </DialogTitle>
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
                        <FormLabel>Assign Technician{draggedMaintenance ? " (Required)" : " (Optional)"}</FormLabel>
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
                  
                  {draggedMaintenance && (
                    <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-md text-sm">
                      <div className="font-medium mb-1">Scheduling Information:</div>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Preferred Time: {draggedMaintenance.preferredTimeSlot}</li>
                        <li>Expected Duration: 3 hours</li>
                        <li>{findNearbyMaintenanceMembers(draggedMaintenance.address)}</li>
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsCreateWorkOrderOpen(false);
                        setDraggedMaintenance(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {draggedMaintenance ? "Schedule Maintenance" : "Create Work Order"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </MainLayout>
    </DndContext>
  );
};

export default Schedule;
