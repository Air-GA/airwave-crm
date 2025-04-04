
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Alert, 
  AlertDescription 
} from "@/components/ui/alert";
import { 
  CalendarClock, 
  MapPin, 
  UserRound, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import { Customer, WorkOrder } from "@/types";
import { formatDate } from "@/lib/date-utils";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

// Sample time slots for maintenance
const TIME_SLOTS = [
  "8:00 AM - 11:00 AM",
  "11:00 AM - 2:00 PM",
  "2:00 PM - 5:00 PM"
];

interface MaintenanceItem {
  customerId: string;
  customerName: string;
  address: string;
  preferredTime: string;
  lastService?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface MaintenancePlanListProps {
  onDragStart: (item: MaintenanceItem) => void;
  onSchedule: (item: MaintenanceItem) => void;
}

const DraggableMaintenanceItem = ({ item, onSchedule }: { 
  item: MaintenanceItem; 
  onSchedule: (item: MaintenanceItem) => void;
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `maintenance-${item.customerId}`,
    data: item
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "border rounded-md p-3 mb-2 cursor-grab hover:border-primary transition-colors",
        isDragging && "opacity-50 border-primary"
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium">{item.customerName}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {item.address}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="h-3.5 w-3.5" />
            Preferred: {item.preferredTime}
          </div>
          {item.lastService && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <CalendarClock className="h-3.5 w-3.5" />
              Last service: {formatDate(new Date(item.lastService))}
            </div>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            onSchedule(item);
          }}
        >
          Schedule
        </Button>
      </div>
    </div>
  );
};

const MaintenancePlanList = ({
  onDragStart,
  onSchedule
}: MaintenancePlanListProps) => {
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortByLocation, setSortByLocation] = useState(false);

  // Get current month for display
  const currentMonth = useMemo(() => {
    return new Date().toLocaleString('default', { month: 'long' });
  }, []);

  // Fetch customers with maintenance plans due this month
  useEffect(() => {
    const fetchMaintenancePlans = async () => {
      try {
        setLoading(true);
        
        // This would be replaced with a real API call to fetch maintenance customers
        // For now, using mock data with location info
        const mockMaintenanceItems: MaintenanceItem[] = [
          {
            customerId: "cust-1",
            customerName: "John Smith",
            address: "123 Main St, Cityville",
            preferredTime: TIME_SLOTS[0],
            lastService: "2024-01-15",
            location: { lat: 35.12, lng: -80.71 }
          },
          {
            customerId: "cust-2",
            customerName: "Emily Johnson",
            address: "456 Park Ave, Cityville",
            preferredTime: TIME_SLOTS[1],
            lastService: "2024-01-20",
            location: { lat: 35.13, lng: -80.72 }
          },
          {
            customerId: "cust-3",
            customerName: "Michael Brown",
            address: "789 Oak Dr, Townsville",
            preferredTime: TIME_SLOTS[2],
            lastService: "2024-02-05",
            location: { lat: 35.20, lng: -80.80 }
          },
          {
            customerId: "cust-4",
            customerName: "Sarah Wilson",
            address: "101 Pine St, Cityville",
            preferredTime: TIME_SLOTS[0],
            lastService: "2024-02-10",
            location: { lat: 35.14, lng: -80.73 }
          },
          {
            customerId: "cust-5",
            customerName: "David Miller",
            address: "202 Elm Rd, Townsville",
            preferredTime: TIME_SLOTS[1],
            lastService: "2024-02-18",
            location: { lat: 35.22, lng: -80.82 }
          }
        ];
        
        setMaintenanceItems(mockMaintenanceItems);
        setError(null);
      } catch (err) {
        console.error("Error fetching maintenance plans:", err);
        setError("Failed to load maintenance plans. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenancePlans();
  }, []);

  // Group items by location proximity for displaying nearby addresses
  const groupedByProximity = useMemo(() => {
    if (!sortByLocation) return null;
    
    // This is a simplified grouping strategy - in a real implementation, 
    // you would use a proper distance calculation algorithm
    const groups: { [key: string]: MaintenanceItem[] } = {};
    
    // Group by general area (first 3 digits of address for this example)
    maintenanceItems.forEach(item => {
      const addressKey = item.address.split(' ')[0].substring(0, 3);
      if (!groups[addressKey]) {
        groups[addressKey] = [];
      }
      groups[addressKey].push(item);
    });
    
    return groups;
  }, [maintenanceItems, sortByLocation]);

  const handleDragStart = (item: MaintenanceItem) => {
    onDragStart(item);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Biannual HVAC Maintenance ({currentMonth})</CardTitle>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="group-nearby" 
              checked={sortByLocation} 
              onCheckedChange={() => setSortByLocation(!sortByLocation)}
            />
            <label 
              htmlFor="group-nearby" 
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Group nearby addresses
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <p className="text-muted-foreground">Loading maintenance plans...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : maintenanceItems.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted-foreground">No maintenance plans due this month.</p>
          </div>
        ) : sortByLocation && groupedByProximity ? (
          // Display grouped by location
          Object.entries(groupedByProximity).map(([location, items], index) => (
            <div key={location} className="mb-4">
              <div className="flex items-center mb-2">
                <Badge variant="outline" className="mr-2">Group {index + 1}</Badge>
                <span className="text-sm text-muted-foreground">
                  {items.length} addresses in proximity
                </span>
              </div>
              {items.map(item => (
                <DraggableMaintenanceItem
                  key={item.customerId}
                  item={item}
                  onSchedule={() => onSchedule(item)}
                />
              ))}
            </div>
          ))
        ) : (
          // Display list without grouping
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Drag items to the calendar or use Schedule button
            </p>
            {maintenanceItems.map(item => (
              <DraggableMaintenanceItem
                key={item.customerId}
                item={item}
                onSchedule={() => onSchedule(item)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaintenancePlanList;
