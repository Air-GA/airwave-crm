
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useMemo } from "react";
import { TimeEntry } from "./types";
import { formatDate } from "@/lib/date-utils";

interface DailyHoursChartProps {
  timesheetEntries: TimeEntry[];
  weekStart: Date | null;
  weekEnd: Date | null;
}

export const DailyHoursChart = ({ timesheetEntries, weekStart, weekEnd }: DailyHoursChartProps) => {
  const chartData = useMemo(() => {
    if (!weekStart || !timesheetEntries.length) return [];

    // Initialize array for all days of the week with zero hours
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyHours = daysOfWeek.map(day => ({ name: day, hours: 0 }));
    
    // Sum up hours for each day
    timesheetEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      // Get day index (0-6, where 0 is Monday)
      const dayIndex = (entryDate.getDay() + 6) % 7; // Convert Sunday:0 to Sunday:6
      if (entry.hours) {
        dailyHours[dayIndex].hours += entry.hours;
      }
    });
    
    return dailyHours;
  }, [timesheetEntries, weekStart]);

  const weekRangeText = weekStart && weekEnd 
    ? `${formatDate(weekStart)} - ${formatDate(weekEnd)}`
    : "Current Week";

  const config = {
    hours: {
      color: "#9b87f5",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Hours</CardTitle>
        <CardDescription>{weekRangeText}</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer config={config}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="hours" fill="var(--color-hours)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
