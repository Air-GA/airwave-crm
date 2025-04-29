
import { format, isToday, parseISO } from "date-fns";

/**
 * Formats a date in a readable format
 * @param date Date to format, can be Date object or ISO string
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, 'h:mm a')}`;
  }
  
  return format(dateObj, 'MMM d, yyyy');
};

/**
 * Formats time from a date
 * @param date Date to format, can be Date object or ISO string
 * @returns Formatted time string
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'h:mm a');
};

/**
 * Gets a readable date range string (e.g. "Jan 1 - Jan 5, 2023")
 * @param startDate Start date
 * @param endDate End date
 * @returns Formatted date range string
 */
export const getDateRangeString = (startDate: Date, endDate: Date): string => {
  if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'd, yyyy')}`;
  }
  
  if (startDate.getFullYear() === endDate.getFullYear()) {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  }
  
  return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
};
