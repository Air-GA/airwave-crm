import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, CreditCard, DollarSign, Calendar, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <Button>
          <DollarSign className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,390</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Credit Card, Bank Transfer, Check, Cash</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Deposit</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Mar 15, 2025</div>
            <p className="text-xs text-muted-foreground">$5,240 pending deposit</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View all payment transactions</CardDescription>
          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search payments..." className="pl-8" />
            </div>
            <Button variant="outline" className="gap-1">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    id: "TRX-2025-0128",
                    customer: "Johnson Residence",
                    date: "Mar 12, 2025",
                    amount: "$450.00",
                    method: "Credit Card",
                    status: "Completed",
                  },
                  {
                    id: "TRX-2025-0127",
                    customer: "Smith Commercial",
                    date: "Mar 10, 2025",
                    amount: "$1,250.00",
                    method: "Bank Transfer",
                    status: "Pending",
                  },
                  {
                    id: "TRX-2025-0126",
                    customer: "Garcia Office",
                    date: "Mar 8, 2025",
                    amount: "$780.00",
                    method: "Credit Card",
                    status: "Completed",
                  },
                  {
                    id: "TRX-2025-0125",
                    customer: "Williams Family",
                    date: "Mar 5, 2025",
                    amount: "$325.00",
                    method: "Check",
                    status: "Completed",
                  },
                  {
                    id: "TRX-2025-0124",
                    customer: "Taylor Residence",
                    date: "Mar 3, 2025",
                    amount: "$890.00",
                    method: "Credit Card",
                    status: "Completed",
                  },
                  {
                    id: "TRX-2025-0123",
                    customer: "Davis Residence",
                    date: "Mar 1, 2025",
                    amount: "$550.00",
                    method: "Cash",
                    status: "Completed",
                  },
                ].map((payment, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>{payment.customer}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>
                      <Badge
                        variant={payment.status === "Completed" ? "outline" : "secondary"}
                        className={payment.status === "Completed" ? "bg-green-100 text-green-800" : ""}
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download receipt</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
