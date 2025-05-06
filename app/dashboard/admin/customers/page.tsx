import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, UserPlus, Edit, Trash2, MoreHorizontal, MapPin, Phone, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>Manage customer accounts and information</CardDescription>
          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search customers..." className="pl-8" />
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
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Customer Since</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    name: "Emily Taylor",
                    email: "emily.taylor@example.com",
                    phone: "(404) 555-1234",
                    address: "123 Oak St, Atlanta, GA",
                    status: "Active",
                    since: "Jan 15, 2023",
                  },
                  {
                    name: "David Martinez",
                    email: "david.martinez@example.com",
                    phone: "(404) 555-5678",
                    address: "456 Pine Ave, Atlanta, GA",
                    status: "Active",
                    since: "Mar 22, 2023",
                  },
                  {
                    name: "Sarah Johnson",
                    email: "sarah.johnson@example.com",
                    phone: "(404) 555-9012",
                    address: "789 Maple Dr, Atlanta, GA",
                    status: "Active",
                    since: "Jun 10, 2023",
                  },
                  {
                    name: "Michael Wilson",
                    email: "michael.wilson@example.com",
                    phone: "(404) 555-3456",
                    address: "101 Elm Blvd, Atlanta, GA",
                    status: "Inactive",
                    since: "Sep 5, 2023",
                  },
                  {
                    name: "Jennifer Garcia",
                    email: "jennifer.garcia@example.com",
                    phone: "(404) 555-7890",
                    address: "202 Cedar Ln, Atlanta, GA",
                    status: "Active",
                    since: "Nov 18, 2023",
                  },
                  {
                    name: "Robert Smith",
                    email: "robert.smith@example.com",
                    phone: "(404) 555-2345",
                    address: "303 Birch St, Atlanta, GA",
                    status: "Active",
                    since: "Feb 7, 2024",
                  },
                ].map((customer, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                          <AvatarFallback>
                            {customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3 text-muted-foreground" />
                          {customer.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="mr-1 h-3 w-3 text-muted-foreground" />
                          {customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                        {customer.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={customer.status === "Active" ? "outline" : "secondary"}
                        className={customer.status === "Active" ? "bg-green-100 text-green-800" : ""}
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{customer.since}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
