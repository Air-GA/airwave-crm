import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock, MapPin, User, Phone, Wrench } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function TechSchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">My Schedule</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <CalendarIcon className="mr-2 h-4 w-4" />
            View Calendar
          </Button>
          <Button>
            <Wrench className="mr-2 h-4 w-4" />
            Request Time Off
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>March 14, 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                time: "8:00 AM - 10:00 AM",
                customer: "Smith Residence",
                address: "123 Oak St, Atlanta, GA",
                type: "Maintenance",
                status: "Completed",
                contact: "John Smith",
                phone: "(404) 555-1234",
              },
              {
                time: "10:30 AM - 12:30 PM",
                customer: "Garcia Office Building",
                address: "456 Pine Ave, Atlanta, GA",
                type: "Repair",
                status: "Completed",
                contact: "Maria Garcia",
                phone: "(404) 555-5678",
              },
              {
                time: "1:30 PM - 3:30 PM",
                customer: "Johnson Residence",
                address: "789 Maple Dr, Atlanta, GA",
                type: "AC Repair",
                status: "In Progress",
                contact: "Robert Johnson",
                phone: "(404) 555-9012",
              },
              {
                time: "4:00 PM - 6:00 PM",
                customer: "Williams Family",
                address: "101 Elm Blvd, Atlanta, GA",
                type: "Installation",
                status: "Upcoming",
                contact: "Sarah Williams",
                phone: "(404) 555-3456",
              },
            ].map((appointment, i) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="md:flex md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{appointment.customer}</h3>
                      <Badge
                        variant={
                          appointment.status === "Completed"
                            ? "outline"
                            : appointment.status === "In Progress"
                              ? "secondary"
                              : "default"
                        }
                        className={
                          appointment.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : ""
                        }
                      >
                        {appointment.status}
                      </Badge>
                      <Badge
                        variant={
                          appointment.type === "Repair" || appointment.type === "AC Repair" ? "destructive" : "outline"
                        }
                      >
                        {appointment.type}
                      </Badge>
                    </div>
                    <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3 flex-shrink-0" />
                        {appointment.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{appointment.address}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="mr-1 h-3 w-3 flex-shrink-0" />
                        Contact: {appointment.contact}
                      </div>
                      <div className="flex items-center">
                        <Phone className="mr-1 h-3 w-3 flex-shrink-0" />
                        {appointment.phone}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {appointment.status === "Upcoming" && <Button size="sm">Start Job</Button>}
                      {appointment.status === "In Progress" && <Button size="sm">Complete</Button>}
                      {appointment.status === "Completed" && (
                        <Button variant="outline" size="sm">
                          View Report
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tomorrow's Schedule</CardTitle>
            <CardDescription>March 15, 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  time: "9:00 AM - 1:00 PM",
                  customer: "Williams Family",
                  address: "101 Elm Blvd, Atlanta, GA",
                  type: "Installation",
                  contact: "Sarah Williams",
                  phone: "(404) 555-3456",
                },
                {
                  time: "2:30 PM - 4:30 PM",
                  customer: "Davis Residence",
                  address: "404 Walnut Way, Atlanta, GA",
                  type: "Maintenance",
                  contact: "Michael Davis",
                  phone: "(404) 555-7890",
                },
              ].map((appointment, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{appointment.customer}</h3>
                      <Badge variant={appointment.type === "Repair" ? "destructive" : "outline"}>
                        {appointment.type}
                      </Badge>
                    </div>
                    <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3 flex-shrink-0" />
                        {appointment.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{appointment.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Overview</CardTitle>
            <CardDescription>March 14 - March 20, 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { day: "Monday", date: "March 17", count: 4 },
                { day: "Tuesday", date: "March 18", count: 3 },
                { day: "Wednesday", date: "March 19", count: 5 },
                { day: "Thursday", date: "March 20", count: 2 },
                { day: "Friday", date: "March 21", count: 3 },
              ].map((day, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{day.day}</p>
                    <p className="text-sm text-muted-foreground">{day.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{day.count} appointments</span>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
