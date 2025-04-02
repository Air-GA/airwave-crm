
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, Plus, UserRound } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/lib/date-utils";
import TechnicianScheduleView from "@/components/schedule/TechnicianScheduleView";
import { technicians, workOrders } from "@/data/mockData";

const Schedule = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  
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
                {selectedTechnician ? (
                  <TechnicianScheduleView
                    technician={selectedTechnician}
                    workOrders={workOrders}
                    selectedDate={date}
                  />
                ) : dateWorkOrders.length > 0 ? (
                  <div className="space-y-4">
                    {dateWorkOrders.map((apt) => (
                      <div key={apt.id} className="rounded-lg border p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <UserRound className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{apt.customerName}</span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatDate(new Date(apt.scheduledDate), { timeOnly: true })}</span>
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">{apt.address}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                              {apt.type}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Tech: {apt.technicianName || "Unassigned"}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <Button variant="outline" size="sm">Reschedule</Button>
                          <Button variant="default" size="sm">Details</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No appointments scheduled</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      There are no appointments scheduled for this date.
                    </p>
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" /> Schedule Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Schedule;
