
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, GripVertical } from "lucide-react";
import { useWorkOrderStore } from "@/services/workOrderStore";
import { formatDate } from "@/lib/date-utils";

interface MaintenancePlanListProps {
  onDragStart?: (item: any) => void;
  onSchedule?: (plan: any) => void;
}

export function MaintenancePlanList({ 
  onDragStart, 
  onSchedule 
}: MaintenancePlanListProps) {
  const workOrders = useWorkOrderStore((state) => state.workOrders);
  
  // Filter maintenance plans (work orders with isMaintenancePlan=true)
  const maintenancePlans = workOrders.filter(
    (order) => order.isMaintenancePlan === true
  );
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Maintenance Plans</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-2 p-3">
          {maintenancePlans.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No maintenance plans available
            </div>
          ) : (
            maintenancePlans.map((plan) => (
              <div
                key={plan.id}
                draggable
                onDragStart={
                  onDragStart ? () => onDragStart(plan) : undefined
                }
                className="border rounded-md p-3 cursor-move hover:bg-accent transition-colors flex"
              >
                <div className="flex items-center mr-3 text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{plan.customerName}</h4>
                  <p className="text-xs text-muted-foreground">
                    {plan.address.length > 30
                      ? plan.address.substring(0, 30) + "..."
                      : plan.address}
                  </p>
                  
                  <div className="flex justify-between items-center mt-2">
                    {plan.scheduledDate ? (
                      <span className="text-xs text-muted-foreground flex items-center">
                        <CalendarCheck className="h-3 w-3 mr-1" />
                        {formatDate(plan.scheduledDate)}
                      </span>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Not scheduled
                      </Badge>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={onSchedule ? () => onSchedule(plan) : undefined}
                    >
                      Schedule
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default MaintenancePlanList;
