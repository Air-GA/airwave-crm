
// First, let's create a separate file to avoid having everything in one huge file
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DndContext, 
  DragEndEvent, 
  MouseSensor, 
  TouchSensor,
  useSensor, 
  useSensors, 
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { WorkOrder, Technician } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { fetchTechnicians } from "@/services/technicianService";
import { fetchWorkOrders, assignWorkOrder, unassignWorkOrder, useWorkOrderStore } from "@/services/workOrderService";

// Import components
import TechnicianDropTarget from "./components/TechnicianDropTarget";
import DraggableWorkOrder from "./components/DraggableWorkOrder";
import TechnicianScheduleView from "@/components/schedule/TechnicianScheduleView";
import DispatchMap from "@/components/maps/DispatchMap";
import DispatchCalendarView from "@/components/schedule/DispatchCalendarView";
import DispatchListView from "./components/DispatchListView";

// Import UI components
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, User, Briefcase, MapIcon } from "lucide-react";
import { formatDate } from "@/lib/date-utils";

const Dispatch = () => {
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [currentWorkOrderId, setCurrentWorkOrderId] = useState<string | null>(null);
  const [currentTechnicianId, setCurrentTechnicianId] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list");
  const { toast: uiToast } = useToast();

  const workOrders = useWorkOrderStore(state => state.workOrders);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [techs, orders] = await Promise.all([
          fetchTechnicians(),
          fetchWorkOrders()
        ]);
        setTechnicians(techs);
      } catch (error) {
        console.error("Failed to load data:", error);
        uiToast({
          title: "Error",
          description: "Failed to load dispatch data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [uiToast]);
  
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100,
      tolerance: 5,
    },
  });
  
  const sensors = useSensors(mouseSensor, touchSensor);
  
  const activeWorkOrders = workOrders.filter(
    order => order.status === 'pending' || order.status === 'scheduled'
  );
  
  const unassignedWorkOrders = activeWorkOrders.filter(order => !order.technicianId);
  
  const technicianWorkOrders = selectedTechnicianId
    ? activeWorkOrders.filter(order => order.technicianId === selectedTechnicianId)
    : [];
  
  const availableTechnicians = technicians.filter(tech => tech.status === 'available').length;
  const busyTechnicians = technicians.filter(tech => tech.status === 'busy').length;
  const offDutyTechnicians = technicians.filter(tech => tech.status === 'off-duty').length;
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveOrderId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveOrderId(null);
    
    if (!over) return;
    
    const workOrderId = active.id as string;
    const technicianId = over.id as string;
    
    if (workOrderId && technicianId) {
      setCurrentWorkOrderId(workOrderId);
      setCurrentTechnicianId(technicianId);
      
      const workOrder = workOrders.find(order => order.id === workOrderId);
      
      if (workOrder) {
        const date = workOrder.scheduledDate ? new Date(workOrder.scheduledDate) : new Date();
        setScheduledDate(date.toISOString().split('T')[0]);
        setScheduledTime(date.toTimeString().substring(0, 5));
      }
      
      setIsScheduleModalOpen(true);
    }
  };
  
  const handleScheduleConfirm = async () => {
    if (!currentWorkOrderId || !currentTechnicianId) return;
    
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
    
    try {
      const technician = technicians.find(t => t.id === currentTechnicianId);
      if (!technician) return;
      
      const updatedOrder = await assignWorkOrder(
        currentWorkOrderId,
        currentTechnicianId,
        technician.name,
        scheduledDateTime.toISOString()
      );
      
      setSelectedTechnicianId(currentTechnicianId);
      
      toast.success(
        `Work Order #${updatedOrder.id} assigned to ${technician.name}`,
        {
          description: `${updatedOrder.type} at ${updatedOrder.address} - Scheduled for ${formatDate(scheduledDateTime)}`
        }
      );
      
      uiToast({
        title: "Assignment Successful",
        description: `Work Order #${updatedOrder.id} has been assigned to ${technician.name}`,
      });
    } catch (error) {
      console.error("Failed to assign work order:", error);
      uiToast({
        title: "Error",
        description: "Failed to assign work order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScheduleModalOpen(false);
    }
  };

  const handleUnassignWorkOrder = async (orderId: string) => {
    try {
      await unassignWorkOrder(orderId);
      toast.info(`Work Order #${orderId} unassigned`);
    } catch (error) {
      console.error("Failed to unassign work order:", error);
      uiToast({
        title: "Error",
        description: "Failed to unassign work order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCalendarDateSelect = (start: Date, end: Date) => {
    // Only open scheduling dialog if we have unassigned work orders
    if (unassignedWorkOrders.length === 0) {
      toast.info("No unassigned work orders available");
      return;
    }
    
    if (!currentTechnicianId && selectedTechnicianId) {
      setCurrentTechnicianId(selectedTechnicianId);
    }
    
    setScheduledDate(start.toISOString().split('T')[0]);
    setScheduledTime(start.toTimeString().substring(0, 5));
    
    setIsScheduleModalOpen(true);
  };

  const handleWorkOrderClick = (workOrderId: string) => {
    const workOrder = workOrders.find(order => order.id === workOrderId);
    if (workOrder) {
      setCurrentWorkOrderId(workOrderId);
      setCurrentTechnicianId(workOrder.technicianId || null);
      
      const date = new Date(workOrder.scheduledDate);
      setScheduledDate(date.toISOString().split('T')[0]);
      setScheduledTime(date.toTimeString().substring(0, 5));
      
      setIsScheduleModalOpen(true);
    }
  };

  const currentTechnician = technicians.find(tech => tech.id === currentTechnicianId);
  const currentWorkOrder = workOrders.find(order => order.id === currentWorkOrderId);
  
  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Dispatch</h1>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground">Loading dispatch data...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dispatch</h1>
            <p className="text-muted-foreground">Assign and track technicians</p>
          </div>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Total Technicians</p>
                <Badge>{technicians.length}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Available</p>
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                  {availableTechnicians}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Busy</p>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                  {busyTechnicians}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Off Duty</p>
                <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
                  {offDutyTechnicians}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <DndContext 
          sensors={sensors} 
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <div className="grid gap-6">
            <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="pt-4">
                {/* ... List view content moved to a separate component */}
                <DispatchListView 
                  unassignedWorkOrders={unassignedWorkOrders}
                  technicians={technicians}
                  selectedTechnicianId={selectedTechnicianId}
                  technicianWorkOrders={technicianWorkOrders}
                  activeOrderId={activeOrderId}
                  onSelectTechnician={setSelectedTechnicianId}
                  onUnassignWorkOrder={handleUnassignWorkOrder}
                />
              </TabsContent>

              <TabsContent value="calendar" className="pt-4">
                <div className="grid gap-4 md:grid-cols-[250px_1fr]">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Calendar className="h-5 w-5" />
                        Calendar Controls
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="techSelect">View Technician:</Label>
                          <Select 
                            value={selectedTechnicianId || "all"} 
                            onValueChange={(value) => setSelectedTechnicianId(value === "all" ? null : value)}
                          >
                            <SelectTrigger id="techSelect" className="mt-1.5">
                              <SelectValue placeholder="All Technicians" />
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
                        </div>
                        
                        <div className="pt-2">
                          <Label>Unassigned Work Orders:</Label>
                          {unassignedWorkOrders.length > 0 ? (
                            <div className="space-y-2 mt-1.5 max-h-[400px] overflow-y-auto">
                              {unassignedWorkOrders.map((order) => (
                                <DraggableWorkOrder 
                                  key={order.id} 
                                  order={order} 
                                  isActive={activeOrderId === order.id}
                                  compact
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground mt-2">
                              No unassigned work orders
                            </div>
                          )}
                        </div>
                        
                        <div className="border-t pt-4 mt-4">
                          <p className="text-sm font-medium">Instructions:</p>
                          <ul className="text-xs space-y-1.5 mt-1.5 text-muted-foreground">
                            <li>• Drag work orders to the calendar</li>
                            <li>• Click on time slots to schedule</li>
                            <li>• Click on events to edit details</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                
                  <div>
                    <DispatchCalendarView 
                      workOrders={workOrders}
                      technicians={technicians}
                      selectedTechnicianId={selectedTechnicianId}
                      onDateSelect={handleCalendarDateSelect}
                      onWorkOrderClick={handleWorkOrderClick}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="map" className="pt-4">
                <div className="grid gap-4 md:grid-cols-[300px_1fr]">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <MapIcon className="h-5 w-5" />
                        Technician Locations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                          Click on a technician's marker on the map to select them.
                        </div>
                        
                        <div className="space-y-2">
                          {technicians.map((tech) => (
                            <div 
                              key={tech.id}
                              className={`flex items-center p-2 rounded-md cursor-pointer
                                ${selectedTechnicianId === tech.id ? 'bg-primary/10' : 'hover:bg-muted'}
                              `}
                              onClick={() => setSelectedTechnicianId(tech.id)}
                            >
                              <div 
                                className={`h-3 w-3 rounded-full mr-2
                                  ${tech.status === 'available' ? 'bg-green-500' : ''}
                                  ${tech.status === 'busy' ? 'bg-amber-500' : ''}
                                  ${tech.status === 'off-duty' ? 'bg-gray-500' : ''}
                                `}
                              />
                              <span className="font-medium">{tech.name}</span>
                              <Badge
                                variant="outline"
                                className={`ml-auto text-xs
                                  ${tech.status === 'available' ? 'bg-green-50 text-green-700' : ''}
                                  ${tech.status === 'busy' ? 'bg-amber-50 text-amber-700' : ''}
                                  ${tech.status === 'off-duty' ? 'bg-gray-50 text-gray-700' : ''}
                                `}
                              >
                                {tech.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        
                        {selectedTechnicianId && (
                          <div className="mt-4 pt-4 border-t">
                            <h3 className="text-sm font-medium mb-2">
                              {technicians.find(t => t.id === selectedTechnicianId)?.name}'s Unassigned Work
                            </h3>
                            {unassignedWorkOrders.length > 0 ? (
                              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {unassignedWorkOrders.map((order) => (
                                  <div
                                    key={order.id}
                                    className="text-xs p-2 border rounded-md cursor-pointer hover:bg-muted"
                                    onClick={() => {
                                      setCurrentWorkOrderId(order.id);
                                      setCurrentTechnicianId(selectedTechnicianId);
                                      
                                      const now = new Date();
                                      setScheduledDate(now.toISOString().split('T')[0]);
                                      setScheduledTime(now.toTimeString().substring(0, 5));
                                      
                                      setIsScheduleModalOpen(true);
                                    }}
                                  >
                                    <div className="font-medium">#{order.id} - {order.type}</div>
                                    <div className="text-muted-foreground mt-1">
                                      {order.address}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                No unassigned work orders available
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <DispatchMap 
                    technicians={technicians}
                    onSelectTechnician={setSelectedTechnicianId}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DragOverlay>
            {activeOrderId ? (
              <div className="rounded-md border p-3 bg-card shadow-md opacity-90 max-w-xs">
                {(() => {
                  const order = workOrders.find(o => o.id === activeOrderId);
                  if (!order) return null;
                  return (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">#{order.id} - {order.type}</p>
                        <Badge
                          variant="outline"
                          className={`
                            ${order.priority === 'low' ? 'bg-gray-50 text-gray-700' : ''}
                            ${order.priority === 'medium' ? 'bg-blue-50 text-blue-700' : ''}
                            ${order.priority === 'high' ? 'bg-amber-50 text-amber-700' : ''}
                            ${order.priority === 'emergency' ? 'bg-red-50 text-red-700' : ''}
                          `}
                        >
                          {order.priority}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        {order.customerName}
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {currentWorkOrderId && currentWorkOrder 
                  ? `Edit Work Order #${currentWorkOrderId}`
                  : "Schedule New Work Order"}
              </DialogTitle>
              <DialogDescription>
                {currentWorkOrderId && currentWorkOrder
                  ? "Update the details and assignment for this work order"
                  : "Select a work order and assign it to a technician"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {currentWorkOrderId && currentWorkOrder ? (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Work Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold">#{currentWorkOrder.id} - {currentWorkOrder.type}</h4>
                        <Badge
                          className={`mt-1
                            ${currentWorkOrder.priority === 'low' ? 'bg-gray-100 text-gray-800' : ''}
                            ${currentWorkOrder.priority === 'medium' ? 'bg-blue-100 text-blue-800' : ''}
                            ${currentWorkOrder.priority === 'high' ? 'bg-amber-100 text-amber-800' : ''}
                            ${currentWorkOrder.priority === 'emergency' ? 'bg-red-100 text-red-800' : ''}
                          `}
                        >
                          {currentWorkOrder.priority}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{currentWorkOrder.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{currentWorkOrder.address}</span>
                        </div>
                        <p className="mt-2 text-muted-foreground">{currentWorkOrder.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Select Work Order</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Label htmlFor="workOrderSelect">Work Order</Label>
                      <Select 
                        onValueChange={(value) => setCurrentWorkOrderId(value)}
                        value={currentWorkOrderId || ""}
                      >
                        <SelectTrigger id="workOrderSelect" className="mt-1.5">
                          <SelectValue placeholder="Select a work order" />
                        </SelectTrigger>
                        <SelectContent>
                          {unassignedWorkOrders.map((order) => (
                            <SelectItem key={order.id} value={order.id}>
                              #{order.id} - {order.type} - {order.customerName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {currentWorkOrderId && (
                        <div className="mt-4">
                          <p className="text-sm font-medium">Selected Work Order:</p>
                          {(() => {
                            const order = workOrders.find(o => o.id === currentWorkOrderId);
                            if (!order) return null;
                            return (
                              <div className="mt-2 p-3 border rounded-md text-sm">
                                <div className="font-medium">#{order.id} - {order.type}</div>
                                <div className="mt-1 space-y-1 text-muted-foreground">
                                  <div>{order.customerName}</div>
                                  <div>{order.address}</div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="technicianSelect">Assigned Technician</Label>
                    <Select 
                      value={currentTechnicianId || ""} 
                      onValueChange={setCurrentTechnicianId}
                    >
                      <SelectTrigger id="technicianSelect" className="mt-1.5">
                        <SelectValue placeholder="Select a technician" />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians
                          .filter(tech => tech.status !== 'off-duty')
                          .map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>
                              {tech.name} ({tech.status})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                {currentTechnicianId && scheduledDate && (
                  <TechnicianScheduleView
                    technician={technicians.find(t => t.id === currentTechnicianId) || null}
                    workOrders={workOrders}
                    selectedDate={new Date(`${scheduledDate}T00:00:00`)}
                  />
                )}
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setIsScheduleModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleScheduleConfirm}
                disabled={!currentWorkOrderId || !currentTechnicianId || !scheduledDate || !scheduledTime}
              >
                {currentWorkOrder?.technicianId ? "Update Assignment" : "Schedule Work Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Dispatch;
