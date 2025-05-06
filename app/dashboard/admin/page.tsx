import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Wrench, DollarSign, UserPlus, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">+24 this month</p>
            <Progress value={85} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Technicians</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">3 currently on call</p>
            <Button variant="outline" className="mt-3 w-full">
              View Team
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
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
            <CardTitle className="text-sm font-medium">Service Calls</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-muted-foreground">This week</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs">Completed: 62</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <span className="text-xs">Pending: 25</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  user: "John Smith",
                  role: "Technician",
                  action: "Completed service call",
                  customer: "Johnson Residence",
                  time: "10 minutes ago",
                },
                {
                  user: "Sarah Johnson",
                  role: "Accounting",
                  action: "Created new invoice",
                  customer: "Garcia Office",
                  time: "45 minutes ago",
                },
                {
                  user: "Mike Davis",
                  role: "Admin",
                  action: "Added new customer",
                  customer: "Williams Family",
                  time: "2 hours ago",
                },
                {
                  user: "Lisa Chen",
                  role: "Technician",
                  action: "Updated service report",
                  customer: "Taylor Residence",
                  time: "3 hours ago",
                },
                {
                  user: "Robert Wilson",
                  role: "Accounting",
                  action: "Processed payment",
                  customer: "Smith Commercial",
                  time: "5 hours ago",
                },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-4 rounded-lg border p-3">
                  <Avatar>
                    <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                    <AvatarFallback>
                      {activity.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{activity.user}</p>
                      <Badge variant="outline">{activity.role}</Badge>
                    </div>
                    <p className="text-sm">
                      {activity.action} for <span className="font-medium">{activity.customer}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>System performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Customer Satisfaction",
                  value: "94%",
                  change: "+2%",
                  description: "Based on recent surveys",
                },
                {
                  title: "Average Response Time",
                  value: "2.4 hours",
                  change: "-15min",
                  description: "For emergency calls",
                },
                {
                  title: "Technician Efficiency",
                  value: "87%",
                  change: "+3%",
                  description: "Jobs completed on time",
                },
                {
                  title: "Maintenance Plan Subscribers",
                  value: "742",
                  change: "+18",
                  description: "Active subscribers",
                },
              ].map((stat, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{stat.title}</p>
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{stat.value}</span>
                      <span className={`text-xs ${stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                  <Progress value={Number.parseInt(stat.value) || 75} className="mt-2 h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage your team and permissions</CardDescription>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
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
                  role: "Technician",
                  status: "Active",
                  lastActive: "Now",
                },
                {
                  name: "Sarah Johnson",
                  role: "Accounting",
                  status: "Active",
                  lastActive: "2 hours ago",
                },
                {
                  name: "Mike Davis",
                  role: "Admin",
                  status: "Active",
                  lastActive: "1 hour ago",
                },
                {
                  name: "Lisa Chen",
                  role: "Technician",
                  status: "On Leave",
                  lastActive: "2 days ago",
                },
                {
                  name: "Robert Wilson",
                  role: "Accounting",
                  status: "Active",
                  lastActive: "30 minutes ago",
                },
              ].map((member, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>
                    <Badge
                      variant={member.status === "Active" ? "outline" : "secondary"}
                      className={member.status === "Active" ? "bg-green-100 text-green-800" : ""}
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.lastActive}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
