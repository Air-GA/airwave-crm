import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Calendar, CheckCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function WorkOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Work Orders</h1>
        <Button>
          <CheckCircle className="mr-2 h-4 w-4" />
          Complete Order
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active (5)</TabsTrigger>
          <TabsTrigger value="pending">Pending (3)</TabsTrigger>
          <TabsTrigger value="completed">Completed (12)</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[
                  {
                    id: "WO-2025-0342",
                    customer: "Johnson Residence",
                    address: "123 Oak St, Atlanta, GA",
                    issue: "AC not cooling properly",
                    priority: "High",
                    date: "Mar 14, 2025",
                    time: "1:30 PM - 3:30 PM",
                  },
                  {
                    id: "WO-2025-0339",
                    customer: "Garcia Office Building",
                    address: "456 Pine Ave, Atlanta, GA",
                    issue: "Furnace making unusual noise",
                    priority: "Medium",
                    date: "Mar 14, 2025",
                    time: "10:30 AM - 12:30 PM",
                  },
                  {
                    id: "WO-2025-0336",
                    customer: "Smith Residence",
                    address: "789 Maple Dr, Atlanta, GA",
                    issue: "Annual maintenance",
                    priority: "Low",
                    date: "Mar 14, 2025",
                    time: "8:00 AM - 10:00 AM",
                  },
                ].map((order, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="md:flex md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{order.customer}</h3>
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
                        <p className="text-sm text-muted-foreground">{order.id}</p>
                        <p>{order.issue}</p>
                        <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{order.address}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                            {order.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3 flex-shrink-0" />
                            {order.time}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button size="sm">Start Job</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[
                  {
                    id: "WO-2025-0345",
                    customer: "Williams Family",
                    address: "101 Elm Blvd, Atlanta, GA",
                    issue: "Installation of new AC unit",
                    priority: "Medium",
                    date: "Mar 15, 2025",
                    time: "9:00 AM - 1:00 PM",
                  },
                  {
                    id: "WO-2025-0344",
                    customer: "Taylor Residence",
                    address: "202 Cedar Ln, Atlanta, GA",
                    issue: "Thermostat replacement",
                    priority: "Low",
                    date: "Mar 16, 2025",
                    time: "1:00 PM - 2:30 PM",
                  },
                  {
                    id: "WO-2025-0343",
                    customer: "Martinez Office",
                    address: "303 Birch St, Atlanta, GA",
                    issue: "Ductwork inspection",
                    priority: "Low",
                    date: "Mar 17, 2025",
                    time: "10:00 AM - 12:00 PM",
                  },
                ].map((order, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="md:flex md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{order.customer}</h3>
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
                        <p className="text-sm text-muted-foreground">{order.id}</p>
                        <p>{order.issue}</p>
                        <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{order.address}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                            {order.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3 flex-shrink-0" />
                            {order.time}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button size="sm">Assign</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[
                  {
                    id: "WO-2025-0335",
                    customer: "Davis Residence",
                    address: "404 Walnut Way, Atlanta, GA",
                    issue: "Furnace repair",
                    priority: "High",
                    date: "Mar 13, 2025",
                    time: "2:00 PM - 4:00 PM",
                    completedBy: "John Smith",
                  },
                  {
                    id: "WO-2025-0334",
                    customer: "Wilson Residence",
                    address: "505 Spruce St, Atlanta, GA",
                    issue: "Filter replacement",
                    priority: "Low",
                    date: "Mar 12, 2025",
                    time: "11:00 AM - 12:00 PM",
                    completedBy: "Sarah Johnson",
                  },
                ].map((order, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="md:flex md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{order.customer}</h3>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Completed
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.id}</p>
                        <p>{order.issue}</p>
                        <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{order.address}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                            {order.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3 flex-shrink-0" />
                            {order.time}
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="mr-1 h-3 w-3 text-green-500 flex-shrink-0" />
                            Completed by: {order.completedBy}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                        <Button variant="outline" size="sm">
                          View Report
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
