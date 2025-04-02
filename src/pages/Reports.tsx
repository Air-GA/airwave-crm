import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Clock, 
  Download, 
  FileBarChart, 
  FileText,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Package,
  Settings, 
  Share2,
  UserCheck,
  Wallet,
  Phone,
  Calendar
} from "lucide-react";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  Line, 
  LineChart, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { useAuth } from "@/hooks/useAuth";

const Reports = () => {
  const { userRole, permissions } = useAuth();
  
  const revenueData = [
    { name: 'Feb', value: 8400 },
    { name: 'Mar', value: 7800 },
    { name: 'Apr', value: 9600 },
    { name: 'May', value: 10200 },
    { name: 'Jun', value: 12500 },
    { name: 'Jul', value: 14800 },
    { name: 'Aug', value: 15200 },
    { name: 'Sep', value: 14700 },
  ];
  
  const serviceTypeData = [
    { name: 'Maintenance', value: 45 },
    { name: 'Repair', value: 30 },
    { name: 'Installation', value: 15 },
    { name: 'Consultation', value: 10 },
  ];
  
  const technicianPerformanceData = [
    { name: 'Mike J.', completed: 42, rating: 4.8 },
    { name: 'David C.', completed: 38, rating: 4.9 },
    { name: 'Sarah W.', completed: 35, rating: 4.7 },
    { name: 'Robert T.', completed: 32, rating: 4.5 },
    { name: 'Emily D.', completed: 28, rating: 4.6 },
  ];
  
  const callMetricsData = [
    { name: 'Mon', calls: 45, booked: 12 },
    { name: 'Tue', calls: 52, booked: 15 },
    { name: 'Wed', calls: 48, booked: 18 },
    { name: 'Thu', calls: 61, booked: 22 },
    { name: 'Fri', calls: 55, booked: 20 },
    { name: 'Sat', calls: 30, booked: 10 },
    { name: 'Sun', calls: 20, booked: 5 },
  ];
  
  const salesPerformanceData = [
    { name: 'Quotes', target: 50, actual: 58 },
    { name: 'Closes', target: 25, actual: 24 },
    { name: 'Revenue', target: 100, actual: 105 },
    { name: 'Follow-ups', target: 75, actual: 68 },
  ];
  
  const hrMetricsData = [
    { name: 'Hiring', target: 5, completed: 4 },
    { name: 'Training', target: 10, completed: 12 },
    { name: 'Reviews', target: 25, completed: 22 },
    { name: 'Certifications', target: 15, completed: 18 },
    { name: 'Onboarding', target: 8, completed: 7 },
  ];
  
  const techMetricsData = [
    { name: 'Resolution Time', value: 2.5, target: 3.0 },
    { name: 'First-time Fix', value: 85, target: 80 },
    { name: 'Customer Rating', value: 4.7, target: 4.5 },
    { name: 'Jobs Per Day', value: 3.2, target: 3.0 },
    { name: 'Callbacks', value: 1.2, target: 2.0 },
  ];
  
  const customerMetricsData = [
    { name: 'Feb', maintenance: 1, repair: 0 },
    { name: 'Mar', maintenance: 0, repair: 1 },
    { name: 'Apr', maintenance: 1, repair: 0 },
    { name: 'May', maintenance: 0, repair: 0 },
    { name: 'Jun', maintenance: 1, repair: 1 },
    { name: 'Jul', maintenance: 0, repair: 0 },
    { name: 'Aug', maintenance: 1, repair: 0 },
    { name: 'Sep', maintenance: 0, repair: 0 },
  ];
  
  const recentReports = [
    { 
      id: 'REP-2025-001', 
      name: 'Monthly Revenue Report - February 2025', 
      type: 'Revenue', 
      created: '2025-03-01', 
      author: 'System'
    },
    { 
      id: 'REP-2025-002', 
      name: 'Technician Performance Q1 2025', 
      type: 'Performance', 
      created: '2025-02-28', 
      author: 'Admin'
    },
    { 
      id: 'REP-2025-003', 
      name: 'Customer Satisfaction Survey Results', 
      type: 'Customer', 
      created: '2025-02-25', 
      author: 'System'
    },
    { 
      id: 'REP-2025-004', 
      name: 'Inventory Usage Analysis', 
      type: 'Inventory', 
      created: '2025-02-22', 
      author: 'Admin'
    },
    { 
      id: 'REP-2025-005', 
      name: 'Service Type Distribution Q1 2025', 
      type: 'Services', 
      created: '2025-02-20', 
      author: 'System'
    },
  ];
  
  const renderRoleSpecificContent = () => {
    switch (userRole) {
      case 'admin':
      case 'manager':
        return (
          <Tabs defaultValue="dashboard">
            <TabsList className="grid w-full grid-cols-3 md:w-auto md:grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="reports">Saved Reports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$14,700</div>
                    <p className="text-xs text-green-500">↑ 12% from last month</p>
                    <div className="mt-4 h-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData}>
                          <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Service Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">175 Services</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                    <div className="mt-4 h-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={serviceTypeData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={45}
                            fill="#2563eb"
                            label={({ name }) => name}
                            labelLine={false}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4.8/5.0</div>
                    <p className="text-xs text-green-500">↑ 0.2 from last month</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="text-sm">5 stars</div>
                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full w-[65%] rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-sm">65%</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">4 stars</div>
                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full w-[25%] rounded-full bg-green-400"></div>
                        </div>
                        <div className="text-sm">25%</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">3 stars</div>
                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full w-[8%] rounded-full bg-amber-400"></div>
                        </div>
                        <div className="text-sm">8%</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">2 stars</div>
                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full w-[1%] rounded-full bg-red-400"></div>
                        </div>
                        <div className="text-sm">1%</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">1 star</div>
                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full w-[1%] rounded-full bg-red-500"></div>
                        </div>
                        <div className="text-sm">1%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Technician Performance</CardTitle>
                  <CardDescription>Completed jobs and customer ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={technicianPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="completed" fill="#2563eb" name="Jobs Completed" />
                        <Bar yAxisId="right" dataKey="rating" fill="#10b981" name="Customer Rating" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="revenue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analysis</CardTitle>
                  <CardDescription>Monthly revenue for the current year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Revenue" stroke="#2563eb" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue YTD</p>
                    <p className="text-2xl font-bold">$93,200</p>
                  </div>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export Data
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Technician Performance</CardTitle>
                  <CardDescription>Job completion and customer satisfaction</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Technician</TableHead>
                        <TableHead className="text-right">Jobs Completed</TableHead>
                        <TableHead className="text-right">Avg. Time</TableHead>
                        <TableHead className="text-right">Customer Rating</TableHead>
                        <TableHead className="text-right">Callbacks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Mike Johnson</TableCell>
                        <TableCell className="text-right">42</TableCell>
                        <TableCell className="text-right">3.2 hrs</TableCell>
                        <TableCell className="text-right">4.8/5.0</TableCell>
                        <TableCell className="text-right">1.2%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>David Chen</TableCell>
                        <TableCell className="text-right">38</TableCell>
                        <TableCell className="text-right">2.9 hrs</TableCell>
                        <TableCell className="text-right">4.9/5.0</TableCell>
                        <TableCell className="text-right">0.8%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Sarah Williams</TableCell>
                        <TableCell className="text-right">35</TableCell>
                        <TableCell className="text-right">3.5 hrs</TableCell>
                        <TableCell className="text-right">4.7/5.0</TableCell>
                        <TableCell className="text-right">1.4%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Robert Thomas</TableCell>
                        <TableCell className="text-right">32</TableCell>
                        <TableCell className="text-right">3.8 hrs</TableCell>
                        <TableCell className="text-right">4.5/5.0</TableCell>
                        <TableCell className="text-right">2.1%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Emily Davis</TableCell>
                        <TableCell className="text-right">28</TableCell>
                        <TableCell className="text-right">3.3 hrs</TableCell>
                        <TableCell className="text-right">4.6/5.0</TableCell>
                        <TableCell className="text-right">1.8%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">
                    <Clock className="mr-2 h-4 w-4" /> View Time Analysis
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Input placeholder="Search reports..." className="pl-8" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
              </div>
              
              <div className="grid gap-4">
                {recentReports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle>{report.name}</CardTitle>
                          <CardDescription>
                            {report.type} Report • Created {new Date(report.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • By {report.author}
                          </CardDescription>
                        </div>
                        {report.type === 'Revenue' && <BarChart3 className="h-5 w-5 text-muted-foreground" />}
                        {report.type === 'Performance' && <LineChartIcon className="h-5 w-5 text-muted-foreground" />}
                        {report.type === 'Services' && <PieChartIcon className="h-5 w-5 text-muted-foreground" />}
                        {report.type === 'Inventory' && <Package className="h-5 w-5 text-muted-foreground" />}
                        {report.type === 'Customer' && <FileText className="h-5 w-5 text-muted-foreground" />}
                      </div>
                    </CardHeader>
                    <CardFooter className="pt-2">
                      <div className="flex w-full items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          ID: {report.id}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Share2 className="h-4 w-4" />
                            <span className="sr-only">Share</span>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        );
        
      case 'csr':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Call Center Metrics</CardTitle>
                <CardDescription>Weekly call volume and booking conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={callMetricsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="calls" fill="#9ca3af" name="Total Calls" />
                      <Bar dataKey="booked" fill="#2563eb" name="Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Booking Rate</p>
                  <p className="text-2xl font-bold">31.8%</p>
                </div>
                <Button variant="outline">
                  <Phone className="mr-2 h-4 w-4" /> Call Details
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
        
      case 'sales':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>Current quarter targets vs. actual performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesPerformanceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="target" fill="#9ca3af" name="Target" />
                      <Bar dataKey="actual" fill="#2563eb" name="Actual" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Close Rate</p>
                  <p className="text-2xl font-bold">41.4%</p>
                </div>
                <Button variant="outline">
                  <Wallet className="mr-2 h-4 w-4" /> Sales Pipeline
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
        
      case 'hr':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>HR Key Performance Indicators</CardTitle>
                <CardDescription>Current quarter targets vs. completion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hrMetricsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="target" fill="#9ca3af" name="Target" />
                      <Bar dataKey="completed" fill="#2563eb" name="Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Completion</p>
                  <p className="text-2xl font-bold">95.2%</p>
                </div>
                <Button variant="outline">
                  <UserCheck className="mr-2 h-4 w-4" /> Staff Records
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
        
      case 'tech':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Technician Key Performance Indicators</CardTitle>
                <CardDescription>Your performance vs targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {techMetricsData.map((metric) => (
                    <div key={metric.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{metric.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{typeof metric.value === 'number' && metric.value % 1 === 0 ? metric.value : metric.value.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">/ {typeof metric.target === 'number' && metric.target % 1 === 0 ? metric.target : metric.target.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div 
                          className={`h-2 rounded-full ${metric.value >= metric.target ? 'bg-green-500' : 'bg-amber-500'}`}
                          style={{ 
                            width: `${Math.min(100, (metric.value / metric.target) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">
                  <Clock className="mr-2 h-4 w-4" /> View Full Metrics
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
        
      case 'customer':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service History</CardTitle>
                <CardDescription>Your maintenance and repair history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={customerMetricsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="maintenance" fill="#2563eb" name="Maintenance" />
                      <Bar dataKey="repair" fill="#f59e0b" name="Repair" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Next Maintenance</p>
                  <p className="text-2xl font-bold">Oct 15, 2025</p>
                </div>
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" /> Schedule Service
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
        
      default:
        return (
          <div className="p-8 text-center">
            <div className="mb-4">
              <FileBarChart className="mx-auto h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No Reports Available</h3>
            <p className="mt-2 text-muted-foreground">
              There are no reports configured for your user role.
            </p>
          </div>
        );
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              {userRole === 'admin' || userRole === 'manager' 
                ? "Analyze business performance and trends" 
                : "View your personalized performance metrics"}
            </p>
          </div>
          
          {(userRole === 'admin' || userRole === 'manager') && (
            <div className="flex gap-2">
              <Button>
                <FileBarChart className="mr-2 h-4 w-4" /> Create Report
              </Button>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" /> Configure
              </Button>
            </div>
          )}
          
          {userRole !== 'admin' && userRole !== 'manager' && (
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export Report
              </Button>
            </div>
          )}
        </div>
        
        {renderRoleSpecificContent()}
      </div>
    </MainLayout>
  );
};

export default Reports;
