
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface TimesheetStats {
  hours: number;
  entries: number;
  approved: number;
  pending: number;
}

interface TimesheetStatsProps {
  stats: TimesheetStats;
  weekStart: Date | null;
  weekEnd: Date | null;
}

export const TimesheetStats = ({ stats, weekStart, weekEnd }: TimesheetStatsProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };
  
  const currentPayPeriod = weekStart && weekEnd ? 
    `${formatDate(weekStart)} - ${formatDate(weekEnd)}` : 
    "Current Pay Period";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.hours} hrs</div>
          <p className="text-xs text-muted-foreground">{currentPayPeriod}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Timesheet Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.entries}</div>
          <p className="text-xs text-muted-foreground">{currentPayPeriod}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Approved Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.approved}</div>
          <p className="text-xs text-green-500">Ready for payroll</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending}</div>
          <p className="text-xs text-amber-500">Awaiting review</p>
        </CardContent>
      </Card>
    </div>
  );
};
