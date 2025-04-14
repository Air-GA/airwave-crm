
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, User, MapPin, Calendar, Clock } from "lucide-react";
import { WorkOrder, Technician } from "@/types";
import { formatDate } from "@/lib/date-utils";
import DraggableWorkOrder from "./DraggableWorkOrder";
import TechnicianDropTarget from "./TechnicianDropTarget";

interface DispatchListViewProps {
  unassignedWorkOrders: WorkOrder[];
  technicians: Technician[];
  selectedTechnicianId: string | null;
  technicianWorkOrders: WorkOrder[];
  activeOrderId: string | null;
  onSelectTechnician: (techId: string) => void;
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
  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Unassigned Work Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[700px] overflow-y-auto p-0">
          {unassignedWorkOrders.length > 0 ? (
            <div className="space-y-3 p-4">
              {unassignedWorkOrders.map((order) => (
                <DraggableWorkOrder 
                  key={order.id} 
                  order={order} 
                  isActive={activeOrderId === order.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="mt-3 text-lg font-medium">No Unassigned Work Orders</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                All work orders have been assigned to technicians.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Technicians</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Drag work orders onto technicians to assign them. Click on a technician to view their scheduled work.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {technicians.map((technician) => (
            <TechnicianDropTarget
              key={technician.id}
              technician={technician}
              isSelected={selectedTechnicianId === technician.id}
              onClick={() => onSelectTechnician(technician.id)}
              assignedCount={technician.workOrdersCount}
            />
          ))}
        </div>

        {selectedTechnicianId ? (
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle>
                {technicians.find(tech => tech.id === selectedTechnicianId)?.name}'s Work Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {technicianWorkOrders.length > 0 ? (
                <div className="space-y-3">
                  {technicianWorkOrders.map((order) => (
                    <div key={order.id} className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">#{order.id} - {order.type}</p>
                        <Badge
                          variant="outline"
                          className={`
                            ${order.status === 'scheduled' ? 'bg-amber-50 text-amber-700 hover:bg-amber-50' : ''}
                            ${order.status === 'in-progress' ? 'bg-blue-50 text-blue-700 hover:bg-blue-50' : ''}
                            ${order.status === 'pending' ? 'bg-gray-50 text-gray-700 hover:bg-gray-50' : ''}
                          `}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1.5 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{order.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{order.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(new Date(order.scheduledDate))}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(new Date(order.scheduledDate), { timeOnly: true })}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onUnassignWorkOrder(order.id)}
                        >
                          Unassign
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-3 text-lg font-medium">No Assigned Work Orders</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This technician has no assigned work orders.
                    <br />
                    Drag work orders from the left to assign them.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-6">
            <CardContent className="p-8 text-center">
              <User className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Technician Selected</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Select a technician from above to view their assigned work orders.
                <br />
                Drag unassigned work orders to a technician to assign them.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DispatchListView;
