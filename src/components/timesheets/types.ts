
export interface TimesheetStats {
  hours: number;
  entries: number;
  approved: number;
  pending: number;
}

export interface ClockEvent {
  id: string;
  userId: string;
  userName: string;
  type: 'in' | 'out';
  timestamp: Date;
  notes?: string;
}

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
