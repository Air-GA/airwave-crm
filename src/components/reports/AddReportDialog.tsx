
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  FileText, 
  Users, 
  CreditCard, 
  Package, 
  ClipboardList, 
  Clock, 
  Percent 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

// Report template interface
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
}

// Mock report templates
const reportTemplates: ReportTemplate[] = [
  {
    id: "revenue",
    name: "Revenue Analysis",
    description: "Overview of your revenue broken down by service type and time period",
    category: "financial",
    icon: <BarChart className="h-10 w-10 text-primary" />
  },
  {
    id: "technician",
    name: "Technician Performance",
    description: "Analyze technician efficiency and customer satisfaction",
    category: "performance",
    icon: <Users className="h-10 w-10 text-primary" />
  },
  {
    id: "customer",
    name: "Customer Satisfaction",
    description: "Track customer feedback and satisfaction metrics",
    category: "customer",
    icon: <Percent className="h-10 w-10 text-primary" />
  },
  {
    id: "workorder",
    name: "Work Order Analysis",
    description: "Review work order completion rates and service times",
    category: "service",
    icon: <ClipboardList className="h-10 w-10 text-primary" />
  },
  {
    id: "inventory",
    name: "Inventory Status",
    description: "Track inventory levels and identify reorder needs",
    category: "inventory",
    icon: <Package className="h-10 w-10 text-primary" />
  },
  {
    id: "financial",
    name: "Financial Summary",
    description: "Complete summary of financial performance and metrics",
    category: "financial",
    icon: <CreditCard className="h-10 w-10 text-primary" />
  },
  {
    id: "scheduling",
    name: "Scheduling Efficiency",
    description: "Analyze scheduling efficiency and technician utilization",
    category: "scheduling",
    icon: <Clock className="h-10 w-10 text-primary" />
  },
  {
    id: "productivity",
    name: "Productivity Metrics",
    description: "Review productivity metrics across the organization",
    category: "performance",
    icon: <LineChart className="h-10 w-10 text-primary" />
  }
];

interface AddReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddReportDialog({ open, onOpenChange }: AddReportDialogProps) {
  const [activeTab, setActiveTab] = useState("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customReportName, setCustomReportName] = useState("");
  const [customReportType, setCustomReportType] = useState("financial");
  const [customReportPeriod, setCustomReportPeriod] = useState("monthly");
  
  const handleCreateFromTemplate = () => {
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    const template = reportTemplates.find(t => t.id === selectedTemplate);
    if (template) {
      toast.success(`Report "${template.name}" created successfully`);
      onOpenChange(false);
      // Reset form
      setSelectedTemplate(null);
    }
  };

  const handleCreateCustomReport = () => {
    if (!customReportName) {
      toast.error("Please enter a report name");
      return;
    }

    toast.success(`Custom report "${customReportName}" created successfully`);
    onOpenChange(false);
    // Reset form
    setCustomReportName("");
    setCustomReportType("financial");
    setCustomReportPeriod("monthly");
  };

  const renderTemplates = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {reportTemplates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-colors hover:bg-accent/50 ${selectedTemplate === template.id ? 'border-primary bg-accent/20' : ''}`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <CardHeader className="p-4 pb-0">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription className="text-xs">{template.description}</CardDescription>
                </div>
                {template.icon}
              </div>
            </CardHeader>
            <CardFooter className="p-4 pt-2">
              <span className="text-xs text-muted-foreground capitalize">{template.category}</span>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  const renderCustomForm = () => {
    return (
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="report-name">Report Name</Label>
          <Input 
            id="report-name" 
            placeholder="Enter report name" 
            value={customReportName}
            onChange={(e) => setCustomReportName(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={customReportType} onValueChange={setCustomReportType}>
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="scheduling">Scheduling</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="report-period">Time Period</Label>
            <Select value={customReportPeriod} onValueChange={setCustomReportPeriod}>
              <SelectTrigger id="report-period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create New Report</DialogTitle>
          <DialogDescription>
            Select a template or create a custom report to analyze your business data
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="templates" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">
              <FileText className="mr-2 h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="custom">
              <PieChart className="mr-2 h-4 w-4" />
              Custom Report
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates">
            {renderTemplates()}
          </TabsContent>
          
          <TabsContent value="custom">
            {renderCustomForm()}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {activeTab === "templates" ? (
            <Button onClick={handleCreateFromTemplate}>
              Create from Template
            </Button>
          ) : (
            <Button onClick={handleCreateCustomReport}>
              Create Custom Report
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
