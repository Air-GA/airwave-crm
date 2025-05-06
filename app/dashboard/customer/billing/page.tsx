import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Download, DollarSign, Receipt } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Billing & Payments</h1>
        <Button>
          <CreditCard className="mr-2 h-4 w-4" />
          Make Payment
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">No outstanding balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$120.00</div>
            <p className="text-xs text-muted-foreground">Feb 15, 2025 via Credit Card</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Method</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-medium">Visa ending in 4242</div>
            <p className="text-xs text-muted-foreground">Expires 12/2027</p>
            <Button variant="outline" className="mt-2 w-full text-xs">
              Update Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    id: "INV-2025-0128",
                    date: "Feb 15, 2025",
                    service: "Annual Maintenance",
                    amount: "$120.00",
                    status: "Paid",
                  },
                  {
                    id: "INV-2024-0987",
                    date: "Oct 10, 2024",
                    service: "Repair Service",
                    amount: "$450.00",
                    status: "Paid",
                  },
                  {
                    id: "INV-2024-0654",
                    date: "Jul 22, 2024",
                    service: "System Installation",
                    amount: "$5,800.00",
                    status: "Paid",
                  },
                ].map((invoice, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.service}</TableCell>
                    <TableCell>{invoice.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download PDF</span>
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
