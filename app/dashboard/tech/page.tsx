import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarClock, MapPin, Clock, CheckCircle, Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function TechDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Jobs</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">2 completed, 3 remaining</p>
            <Progress value={40} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1:30 PM</div>
            <p className="text-xs text-muted-foreground">Johnson Residence - AC Repair</p>
            <Button variant="outline" className="mt-3 w-full">
              View Details
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parts Needed</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">For upcoming jobs</p>
            <Button variant="outline" className="mt-3 w-full">
              Request Parts
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Efficiency</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
            <Progress value={92} className="mt-3 h-2" />
          </CardContent>
        </Card>
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
                time: "8:00 AM",
                customer: "Smith Residence",
                address: "123 Oak St, Atlanta, GA",
                type: "Maintenance",
                status: "Completed",
              },
              {
                time: "10:30 AM",
                customer: "Garcia Office Building",
                address: "456 Pine Ave, Atlanta, GA",
                type: "Repair",
                status: "Completed",
              },
              {
                time: "1:30 PM",
                customer: "Johnson Residence",
                address: "789 Maple Dr, Atlanta, GA",
                type: "AC Repair",
                status: "Upcoming",
              },
              {
                time: "3:00 PM",
                customer: "Williams Family",
                address: "101 Elm Blvd, Atlanta, GA",
                type: "Installation",
                status: "Upcoming",
              },
              {
                time: "5:00 PM",
                customer: "Taylor Residence",
                address: "202 Cedar Ln, Atlanta, GA",
                type: "Estimate",
                status: "Upcoming",
              },
            ].map((appointment, i) => (
              <div key={i} className="flex items-start justify-between rounded-lg border p-4">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <Clock className="h-6 w-6 text-slate-700" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {appointment.time} - {appointment.customer}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3" />
                      {appointment.address}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={appointment.type === "Repair" ? "destructive" : "outline"}>
                        {appointment.type}
                      </Badge>
                      {appointment.status === "Completed" ? (
                        <Badge variant="success" className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          Upcoming
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Parts Inventory</CardTitle>
            <CardDescription>Parts in your truck inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Air Filter (MERV 13)", quantity: 8, status: "In Stock" },
                { name: "Capacitor 45/5 MFD", quantity: 3, status: "In Stock" },
                { name: "Contactor 30A", quantity: 2, status: "In Stock" },
                { name: "Refrigerant R-410A", quantity: 1, status: "Low Stock" },
                { name: "Thermostat (Smart)", quantity: 0, status: "Out of Stock" },
              ].map((part, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{part.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {part.quantity}</p>
                  </div>
                  <Badge
                    variant={
                      part.status === "In Stock" ? "outline" : part.status === "Low Stock" ? "secondary" : "destructive"
                    }
                  >
                    {part.status}
                  </Badge>
                </div>
              ))}
              <Button variant="link" className="px-0">
                Request Restock
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Work Orders</CardTitle>
            <CardDescription>Work orders requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "WO-2025-0342",
                  customer: "Davis Residence",
                  issue: "Furnace not heating",
                  priority: "High",
                  date: "Mar 15, 2025",
                },
                {
                  id: "WO-2025-0339",
                  customer: "Martinez Office",
                  issue: "AC not cooling properly",
                  priority: "Medium",
                  date: "Mar 16, 2025",
                },
                {
                  id: "WO-2025-0336",
                  customer: "Wilson Residence",
                  issue: "Annual maintenance",
                  priority: "Low",
                  date: "Mar 17, 2025",
                },
              ].map((order, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{order.customer}</p>
                        <Badge
                          variant={
                            order.priority === "High"
                              ? "destructive"
                              : order.priority === "Medium"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {order.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.id} • {order.date}
                      </p>
                      <p className="text-sm">{order.issue}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Details
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
