
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
  LineChart, 
  PieChart, 
  Settings, 
  Share2
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const Reports = () => {
  // Mock data for reports
  const revenueData = [
    { name: 'Jan', value: 8400 },
    { name: 'Feb', value: 7800 },
    { name: 'Mar', value: 9600 },
    { name: 'Apr', value: 10200 },
    { name: 'May', value: 12500 },
    { name: 'Jun', value: 14800 },
    { name: 'Jul', value: 15200 },
    { name: 'Aug', value: 14700 },
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
  
  const recentReports = [
    { 
      id: 'REP-2023-001', 
      name: 'Monthly Revenue Report - August 2023', 
      type: 'Revenue', 
      created: '2023-09-01', 
      author: 'System'
    },
    { 
      id: 'REP-2023-002', 
      name: 'Technician Performance Q3 2023', 
      type: 'Performance', 
      created: '2023-08-28', 
      author: 'Admin'
    },
    { 
      id: 'REP-2023-003', 
      name: 'Customer Satisfaction Survey Results', 
      type: 'Customer', 
      created: '2023-08-25', 
      author: 'System'
    },
    { 
      id: 'REP-2023-004', 
      name: 'Inventory Usage Analysis', 
      type: 'Inventory', 
      created: '2023-08-22', 
      author: 'Admin'
    },
    { 
      id: 'REP-2023-005', 
      name: 'Service Type Distribution Q3 2023', 
      type: 'Services', 
      created: '2023-08-20', 
      author: 'System'
    },
  ];
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">Analyze business performance and trends</p>
          </div>
          <div className="flex gap-2">
            <Button>
              <FileBarChart className="mr-2 h-4 w-4" /> Create Report
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" /> Configure
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="reports">Saved Reports</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
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
          
          {/* Revenue Tab */}
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
          
          {/* Performance Tab */}
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
          
          {/* Saved Reports Tab */}
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
                      {report.type === 'Performance' && <LineChart className="h-5 w-5 text-muted-foreground" />}
                      {report.type === 'Services' && <PieChart className="h-5 w-5 text-muted-foreground" />}
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
      </div>
    </MainLayout>
  );
};

export default Reports;
