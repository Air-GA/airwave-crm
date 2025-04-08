import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  BarChart4, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Clock, 
  Users, 
  Wallet, 
  Activity, 
  DownloadCloud, 
  FileCog, 
  FilePlus, 
  MoreVertical, 
  Calendar, 
  Truck, 
  HelpCircle
} from "lucide-react";
import ReportViewer, { ReportData } from "@/components/reports/ReportViewer";
import { generateReportData, exportReportToCsv } from "@/services/reportService";

interface Report {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "annual";
  lastRun?: string;
  createdAt: string;
  scheduled?: boolean;
  icon: JSX.Element;
}

type ReportType = 
  | "revenue" 
  | "technician" 
  | "customer" 
  | "workorder" 
  | "inventory" 
  | "financial" 
  | "scheduling" 
  | "productivity";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  icon: JSX.Element;
  requiresFinancialAccess?: boolean;
  requiresHRAccess?: boolean;
  requiresTechnicianAccess?: boolean;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "revenue-analysis",
    name: "Revenue Analysis",
    description: "Analyze company revenue by service type, location, and time period",
    type: "revenue",
    icon: <BarChart4 className="h-5 w-5" />,
    requiresFinancialAccess: true
  },
  {
    id: "technician-performance",
    name: "Technician Performance",
    description: "Evaluate technician productivity, job completion rates, and customer feedback",
    type: "technician",
    icon: <Users className="h-5 w-5" />,
    requiresHRAccess: true
  },
  {
    id: "customer-acquisition",
    name: "Customer Acquisition",
    description: "Track new customers, lead sources, and conversion rates",
    type: "customer",
    icon: <TrendingUp className="h-5 w-5" />
  },
  {
    id: "workorder-summary",
    name: "Work Order Summary",
    description: "Analyze work orders by type, status, and resolution time",
    type: "workorder",
    icon: <Activity className="h-5 w-5" />
  },
  {
    id: "inventory-usage",
    name: "Inventory Usage",
    description: "Track parts usage, inventory levels, and reorder needs",
    type: "inventory",
    icon: <Truck className="h-5 w-5" />
  },
  {
    id: "profit-margins",
    name: "Profit Margins",
    description: "Analyze profit margins by service type and job size",
    type: "financial",
    icon: <Wallet className="h-5 w-5" />,
    requiresFinancialAccess: true
  },
  {
    id: "scheduling-efficiency",
    name: "Scheduling Efficiency",
    description: "Measure dispatch efficiency and technician utilization",
    type: "scheduling",
    icon: <Calendar className="h-5 w-5" />,
    requiresTechnicianAccess: true
  },
  {
    id: "service-time-analysis",
    name: "Service Time Analysis",
    description: "Track average service times by job type and technician",
    type: "productivity",
    icon: <Clock className="h-5 w-5" />,
    requiresTechnicianAccess: true
  }
];

const SAMPLE_REPORTS: Report[] = [
  {
    id: "1",
    name: "Monthly Revenue Report",
    description: "Revenue breakdown by service type",
    type: "revenue",
    frequency: "monthly",
    lastRun: "2025-04-01",
    createdAt: "2025-01-15",
    scheduled: true,
    icon: <BarChart4 className="h-5 w-5" />
  },
  {
    id: "2",
    name: "Technician Performance",
    description: "Productivity metrics for all technicians",
    type: "technician",
    frequency: "weekly",
    lastRun: "2025-04-05",
    createdAt: "2025-02-10",
    scheduled: true,
    icon: <LineChart className="h-5 w-5" />
  },
  {
    id: "3",
    name: "Quarterly Financial Summary",
    description: "Profit and loss overview by quarter",
    type: "financial",
    frequency: "quarterly",
    lastRun: "2025-03-31",
    createdAt: "2025-01-05",
    scheduled: true,
    icon: <PieChart className="h-5 w-5" />
  },
  {
    id: "4",
    name: "Inventory Usage Trends",
    description: "Parts usage and availability analysis",
    type: "inventory",
    lastRun: "2025-04-06",
    createdAt: "2025-03-20",
    scheduled: false,
    icon: <TrendingUp className="h-5 w-5" />
  }
];

const Reports = () => {
  const { permissions } = useAuth();
  const [reports, setReports] = useState<Report[]>(SAMPLE_REPORTS);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isConfigureDialogOpen, setIsConfigureDialogOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);
  const [currentReportData, setCurrentReportData] = useState<ReportData | null>(null);
  const [currentViewingReport, setCurrentViewingReport] = useState<Report | null>(null);

  const filteredTemplates = REPORT_TEMPLATES.filter(template => {
    if (template.requiresFinancialAccess && !permissions.canViewFinancials) {
      return false;
    }
    if (template.requiresHRAccess && !permissions.canViewHRInfo) {
      return false;
    }
    if (template.requiresTechnicianAccess && !permissions.canViewTechnicianData) {
      return false;
    }
    return true;
  });

  const createReport = (templateId: string) => {
    const template = REPORT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    
    const newReport: Report = {
      id: `report-${Date.now()}`,
      name: template.name,
      description: template.description,
      type: template.type,
      createdAt: new Date().toISOString(),
      scheduled: false,
      icon: template.icon
    };
    
    setReports([...reports, newReport]);
    setIsCreateDialogOpen(false);
    toast.success("Report created successfully");
  };

  const deleteReport = (reportId: string) => {
    setReports(reports.filter(r => r.id !== reportId));
    setIsConfigureDialogOpen(false);
    toast.success("Report deleted successfully");
  };

  const toggleSchedule = (reportId: string, scheduled: boolean) => {
    setReports(reports.map(report => 
      report.id === reportId 
        ? { ...report, scheduled, frequency: scheduled ? "monthly" : undefined } 
        : report
    ));
    toast.success(`Scheduling ${scheduled ? "enabled" : "disabled"}`);
  };

  const updateFrequency = (reportId: string, frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annual") => {
    setReports(reports.map(report => 
      report.id === reportId 
        ? { ...report, frequency } 
        : report
    ));
  };

  const generateReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    toast.success(`Generating ${report.name}...`);

    const reportData = generateReportData(report.type, report.name);
    
    setReports(reports.map(r => 
      r.id === reportId 
        ? { ...r, lastRun: new Date().toISOString() } 
        : r
    ));

    setTimeout(() => {
      setCurrentReportData(reportData);
      setCurrentViewingReport(report);
      setIsReportViewerOpen(true);
    }, 800);
  };

  const handleDownloadReport = () => {
    if (!currentReportData || !currentViewingReport) return;
    
    exportReportToCsv(currentReportData, currentViewingReport.name);
    toast.success("Report downloaded successfully");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">View, create, and manage business reports</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Create Report
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Report</DialogTitle>
                  <DialogDescription>
                    Select from available report templates or customize your own
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="templates" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="custom">Custom Report</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="templates" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {filteredTemplates.map((template) => (
                        <Card 
                          key={template.id} 
                          className="cursor-pointer hover:bg-accent transition-colors"
                          onClick={() => createReport(template.id)}
                        >
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-center gap-2">
                              {template.icon}
                              <CardTitle className="text-md">{template.name}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="custom" className="space-y-4">
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="report-name">Report Name</Label>
                        <Input id="report-name" placeholder="Enter report name" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="report-type">Report Type</Label>
                        <Select onValueChange={(value) => setSelectedReportType(value as ReportType)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="revenue">Revenue</SelectItem>
                            <SelectItem value="technician">Technician</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="workorder">Work Order</SelectItem>
                            <SelectItem value="inventory">Inventory</SelectItem>
                            <SelectItem value="financial">Financial</SelectItem>
                            <SelectItem value="scheduling">Scheduling</SelectItem>
                            <SelectItem value="productivity">Productivity</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="report-description">Description</Label>
                        <Input id="report-description" placeholder="Enter report description" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Data to Include</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="data-date" />
                            <Label htmlFor="data-date">Date Range</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="data-customers" />
                            <Label htmlFor="data-customers">Customers</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="data-technicians" />
                            <Label htmlFor="data-technicians">Technicians</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="data-services" />
                            <Label htmlFor="data-services">Services</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="data-revenue" />
                            <Label htmlFor="data-revenue">Revenue</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="data-location" />
                            <Label htmlFor="data-location">Location</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Data Visualization</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="viz-table" defaultChecked />
                            <Label htmlFor="viz-table">Table</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="viz-bar" />
                            <Label htmlFor="viz-bar">Bar Chart</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="viz-line" />
                            <Label htmlFor="viz-line">Line Chart</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="viz-pie" />
                            <Label htmlFor="viz-pie">Pie Chart</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                      <Button onClick={() => {
                        const newReport: Report = {
                          id: `custom-${Date.now()}`,
                          name: "Custom Report",
                          description: "Custom report description",
                          type: selectedReportType || "revenue",
                          createdAt: new Date().toISOString(),
                          scheduled: false,
                          icon: <BarChart4 className="h-5 w-5" />
                        };
                        setReports([...reports, newReport]);
                        setIsCreateDialogOpen(false);
                        toast.success("Custom report created successfully");
                      }}>
                        Create Report
                      </Button>
                    </DialogFooter>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isConfigureDialogOpen} onOpenChange={setIsConfigureDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileCog className="mr-2 h-4 w-4" />
                  Configure
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Configure Reports</DialogTitle>
                  <DialogDescription>
                    Manage your saved reports and scheduling preferences
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {reports.map((report) => (
                    <Card key={report.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2 items-center">
                            {report.icon}
                            <CardTitle className="text-md">{report.name}</CardTitle>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setSelectedReport(report)}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 pb-2">
                        <p className="text-sm text-muted-foreground">
                          {report.description}
                        </p>
                      </CardContent>
                      <CardFooter className="p-4 pt-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={report.scheduled || false} 
                            onCheckedChange={(checked) => toggleSchedule(report.id, checked)}
                          />
                          <Label>Schedule</Label>
                        </div>
                        
                        {report.scheduled && (
                          <Select 
                            value={report.frequency} 
                            onValueChange={(value) => updateFrequency(
                              report.id, 
                              value as "daily" | "weekly" | "monthly" | "quarterly" | "annual"
                            )}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="annual">Annual</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                  
                  {reports.length === 0 && (
                    <div className="text-center py-8">
                      <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-2 text-muted-foreground">No reports configured</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => {
                          setIsConfigureDialogOpen(false);
                          setIsCreateDialogOpen(true);
                        }}
                      >
                        Create Your First Report
                      </Button>
                    </div>
                  )}
                </div>
                
                {selectedReport && (
                  <DropdownMenu>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Report Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        generateReport(selectedReport.id);
                        setIsConfigureDialogOpen(false);
                      }}>
                        Generate Now
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        toast.info("Edit functionality would open here");
                      }}>
                        Edit Report
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-500"
                        onClick={() => deleteReport(selectedReport.id)}
                      >
                        Delete Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex gap-2 items-center">
                    {report.icon}
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => generateReport(report.id)}>
                        Generate Now
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const reportData = generateReportData(report.type, report.name);
                        setCurrentReportData(reportData);
                        setCurrentViewingReport(report);
                        exportReportToCsv(reportData, report.name);
                        toast.success("Report download started");
                      }}>
                        <DownloadCloud className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        setSelectedReport(report);
                        setIsConfigureDialogOpen(true);
                      }}>
                        Edit Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <div className="text-muted-foreground">Type:</div>
                  <div className="capitalize">{report.type}</div>
                  {report.frequency && (
                    <>
                      <div className="text-muted-foreground">Frequency:</div>
                      <div className="capitalize">{report.frequency}</div>
                    </>
                  )}
                  {report.lastRun && (
                    <>
                      <div className="text-muted-foreground">Last Generated:</div>
                      <div>{new Date(report.lastRun).toLocaleDateString()}</div>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => generateReport(report.id)}
                >
                  Generate Report
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {reports.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center p-12 border rounded-lg">
              <HelpCircle className="h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-xl font-medium">No Reports Configured</h3>
              <p className="mt-2 text-center text-muted-foreground">
                Create your first report to track key business metrics and performance indicators.
              </p>
              <Button 
                className="mt-6"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <FilePlus className="mr-2 h-4 w-4" />
                Create Your First Report
              </Button>
            </div>
          )}
        </div>
      </div>

      {currentViewingReport && (
        <ReportViewer
          isOpen={isReportViewerOpen}
          onClose={() => setIsReportViewerOpen(false)}
          reportName={currentViewingReport.name}
          reportType={currentViewingReport.type}
          reportData={currentReportData}
          onDownload={handleDownloadReport}
        />
      )}
    </MainLayout>
  );
};

export default Reports;
