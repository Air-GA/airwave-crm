import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, FileText, Plus, Download, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>Manage customer invoices</CardDescription>
          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search invoices..." className="pl-8" />
            </div>
            <Button variant="outline" className="gap-1">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
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
                    {
                      id: "INV-2025-0123",
                      customer: "Davis Residence",
                      date: "Mar 1, 2025",
                      amount: "$550.00",
                      status: "Pending",
                    },
                    {
                      id: "INV-2025-0122",
                      customer: "Wilson Residence",
                      date: "Feb 28, 2025",
                      amount: "$420.00",
                      status: "Overdue",
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
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Download">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Email">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
