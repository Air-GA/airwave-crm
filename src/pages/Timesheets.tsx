
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Calendar, 
  Check, 
  Clock, 
  Download, 
  Filter, 
  Plus, 
  Search, 
  UserRound, 
  X 
} from "lucide-react";
import { formatDate } from "@/lib/date-utils";

const Timesheets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("current");
  
  // Mock data for timesheets
  const currentWeekEntries = [
    {
      id: "TS-2023-001",
      technicianName: "Mike Johnson",
      date: "2023-08-21",
      startTime: "08:00 AM",
      endTime: "05:00 PM",
      totalHours: 8,
      workOrderIds: ["WO-23-1547", "WO-23-1550"],
      status: "approved"
    },
    {
      id: "TS-2023-002",
      technicianName: "David Chen",
      date: "2023-08-21",
      startTime: "09:00 AM",
      endTime: "06:00 PM",
      totalHours: 8,
      workOrderIds: ["WO-23-1548"],
      status: "pending"
    },
    {
      id: "TS-2023-003",
      technicianName: "Sarah Williams",
      date: "2023-08-21",
      startTime: "08:30 AM",
      endTime: "04:30 PM",
      totalHours: 7,
      workOrderIds: ["WO-23-1549", "WO-23-1551"],
      status: "approved"
    },
    {
      id: "TS-2023-004",
      technicianName: "Mike Johnson",
      date: "2023-08-22",
      startTime: "08:00 AM",
      endTime: "05:00 PM",
      totalHours: 8,
      workOrderIds: ["WO-23-1552"],
      status: "approved"
    },
    {
      id: "TS-2023-005",
      technicianName: "David Chen",
      date: "2023-08-22",
      startTime: "09:00 AM",
      endTime: "06:00 PM",
      totalHours: 8,
      workOrderIds: ["WO-23-1553", "WO-23-1554"],
      status: "pending"
    },
  ];
  
  // Filter timesheet entries
  const filteredEntries = currentWeekEntries.filter(entry => 
    entry.technicianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.workOrderIds.some(wo => wo.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Calculate weekly totals
  const weeklyTotals = filteredEntries.reduce((acc, entry) => {
    if (!acc[entry.technicianName]) {
      acc[entry.technicianName] = {
        hours: 0,
        entries: 0,
        approved: 0,
        pending: 0
      };
    }
    
    acc[entry.technicianName].hours += entry.totalHours;
    acc[entry.technicianName].entries += 1;
    
    if (entry.status === 'approved') {
      acc[entry.technicianName].approved += 1;
    } else if (entry.status === 'pending') {
      acc[entry.technicianName].pending += 1;
    }
    
    return acc;
  }, {});
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Timesheets</h1>
            <p className="text-muted-foreground">Track technician hours and job times</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Time Entry
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
        
        {/* Week selection */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Weekly Timesheet</CardTitle>
              <div className="flex gap-2">
                <Button variant={selectedWeek === "previous" ? "default" : "outline"} size="sm" onClick={() => setSelectedWeek("previous")}>
                  Previous Week
                </Button>
                <Button variant={selectedWeek === "current" ? "default" : "outline"} size="sm" onClick={() => setSelectedWeek("current")}>
                  Current Week
                </Button>
                <Button variant={selectedWeek === "next" ? "default" : "outline"} size="sm" onClick={() => setSelectedWeek("next")}>
                  Next Week
                </Button>
              </div>
            </div>
            <CardDescription className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> August 21 - August 27, 2023
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Total Hours</div>
                <div className="mt-2 text-2xl font-bold">
                  {Object.values(weeklyTotals).reduce((sum, tech) => sum + tech.hours, 0)}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Time Entries</div>
                <div className="mt-2 text-2xl font-bold">
                  {filteredEntries.length}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Approved</div>
                <div className="mt-2 text-2xl font-bold text-green-500">
                  {Object.values(weeklyTotals).reduce((sum, tech) => sum + tech.approved, 0)}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Pending Approval</div>
                <div className="mt-2 text-2xl font-bold text-amber-500">
                  {Object.values(weeklyTotals).reduce((sum, tech) => sum + tech.pending, 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Search bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search technicians or work orders..."
              className="pl-8 w-full md:max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button variant="outline">
            <Filter className="mr-1 h-4 w-4" /> Filters
          </Button>
        </div>
        
        {/* Technician summary */}
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(weeklyTotals).map(([technicianName, data]) => (
            <Card key={technicianName}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{technicianName}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Hours</div>
                    <div className="text-xl font-semibold">{data.hours}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Entries</div>
                    <div className="text-xl font-semibold">{data.entries}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Approved</div>
                    <div className="flex items-center gap-1 text-green-500">
                      <Check className="h-4 w-4" /> {data.approved}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Clock className="h-4 w-4" /> {data.pending}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Time entries table */}
        <Card>
          <CardHeader>
            <CardTitle>Time Entries</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Work Orders</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.technicianName}</TableCell>
                    <TableCell>{formatDate(new Date(entry.date))}</TableCell>
                    <TableCell>{entry.startTime} - {entry.endTime}</TableCell>
                    <TableCell>{entry.totalHours}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {entry.workOrderIds.map(id => (
                          <Badge key={id} variant="outline" className="text-xs">
                            {id}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          entry.status === 'approved' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-amber-50 text-amber-700'
                        }
                      >
                        {entry.status === 'approved' ? 'Approved' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Timesheets;
