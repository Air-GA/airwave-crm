import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

export default function AccountingDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$128,430</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
            <Progress value={75} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,780</div>
            <p className="text-xs text-muted-foreground">32 invoices pending</p>
            <Button variant="outline" className="mt-3 w-full">
              View All
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payments Received</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,390</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
            <Progress value={65} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$6,240</div>
            <p className="text-xs text-muted-foreground">8 invoices overdue</p>
            <Button variant="outline" className="mt-3 w-full text-red-500 hover:text-red-600">
              Send Reminders
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Latest invoices and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  id: "INV-2025-0128",
                  customer: "Johnson Residence",
                  date: "Mar 12, 2025",
                  amount: "$450.00",
                  status: "Paid",
                },
                {
                  id: "INV-2025-0127",
                  customer: "Smith Commercial",
                  date: "Mar 10, 2025",
                  amount: "$1,250.00",
                  status: "Pending",
                },
                {
                  id: "INV-2025-0126",
                  customer: "Garcia Office",
                  date: "Mar 8, 2025",
                  amount: "$780.00",
                  status: "Paid",
                },
                {
                  id: "INV-2025-0125",
                  customer: "Williams Family",
                  date: "Mar 5, 2025",
                  amount: "$325.00",
                  status: "Overdue",
                },
                {
                  id: "INV-2025-0124",
                  customer: "Taylor Residence",
                  date: "Mar 3, 2025",
                  amount: "$890.00",
                  status: "Paid",
                },
              ].map((invoice, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === "Paid"
                          ? "outline"
                          : invoice.status === "Pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className={
                        invoice.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : invoice.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end">
            <Button variant="outline">View All Invoices</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue breakdown for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {/* This would be a chart in a real implementation */}
              <div className="flex h-full flex-col justify-end space-y-2">
                {[65, 40, 75, 50, 90, 80].map((value, i) => (
                  <div key={i} className="flex items-end gap-2">
                    <div className="w-full rounded-t bg-primary" style={{ height: `${value}%` }}></div>
                    <span className="text-sm text-muted-foreground">
                      {["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Breakdown of payment methods used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { method: "Credit Card", percentage: 65, amount: "$83,480" },
                { method: "Bank Transfer", percentage: 25, amount: "$32,107" },
                { method: "Check", percentage: 8, amount: "$10,274" },
                { method: "Cash", percentage: 2, amount: "$2,569" },
              ].map((payment, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          i === 0 ? "bg-primary" : i === 1 ? "bg-blue-500" : i === 2 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                      ></div>
                      <span className="font-medium">{payment.method}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{payment.amount}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={payment.percentage} className="h-2" />
                    <span className="text-sm text-muted-foreground">{payment.percentage}%</span>
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
