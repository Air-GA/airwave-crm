import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Truck, Package, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Parts Inventory</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Truck className="mr-2 h-4 w-4" />
            Request Parts
          </Button>
          <Button>
            <Package className="mr-2 h-4 w-4" />
            Scan Inventory
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">In your truck inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Parts need reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parts on Order</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Expected delivery: Mar 16</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory List</CardTitle>
          <CardDescription>Manage your truck inventory</CardDescription>
          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search parts..." className="pl-8" />
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
                  <TableHead>Part Name</TableHead>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    name: "Air Filter (MERV 13)",
                    number: "AF-1013",
                    category: "Filters",
                    quantity: 8,
                    status: "In Stock",
                  },
                  {
                    name: "Capacitor 45/5 MFD",
                    number: "CAP-455",
                    category: "Electrical",
                    quantity: 3,
                    status: "In Stock",
                  },
                  {
                    name: "Contactor 30A",
                    number: "CON-30A",
                    category: "Electrical",
                    quantity: 2,
                    status: "In Stock",
                  },
                  {
                    name: "Refrigerant R-410A",
                    number: "REF-410A",
                    category: "Chemicals",
                    quantity: 1,
                    status: "Low Stock",
                  },
                  {
                    name: "Thermostat (Smart)",
                    number: "TSTAT-S1",
                    category: "Controls",
                    quantity: 0,
                    status: "Out of Stock",
                  },
                  {
                    name: "Blower Motor 1/2 HP",
                    number: "BM-12HP",
                    category: "Motors",
                    quantity: 1,
                    status: "Low Stock",
                  },
                  {
                    name: "Igniter",
                    number: "IGN-01",
                    category: "Heating",
                    quantity: 4,
                    status: "In Stock",
                  },
                ].map((part, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{part.name}</TableCell>
                    <TableCell>{part.number}</TableCell>
                    <TableCell>{part.category}</TableCell>
                    <TableCell>{part.quantity}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          part.status === "In Stock"
                            ? "outline"
                            : part.status === "Low Stock"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          part.status === "In Stock"
                            ? "bg-green-100 text-green-800"
                            : part.status === "Low Stock"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {part.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        {part.status === "Out of Stock" || part.status === "Low Stock" ? "Order" : "Use"}
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
