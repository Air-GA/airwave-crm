
import { Calendar, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { TimesheetStats } from "./TimesheetStats";

export interface TimeEntry {
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

interface WeeklyTimesheetProps {
  weekStart: Date | null;
  weekEnd: Date | null;
  selectedWeek: string;
  setSelectedWeek: React.Dispatch<React.SetStateAction<string>>;
  timesheetEntries: TimeEntry[];
  stats: TimesheetStats;
}

export const WeeklyTimesheet = ({
  weekStart,
  weekEnd,
  selectedWeek,
  setSelectedWeek,
  timesheetEntries,
  stats
}: WeeklyTimesheetProps) => {
  const isMobile = useIsMobile();
  const { userRole } = useAuth();
  const canViewAllTimesheets = userRole === 'admin' || userRole === 'manager' || userRole === 'hr';
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <CardTitle>Weekly Timesheet</CardTitle>
            <CardDescription>{weekStart && weekEnd ? `${formatDate(weekStart)} - ${formatDate(weekEnd)}` : "Current Pay Period"}</CardDescription>
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
              Total Hours: {stats.hours}
            </div>
            <div className="font-medium">
              Entries: {stats.entries}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className="flex items-center gap-1 text-sm">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                {stats.approved} Approved
              </span>
              <span className="flex items-center gap-1 text-sm">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                {stats.pending} Pending
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
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" /> Generate Report
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
