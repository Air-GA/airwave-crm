
type FormatDateOptions = {
  includeTime?: boolean;
  timeOnly?: boolean;
}

export function formatDate(date: Date, options?: FormatDateOptions): string {
  const { includeTime = false, timeOnly = false } = options || {};
  
  if (timeOnly) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  const formattedDate = date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
  
  if (includeTime) {
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${formattedDate} at ${formattedTime}`;
  }
  
  return formattedDate;
}
