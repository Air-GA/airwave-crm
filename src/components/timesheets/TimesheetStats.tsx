
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/date-utils";
import { TimesheetStats as TimesheetStatsType } from "./types";

interface TimesheetStatsProps {
  stats: TimesheetStatsType;
  weekStart: Date | null;
  weekEnd: Date | null;
}

export const TimesheetStats = ({ stats, weekStart, weekEnd }: TimesheetStatsProps) => {  
  const currentPayPeriod = weekStart && weekEnd ? 
    `${formatDate(weekStart)} - ${formatDate(weekEnd)}` : 
    "Current Pay Period";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timesheet Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Total Hours</div>
            <div className="text-2xl font-bold">{stats.hours} hrs</div>
            <p className="text-xs text-muted-foreground">{currentPayPeriod}</p>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Timesheet Entries</div>
            <div className="text-2xl font-bold">{stats.entries}</div>
            <p className="text-xs text-muted-foreground">{currentPayPeriod}</p>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Approved Hours</div>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-green-500">Ready for payroll</p>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Pending Approval</div>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-amber-500">Awaiting review</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
