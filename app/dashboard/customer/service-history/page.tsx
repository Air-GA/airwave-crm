import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

export default function ServiceHistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Service History</h1>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Export History
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Records</CardTitle>
          <CardDescription>View your complete service history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 overflow-x-auto">
            {[
              {
                date: "Jan 15, 2025",
                type: "Repair",
                tech: "John Smith",
                description: "AC compressor replacement",
                status: "Completed",
                cost: "$450.00",
              },
              {
                date: "Oct 10, 2024",
                type: "Maintenance",
                tech: "Sarah Johnson",
                description: "Annual system tune-up and filter replacement",
                status: "Completed",
                cost: "$120.00",
              },
              {
                date: "Jul 22, 2024",
                type: "Installation",
                tech: "Mike Davis",
                description: "New HVAC system installation",
                status: "Completed",
                cost: "$5,800.00",
              },
              {
                date: "Apr 5, 2024",
                type: "Repair",
                tech: "Lisa Chen",
                description: "Thermostat replacement",
                status: "Completed",
                cost: "$225.00",
              },
              {
                date: "Jan 12, 2024",
                type: "Maintenance",
                tech: "John Smith",
                description: "Winter system check-up",
                status: "Completed",
                cost: "$120.00",
              },
            ].map((service, i) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="md:flex md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{service.type}</h3>
                      <Badge
                        variant={
                          service.type === "Repair"
                            ? "destructive"
                            : service.type === "Installation"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {service.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {service.date} • Technician: {service.tech}
                    </p>
                    <p>{service.description}</p>
                  </div>
                  <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                    <p className="font-semibold">{service.cost}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
