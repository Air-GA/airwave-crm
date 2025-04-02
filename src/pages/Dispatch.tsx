
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { technicians, workOrders } from "@/data/mockData";
import { Calendar, Clock, MapPin, User, Briefcase, X } from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import { 
  DndContext, 
  DragEndEvent, 
  MouseSensor, 
  TouchSensor,
  useSensor, 
  useSensors, 
  DragStartEvent,
  DragOverlay,
  useDraggable,
  useDroppable 
} from "@dnd-kit/core";
import { toast } from "sonner";
import { WorkOrder } from "@/types";
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
import TechnicianScheduleView from "@/components/schedule/TechnicianScheduleView";
import { useToast } from "@/hooks/use-toast";

const Dispatch = () => {
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [draggedWorkOrders, setDraggedWorkOrders] = useState(workOrders);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [currentWorkOrderId, setCurrentWorkOrderId] = useState<string | null>(null);
  const [currentTechnicianId, setCurrentTechnicianId] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const { toast: uiToast } = useToast();
  
  const mouseSensor = useSensor(MouseSensor, {
    // Reduce the distance to start dragging for easier use
    activationConstraint: {
      distance: 5,
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    // Make touch interactions easier
    activationConstraint: {
      delay: 100,
      tolerance: 5,
    },
  });
  
  const sensors = useSensors(mouseSensor, touchSensor);
  
  // Get work orders that are pending or scheduled
  const activeWorkOrders = draggedWorkOrders.filter(
    order => order.status === 'pending' || order.status === 'scheduled'
  );
  
  // Get unassigned work orders
  const unassignedWorkOrders = activeWorkOrders.filter(order => !order.technicianId);
  
  // Get assigned work orders for the selected technician
  const technicianWorkOrders = selectedTechnicianId
    ? activeWorkOrders.filter(order => order.technicianId === selectedTechnicianId)
    : [];
  
  // Calculate technician status counts
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
      // Set up for schedule modal
      setCurrentWorkOrderId(workOrderId);
      setCurrentTechnicianId(technicianId);
      
      // Get the current work order
      const workOrder = draggedWorkOrders.find(order => order.id === workOrderId);
      
      // Pre-fill the date and time with today's date if not already scheduled
      if (workOrder) {
        const date = workOrder.scheduledDate ? new Date(workOrder.scheduledDate) : new Date();
        setScheduledDate(date.toISOString().split('T')[0]);
        setScheduledTime(date.toTimeString().substring(0, 5));
      }
      
      // Open the schedule modal
      setIsScheduleModalOpen(true);
    }
  };
  
  const handleScheduleConfirm = () => {
    if (!currentWorkOrderId || !currentTechnicianId) return;
    
    // Create a date object from the scheduled date and time
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
    
    // Update the work order with the new technician and schedule
    const updatedWorkOrders = draggedWorkOrders.map(order => {
      if (order.id === currentWorkOrderId) {
        const tech = technicians.find(t => t.id === currentTechnicianId);
        return {
          ...order,
          technicianId: currentTechnicianId,
          technicianName: tech?.name,
          status: 'scheduled' as const,  // Explicitly tell TypeScript this is a literal type
          scheduledDate: scheduledDateTime.toISOString(),
        };
      }
      return order;
    });
    
    setDraggedWorkOrders(updatedWorkOrders);
    setSelectedTechnicianId(currentTechnicianId);
    
    // Show success notification
    const workOrder = draggedWorkOrders.find(order => order.id === currentWorkOrderId);
    const technician = technicians.find(tech => tech.id === currentTechnicianId);
    
    toast.success(
      `Work Order #${workOrder?.id} assigned to ${technician?.name}`,
      {
        description: `${workOrder?.type} at ${workOrder?.address} - Scheduled for ${formatDate(scheduledDateTime)}`
      }
    );
    
    uiToast({
      title: "Assignment Successful",
      description: `Work Order #${workOrder?.id} has been assigned to ${technician?.name}`,
    });
    
    // Close the modal
    setIsScheduleModalOpen(false);
  };

  // Get the current technician and work order for the schedule modal
  const currentTechnician = technicians.find(tech => tech.id === currentTechnicianId);
  const currentWorkOrder = draggedWorkOrders.find(order => order.id === currentWorkOrderId);
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dispatch</h1>
            <p className="text-muted-foreground">Assign and track technicians</p>
          </div>
        </div>
        
        {/* Status summary */}
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
            <Tabs defaultValue="list">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
              </TabsList>

              {/* List View Tab - New drag-drop interface */}
              <TabsContent value="list" className="pt-4">
                <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
                  {/* Unassigned work orders list - draggable items */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Unassigned Work Orders
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-[700px] overflow-y-auto p-0">
                      {unassignedWorkOrders.length > 0 ? (
                        <div className="space-y-3 p-4">
                          {unassignedWorkOrders.map((order) => (
                            <DraggableWorkOrder 
                              key={order.id} 
                              order={order} 
                              isActive={activeOrderId === order.id}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Briefcase className="mx-auto h-8 w-8 text-muted-foreground" />
                          <h3 className="mt-3 text-lg font-medium">No Unassigned Work Orders</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            All work orders have been assigned to technicians.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Technicians Grid - Drop targets */}
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Technicians</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag work orders onto technicians to assign them. Click on a technician to view their scheduled work.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {technicians.map((technician) => (
                        <TechnicianDropTarget
                          key={technician.id}
                          technician={technician}
                          isSelected={selectedTechnicianId === technician.id}
                          onClick={() => setSelectedTechnicianId(technician.id)}
                          assignedCount={draggedWorkOrders.filter(order => order.technicianId === technician.id).length}
                        />
                      ))}
                    </div>

                    {/* Selected Technician Details */}
                    {selectedTechnicianId ? (
                      <Card className="mt-6">
                        <CardHeader className="pb-2">
                          <CardTitle>
                            {technicians.find(tech => tech.id === selectedTechnicianId)?.name}'s Work Orders
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {technicianWorkOrders.length > 0 ? (
                            <div className="space-y-3">
                              {technicianWorkOrders.map((order) => (
                                <div key={order.id} className="rounded-md border p-4">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium">#{order.id} - {order.type}</p>
                                    <Badge
                                      variant="outline"
                                      className={`
                                        ${order.status === 'scheduled' ? 'bg-amber-50 text-amber-700 hover:bg-amber-50' : ''}
                                        ${order.status === 'in-progress' ? 'bg-blue-50 text-blue-700 hover:bg-blue-50' : ''}
                                        ${order.status === 'pending' ? 'bg-gray-50 text-gray-700 hover:bg-gray-50' : ''}
                                      `}
                                    >
                                      {order.status}
                                    </Badge>
                                  </div>
                                  <div className="mt-2 space-y-1.5 text-sm">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <span>{order.customerName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-muted-foreground" />
                                      <span>{order.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <span>{formatDate(new Date(order.scheduledDate))}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <span>{formatDate(new Date(order.scheduledDate), { timeOnly: true })}</span>
                                    </div>
                                  </div>
                                  <div className="mt-3 flex justify-end">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        // Remove assignment
                                        const updatedWorkOrders = draggedWorkOrders.map(wo => {
                                          if (wo.id === order.id) {
                                            return {
                                              ...wo,
                                              technicianId: undefined,
                                              technicianName: undefined,
                                              status: 'pending' as const  // Explicitly tell TypeScript this is a literal type
                                            };
                                          }
                                          return wo;
                                        });
                                        setDraggedWorkOrders(updatedWorkOrders);
                                        toast.info(`Work Order #${order.id} unassigned`);
                                      }}
                                    >
                                      Unassign
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
                              <h3 className="mt-3 text-lg font-medium">No Assigned Work Orders</h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                This technician has no assigned work orders.
                                <br />
                                Drag work orders from the left to assign them.
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="mt-6">
                        <CardContent className="p-8 text-center">
                          <User className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-medium">No Technician Selected</h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Select a technician from above to view their assigned work orders.
                            <br />
                            Drag unassigned work orders to a technician to assign them.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Map View Tab */}
              <TabsContent value="map" className="pt-4">
                <Card className="overflow-hidden">
                  <div className="relative">
                    <div 
                      className="h-[500px] bg-cover bg-center" 
                      style={{ 
                        backgroundImage: "url('https://maps.googleapis.com/maps/api/staticmap?center=Atlanta,GA&zoom=11&size=1200x500&maptype=roadmap&key=USE_YOUR_API_KEY_HERE')",
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        backgroundColor: '#e5e7eb'
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60 text-center p-4">
                        <div>
                          <MapPin className="h-10 w-10 mx-auto text-primary" />
                          <h3 className="mt-2 text-lg font-medium">Google Maps Integration</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            A real Google Maps integration would be displayed here, showing technicians' locations and optimized routes.
                            <br />This requires a valid Google Maps API key and live data from technicians.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Select a technician on the map or from the list below to view their assigned work orders and route.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Drag Overlay for visual feedback */}
          <DragOverlay>
            {activeOrderId ? (
              <div className="rounded-md border p-3 bg-card shadow-md opacity-90 max-w-xs">
                {(() => {
                  const order = draggedWorkOrders.find(o => o.id === activeOrderId);
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

        {/* Enhanced Schedule Modal with Technician Schedule View */}
        <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Schedule Work Order</DialogTitle>
              <DialogDescription>
                Set the date and time for this work order assignment
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column: Work order details */}
              <div>
                {currentWorkOrder && (
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
                      
                      <div className="space-y-4 pt-2">
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
                        
                        {currentTechnician && (
                          <div>
                            <Label>Assigned To</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <div
                                className={`h-2.5 w-2.5 rounded-full
                                  ${currentTechnician.status === "available" ? "bg-green-500" : ""}
                                  ${currentTechnician.status === "busy" ? "bg-amber-500" : ""}
                                  ${currentTechnician.status === "off-duty" ? "bg-gray-500" : ""}
                                `}
                              />
                              <span>{currentTechnician.name}</span>
                              <Badge
                                variant="outline"
                                className={`ml-auto
                                  ${currentTechnician.status === 'available' ? 'bg-green-50 text-green-700' : ''}
                                  ${currentTechnician.status === 'busy' ? 'bg-amber-50 text-amber-700' : ''}
                                  ${currentTechnician.status === 'off-duty' ? 'bg-gray-50 text-gray-700' : ''}
                                `}
                              >
                                {currentTechnician.status}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Right column: Technician's schedule */}
              <div>
                {currentTechnician && scheduledDate && (
                  <TechnicianScheduleView
                    technician={currentTechnician}
                    workOrders={draggedWorkOrders}
                    selectedDate={new Date(`${scheduledDate}T00:00:00`)}
                  />
                )}
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button type="button" variant="secondary" onClick={() => setIsScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleScheduleConfirm}>
                Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

// Draggable Work Order Component
interface DraggableWorkOrderProps {
  order: WorkOrder;
  isActive: boolean;
}

const DraggableWorkOrder = ({ order, isActive }: DraggableWorkOrderProps) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: order.id,
  });
  
  return (
    <div 
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`rounded-md border p-3 bg-card hover:border-primary ${isActive ? 'opacity-50' : ''} cursor-grab active:cursor-grabbing`}
      style={{ touchAction: 'none' }}
    >
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
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{order.customerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">{order.address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(new Date(order.scheduledDate))}</span>
        </div>
      </div>
    </div>
  );
};

// Technician Drop Target Component
interface TechnicianDropTargetProps {
  technician: { id: string; name: string; status: string; currentLocation?: any; specialties: string[] };
  isSelected: boolean;
  onClick: () => void;
  assignedCount: number;
}

const TechnicianDropTarget = ({ technician, isSelected, onClick, assignedCount }: TechnicianDropTargetProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: technician.id,
  });
  
  return (
    <div 
      ref={setNodeRef}
      className={`
        rounded-lg border p-3 cursor-pointer
        ${isSelected ? 'border-primary bg-primary/5' : ''}
        ${isOver ? 'border-primary border-dashed bg-primary/5' : ''}
        hover:border-primary hover:bg-primary/5
      `}
      onClick={onClick}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className={`
            h-2 w-2 rounded-full
            ${technician.status === 'available' ? 'bg-green-500' : ''}
            ${technician.status === 'busy' ? 'bg-amber-500' : ''}
            ${technician.status === 'off-duty' ? 'bg-gray-500' : ''}
          `} />
          <p className="font-medium">{technician.name}</p>
          <Badge
            variant="outline"
            className={`ml-auto
              ${technician.status === 'available' ? 'bg-green-50 text-green-700 hover:bg-green-50' : ''}
              ${technician.status === 'busy' ? 'bg-amber-50 text-amber-700 hover:bg-amber-50' : ''}
              ${technician.status === 'off-duty' ? 'bg-gray-50 text-gray-700 hover:bg-gray-50' : ''}
            `}
          >
            {technician.status}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {technician.specialties.join(', ')}
        </div>
        <div className="text-xs">
          <span className="font-medium">Assigned:</span> {assignedCount} work orders
        </div>
        {technician.currentLocation && (
          <div className="text-xs truncate">
            <MapPin className="inline-block h-3 w-3 mr-1" />
            {technician.currentLocation.address}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dispatch;
