import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dashboardStats, performanceMetrics, workOrders } from "@/data/mockData";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calendar, Clipboard, DollarSign, Package, Timer, Users, Download } from "lucide-react";

const Index = () => {
  const data = [
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
      customerName: "John Smith",
      date: "2023-01-01",
      amount: "$100.00",
      status: "Paid",
    },
    {
      invoiceNumber: "#1236",
      customerName: "John Smith",
      date: "2023-01-01",
      amount: "$100.00",
      status: "Paid",
    },
    {
      invoiceNumber: "#1237",
      customerName: "John Smith",
      date: "2023-01-01",
      amount: "$100.00",
      status: "Unpaid",
    },
    {
      invoiceNumber: "#1238",
      customerName: "John Smith",
      date: "2023-01-01",
      amount: "$100.00",
      status: "Paid",
    },
  ];

  const latestWorkOrders = [
    {
      workOrderNumber: "#1234",
      customerName: "John Smith",
      date: "2023-01-01",
      status: "Open",
    },
    {
      workOrderNumber: "#1235",
      customerName: "John Smith",
      date: "2023-01-01",
      status: "Open",
    },
    {
      workOrderNumber: "#1236",
      customerName: "John Smith",
      date: "2023-01-01",
      status: "Closed",
    },
    {
      workOrderNumber: "#1237",
      customerName: "John Smith",
      date: "2023-01-01",
      status: "Open",
    },
    {
      workOrderNumber: "#1238",
      customerName: "John Smith",
      date: "2023-01-01",
      status: "Closed",
    },
  ];

  return (
    <>
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
            <div className="text-2xl font-bold">{dashboardStats.totalWorkOrders}</div>
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
            <div className="text-2xl font-bold">{dashboardStats.pendingWorkOrders}</div>
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
            <div className="text-2xl font-bold">{dashboardStats.activeCustomers}</div>
            <p className="text-sm text-muted-foreground">
              +23% from last month
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart
                data={data}
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
                      className="last:border-b-0 [&:nth-child(odd)]:bg-muted"
                    >
                      <td className="border-b p-4 pl-8">{invoice.invoiceNumber}</td>
                      <td className="border-b p-4">{invoice.customerName}</td>
                      <td className="border-b p-4">{invoice.date}</td>
                      <td className="border-b p-4">{invoice.amount}</td>
                      <td className="border-b p-4 pr-8">
                        <Badge variant="outline">{invoice.status}</Badge>
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
                  {latestWorkOrders?.map((workOrder) => (
                    <tr
                      key={workOrder.workOrderNumber}
                      className="last:border-b-0 [&:nth-child(odd)]:bg-muted"
                    >
                      <td className="border-b p-4 pl-8">
                        {workOrder.workOrderNumber}
                      </td>
                      <td className="border-b p-4">{workOrder.customerName}</td>
                      <td className="border-b p-4">{workOrder.date}</td>
                      <td className="border-b p-4 pr-8">
                        <Badge variant="outline">{workOrder.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Index;
