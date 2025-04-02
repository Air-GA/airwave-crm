
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  PlusCircle,
  Upload,
  User,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

// Define types for our timesheet data
interface TimesheetStats {
  hours: number;
  entries: number;
  approved: number;
  pending: number;
}

const Timesheets = () => {
  const isMobile = useIsMobile();
  const [selectedWeek, setSelectedWeek] = useState("current");
  
  // Mock timesheet data
  const timesheetStats: TimesheetStats = {
    hours: 37.5,
    entries: 15,
    approved: 12,
    pending: 3
  };
  
  const timesheetEntries = [
    {
      id: "TS1001",
      date: "2023-09-04",
      technician: "Mike Johnson",
      jobNumber: "JOB4532",
      customer: "Peachtree Office Center",
      hours: 8,
      status: "approved"
    },
    {
      id: "TS1002",
      date: "2023-09-05",
      technician: "Mike Johnson",
      jobNumber: "JOB4533",
      customer: "Downtown Residences",
      hours: 7.5,
      status: "approved"
    },
    {
      id: "TS1003",
      date: "2023-09-06",
      technician: "Mike Johnson",
      jobNumber: "JOB4536",
      customer: "Riverfront Hotel",
      hours: 6,
      status: "approved"
    },
    {
      id: "TS1004",
      date: "2023-09-07",
      technician: "Mike Johnson",
      jobNumber: "JOB4538",
      customer: "Westside Apartments",
      hours: 8,
      status: "approved"
    },
    {
      id: "TS1005",
      date: "2023-09-08",
      technician: "Mike Johnson",
      jobNumber: "JOB4541",
      customer: "North Hills Mall",
      hours: 8,
      status: "approved"
    },
  ];
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Timesheets</h1>
            <p className="text-muted-foreground">Track and manage work hours</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> New Timesheet
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timesheetStats.hours} hrs</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Timesheet Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timesheetStats.entries}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timesheetStats.approved}</div>
              <p className="text-xs text-green-500">Ready for payroll</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timesheetStats.pending}</div>
              <p className="text-xs text-amber-500">Awaiting review</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div>
                <CardTitle>Weekly Timesheet</CardTitle>
                <CardDescription>September 4 - September 8, 2023</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select defaultValue={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Week" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Week</SelectItem>
                    <SelectItem value="previous">Previous Week</SelectItem>
                    <SelectItem value="two-weeks-ago">Two Weeks Ago</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="flex items-center justify-between border-b bg-muted/40 p-4">
                <div className="font-medium">
                  Total Hours: {timesheetStats.hours}
                </div>
                <div className="font-medium">
                  Entries: {timesheetStats.entries}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className="flex items-center gap-1 text-sm">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    {timesheetStats.approved} Approved
                  </span>
                  <span className="flex items-center gap-1 text-sm">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    {timesheetStats.pending} Pending
                  </span>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    {!isMobile && <TableHead>Timesheet ID</TableHead>}
                    {!isMobile && <TableHead>Technician</TableHead>}
                    <TableHead>Job/Customer</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timesheetEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      {!isMobile && <TableCell>{entry.id}</TableCell>}
                      {!isMobile && <TableCell>{entry.technician}</TableCell>}
                      <TableCell>
                        <div className="font-medium">{entry.jobNumber}</div>
                        <div className="text-xs text-muted-foreground">{entry.customer}</div>
                      </TableCell>
                      <TableCell className="text-right">{entry.hours}</TableCell>
                      <TableCell>
                        {entry.status === "approved" ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" /> View Time Details
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" /> Generate Report
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Submit New Hours</CardTitle>
            <CardDescription>
              Log your work hours for a specific job
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily">
              <TabsList>
                <TabsTrigger value="daily">Daily Entry</TabsTrigger>
                <TabsTrigger value="weekly">Weekly Entry</TabsTrigger>
              </TabsList>
              <TabsContent value="daily" className="space-y-4 pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="technician">Technician</Label>
                    <Select defaultValue="mike">
                      <SelectTrigger id="technician">
                        <SelectValue placeholder="Select Technician" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mike">Mike Johnson</SelectItem>
                        <SelectItem value="david">David Chen</SelectItem>
                        <SelectItem value="sarah">Sarah Williams</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job">Job Number</Label>
                    <Select>
                      <SelectTrigger id="job">
                        <SelectValue placeholder="Select Job" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="job4541">JOB4541 - North Hills Mall</SelectItem>
                        <SelectItem value="job4542">JOB4542 - Eastside Offices</SelectItem>
                        <SelectItem value="job4543">JOB4543 - Downtown Hotel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours Worked</Label>
                    <Input id="hours" type="number" min="0" step="0.5" placeholder="8.0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input id="notes" placeholder="Any notes about the work performed" />
                </div>
              </TabsContent>
              <TabsContent value="weekly" className="pt-4">
                <div className="text-center text-muted-foreground">
                  Weekly timesheet entry coming soon.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Submit Hours
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Timesheets;
