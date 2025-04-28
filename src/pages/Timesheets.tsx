
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { TimeClock } from "@/components/timesheets/TimeClock";
import { TimesheetStats } from "@/components/timesheets/TimesheetStats";
import { WeeklyTimesheet } from "@/components/timesheets/WeeklyTimesheet";
import { DailyHoursChart } from "@/components/timesheets/DailyHoursChart";
import { TimesheetStats as TimesheetStatsType } from "@/components/timesheets/types";
import { ClockEvent, TimeEntry } from "@/components/timesheets/types";

const Timesheets = () => {
  const { user, userRole } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState("current");
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [clockOutTime, setClockOutTime] = useState<Date | null>(null);
  const [clockEvents, setClockEvents] = useState<ClockEvent[]>([]);
  const [activeTab, setActiveTab] = useState("daily");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [weekEnd, setWeekEnd] = useState<Date | null>(null);
  const [timesheetEntries, setTimesheetEntries] = useState<TimeEntry[]>([]);
  
  // Permission check for viewing all timesheets
  const canViewAllTimesheets = userRole === 'admin' || userRole === 'manager' || userRole === 'hr';
  
  // Timesheet statistics
  const timesheetStats: TimesheetStatsType = {
    hours: 37.5,
    entries: 15,
    approved: 12,
    pending: 3
  };
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  // Load clock state from localStorage on component mount
  useEffect(() => {
    if (user) {
      const storedClockInTime = localStorage.getItem('clockInTime_' + user.id);
      if (storedClockInTime) {
        setClockInTime(new Date(JSON.parse(storedClockInTime)));
        setIsClockedIn(true);
      }
      
      const storedEvents = localStorage.getItem('clockEvents');
      if (storedEvents) {
        const events = JSON.parse(storedEvents)
          .map((event: any) => ({
            ...event,
            timestamp: new Date(event.timestamp)
          }));
        setClockEvents(events);
      }
    }
  }, [user]);
  
  // Set week start and end dates based on selected week
  useEffect(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    if (selectedWeek === 'current') {
      setWeekStart(startOfWeek);
      setWeekEnd(endOfWeek);
    } else if (selectedWeek === 'previous') {
      const prevWeekStart = new Date(startOfWeek);
      prevWeekStart.setDate(prevWeekStart.getDate() - 7);
      
      const prevWeekEnd = new Date(endOfWeek);
      prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);
      
      setWeekStart(prevWeekStart);
      setWeekEnd(prevWeekEnd);
    } else if (selectedWeek === 'two-weeks-ago') {
      const twoWeeksAgoStart = new Date(startOfWeek);
      twoWeeksAgoStart.setDate(twoWeeksAgoStart.getDate() - 14);
      
      const twoWeeksAgoEnd = new Date(endOfWeek);
      twoWeeksAgoEnd.setDate(twoWeeksAgoEnd.getDate() - 14);
      
      setWeekStart(twoWeeksAgoStart);
      setWeekEnd(twoWeeksAgoEnd);
    }
  }, [selectedWeek]);
  
  // Load timesheet entries (mock data for now)
  useEffect(() => {
    if (weekStart && weekEnd) {
      // In a real app, this would be a call to an API
      // For now we'll generate some mock data based on the selected week
      const startDate = new Date(weekStart);
      const mockEntries: TimeEntry[] = [];
      
      for (let i = 0; i < 5; i++) {
        const entryDate = new Date(startDate);
        entryDate.setDate(startDate.getDate() + i);
        
        const clockIn = new Date(entryDate);
        clockIn.setHours(9, 0, 0, 0);
        
        const clockOut = new Date(entryDate);
        clockOut.setHours(17, 0, 0, 0);
        
        mockEntries.push({
          id: `TS-${selectedWeek}-${i + 1}`,
          date: entryDate.toISOString(),
          technician: "John Doe",
          jobNumber: `JOB-${1000 + i}`,
          customer: `Customer ${i + 1}`,
          clockIn,
          clockOut,
          hours: 8,
          status: i < 3 ? 'approved' : 'pending'
        });
      }
      
      setTimesheetEntries(mockEntries);
    }
  }, [weekStart, weekEnd, selectedWeek]);
  
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
        
        <TimeClock
          clockInTime={clockInTime}
          setClockInTime={setClockInTime}
          clockOutTime={clockOutTime}
          setClockOutTime={setClockOutTime}
          isClockedIn={isClockedIn}
          setIsClockedIn={setIsClockedIn}
          clockEvents={clockEvents}
          setClockEvents={setClockEvents}
          currentTime={currentTime}
        />
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <TimesheetStats 
            stats={timesheetStats}
            weekStart={weekStart}
            weekEnd={weekEnd}
          />
          
          <DailyHoursChart 
            timesheetEntries={timesheetEntries}
            weekStart={weekStart}
            weekEnd={weekEnd}
          />
        </div>
        
        <WeeklyTimesheet
          weekStart={weekStart}
          weekEnd={weekEnd}
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
          timesheetEntries={timesheetEntries}
          stats={timesheetStats}
        />
      </div>
    </MainLayout>
  );
};

export default Timesheets;
