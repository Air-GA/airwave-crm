
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrder, Technician } from '@/types';
import DraggableWorkOrder from './DraggableWorkOrder';
import TechnicianDropTarget from './TechnicianDropTarget';
import { Button } from '@/components/ui/button';
import { CircleX } from 'lucide-react';
import { useWorkOrderStore } from '@/services/workOrderService';

interface DispatchListViewProps {
  unassignedWorkOrders: WorkOrder[];
  technicians: Technician[];
  selectedTechnicianId: string | null;
  technicianWorkOrders: WorkOrder[];
  activeOrderId: string | null;
  onSelectTechnician: (technicianId: string) => void;
  onUnassignWorkOrder: (orderId: string) => void;
}

const DispatchListView = ({
  unassignedWorkOrders,
  technicians,
  selectedTechnicianId,
  technicianWorkOrders,
  activeOrderId,
  onSelectTechnician,
  onUnassignWorkOrder
}: DispatchListViewProps) => {
  // Use the work order store to ensure sync
  const syncWithCustomers = useWorkOrderStore(state => state.syncWithCustomers);
  
  // Sync customer data with work orders when component mounts
  useEffect(() => {
    syncWithCustomers();
  }, [syncWithCustomers]);
  
  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unassignedWorkOrders && unassignedWorkOrders.length > 0 ? (
                unassignedWorkOrders.map(order => (
                  <DraggableWorkOrder 
                    key={order.id} 
                    order={order} 
                    isActive={activeOrderId === order.id} 
                  />
                ))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  No unassigned work orders
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Technician Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-3">
              Select a technician to view their work orders
            </div>
            <div className="grid gap-3">
              {technicians.map(technician => (
                <TechnicianDropTarget
                  key={technician.id}
                  technician={technician}
                  isSelected={selectedTechnicianId === technician.id}
                  onClick={() => onSelectTechnician(technician.id)}
                  assignedCount={technicianWorkOrders.filter(order => order.technicianId === technician.id).length}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
            
      {selectedTechnicianId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Assigned Work Orders for {technicians.find(t => t.id === selectedTechnicianId)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {technicianWorkOrders && technicianWorkOrders.length > 0 ? (
                technicianWorkOrders.map(order => (
                  <div key={order.id} className="relative">
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute -right-3 -top-3 h-6 w-6 rounded-full z-10"
                      onClick={() => onUnassignWorkOrder(order.id)}
                    >
                      <CircleX className="h-4 w-4" />
                    </Button>
                    <DraggableWorkOrder 
                      order={order} 
                      isActive={activeOrderId === order.id} 
                    />
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  No work orders assigned to this technician
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DispatchListView;
