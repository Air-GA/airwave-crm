
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  AlertCircle, 
  Calendar, 
  Clock, 
  Truck, 
  Package, 
  Bell, 
  CheckCircle2, 
  User, 
  CalendarClock 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { WorkOrder, ProgressStep } from "@/types";
import { toast } from "sonner";

interface WorkOrderProgressTrackerProps {
  workOrder: WorkOrder;
  onProgressUpdate?: (progressSteps: ProgressStep[], currentStep: string, percentage: number) => void;
}

const DEFAULT_PROGRESS_STEPS: ProgressStep[] = [
  {
    id: "sale",
    name: "Initial Sale",
    description: "Service order created and scheduled",
    status: "completed",
    notifyCustomer: true,
    notifyTech: false,
    notifyAdmin: true,
  },
  {
    id: "assignment",
    name: "Technician Assignment",
    description: "Technician assigned to the work order",
    status: "pending",
    notifyCustomer: true,
    notifyTech: true,
    notifyAdmin: true,
  },
  {
    id: "reminder",
    name: "Service Reminder",
    description: "24-hour reminder sent to customer",
    status: "pending",
    notifyCustomer: true,
    notifyTech: false,
    notifyAdmin: false,
  },
  {
    id: "supplies",
    name: "Supplies Prepared",
    description: "Inventory loaded on service vehicle",
    status: "pending",
    notifyCustomer: false,
    notifyTech: true,
    notifyAdmin: true,
  },
  {
    id: "enroute",
    name: "Technician En Route",
    description: "Technician on the way to service location",
    status: "pending",
    notifyCustomer: true,
    notifyTech: false,
    notifyAdmin: true,
  },
  {
    id: "arrival",
    name: "Technician Arrival",
    description: "Technician arrived at service location",
    status: "pending",
    notifyCustomer: true,
    notifyTech: false,
    notifyAdmin: true,
  },
  {
    id: "service",
    name: "Service In Progress",
    description: "Work being performed at location",
    status: "pending",
    notifyCustomer: false,
    notifyTech: false,
    notifyAdmin: true,
  },
  {
    id: "completion",
    name: "Service Completed",
    description: "Work order has been completed",
    status: "pending",
    notifyCustomer: true,
    notifyTech: true,
    notifyAdmin: true,
  },
  {
    id: "invoice",
    name: "Invoice Generated",
    description: "Invoice created and sent to customer",
    status: "pending",
    notifyCustomer: true,
    notifyTech: false,
    notifyAdmin: true,
  }
];

const WorkOrderProgressTracker = ({ 
  workOrder, 
  onProgressUpdate 
}: WorkOrderProgressTrackerProps) => {
  // Initialize progress steps from work order or use defaults
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>(
    workOrder.progressSteps || DEFAULT_PROGRESS_STEPS
  );
  
  const [currentStep, setCurrentStep] = useState<string>(
    workOrder.currentProgressStep || "sale"
  );
  
  const [progress, setProgress] = useState<number>(
    workOrder.progressPercentage || calculateProgress(progressSteps)
  );
  
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Calculate progress percentage based on completed steps
  function calculateProgress(steps: ProgressStep[]): number {
    const totalSteps = steps.length;
    const completedSteps = steps.filter(step => step.status === "completed").length;
    return Math.round((completedSteps / totalSteps) * 100);
  }

  // Update step status
  const updateStepStatus = (stepId: string, newStatus: ProgressStep['status']) => {
    // Find the step index
    const stepIndex = progressSteps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;
    
    // Create a new array with the updated step
    const updatedSteps = [...progressSteps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      status: newStatus,
      timestamp: new Date().toISOString()
    };
    
    // Update all previous steps to completed if they're not already
    if (newStatus === "completed") {
      for (let i = 0; i < stepIndex; i++) {
        if (updatedSteps[i].status !== "completed") {
          updatedSteps[i] = {
            ...updatedSteps[i],
            status: "completed",
            timestamp: updatedSteps[i].timestamp || new Date().toISOString()
          };
        }
      }
      
      // Set current step to the next pending step
      const nextPendingStep = updatedSteps.find((step, idx) => idx > stepIndex && step.status === "pending");
      if (nextPendingStep) {
        setCurrentStep(nextPendingStep.id);
      }
    }
    
    // Update state
    setProgressSteps(updatedSteps);
    const newProgress = calculateProgress(updatedSteps);
    setProgress(newProgress);
    
    // Send notifications based on step settings
    sendNotifications(updatedSteps[stepIndex]);
    
    // Callback to parent component
    if (onProgressUpdate) {
      onProgressUpdate(updatedSteps, nextStepId(updatedSteps, stepId) || stepId, newProgress);
    }
  };
  
  // Get the ID of the next step after the current one
  const nextStepId = (steps: ProgressStep[], currentStepId: string): string | null => {
    const currentIndex = steps.findIndex(step => step.id === currentStepId);
    if (currentIndex === -1 || currentIndex >= steps.length - 1) return null;
    return steps[currentIndex + 1].id;
  };
  
  // Send notifications based on step configuration
  const sendNotifications = (step: ProgressStep) => {
    if (step.status !== "completed") return;
    
    // For demo purposes, just show toasts
    if (step.notifyCustomer) {
      toast.info(`Customer notification sent`, {
        description: `Notified customer about: ${step.name}`
      });
    }
    
    if (step.notifyTech) {
      toast.info(`Technician notification sent`, {
        description: `Notified technician about: ${step.name}`
      });
    }
    
    if (step.notifyAdmin) {
      toast.info(`Admin notification sent`, {
        description: `Notified admin about: ${step.name}`
      });
    }
  };
  
  // Find the current active step
  const currentActiveStep = progressSteps.find(step => step.id === currentStep);
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <CalendarClock className="h-5 w-5 mr-2" />
          Work Order Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Current status */}
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Current Step:</p>
                <p className="text-base">{currentActiveStep?.name || "Not started"}</p>
              </div>
              <Badge variant="outline" className={
                currentActiveStep?.status === "completed" 
                  ? "bg-green-50 text-green-700" 
                  : currentActiveStep?.status === "in-progress"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-50 text-gray-700"
              }>
                {currentActiveStep?.status || "pending"}
              </Badge>
            </div>
            {currentActiveStep?.description && (
              <p className="text-sm text-muted-foreground mt-1">{currentActiveStep.description}</p>
            )}
          </div>
          
          {/* Tabs for different views */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>
            
            {/* Overview tab */}
            <TabsContent value="overview" className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="border rounded-md p-3">
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <User className="h-4 w-4 mr-1" />
                    <span>Customer</span>
                  </div>
                  <p className="font-medium">{workOrder.customerName}</p>
                  {workOrder.email && <p className="text-sm">{workOrder.email}</p>}
                  {workOrder.phoneNumber && <p className="text-sm">{workOrder.phoneNumber}</p>}
                </div>
                
                <div className="border rounded-md p-3">
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Scheduled</span>
                  </div>
                  <p className="font-medium">{formatDate(new Date(workOrder.scheduledDate))}</p>
                  <p className="text-sm">{formatDate(new Date(workOrder.scheduledDate), { timeOnly: true })}</p>
                </div>
                
                <div className="border rounded-md p-3">
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <Truck className="h-4 w-4 mr-1" />
                    <span>Technician</span>
                  </div>
                  <p className="font-medium">{workOrder.technicianName || "Unassigned"}</p>
                  {workOrder.estimatedArrivalTime && (
                    <p className="text-sm">ETA: {formatDate(new Date(workOrder.estimatedArrivalTime), { timeOnly: true })}</p>
                  )}
                </div>
              </div>
              
              {/* Key milestones */}
              <div className="border rounded-md p-3">
                <h3 className="font-medium mb-2">Key Milestones</h3>
                <div className="space-y-1.5">
                  {progressSteps
                    .filter(step => ["assignment", "supplies", "enroute", "arrival", "completion"].includes(step.id))
                    .map(step => (
                      <div key={step.id} className="flex items-center justify-between text-sm">
                        <span>{step.name}</span>
                        <div className="flex items-center">
                          {step.status === "completed" ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
                              {step.timestamp && (
                                <span className="text-muted-foreground">{formatDate(new Date(step.timestamp), { timeOnly: true })}</span>
                              )}
                            </>
                          ) : step.status === "in-progress" ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">In Progress</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700">Pending</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </TabsContent>
            
            {/* Timeline tab */}
            <TabsContent value="timeline" className="space-y-2 pt-2">
              <div className="space-y-3">
                {progressSteps.map((step, index) => (
                  <div 
                    key={step.id} 
                    className={`relative pl-6 pb-3 ${
                      index < progressSteps.length - 1 ? "border-l-2 border-muted" : ""
                    } ${step.status === "completed" ? "border-green-200" : ""}`}
                  >
                    <div className={`absolute top-0 left-[-8px] w-4 h-4 rounded-full border-2 ${
                      step.status === "completed" 
                        ? "bg-green-500 border-green-200" 
                        : step.status === "in-progress"
                        ? "bg-blue-500 border-blue-200"
                        : "bg-gray-200 border-gray-100"
                    }`} />
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{step.name}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      {step.timestamp && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(new Date(step.timestamp))}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex mt-1 space-x-2">
                      {step.notifyCustomer && (
                        <Badge variant="outline" size="sm" className="text-xs">
                          <Bell className="h-3 w-3 mr-1" /> Customer
                        </Badge>
                      )}
                      {step.notifyTech && (
                        <Badge variant="outline" size="sm" className="text-xs">
                          <Bell className="h-3 w-3 mr-1" /> Technician
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            {/* Actions tab */}
            <TabsContent value="actions" className="space-y-4 pt-2">
              <div className="space-y-2">
                <h3 className="font-medium">Update Progress Status</h3>
                
                {progressSteps.map(step => (
                  <div key={step.id} className="flex items-center justify-between border rounded-md p-2">
                    <div>
                      <p className="font-medium">{step.name}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {step.status !== "completed" && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                          onClick={() => updateStepStatus(step.id, "completed")}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Completed
                        </Button>
                      )}
                      
                      {step.status === "pending" && step.id === currentStep && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => updateStepStatus(step.id, "in-progress")}
                        >
                          Start
                        </Button>
                      )}
                      
                      {step.status === "completed" && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Completed
                          {step.timestamp && (
                            <span className="ml-1">at {formatDate(new Date(step.timestamp), { timeOnly: true })}</span>
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrderProgressTracker;
