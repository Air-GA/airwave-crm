import React, { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calendar, Clipboard, DollarSign, Package, Timer, Users, Download, RefreshCw } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useWorkOrderStore } from "@/services/workOrderStore";
import { useCustomerStore } from "@/services/customerStore";
import { fetchCustomers } from "@/services/customerStore";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const { workOrders } = useWorkOrderStore();
  const { customers } = useCustomerStore();
  
  // Fetch customers on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchCustomers();
      } catch (error) {
        console.error("Failed to load customer data:", error);
      }
    };
    
    loadData();
  }, []);
  
  const revenueData = [
    {
      name: "Jan",
      Revenue: 2400,
      Sales: 400,
      amt: 2400,
    },
    {
      name: "Feb",
      Revenue: 1398,
      Sales: 300,
      amt: 2210,
    },
    {
      name: "Mar",
      Revenue: 9800,
      Sales: 320,
      amt: 2290,
    },
    {
      name: "Apr",
      Revenue: 3908,
      Sales: 400,
      amt: 2000,
    },
    {
      name: "May",
      Revenue: 4800,
      Sales: 300,
      amt: 2181,
    },
    {
      name: "Jun",
      Revenue: 3800,
      Sales: 400,
      amt: 2500,
    },
    {
      name: "Jul",
      Revenue: 4300,
      Sales: 300,
      amt: 2100,
    },
    {
      name: "Aug",
      Revenue: 2400,
      Sales: 400,
      amt: 2400,
    },
    {
      name: "Sep",
      Revenue: 1398,
      Sales: 300,
      amt: 2210,
    },
    {
      name: "Oct",
      Revenue: 9800,
      Sales: 320,
      amt: 2290,
    },
    {
      name: "Nov",
      Revenue: 3908,
      Sales: 400,
      amt: 2000,
    },
    {
      name: "Dec",
      Revenue: 4800,
      Sales: 300,
      amt: 2181,
    },
  ];

  const barChartData = [
    {
      name: "Jan",
      Sales: 2400,
      amt: 2400,
    },
    {
      name: "Feb",
      Sales: 1398,
      amt: 2210,
    },
    {
      name: "Mar",
      Sales: 9800,
      amt: 2290,
    },
    {
      name: "Apr",
      Sales: 3908,
      amt: 2000,
    },
    {
      name: "May",
      Sales: 4800,
      amt: 2181,
    },
    {
      name: "Jun",
      Sales: 3800,
      amt: 2500,
    },
    {
      name: "Jul",
      Sales: 4300,
      amt: 2100,
    },
  ];

  // Get latest work orders from store
  const latestWorkOrders = workOrders.slice(0, 5).map(order => ({
    workOrderNumber: `#${order.id.substring(0, 4)}`,
    customerName: order.customerName,
    date: new Date(order.scheduledDate).toISOString().split('T')[0],
    status: order.status
  }));

  // Sample invoice data (would be replaced with real data in a production app)
  const latestInvoices = [
    {
      invoiceNumber: "#1234",
      customerName: "John Smith",
      date: "2023-01-01",
      amount: "$100.00",
      status: "Paid",
    },
    {
      invoiceNumber: "#1235",
      customerName: "Sarah Johnson",
      date: "2023-01-02",
      amount: "$250.00",
      status: "Paid",
    },
    {
      invoiceNumber: "#1236",
      customerName: "Michael Davis",
      date: "2023-01-03",
      amount: "$175.00",
      status: "Paid",
    },
    {
      invoiceNumber: "#1237",
      customerName: "Emily Wilson",
      date: "2023-01-04",
      amount: "$320.00",
      status: "Unpaid",
    },
    {
      invoiceNumber: "#1238",
      customerName: "Robert Taylor",
      date: "2023-01-05",
      amount: "$95.00",
      status: "Paid",
    },
  ];

  const handleRefreshData = async () => {
    try {
      await fetchCustomers();
      toast({
        title: "Dashboard Refreshed",
        description: "Latest data has been loaded",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh dashboard data",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout pageName="Dashboard">
      <div className="container mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <Button variant="outline" size="sm" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45,231.89</div>
              <p className="text-sm text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workOrders.length}</div>
              <p className="text-sm text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Tasks
              </CardTitle>
              <Clipboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workOrders.filter(order => order.status !== 'completed' && order.status !== 'cancelled').length}</div>
              <p className="text-sm text-muted-foreground">
                +7% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
              <p className="text-sm text-muted-foreground">
                +23% from last month
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue for the current year</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={revenueData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="Revenue"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>You made 265 sales this month.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Sales" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Latest Invoices</CardTitle>
              <CardDescription>Recent customer invoices and payment status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <table className="w-full table-auto text-sm">
                  <thead>
                    <tr>
                      <th className="border-b font-medium p-4 pl-8 pb-3 text-left">
                        Invoice
                      </th>
                      <th className="border-b font-medium p-4 pb-3 text-left">
                        Customer
                      </th>
                      <th className="border-b font-medium p-4 pb-3 text-left">
                        Date
                      </th>
                      <th className="border-b font-medium p-4 pb-3 text-left">
                        Amount
                      </th>
                      <th className="border-b font-medium p-4 pr-8 pb-3 text-left">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestInvoices?.map((invoice) => (
                      <tr
                        key={invoice.invoiceNumber}
                        className="hover:bg-muted/50"
                      >
                        <td className="border-b p-4 pl-8">{invoice.invoiceNumber}</td>
                        <td className="border-b p-4">{invoice.customerName}</td>
                        <td className="border-b p-4">{invoice.date}</td>
                        <td className="border-b p-4">{invoice.amount}</td>
                        <td className="border-b p-4 pr-8">
                          <Badge variant={invoice.status === "Paid" ? "outline" : "secondary"}>
                            {invoice.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Latest Work Orders</CardTitle>
              <CardDescription>Recent service requests and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <table className="w-full table-auto text-sm">
                  <thead>
                    <tr>
                      <th className="border-b font-medium p-4 pl-8 pb-3 text-left">
                        Work Order
                      </th>
                      <th className="border-b font-medium p-4 pb-3 text-left">
                        Customer
                      </th>
                      <th className="border-b font-medium p-4 pb-3 text-left">
                        Date
                      </th>
                      <th className="border-b font-medium p-4 pr-8 pb-3 text-left">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestWorkOrders.length > 0 ? (
                      latestWorkOrders.map((workOrder) => (
                        <tr
                          key={workOrder.workOrderNumber}
                          className="hover:bg-muted/50"
                        >
                          <td className="border-b p-4 pl-8">
                            {workOrder.workOrderNumber}
                          </td>
                          <td className="border-b p-4">{workOrder.customerName}</td>
                          <td className="border-b p-4">{workOrder.date}</td>
                          <td className="border-b p-4 pr-8">
                            <Badge 
                              className={`${
                                workOrder.status === 'completed' ? 'bg-green-500' : 
                                workOrder.status === 'in-progress' ? 'bg-blue-500' : 
                                workOrder.status === 'pending' ? 'bg-yellow-500' : 
                                workOrder.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                              }`}
                            >
                              {workOrder.status === 'in-progress' ? 'In Progress' : 
                               workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4">No work orders available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <a href="/work-orders">View All Work Orders</a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
