
import { useState, useEffect } from "react";
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
  Timer,
  TimerOff,
  ClockAlert,
  DollarSign,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { SyncButton } from "@/components/SyncButton";
import apiIntegrationService from "@/services/apiIntegrationService";

interface TimesheetStats {
  hours: number;
  entries: number;
  approved: number;
  pending: number;
}

interface ClockEvent {
  id: string;
  userId: string;
  userName: string;
  type: 'in' | 'out';
  timestamp: Date;
  notes?: string;
}

interface TimeEntry {
  id: string;
  date: string;
  technician: string;
  jobNumber?: string;
  customer?: string;
  clockIn: Date;
  clockOut?: Date;
  hours?: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

const Timesheets = () => {
  const isMobile = useIsMobile();
  const { user, permissions, userRole } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState("current");
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [clockOutTime, setClockOutTime] = useState<Date | null>(null);
  const [clockEvents, setClockEvents] = useState<ClockEvent[]>([]);
  const [activeTab, setActiveTab] = useState("daily");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [weekEnd, setWeekEnd] = useState<Date | null>(null);
  const [timesheetEntries, setTimesheetEntries] = useState<any[]>([]);
  const [isSyncingWithQuickbooks, setIsSyncingWithQuickbooks] = useState(false);
  
  // Check if user has permission to view all timesheets
  const canViewAllTimesheets = 
    permissions?.canViewHRInfo || 
    user?.role === 'admin' || 
    user?.role === 'manager' || 
    user?.role === 'hr';
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const today = new Date();
    let startDay = new Date(today);
    
    // Find the previous Thursday (day 4)
    while (startDay.getDay() !== 4) {
      startDay.setDate(startDay.getDate() - 1);
    }
    
    if (today.getDay() >= 4) {
    } else {
      startDay.setDate(startDay.getDate() - 7);
    }
    
    startDay.setHours(0, 0, 0, 0);
    const endDay = new Date(startDay);
    endDay.setDate(endDay.getDate() + 6);
    endDay.setHours(23, 59, 59, 999);
    
    setWeekStart(startDay);
    setWeekEnd(endDay);
  }, [selectedWeek]);
  
  useEffect(() => {
    // Load clock events for the current user
    const storedClockIn = localStorage.getItem('clockInTime_' + user?.id);
    const storedEvents = localStorage.getItem('clockEvents');
    
    if (storedClockIn) {
      const clockInDate = new Date(JSON.parse(storedClockIn));
      setClockInTime(clockInDate);
      setIsClockedIn(true);
    }
    
    if (storedEvents) {
      const allEvents = JSON.parse(storedEvents).map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp)
      }));
      
      // Filter events to only show current user's events unless admin/hr/manager
      const filteredEvents = canViewAllTimesheets
        ? allEvents
        : allEvents.filter((event: ClockEvent) => event.userId === user?.id);
      
      setClockEvents(filteredEvents);
    }
    
    // Filter timesheet entries based on user role
    const mockTimesheetEntries = [
      {
        id: "TS1001",
        date: "2023-09-04",
        technician: "Mike Johnson",
        technicianId: "1",
        jobNumber: "JOB4532",
        customer: "Peachtree Office Center",
        hours: 8,
        status: "approved"
      },
      {
        id: "TS1002",
        date: "2023-09-05",
        technician: "Mike Johnson",
        technicianId: "1",
        jobNumber: "JOB4533",
        customer: "Downtown Residences",
        hours: 7.5,
        status: "approved"
      },
      {
        id: "TS1003",
        date: "2023-09-06",
        technician: "Mike Johnson",
        technicianId: "1",
        jobNumber: "JOB4536",
        customer: "Riverfront Hotel",
        hours: 6,
        status: "approved"
      },
      {
        id: "TS1004",
        date: "2023-09-07",
        technician: "David Chen",
        technicianId: "2",
        jobNumber: "JOB4538",
        customer: "Westside Apartments",
        hours: 8,
        status: "approved"
      },
      {
        id: "TS1005",
        date: "2023-09-08",
        technician: "Sarah Williams",
        technicianId: "3",
        jobNumber: "JOB4541",
        customer: "North Hills Mall",
        hours: 8,
        status: "approved"
      },
    ];
    
    // Filter timesheet entries based on user permissions
    if (canViewAllTimesheets) {
      setTimesheetEntries(mockTimesheetEntries);
    } else {
      // For non-admin users, only show their own entries
      const filteredEntries = mockTimesheetEntries.filter(
        entry => entry.technicianId === user?.id
      );
      setTimesheetEntries(filteredEntries);
    }
  }, [user, canViewAllTimesheets]);
  
  const timesheetStats: TimesheetStats = {
    hours: 37.5,
    entries: 15,
    approved: 12,
    pending: 3
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  
  const calculateHours = (clockIn: Date, clockOut: Date) => {
    const diffMs = clockOut.getTime() - clockIn.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    return Math.round(diffHrs * 100) / 100;
  };
  
  const handleClockIn = () => {
    if (!user) return;
    
    const now = new Date();
    setClockInTime(now);
    setIsClockedIn(true);
    
    const newEvent: ClockEvent = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name || user.email,
      type: 'in',
      timestamp: now
    };
    
    const updatedEvents = [...clockEvents, newEvent];
    const allEvents = localStorage.getItem('clockEvents')
      ? [...JSON.parse(localStorage.getItem('clockEvents')!).map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        })), newEvent]
      : [newEvent];
    
    setClockEvents(canViewAllTimesheets ? allEvents : updatedEvents);
    
    localStorage.setItem('clockInTime_' + user.id, JSON.stringify(now));
    localStorage.setItem('clockEvents', JSON.stringify(allEvents));
    
    toast.success("You have clocked in", {
      description: `Time: ${formatTime(now)}`
    });
  };
  
  const handleClockOut = () => {
    if (!user || !clockInTime) return;
    
    const now = new Date();
    setClockOutTime(now);
    setIsClockedIn(false);
    
    const hours = calculateHours(clockInTime, now);
    
    const newEvent: ClockEvent = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name || user.email,
      type: 'out',
      timestamp: now
    };
    
    const allEvents = localStorage.getItem('clockEvents')
      ? [...JSON.parse(localStorage.getItem('clockEvents')!).map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        })), newEvent]
      : [newEvent];
    
    const updatedEvents = [...clockEvents, newEvent];
    setClockEvents(canViewAllTimesheets ? allEvents : updatedEvents);
    
    localStorage.removeItem('clockInTime_' + user.id);
    localStorage.setItem('clockEvents', JSON.stringify(allEvents));
    
    toast.success("You have clocked out", {
      description: `Duration: ${hours} hours`
    });
  };
  
  const handleSyncWithQuickbooks = async () => {
    if (!weekStart || !weekEnd) return;
    
    setIsSyncingWithQuickbooks(true);
    try {
      // Format dates for API call
      const fromDate = weekStart.toISOString().split('T')[0];
      const toDate = weekEnd.toISOString().split('T')[0];
      
      // Call the integration service
      const success = await apiIntegrationService.quickbooks.syncTimesheets(fromDate, toDate);
      
      if (success) {
        toast.success("Timesheets synced with QuickBooks", {
          description: `Pay period: ${formatDate(weekStart)} - ${formatDate(weekEnd)}`
        });
      }
    } catch (error) {
      console.error('Error syncing with QuickBooks:', error);
      toast.error("Failed to sync timesheets with QuickBooks");
    } finally {
      setIsSyncingWithQuickbooks(false);
    }
  };
  
  const currentPayPeriod = weekStart && weekEnd ? 
    `${formatDate(weekStart)} - ${formatDate(weekEnd)}` : 
    "Current Pay Period";
  
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
            
            {/* QuickBooks Sync Button - Only for Admin/HR/Manager */}
            {canViewAllTimesheets && (
              <Button 
                variant="outline"
                onClick={handleSyncWithQuickbooks}
                disabled={isSyncingWithQuickbooks}
              >
                {isSyncingWithQuickbooks ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <DollarSign className="mr-2 h-4 w-4" />
                )}
                Sync to QuickBooks
              </Button>
            )}
          </div>
        </div>
        
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50/50">
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Time Clock
            </CardTitle>
            <CardDescription>
              Record your work hours by clocking in and out
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2">
                <div className="text-xl font-bold">{formatTime(currentTime)}</div>
                <div className="text-muted-foreground">{formatDate(currentTime)}</div>
              </div>
              <div className="flex space-x-4">
                <Button
                  variant={isClockedIn ? "outline" : "default"}
                  className={!isClockedIn ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={handleClockIn}
                  disabled={isClockedIn}
                >
                  <Timer className="mr-2 h-4 w-4" />
                  Clock In
                </Button>
                <Button 
                  variant={!isClockedIn ? "outline" : "destructive"}
                  onClick={handleClockOut}
                  disabled={!isClockedIn}
                >
                  <TimerOff className="mr-2 h-4 w-4" />
                  Clock Out
                </Button>
              </div>
            </div>
            
            {isClockedIn && (
              <div className="mt-6 p-4 bg-blue-50 rounded-md flex flex-col md:flex-row justify-between items-center">
                <div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <Timer className="mr-1 h-3 w-3" />
                    Currently Clocked In
                  </Badge>
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground">Clocked in at:</span>{" "}
                    <span className="font-medium">{clockInTime && formatTime(clockInTime)}</span>
                  </div>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className="text-sm text-muted-foreground">Duration:</span>{" "}
                  <span className="font-bold">
                    {clockInTime && calculateHours(clockInTime, currentTime).toFixed(2)} hrs
                  </span>
                </div>
              </div>
            )}
            
            {clockEvents.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">
                  {canViewAllTimesheets ? "All Time Entries" : "Your Time Entries"}
                </h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        {canViewAllTimesheets && <TableHead>User</TableHead>}
                        <TableHead>Type</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clockEvents
                        .slice(-6)
                        .reverse()
                        .map((event) => (
                          <TableRow key={event.id}>
                            <TableCell>{formatDate(event.timestamp)}</TableCell>
                            {canViewAllTimesheets && <TableCell>{event.userName}</TableCell>}
                            <TableCell>
                              {event.type === 'in' ? (
                                <Badge className="bg-green-100 text-green-800">Clock In</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">Clock Out</Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatTime(event.timestamp)}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timesheetStats.hours} hrs</div>
              <p className="text-xs text-muted-foreground">{currentPayPeriod}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Timesheet Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timesheetStats.entries}</div>
              <p className="text-xs text-muted-foreground">{currentPayPeriod}</p>
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
                <CardDescription>{currentPayPeriod}</CardDescription>
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
                    {!isMobile && canViewAllTimesheets && <TableHead>Technician</TableHead>}
                    <TableHead>Job/Customer</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead>Status</TableHead>
                    {canViewAllTimesheets && <TableHead>QuickBooks Status</TableHead>}
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
                      {!isMobile && canViewAllTimesheets && <TableCell>{entry.technician}</TableCell>}
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
                      {canViewAllTimesheets && (
                        <TableCell>
                          {entry.id.includes('3') ? (
                            <Badge variant="outline" className="bg-red-50 text-red-700">
                              Not Synced
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Synced
                            </Badge>
                          )}
                        </TableCell>
                      )}
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
            <div className="flex gap-2">
              {canViewAllTimesheets && (
                <Button 
                  variant="outline" 
                  onClick={handleSyncWithQuickbooks}
                  disabled={isSyncingWithQuickbooks}
                >
                  {isSyncingWithQuickbooks ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <DollarSign className="mr-2 h-4 w-4" />
                  )}
                  Sync to QuickBooks
                </Button>
              )}
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" /> Generate Report
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Timesheets;
