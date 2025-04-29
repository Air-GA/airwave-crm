
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  MapPin, 
  Calendar, 
  Phone, 
  Mail,
  CheckCircle,
  Clock,
  User,
  Tag,
  MessageCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WorkOrder, Technician, Customer } from "@/types";
import { format } from 'date-fns';

interface WorkOrderDetailsPanelProps {
  workOrder: WorkOrder;
  onUnassign: (workOrderId: string) => void;
  onAssign: (workOrderId: string, technicianId: string, technicianName: string) => void;
  showAssignOption: boolean;
  technicians: Technician[];
  customerData?: Customer;
}

export const WorkOrderDetailsPanel: React.FC<WorkOrderDetailsPanelProps> = ({
  workOrder,
  onUnassign,
  onAssign,
  showAssignOption,
  technicians,
  customerData
}) => {
  const [assignToTech, setAssignToTech] = React.useState<string>('');
  
  // Combine customer data with work order data
  const customer = customerData || {
    name: workOrder.customerName,
    address: workOrder.address,
    phone: workOrder.phoneNumber || '',
    email: workOrder.email || '',
  };
  
  const handleAssign = () => {
    if (!assignToTech) return;
    
    const technician = technicians.find(tech => tech.id === assignToTech);
    if (!technician) return;
    
    onAssign(workOrder.id, technician.id, technician.name);
  };

  const formattedDate = workOrder.scheduledDate 
    ? format(new Date(workOrder.scheduledDate), 'MMM dd, yyyy h:mm a')
    : 'Not scheduled';

  return (
    <div className="space-y-4 py-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{workOrder.description || 'Work Order'}</CardTitle>
              <Badge 
                className={`mt-1 ${
                  workOrder.status === 'pending' ? 'bg-amber-600' : 
                  workOrder.status === 'in-progress' ? 'bg-blue-600' : 
                  workOrder.status === 'completed' ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                {workOrder.status}
              </Badge>
            </div>
            <Badge variant="outline" className="uppercase">
              {workOrder.type || 'repair'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">{customer.name}</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{customer.address}</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formattedDate}</span>
            </div>
            
            {customer.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
            )}
            
            {customer.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="capitalize">{workOrder.priority || 'medium'} priority</span>
            </div>
            
            {workOrder.estimatedHours && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Estimated: {workOrder.estimatedHours} hours</span>
              </div>
            )}
          </div>
          
          <Separator />
          
          {workOrder.notes && workOrder.notes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" /> Notes
              </h3>
              <ul className="space-y-1 text-sm">
                {workOrder.notes.map((note, index) => (
                  <li key={index} className="bg-muted/50 p-2 rounded-sm">{note}</li>
                ))}
              </ul>
            </div>
          )}
          
          {workOrder.progressSteps && workOrder.progressSteps.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" /> Progress
              </h3>
              <ul className="space-y-1">
                {workOrder.progressSteps.map((step) => (
                  <li key={step.id} className="flex items-center text-sm">
                    <div className={`h-2 w-2 rounded-full mr-2 ${
                      step.status === 'completed' ? 'bg-green-500' : 
                      step.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                    <span className={step.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                      {step.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-0">
          {workOrder.technicianId ? (
            <div className="space-y-2 w-full">
              <p className="text-sm">
                Assigned to: <span className="font-medium">{workOrder.technicianName}</span>
              </p>
              {showAssignOption && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onUnassign(workOrder.id)}
                >
                  Unassign
                </Button>
              )}
            </div>
          ) : showAssignOption ? (
            <div className="space-y-2 w-full">
              <Select value={assignToTech} onValueChange={setAssignToTech}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign to technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="default" 
                size="sm"
                disabled={!assignToTech} 
                className="w-full"
                onClick={handleAssign}
              >
                Assign
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not assigned to any technician</p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
