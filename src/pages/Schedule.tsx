
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, Plus, UserRound } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/lib/date-utils";

const Schedule = () => {
  const [date, setDate] = useState<Date>(new Date());
  
  // Mock data for scheduling
  const appointments = [
    {
      id: "apt-001",
      customerName: "John Smith",
      address: "123 Main St, Atlanta, GA",
      time: "09:00 AM - 11:00 AM",
      type: "Maintenance",
      technicianName: "Mike Johnson"
    },
    {
      id: "apt-002",
      customerName: "Sarah Wilson",
      address: "456 Oak Ave, Marietta, GA",
      time: "12:30 PM - 02:30 PM",
      type: "Repair",
      technicianName: "David Chen"
    },
    {
      id: "apt-003",
      customerName: "Robert Brown",
      address: "789 Pine Rd, Decatur, GA",
      time: "03:00 PM - 05:00 PM",
      type: "Installation",
      technicianName: "Mike Johnson"
    }
  ];
  
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
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Appointments for {formatDate(date)}</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="rounded-lg border p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <UserRound className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{apt.customerName}</span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{apt.time}</span>
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">{apt.address}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                              {apt.type}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Tech: {apt.technicianName}
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
