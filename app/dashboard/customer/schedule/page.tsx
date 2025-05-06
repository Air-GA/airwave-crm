import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ScheduleServicePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Schedule Service</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="order-2 md:order-1">
          <CardHeader>
            <CardTitle>Request Service</CardTitle>
            <CardDescription>Schedule a new service appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service-type">Service Type</Label>
                <Select defaultValue="maintenance">
                  <SelectTrigger id="service-type">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="installation">Installation</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Preferred Date</Label>
                <Input type="date" id="date" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Preferred Time</Label>
                <Select defaultValue="morning">
                  <SelectTrigger id="time">
                    <SelectValue placeholder="Select preferred time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12PM - 4PM)</SelectItem>
                    <SelectItem value="evening">Evening (4PM - 7PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description of Issue</Label>
                <Textarea id="description" placeholder="Please describe the issue or service needed" />
              </div>

              <Button type="submit" className="w-full">
                Schedule Service
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="order-1 md:order-2">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled service appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  date: "Mar 25, 2025",
                  time: "Morning (8AM - 12PM)",
                  type: "Annual Maintenance",
                  address: "123 Main St, Atlanta, GA",
                },
              ].map((appointment, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{appointment.type}</h3>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                          {appointment.date}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3 flex-shrink-0" />
                          {appointment.time}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                          {appointment.address}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                    <Button variant="destructive" size="sm">
                      Cancel
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
