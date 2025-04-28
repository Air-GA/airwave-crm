
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, TimerOff } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export interface ClockEvent {
  id: string;
  userId: string;
  userName: string;
  type: 'in' | 'out';
  timestamp: Date;
  notes?: string;
}

interface TimeClockProps {
  clockInTime: Date | null;
  setClockInTime: React.Dispatch<React.SetStateAction<Date | null>>;
  clockOutTime: Date | null;
  setClockOutTime: React.Dispatch<React.SetStateAction<Date | null>>;
  isClockedIn: boolean;
  setIsClockedIn: React.Dispatch<React.SetStateAction<boolean>>;
  clockEvents: ClockEvent[];
  setClockEvents: React.Dispatch<React.SetStateAction<ClockEvent[]>>;
  currentTime: Date;
}

export const TimeClock = ({
  clockInTime,
  setClockInTime,
  clockOutTime,
  setClockOutTime,
  isClockedIn,
  setIsClockedIn,
  clockEvents,
  setClockEvents,
  currentTime,
}: TimeClockProps) => {
  const { user, userRole } = useAuth();
  const canViewAllTimesheets = userRole === 'admin' || userRole === 'manager' || userRole === 'hr';

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

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-blue-50/50">
        <CardTitle className="flex items-center">
          <Timer className="mr-2 h-5 w-5" />
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
  );
};
