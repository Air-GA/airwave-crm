import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarClock, FileText, CreditCard, Wrench, ThermometerSun, ThermometerSnowflake } from "lucide-react"

export default function CustomerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Service</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">March 25, 2025</div>
            <p className="text-xs text-muted-foreground">Annual Maintenance</p>
            <Button variant="outline" className="mt-4 w-full">
              Reschedule
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <ThermometerSun className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Operational</div>
            <p className="text-xs text-muted-foreground">Last checked: Today</p>
            <div className="mt-4 flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="ml-2 text-sm">All systems normal</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">Last payment: Feb 15, 2025</p>
            <Button variant="outline" className="mt-4 w-full">
              View Billing
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Service History</CardTitle>
            <CardDescription>Your recent service appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: "Jan 15, 2025", type: "Repair", tech: "John Smith", status: "Completed" },
                { date: "Oct 10, 2024", type: "Maintenance", tech: "Sarah Johnson", status: "Completed" },
                { date: "Jul 22, 2024", type: "Installation", tech: "Mike Davis", status: "Completed" },
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{service.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {service.date} • {service.tech}
                    </p>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    {service.status}
                  </span>
                </div>
              ))}
              <Button variant="link" className="px-0">
                View all history
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Your Equipment</CardTitle>
            <CardDescription>Installed systems and warranty information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: "Central AC Unit",
                  model: "Carrier Infinity 26",
                  installed: "Jul 22, 2024",
                  warranty: "Jul 22, 2034",
                },
                { name: "Gas Furnace", model: "Trane XC95m", installed: "Jul 22, 2024", warranty: "Jul 22, 2034" },
              ].map((equipment, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{equipment.name}</p>
                      <p className="text-sm text-muted-foreground">Model: {equipment.model}</p>
                      <p className="text-sm text-muted-foreground">Installed: {equipment.installed}</p>
                    </div>
                    {equipment.name.includes("AC") ? (
                      <ThermometerSun className="h-5 w-5 text-blue-500" />
                    ) : (
                      <ThermometerSnowflake className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="mt-2 flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="ml-2 text-sm">Warranty valid until {equipment.warranty}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Button className="flex h-24 flex-col items-center justify-center gap-1">
              <Wrench className="h-5 w-5" />
              <span>Schedule Service</span>
            </Button>
            <Button variant="outline" className="flex h-24 flex-col items-center justify-center gap-1">
              <FileText className="h-5 w-5" />
              <span>View Documents</span>
            </Button>
            <Button variant="outline" className="flex h-24 flex-col items-center justify-center gap-1">
              <CreditCard className="h-5 w-5" />
              <span>Make Payment</span>
            </Button>
            <Button variant="outline" className="flex h-24 flex-col items-center justify-center gap-1">
              <CalendarClock className="h-5 w-5" />
              <span>Maintenance Plan</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
