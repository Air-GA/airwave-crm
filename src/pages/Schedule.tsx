
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, Plus, UserRound } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/lib/date-utils";
import TechnicianScheduleView from "@/components/schedule/TechnicianScheduleView";
import { Technician, WorkOrder } from "@/types";
import { fetchTechnicians } from "@/services/technicianService";
import { fetchWorkOrders, useWorkOrderStore } from "@/services/workOrderService";
import { useToast } from "@/hooks/use-toast";

const Schedule = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Use the work orders from the store
  const workOrders = useWorkOrderStore(state => state.workOrders);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [techData, ordersData] = await Promise.all([
          fetchTechnicians(),
          fetchWorkOrders()
        ]);
        setTechnicians(techData);
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
    
    loadData();
  }, [toast]);
  
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
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
            <p className="text-muted-foreground">Manage appointments and technician schedules</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Appointment
          </Button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground">Loading schedule data...</p>
            </div>
          </div>
        ) : (
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
            </div>
            
            <div className="space-y-6">
              <Card>
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
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Schedule;
