import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, UserPlus, Edit, Trash2, MoreHorizontal } from "lucide-react"
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

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage system users and permissions</CardDescription>
          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-8" />
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
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      name: "John Smith",
                      email: "john.smith@example.com",
                      role: "Technician",
                      status: "Active",
                      lastActive: "Now",
                    },
                    {
                      name: "Sarah Johnson",
                      email: "sarah.johnson@example.com",
                      role: "Accounting",
                      status: "Active",
                      lastActive: "2 hours ago",
                    },
                    {
                      name: "Mike Davis",
                      email: "mike.davis@example.com",
                      role: "Admin",
                      status: "Active",
                      lastActive: "1 hour ago",
                    },
                    {
                      name: "Lisa Chen",
                      email: "lisa.chen@example.com",
                      role: "Technician",
                      status: "On Leave",
                      lastActive: "2 days ago",
                    },
                    {
                      name: "Robert Wilson",
                      email: "robert.wilson@example.com",
                      role: "Accounting",
                      status: "Active",
                      lastActive: "30 minutes ago",
                    },
                    {
                      name: "Emily Taylor",
                      email: "emily.taylor@example.com",
                      role: "Customer",
                      status: "Active",
                      lastActive: "5 days ago",
                    },
                    {
                      name: "David Martinez",
                      email: "david.martinez@example.com",
                      role: "Customer",
                      status: "Inactive",
                      lastActive: "3 weeks ago",
                    },
                  ].map((user, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === "Active" ? "outline" : "secondary"}
                          className={user.status === "Active" ? "bg-green-100 text-green-800" : ""}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.lastActive}</TableCell>
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
