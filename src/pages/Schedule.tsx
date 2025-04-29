import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

import MainLayout from "@/components/layout/MainLayout";
import TechnicianScheduleView from "@/components/schedule/TechnicianScheduleView";
import MaintenancePlanList from "@/components/schedule/MaintenancePlanList";
import { DndContext } from "@dnd-kit/core";
import {
  useWorkOrderStore,
  createWorkOrder,
  createMaintenanceWorkOrder,
  rescheduleMaintenanceWorkOrder,
} from "@/services/workOrderService";
import { fetchTechnicians, useTechnicianStore } from "@/services/technicianService";
import { WorkOrder } from "@/types";

export default function Schedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  const technicians = useTechnicianStore((state) => state.technicians);
  
  useEffect(() => {
    // Fetch technicians
    const loadTechnicians = async () => {
      try {
        await fetchTechnicians();
      } catch (error) {
        console.error("Failed to fetch technicians:", error);
      }
    };
    
    loadTechnicians();
  }, []);

  const refetchEvents = () => {
    // Implement refetch logic here
  };

  const handleDragStart = (item: any) => {
    setDraggedItem(item);
  };

  const handleDragEnd = async (event: any) => {
    const { over } = event;

    if (over && draggedItem) {
      const scheduledDate = over.id;

      if (draggedItem.isMaintenancePlan) {
        try {
          setIsSubmitting(true);
          await createMaintenanceWorkOrder(
            draggedItem,
            undefined,
            undefined,
            scheduledDate
          );
          toast({
            title: "Maintenance Work Order Scheduled",
            description: "The maintenance work order has been scheduled.",
          });
          refetchEvents();
        } catch (error) {
          console.error("Error scheduling maintenance work order:", error);
          toast({
            title: "Error",
            description:
              "Failed to schedule the maintenance work order. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsSubmitting(false);
          setDraggedItem(null);
        }
      } else {
        try {
          setIsRescheduling(true);
          await rescheduleMaintenanceWorkOrder(draggedItem.id, scheduledDate);
          toast({
            title: "Work Order Rescheduled",
            description: "The work order has been rescheduled.",
          });
          refetchEvents();
        } catch (error) {
          console.error("Error rescheduling work order:", error);
          toast({
            title: "Error",
            description:
              "Failed to reschedule the work order. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsRescheduling(false);
          setDraggedItem(null);
        }
      }
    }
  };

  const handleScheduleMaintenancePlan = async (plan: any) => {
    setDate(new Date());
    setIsAddEventDialogOpen(true);
  };

  const handleAddEvent = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      const newEvent: Omit<WorkOrder, "id" | "createdAt" | "updatedAt"> = {
        customerName: data.customerName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
        type: data.type as any,
        description: data.description,
        priority: data.priority as any,
        scheduledDate: data.date,
        status: data.technicianId ? "scheduled" : "pending",
        technicianId: data.technicianId,
        technicianName: data.technicianName,
        customerId: "temp-" + Date.now(),
      };
      
      await createWorkOrder(newEvent);
      
      toast({
        title: "Event Added",
        description: "The event has been added to the schedule.",
      });
      
      setIsAddEventDialogOpen(false);
      refetchEvents();
      
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error",
        description: "Failed to add the event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Select first technician by default or use null if no technicians
  const [selectedTechnician, setSelectedTechnician] = useState<any>(null);
  
  // Update selected technician when technicians are loaded
  useEffect(() => {
    if (technicians.length > 0 && !selectedTechnician) {
      setSelectedTechnician(technicians[0]);
    }
  }, [technicians, selectedTechnician]);
  
  // Handle work order click
  const handleWorkOrderClick = (workOrder: WorkOrder) => {
    console.log("Work order clicked:", workOrder);
    // Implement your work order click handler logic here
  };

  return (
    <MainLayout pageName="Schedule">
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <CalendarPicker date={date} setDate={setDate} />
            <MaintenancePlanList
              onDragStart={handleDragStart}
              onSchedule={handleScheduleMaintenancePlan}
            />
          </div>
          <DndContext onDragEnd={handleDragEnd}>
            <div className="col-span-2">
              <TechnicianScheduleView 
                selectedDate={date || new Date()}
                technician={selectedTechnician}
                onWorkOrderClick={handleWorkOrderClick}
              />
            </div>
          </DndContext>
        </div>
      </div>
      <AddEventDialog
        open={isAddEventDialogOpen}
        onClose={() => setIsAddEventDialogOpen(false)}
        onSubmit={handleAddEvent}
        selectedDate={date}
      />
    </MainLayout>
  );
}

interface CalendarPickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

function CalendarPicker({ date, setDate }: CalendarPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={
            "w-[280px] justify-start text-left font-normal" +
            (date ? "text-sm" : "text-muted-foreground")
          }
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface AddEventDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  selectedDate: Date | undefined;
}

function AddEventDialog({
  open,
  onClose,
  onSubmit,
  selectedDate,
}: AddEventDialogProps) {
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState("repair");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [date, setDate] = useState<Date | undefined>(selectedDate);
  const [technicianId, setTechnicianId] = useState<string | undefined>(
    undefined
  );
  const technicians = useTechnicianStore((state) => state.technicians);

  const handleSubmit = () => {
    const data = {
      customerName,
      email,
      phoneNumber,
      address,
      type,
      description,
      priority,
      date: date?.toISOString(),
      technicianId,
      technicianName:
        technicians.find((tech) => tech.id === technicianId)?.name || "",
    };
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
          <DialogDescription>Add a new event to the schedule.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customerName" className="text-right">
              Customer Name
            </Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phoneNumber" className="text-right">
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Address
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select value={type} onValueChange={(value) => setType(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              Priority
            </Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={
                    "w-[280px] justify-start text-left font-normal" +
                    (date ? "text-sm" : "text-muted-foreground")
                  }
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="technician" className="text-right">
              Technician
            </Label>
            <Select
              value={technicianId || ""}
              onValueChange={(value) => setTechnicianId(value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a technician" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((technician) => (
                  <SelectItem key={technician.id} value={technician.id}>
                    {technician.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Add Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
