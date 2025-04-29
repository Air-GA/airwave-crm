// Date utility functions
import { format } from "date-fns";

// Format a date for display
export const formatDate = (date: Date | string, formatStr = 'PPP'): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  try {
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Format a date as YYYY-MM-DD
export const formatDateYYYYMMDD = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Format a time as HH:MM AM/PM
export const formatTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

// Format a date and time as YYYY-MM-DD HH:MM AM/PM
export const formatDateTime = (date: Date): string => {
  return format(date, 'yyyy-MM-dd h:mm a');
};

// Add more date utility functions as needed...
