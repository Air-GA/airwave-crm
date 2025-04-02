
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dashboardStats, performanceMetrics, workOrders } from "@/data/mockData";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calendar, Clipboard, DollarSign, Package, Timer, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDate } from "@/lib/date-utils";

const Dashboard = () => {
  const isMobile = useIsMobile();
  
  // Get work orders for today
  const today = new Date().toISOString().split('T')[0];
  const todaysWorkOrders = workOrders.filter(
    order => order.scheduledDate.startsWith(today)
  );
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline">Download Reports</Button>
            <Button>+ New Work Order</Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Work Orders</p>
                  <p className="mt-1 text-2xl font-bold">{dashboardStats.totalWorkOrders}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Clipboard className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                  +12%
                </Badge>
                <span className="ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                  <p className="mt-1 text-2xl font-bold">{dashboardStats.totalCustomers}</p>
                </div>
                <div className="rounded-full bg-accent/20 p-2 text-accent">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                  +5%
                </Badge>
                <span className="ml-2">new customers this month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="mt-1 text-2xl font-bold">${dashboardStats.revenueThisMonth.toLocaleString()}</p>
                </div>
                <div className="rounded-full bg-green-100 p-2 text-green-600">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                  +8%
                </Badge>
                <span className="ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Completion Time</p>
                  <p className="mt-1 text-2xl font-bold">{dashboardStats.averageCompletionTime}</p>
                </div>
                <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                  <Timer className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                  -15 min
                </Badge>
                <span className="ml-2">improvement from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts and Tables */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Weekly Performance</CardTitle>
              <CardDescription>Job completions and revenue for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={performanceMetrics}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }} 
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === "revenue") return [`$${Number(value).toLocaleString()}`, "Revenue"];
                        return [value, "Jobs Completed"];
                      }}
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString();
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="completedJobs"
                      name="Jobs Completed"
                      stroke="#0056b3"
                      fill="#0056b3"
                      fillOpacity={0.1}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      name="revenue"
                      stroke="#ff7a00"
                      fill="#ff7a00"
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Work Order Status</CardTitle>
              <CardDescription>Current distribution of work orders by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Pending", value: dashboardStats.pendingWorkOrders, fill: "#f59e0b" },
                      { name: "In Progress", value: dashboardStats.inProgressWorkOrders, fill: "#3b82f6" },
                      { name: "Completed", value: dashboardStats.completedWorkOrdersThisWeek, fill: "#10b981" },
                    ]}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} work orders`, ""]} />
                    <Legend />
                    <Bar dataKey="value" name="Work Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Today's Work Orders */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Today's Work Orders</CardTitle>
              <CardDescription>Work orders scheduled for today</CardDescription>
            </CardHeader>
            <CardContent>
              {todaysWorkOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-3 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                        <th className="px-3 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                        {!isMobile && (
                          <th className="px-3 py-3 text-left text-sm font-medium text-muted-foreground">Address</th>
                        )}
                        <th className="px-3 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                        <th className="px-3 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                        <th className="px-3 py-3 text-left text-sm font-medium text-muted-foreground">Technician</th>
                        <th className="px-3 py-3 text-left text-sm font-medium text-muted-foreground">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todaysWorkOrders.map((order) => (
                        <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="px-3 py-3 text-sm">#{order.id}</td>
                          <td className="px-3 py-3 text-sm">{order.customerName}</td>
                          {!isMobile && (
                            <td className="px-3 py-3 text-sm">{order.address}</td>
                          )}
                          <td className="px-3 py-3 text-sm">{order.type}</td>
                          <td className="px-3 py-3">
                            <Badge
                              variant="outline"
                              className={`
                                ${order.status === 'completed' ? 'bg-green-50 text-green-700 hover:bg-green-50' : ''}
                                ${order.status === 'in-progress' ? 'bg-blue-50 text-blue-700 hover:bg-blue-50' : ''}
                                ${order.status === 'scheduled' ? 'bg-amber-50 text-amber-700 hover:bg-amber-50' : ''}
                                ${order.status === 'pending' ? 'bg-gray-50 text-gray-700 hover:bg-gray-50' : ''}
                                ${order.status === 'cancelled' ? 'bg-red-50 text-red-700 hover:bg-red-50' : ''}
                              `}
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td className="px-3 py-3 text-sm">{order.technicianName || 'Unassigned'}</td>
                          <td className="px-3 py-3 text-sm">
                            {formatDate(new Date(order.scheduledDate), { timeOnly: true })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No work orders scheduled for today</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    All caught up! No pending work orders for today.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Inventory Alerts */}
        <Tabs defaultValue="alerts" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="alerts">Inventory Alerts</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="alerts" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-md border p-4">
                    <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Refrigerant R-410A</h4>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                          Low Stock
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Current quantity: 8, Reorder level: 5</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Reorder
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4 rounded-md border p-4">
                    <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Condensing Fan Motor</h4>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                          Low Stock
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Current quantity: 7, Reorder level: 5</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Reorder
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4 rounded-md border p-4">
                    <div className="rounded-full bg-red-100 p-2 text-red-600">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Capacitor 45/5 MFD</h4>
                        <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                          Critically Low
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Current quantity: 3, Reorder level: 15</p>
                    </div>
                    <Button size="sm">
                      Reorder Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                      <Clipboard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Work order #wo4 completed</p>
                      <p className="text-sm text-muted-foreground">James Wilson completed the thermostat repair at Peachtree Office Center</p>
                      <p className="mt-1 text-xs text-muted-foreground">Today at 12:45 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-green-100 p-2 text-green-600">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Invoice #INV-2024-0415 created</p>
                      <p className="text-sm text-muted-foreground">Invoice for Peachtree Office Center has been generated and sent</p>
                      <p className="mt-1 text-xs text-muted-foreground">Today at 1:10 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">New customer added</p>
                      <p className="text-sm text-muted-foreground">Atlanta Medical Center has been added as a new commercial customer</p>
                      <p className="mt-1 text-xs text-muted-foreground">Today at 11:30 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Inventory updated</p>
                      <p className="text-sm text-muted-foreground">10 new Digital Thermostats added to inventory</p>
                      <p className="mt-1 text-xs text-muted-foreground">Today at 9:15 AM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
