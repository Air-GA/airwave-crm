import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, DollarSign, TrendingUp, TrendingDown, Users, Wrench, Star } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Business Reports</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$128,430</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500 font-medium">+12.5%</span>
              <span className="text-xs text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500 font-medium">+24</span>
              <span className="text-xs text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Calls</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <div className="flex items-center mt-1">
              <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
              <span className="text-xs text-red-500 font-medium">-5</span>
              <span className="text-xs text-muted-foreground ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-xs text-green-500 font-medium">+2%</span>
              <span className="text-xs text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Business Performance</CardTitle>
                <CardDescription>Key metrics overview</CardDescription>
              </div>
              <Select defaultValue="year">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Last 30 days</SelectItem>
                  <SelectItem value="quarter">Last quarter</SelectItem>
                  <SelectItem value="year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {/* This would be a chart in a real implementation */}
              <div className="flex h-full flex-col justify-end space-x-2">
                <div className="flex h-full items-end gap-2">
                  {[65, 40, 75, 50, 90, 80, 70, 60, 85, 75, 65, 95].map((value, i) => (
                    <div key={i} className="relative flex w-full flex-col items-center">
                      <div className="w-full rounded-t bg-primary" style={{ height: `${value}%` }}></div>
                      <span className="mt-2 text-xs text-muted-foreground">
                        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>Download business reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Monthly Business Summary", date: "Mar 1, 2025", type: "PDF" },
                { name: "Customer Growth Report", date: "Feb 15, 2025", type: "Excel" },
                { name: "Technician Performance", date: "Mar 5, 2025", type: "PDF" },
                { name: "Service Call Analysis", date: "Mar 10, 2025", type: "Excel" },
                { name: "Customer Satisfaction Survey", date: "Feb 28, 2025", type: "PDF" },
              ].map((report, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-primary/10 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">Generated: {report.date}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    {report.type}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Type Distribution</CardTitle>
            <CardDescription>Breakdown of service calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { service: "Maintenance", percentage: 40, count: 35 },
                { service: "Repairs", percentage: 35, count: 30 },
                { service: "Installations", percentage: 15, count: 13 },
                { service: "Inspections", percentage: 10, count: 9 },
              ].map((service, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          i === 0 ? "bg-primary" : i === 1 ? "bg-blue-500" : i === 2 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                      ></div>
                      <span className="font-medium">{service.service}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{service.count} calls</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${
                          i === 0 ? "bg-primary" : i === 1 ? "bg-blue-500" : i === 2 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${service.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">{service.percentage}%</span>
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
