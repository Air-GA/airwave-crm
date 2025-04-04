
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDraggable } from "@dnd-kit/core";
import { Customer } from "@/types";
import { useWorkOrderStore } from "@/services/workOrderService";

export interface MaintenanceMember {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  preferredTimeSlot: string;
  phoneNumber?: string;
  email?: string;
  lastMaintenanceDate?: string;
}

interface MaintenancePlanListProps {
  onDragStart?: (member: MaintenanceMember) => void;
}

export const MaintenancePlanList = ({ onDragStart }: MaintenancePlanListProps) => {
  const [members, setMembers] = useState<MaintenanceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedMembers, setGroupedMembers] = useState<Record<string, MaintenanceMember[]>>({});
  const workOrders = useWorkOrderStore(state => state.workOrders);

  // Mock data - in a real app, fetch from API/Supabase
  useEffect(() => {
    const fetchMaintenanceMembers = async () => {
      try {
        // Mock data for demonstration
        const mockMembers: MaintenanceMember[] = [
          {
            id: "m1",
            customerId: "c1",
            customerName: "John Smith",
            address: "123 Oak St, Springfield",
            preferredTimeSlot: "8:00 AM - 11:00 AM",
            phoneNumber: "(555) 123-4567",
            email: "john@example.com",
            lastMaintenanceDate: "2023-10-15"
          },
          {
            id: "m2", 
            customerId: "c2",
            customerName: "Sarah Johnson",
            address: "127 Oak St, Springfield",
            preferredTimeSlot: "1:00 PM - 4:00 PM",
            phoneNumber: "(555) 987-6543",
            email: "sarah@example.com",
            lastMaintenanceDate: "2023-09-22"
          },
          {
            id: "m3",
            customerId: "c3",
            customerName: "Robert Davis",
            address: "456 Pine Ave, Springfield",
            preferredTimeSlot: "10:00 AM - 1:00 PM",
            phoneNumber: "(555) 555-1212",
            email: "robert@example.com",
            lastMaintenanceDate: "2023-11-05"
          },
          {
            id: "m4",
            customerId: "c4",
            customerName: "Emily Wilson",
            address: "458 Pine Ave, Springfield",
            preferredTimeSlot: "2:00 PM - 5:00 PM",
            phoneNumber: "(555) 222-3333",
            email: "emily@example.com",
            lastMaintenanceDate: "2023-10-28"
          },
          {
            id: "m5",
            customerId: "c5",
            customerName: "Michael Brown",
            address: "789 Maple Rd, Riverside",
            preferredTimeSlot: "9:00 AM - 12:00 PM",
            phoneNumber: "(555) 444-5555",
            email: "michael@example.com",
            lastMaintenanceDate: "2023-11-10"
          }
        ];

        // Filter out customers who already have scheduled maintenance appointments
        const filteredMembers = mockMembers.filter(member => {
          // Check if this customer already has a scheduled maintenance appointment
          return !workOrders.some(order => 
            // Match by customer ID, customer name, or email
            (order.customerId === member.customerId || 
             order.customerName === member.customerName ||
             (order.email && member.email && order.email === member.email)) &&
            // Only filter out scheduled/in-progress appointments
            (order.status === 'scheduled' || order.status === 'in-progress') &&
            // Make sure it's a maintenance type appointment
            order.type === 'maintenance'
          );
        });

        setMembers(filteredMembers);
        
        // Group members by street address for proximity
        const grouped = filteredMembers.reduce<Record<string, MaintenanceMember[]>>((acc, member) => {
          // Extract street name from address for grouping
          const streetMatch = member.address.match(/\d+\s+([A-Za-z]+)/);
          const street = streetMatch ? streetMatch[1] : "Other";
          
          if (!acc[street]) {
            acc[street] = [];
          }
          acc[street].push(member);
          return acc;
        }, {});
        
        setGroupedMembers(grouped);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching maintenance members:", error);
        setLoading(false);
      }
    };

    fetchMaintenanceMembers();
  }, [workOrders]); // Re-run when work orders change

  const DraggableMemberCard = ({ member }: { member: MaintenanceMember }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: member.id,
      data: {
        type: 'maintenance-member',
        member
      }
    });

    return (
      <div 
        ref={setNodeRef}
        {...listeners} 
        {...attributes}
        className={`mb-2 cursor-move ${isDragging ? 'opacity-50' : ''}`}
      >
        <Card className="border border-border hover:border-primary hover:shadow-sm transition-all">
          <CardHeader className="p-3 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {member.customerName}
              </CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                Maintenance
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {member.address}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {member.preferredTimeSlot}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Last service: {member.lastMaintenanceDate || "None"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Maintenance Plan Members</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <p className="text-sm text-muted-foreground">Loading members...</p>
          </div>
        ) : Object.keys(groupedMembers).length > 0 ? (
          <div className="overflow-y-auto max-h-[calc(100vh-400px)]">
            {Object.entries(groupedMembers).map(([street, streetMembers]) => (
              <div key={street} className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">
                  {street} Street Area ({streetMembers.length})
                </h3>
                {streetMembers.map((member) => (
                  <DraggableMemberCard key={member.id} member={member} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center p-4">
            <p className="text-sm text-muted-foreground">No maintenance members available for scheduling</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaintenancePlanList;
