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
  AlertCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Customer, WorkOrder } from "@/types";
import { formatDate } from "@/lib/date-utils";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { useWorkOrderStore } from "@/services/workOrderService";

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
        <div>
          <Badge className="mb-2" variant="outline">Maintenance</Badge>
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
    </div>
  );
};

const AreaGroup = ({ 
  title, 
  items, 
  onSchedule 
}: { 
  title: string; 
  items: MaintenanceItem[];
  onSchedule: (item: MaintenanceItem) => void;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-4">
      <div 
        className="flex items-center justify-between cursor-pointer py-1 border-b"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline">{title}</Badge>
          <span className="text-sm text-muted-foreground">
            ({items.length})
          </span>
        </div>
        <Button variant="ghost" size="sm">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {isOpen && items.map(item => (
        <DraggableMaintenanceItem
          key={item.customerId}
          item={item}
          onSchedule={onSchedule}
        />
      ))}
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
  const [sortByLocation, setSortByLocation] = useState(true);

  // Get scheduled maintenance work orders to filter them out
  const workOrders = useWorkOrderStore(state => state.workOrders);
  const scheduledMaintenanceIds = useMemo(() => {
    return workOrders
      .filter(order => order.type === 'maintenance' && 
              // Check if maintenance is already planned/scheduled
              (order.isMaintenancePlan === true || order.description?.toLowerCase().includes('maintenance')))
      .map(order => order.customerId);
  }, [workOrders]);

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
            address: "123 Oak St, Springfield",
            preferredTime: "8:00 AM - 11:00 AM",
            lastService: "2023-10-15",
            location: { lat: 35.12, lng: -80.71 }
          },
          {
            customerId: "cust-2",
            customerName: "Sarah Johnson",
            address: "127 Oak St, Springfield",
            preferredTime: "1:00 PM - 4:00 PM",
            lastService: "2023-09-22",
            location: { lat: 35.13, lng: -80.72 }
          },
          {
            customerId: "cust-3",
            customerName: "Robert Davis",
            address: "456 Pine Ave, Springfield",
            preferredTime: "10:00 AM - 1:00 PM",
            lastService: "2023-11-05",
            location: { lat: 35.20, lng: -80.80 }
          },
          {
            customerId: "cust-4",
            customerName: "Emily Wilson",
            address: "458 Pine Ave, Springfield",
            preferredTime: "2:00 PM - 5:00 PM",
            lastService: "2023-10-28",
            location: { lat: 35.21, lng: -80.81 }
          },
          {
            customerId: "cust-5",
            customerName: "Michael Brown",
            address: "789 Maple Dr, Springfield",
            preferredTime: "8:00 AM - 11:00 AM",
            lastService: "2024-02-05",
            location: { lat: 35.25, lng: -80.85 }
          }
        ];
        
        // Filter out already scheduled customers
        const filteredItems = mockMaintenanceItems.filter(
          item => !scheduledMaintenanceIds.includes(item.customerId)
        );
        
        setMaintenanceItems(filteredItems);
        setError(null);
      } catch (err) {
        console.error("Error fetching maintenance plans:", err);
        setError("Failed to load maintenance plans. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenancePlans();
  }, [scheduledMaintenanceIds]);

  // Group items by location proximity for displaying by area
  const groupedByArea = useMemo(() => {
    if (!sortByLocation) {
      return { "All Customers": maintenanceItems };
    }
    
    // Group by street name for this example
    const groups: { [key: string]: MaintenanceItem[] } = {};
    
    maintenanceItems.forEach(item => {
      // Extract street name from address
      const streetMatch = item.address.match(/\d+\s+([A-Za-z]+)/);
      const streetName = streetMatch ? `${streetMatch[1]} Street Area` : "Other Area";
      
      if (!groups[streetName]) {
        groups[streetName] = [];
      }
      groups[streetName].push(item);
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
          <CardTitle>Maintenance Plan Members</CardTitle>
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
              Group by area
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
            <p className="text-muted-foreground">No pending maintenance plans for this month.</p>
          </div>
        ) : (
          <div>
            {Object.entries(groupedByArea).map(([areaName, items]) => (
              <AreaGroup 
                key={areaName} 
                title={areaName} 
                items={items}
                onSchedule={onSchedule}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaintenancePlanList;
