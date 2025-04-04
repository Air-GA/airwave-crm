import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { format, parseISO } from 'date-fns';
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Phone, Mail, CheckCircle, AlertTriangle, Clock, UserRound, Truck, GripVertical, MoreVertical, FileEdit, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  fetchMockTechnicians,
  fetchMockWorkOrders,
  updateMockWorkOrder,
  updateMockTechnician,
  completeMockWorkOrder,
  markWorkOrderPendingCompletion
} from "@/services/mockService";
import { syncTechniciansFromCRM, syncWorkOrdersFromCRM, pushWorkOrderUpdateToCRM, pushTechnicianUpdateToCRM } from "@/services/crmSyncService";
import { Technician, WorkOrder } from "@/types";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const Dispatch = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [showWorkOrderDetails, setShowWorkOrderDetails] = useState(false);
  const [showTechnicianDetails, setShowTechnicianDetails] = useState(false);
  const [isCompletingWorkOrder, setIsCompletingWorkOrder] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [isMarkingPendingCompletion, setIsMarkingPendingCompletion] = useState(false);
  const [pendingReason, setPendingReason] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPushingUpdates, setIsPushingUpdates] = useState(false);
  const [isTechnicianDialogOpen, setIsTechnicianDialogOpen] = useState(false);
  const [editedTechnician, setEditedTechnician] = useState<Technician | null>(null);
  const [editedTechnicianStatus, setEditedTechnicianStatus] = useState<Technician["status"]>("available");
  const [editedTechnicianAddress, setEditedTechnicianAddress] = useState("");
  const [editedTechnicianLat, setEditedTechnicianLat] = useState<number | undefined>(undefined);
  const [editedTechnicianLng, setEditedTechnicianLng] = useState<number | undefined>(undefined);
  const [editedTechnicianSkills, setEditedTechnicianSkills] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>([]);
  const [isMobile] = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapContainerStyle = {
    width: "100%",
    height: "400px",
    borderRadius: "0.375rem",
    border: "1px solid #e4e4e7",
  };
  const defaultLocation = { lat: 33.7490, lng: -84.3880 }; // Default to Atlanta, GA
  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const techniciansData = await fetchMockTechnicians();
      setTechnicians(techniciansData);

      const workOrdersData = await fetchMockWorkOrders();
      setWorkOrders(workOrdersData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const syncDataFromCRM = async () => {
    setIsSyncing(true);
    try {
      const syncedTechnicians = await syncTechniciansFromCRM();
      setTechnicians(syncedTechnicians);

      const syncedWorkOrders = await syncWorkOrdersFromCRM();
      setWorkOrders(syncedWorkOrders);

      toast({
        title: "Sync Complete",
        description: "Data has been synced from the CRM.",
      });
    } catch (error) {
      console.error("Error syncing data:", error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync data from the CRM. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTechnicianStatusChange = async (technician: Technician, status: Technician["status"]) => {
    try {
      const updatedTechnician: Technician = { ...technician, status };
      await updateMockTechnician(updatedTechnician);
      setTechnicians(
        technicians.map((tech) =>
          tech.id === technician.id ? updatedTechnician : tech
        )
      );

      setTechnicians((prevTechnicians) =>
        prevTechnicians.map((tech) =>
          tech.id === technician.id ? { ...tech, status: status } : tech
        )
      );

      toast({
        title: "Technician Updated",
        description: `${technician.name}'s status has been updated to ${status}.`,
      });

      setIsPushingUpdates(true);
      const success = await pushTechnicianUpdateToCRM(updatedTechnician);
      if (!success) {
        toast({
          title: "CRM Update Failed",
          description: `Failed to push ${technician.name}'s status update to the CRM.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating technician status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update technician status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPushingUpdates(false);
    }
  };

  const handleWorkOrderStatusChange = async (workOrder: WorkOrder, status: WorkOrder["status"]) => {
    try {
      const updatedWorkOrder: WorkOrder = { ...workOrder, status };
      await updateMockWorkOrder(updatedWorkOrder);
      setWorkOrders(
        workOrders.map((wo) =>
          wo.id === workOrder.id ? updatedWorkOrder : wo
        )
      );

      setWorkOrders((prevWorkOrders) =>
        prevWorkOrders.map((wo) =>
          wo.id === workOrder.id ? { ...wo, status: status } : wo
        )
      );

      toast({
        title: "Work Order Updated",
        description: `Work order #${workOrder.id} status has been updated to ${status}.`,
      });

      setIsPushingUpdates(true);
      const success = await pushWorkOrderUpdateToCRM(updatedWorkOrder);
      if (!success) {
        toast({
          title: "CRM Update Failed",
          description: `Failed to push work order #${workOrder.id} status update to the CRM.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating work order status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update work order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPushingUpdates(false);
    }
  };

  const handleCompleteWorkOrder = async () => {
    if (!selectedWorkOrder) return;

    setIsCompletingWorkOrder(true);
    try {
      const updatedWorkOrder = await completeMockWorkOrder(selectedWorkOrder.id, completionNotes);

      setWorkOrders((prevWorkOrders) =>
        prevWorkOrders.map((wo) =>
          wo.id === selectedWorkOrder.id ? updatedWorkOrder : wo
        )
      );

      setShowWorkOrderDetails(false);
      setCompletionNotes("");

      toast({
        title: "Work Order Completed",
        description: `Work order #${selectedWorkOrder.id} has been marked as completed.`,
      });

      setIsPushingUpdates(true);
      const success = await pushWorkOrderUpdateToCRM(updatedWorkOrder);
      if (!success) {
        toast({
          title: "CRM Update Failed",
          description: `Failed to push work order #${selectedWorkOrder.id} completion status to the CRM.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error completing work order:", error);
      toast({
        title: "Completion Failed",
        description: "Failed to complete work order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompletingWorkOrder(false);
      setIsPushingUpdates(false);
    }
  };

  const handleMarkPendingCompletion = async () => {
    if (!selectedWorkOrder) return;

    setIsMarkingPendingCompletion(true);
    try {
      const updatedWorkOrder = await markWorkOrderPendingCompletion(selectedWorkOrder.id, pendingReason);

      setWorkOrders((prevWorkOrders) =>
        prevWorkOrders.map((wo) =>
          wo.id === selectedWorkOrder.id ? updatedWorkOrder : wo
        )
      );

      setShowWorkOrderDetails(false);
      setPendingReason("");

      toast({
        title: "Work Order Updated",
        description: `Work order #${selectedWorkOrder.id} has been marked as pending completion.`,
      });

      setIsPushingUpdates(true);
      const success = await pushWorkOrderUpdateToCRM(updatedWorkOrder);
      if (!success) {
        toast({
          title: "CRM Update Failed",
          description: `Failed to push work order #${selectedWorkOrder.id} pending completion status to the CRM.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error marking work order as pending completion:", error);
      toast({
        title: "Update Failed",
        description: "Failed to mark work order as pending completion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMarkingPendingCompletion(false);
      setIsPushingUpdates(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const { source, destination, draggableId } = result;

    if (destination.droppableId.startsWith('technician-')) {
      const technicianId = destination.droppableId.split('-')[1];
      const technician = technicians.find(t => t.id === technicianId);
      const workOrder = workOrders.find(wo => wo.id === draggableId);

      if (technician && workOrder) {
        const updatedWorkOrder: WorkOrder = {
          ...workOrder,
          technicianId: technician.id,
          technicianName: technician.name,
          status: 'scheduled'
        };

        setWorkOrders((prevWorkOrders) =>
          prevWorkOrders.map((wo) =>
            wo.id === workOrder.id ? updatedWorkOrder : wo
          )
        );

        updateMockWorkOrder(updatedWorkOrder)
          .then(() => {
            toast({
              title: "Work Order Assigned",
              description: `Work order #${workOrder.id} has been assigned to ${technician.name}.`,
            });

            setIsPushingUpdates(true);
            pushWorkOrderUpdateToCRM(updatedWorkOrder)
              .then(success => {
                if (!success) {
                  toast({
                    title: "CRM Update Failed",
                    description: `Failed to push work order #${workOrder.id} assignment to the CRM.`,
                    variant: "destructive",
                  });
                }
              })
              .catch(error => {
                console.error("Error pushing work order update to CRM:", error);
                toast({
                  title: "CRM Update Failed",
                  description: `Failed to push work order #${workOrder.id} assignment to the CRM.`,
                  variant: "destructive",
                });
              })
              .finally(() => setIsPushingUpdates(false));
          })
          .catch(error => {
            console.error("Error updating work order:", error);
            toast({
              title: "Update Failed",
              description: "Failed to update work order. Please try again.",
              variant: "destructive",
            });
          });
      }
    }
  };

  const handleOpenTechnicianDialog = (technician: Technician) => {
    setEditedTechnician(technician);
    setEditedTechnicianStatus(technician.status);
    setEditedTechnicianAddress(technician.current_location_address || "");
    setEditedTechnicianLat(technician.current_location_lat);
    setEditedTechnicianLng(technician.current_location_lng);
    setEditedTechnicianSkills(technician.specialties ? technician.specialties.join(", ") : "");
    setIsTechnicianDialogOpen(true);
  };

  const handleCloseTechnicianDialog = () => {
    setIsTechnicianDialogOpen(false);
    setEditedTechnician(null);
  };

  const handleSaveTechnician = async () => {
    if (!editedTechnician) return;

    try {
      const updatedTechnician: Technician = {
        ...editedTechnician,
        status: editedTechnicianStatus,
        specialties: editedTechnicianSkills.split(",").map((skill) => skill.trim()),
        current_location_address: editedTechnicianAddress,
        current_location_lat: editedTechnicianLat,
        current_location_lng: editedTechnicianLng,
      };

      await updateMockTechnician(updatedTechnician);

      setTechnicians((prevTechnicians) =>
        prevTechnicians.map((tech) =>
          tech.id === editedTechnician.id ? updatedTechnician : tech
        )
      );

      handleCloseTechnicianDialog();

      toast({
        title: "Technician Updated",
        description: `${editedTechnician.name}'s details have been updated.`,
      });

      setIsPushingUpdates(true);
      const success = await pushTechnicianUpdateToCRM(updatedTechnician);
      if (!success) {
        toast({
          title: "CRM Update Failed",
          description: `Failed to push ${editedTechnician.name}'s details update to the CRM.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating technician:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update technician. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPushingUpdates(false);
    }
  };

  const geocodeAddress = (address: string): Promise<{ lat: number, lng: number } | null> => {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          console.error("Geocoding failed:", status);
          reject(null);
        }
      });
    });
  };

  const handleAddressChange = async (address: string) => {
    setEditedTechnicianAddress(address);
    try {
      const location = await geocodeAddress(address);
      if (location) {
        setEditedTechnicianLat(location.lat);
        setEditedTechnicianLng(location.lng);
      } else {
        setEditedTechnicianLat(undefined);
        setEditedTechnicianLng(undefined);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setEditedTechnicianLat(undefined);
      setEditedTechnicianLng(undefined);
    }
  };

  useEffect(() => {
    const filtered = technicians.filter(technician =>
      technician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (technician.specialties && technician.specialties.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())))
    );
    setFilteredTechnicians(filtered);
  }, [technicians, searchQuery]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dispatch</h1>
            <p className="text-muted-foreground">
              Manage technicians and work orders
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={syncDataFromCRM} disabled={isSyncing}>
              {isSyncing ? "Syncing..." : "Sync from CRM"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/work-orders/create")}>
              Create Work Order
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Technicians</CardTitle>
              <Input
                type="search"
                placeholder="Search technicians..."
                className="max-w-sm h-8 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="divide-y divide-border">
                  {filteredTechnicians.map((technician) => (
                    <div
                      key={technician.id}
                      className="flex items-center justify-between p-3 hover:bg-secondary/50"
                    >
                      <div className="flex items-center space-x-2">
                        <UserRound className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium leading-none">
                          {technician.name}
                        </span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-6 w-6 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenTechnicianDialog(technician)}>
                            Edit Technician
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedTechnician(technician)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            View Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            View Performance
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled>
                            Send Message (Coming Soon)
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-red-500">
                                  Remove Technician
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently
                                    remove{" "}
                                    {technician.name} from our
                                    database.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="md:col-span-2 flex flex-col space-y-6">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Technician Locations</CardTitle>
                <Button variant="outline" size="sm">
                  Show All
                </Button>
              </CardHeader>
              <CardContent>
                <LoadScript googleMapsApiKey={googleMapsApiKey}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    zoom={10}
                    center={defaultLocation}
                    options={mapOptions}
                  >
                    {technicians.map((technician) => {
                      const position = {
                        lat: technician.current_location_lat || defaultLocation.lat, 
                        lng: technician.current_location_lng || defaultLocation.lng
                      };
                      return (
                        <Marker
                          key={technician.id}
                          position={position}
                          onClick={() => setSelectedTechnician(technician)}
                        >
                          {selectedTechnician?.id === technician.id && (
                            <InfoWindow onCloseClick={() => setSelectedTechnician(null)}>
                              <div>
                                <h3 className="font-semibold">{technician.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {technician.status}
                                </p>
                              </div>
                            </InfoWindow>
                          )}
                        </Marker>
                      );
                    })}
                  </GoogleMap>
                </LoadScript>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
                <Select onValueChange={(value) => console.log(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-550px)]">
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="work-orders-list">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="divide-y divide-border"
                        >
                          {workOrders.map((workOrder, index) => (
                            <Draggable key={workOrder.id} draggableId={workOrder.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="flex items-center justify-between p-3 hover:bg-secondary/50 cursor-move"
                                >
                                  <div className="flex items-center space-x-2">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium leading-none">
                                      {workOrder.customerName}
                                    </span>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-6 w-6 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => {
                                        setSelectedWorkOrder(workOrder);
                                        setShowWorkOrderDetails(true);
                                      }}>
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => navigate(`/work-orders/${workOrder.id}`)}>
                                        Edit Work Order
                                      </DropdownMenuItem>
                                      <DropdownMenuItem disabled>
                                        Send Update (Coming Soon)
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-red-500">
                                              Cancel Work Order
                                            </DropdownMenuItem>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This action cannot be undone. This will permanently
                                                cancel work order{" "}
                                                {workOrder.id}
                                                .
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Card className="md:col-span-1">
            <CardHeader className="flex items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Technician Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTechnician ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">{selectedTechnician.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedTechnician.specialties?.join(", ") || "No specialties"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {selectedTechnician.current_location_address || "No location"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        (123) 456-7890
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        john.doe@example.com
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={selectedTechnician.status}
                      onValueChange={(value) =>
                        handleTechnicianStatusChange(selectedTechnician, value as Technician["status"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                        <SelectItem value="off-duty">Off Duty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Actions</Label>
                    <div className="grid gap-2">
                      <Button variant="outline" onClick={() => setShowTechnicianDetails(true)}>
                        View Details
                      </Button>
                      <Button>Assign Work Order</Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Work Orders</Label>
                    <ScrollArea className="h-24">
                      <div className="divide-y divide-border">
                        {workOrders
                          .filter((wo) => wo.technicianId === selectedTechnician.id)
                          .map((workOrder) => (
                            <div
                              key={workOrder.id}
                              className="flex items-center justify-between p-2 hover:bg-secondary/50"
                            >
                              <span className="text-sm font-medium leading-none">
                                {workOrder.customerName}
                              </span>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  Select a technician to view details
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showWorkOrderDetails} onOpenChange={setShowWorkOrderDetails}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Work Order Details</DialogTitle>
            <DialogDescription>
              View and manage work order details.
            </DialogDescription>
          </DialogHeader>

          {selectedWorkOrder ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Customer Name</Label>
                  <p className="text-sm font-medium">{selectedWorkOrder.customerName}</p>
                </div>
                <div>
                  <Label>Address</Label>
                  <p className="text-sm font-medium">{selectedWorkOrder.address}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="text-sm font-medium">{selectedWorkOrder.type}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <p className="text-sm font-medium">{selectedWorkOrder.priority}</p>
                </div>
                <div>
                  <Label>Scheduled Date</Label>
                  <p className="text-sm font-medium">
                    {format(parseISO(selectedWorkOrder.scheduledDate), 'PPP')}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge
                    variant="secondary"
                    className={
                      selectedWorkOrder.status === "completed"
                        ? "bg-green-500 text-white"
                        : selectedWorkOrder.status === "pending"
                          ? "bg-yellow-500 text-black"
                          : "bg-blue-500 text-white"
                    }
                  >
                    {selectedWorkOrder.status}
                  </Badge>
                </div>
                <div>
                  <Label>Technician</Label>
                  <p className="text-sm font-medium">
                    {selectedWorkOrder.technicianName || "Not assigned"}
                  </p>
                </div>
                <div>
                  <Label>Estimated Hours</Label>
                  <p className="text-sm font-medium">
                    {selectedWorkOrder.estimatedHours || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <p className="text-sm font-medium">
                  {selectedWorkOrder.description}
                </p>
              </div>

              {selectedWorkOrder.notes && selectedWorkOrder.notes.length > 0 && (
                <div>
                  <Label>Notes</Label>
                  <ul className="text-sm font-medium list-disc pl-5">
                    {selectedWorkOrder.notes.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedWorkOrder.status === "pending-completion" && (
                <div className="bg-yellow-50 p-3 rounded-md">
                  <p className="text-sm text-yellow-700 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span>Pending Completion: {selectedWorkOrder.pendingReason}</span>
                  </p>
                </div>
              )}
              
              <DialogFooter className="sm:justify-start">
                <div className="flex gap-2">
                  {selectedWorkOrder.status !== "completed" && (
                    <Button onClick={handleCompleteWorkOrder} disabled={isCompletingWorkOrder}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {isCompletingWorkOrder ? "Completing..." : "Complete Work Order"}
                    </Button>
                  )}
                  
                  {selectedWorkOrder.status !== "pending-completion" && selectedWorkOrder.status !== "completed" && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowWorkOrderDetails(false);
                        setPendingReason("");
                        setIsMarkingPendingCompletion(false);
                      }}
                    >
                      Mark as Pending
                    </Button>
                  )}
                  
                  <Button variant="ghost" onClick={() => setShowWorkOrderDetails(false)}>
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              No work order selected.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Dispatch;
