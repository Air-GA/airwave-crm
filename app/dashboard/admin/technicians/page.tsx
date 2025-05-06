import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, UserPlus, Edit, Trash2, MoreHorizontal, Phone, Mail, Wrench, Star } from "lucide-react"
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

export default function TechniciansPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Technicians</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Technician
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Technicians</CardTitle>
          <CardDescription>Manage technician accounts and assignments</CardDescription>
          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search technicians..." className="pl-8" />
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
                  <TableHead>Specialization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    name: "John Smith",
                    email: "john.smith@example.com",
                    phone: "(404) 555-1234",
                    specialization: "HVAC Installation",
                    status: "Active",
                    rating: 4.8,
                  },
                  {
                    name: "Lisa Chen",
                    email: "lisa.chen@example.com",
                    phone: "(404) 555-5678",
                    specialization: "Heating Systems",
                    status: "On Leave",
                    rating: 4.9,
                  },
                  {
                    name: "Mike Davis",
                    email: "mike.davis@example.com",
                    phone: "(404) 555-9012",
                    specialization: "AC Repair",
                    status: "Active",
                    rating: 4.7,
                  },
                  {
                    name: "Sarah Johnson",
                    email: "sarah.johnson@example.com",
                    phone: "(404) 555-3456",
                    specialization: "Ductwork",
                    status: "Active",
                    rating: 4.6,
                  },
                  {
                    name: "Robert Wilson",
                    email: "robert.wilson@example.com",
                    phone: "(404) 555-7890",
                    specialization: "Commercial HVAC",
                    status: "Active",
                    rating: 4.5,
                  },
                ].map((tech, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                          <AvatarFallback>
                            {tech.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{tech.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3 text-muted-foreground" />
                          {tech.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="mr-1 h-3 w-3 text-muted-foreground" />
                          {tech.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Wrench className="mr-1 h-3 w-3 text-muted-foreground" />
                        {tech.specialization}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={tech.status === "Active" ? "outline" : "secondary"}
                        className={tech.status === "Active" ? "bg-green-100 text-green-800" : ""}
                      >
                        {tech.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="mr-1 h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span>{tech.rating}</span>
                      </div>
                    </TableCell>
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
