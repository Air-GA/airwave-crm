
import { useState } from "react";
import { Download, Filter, BarChart, FileText, Calendar, Users, CalendarRange } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SyncWithQuickBooks } from "@/components/SyncWithQuickBooks";
import ReportViewer from "@/components/reports/ReportViewer";
import { generateReportData, exportReportToCsv } from "@/services/reportService";

// Mock reports data
const mockReports = [
  { id: 1, name: "Monthly Revenue", category: "financial", date: "2025-04-01", type: "revenue" },
  { id: 2, name: "Technician Performance", category: "performance", date: "2025-04-05", type: "technician" },
  { id: 3, name: "Customer Satisfaction", category: "customer", date: "2025-04-07", type: "customer" },
  { id: 4, name: "Inventory Status", category: "inventory", date: "2025-04-08", type: "inventory" },
  { id: 5, name: "Service Call Analysis", category: "service", date: "2025-04-10", type: "workorder" },
];

// Time frame options
const timeFrameOptions = [
  { value: "last30days", label: "Last 30 Days" },
  { value: "last90days", label: "Last 90 Days" },
  { value: "lastYear", label: "Last Year" },
  { value: "ytd", label: "Year to Date" },
  { value: "custom", label: "Custom Range" }
];

export default function Reports() {
  const [selectedReportCategory, setSelectedReportCategory] = useState<string>("all");
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<string>("last30days");
  const [viewingReport, setViewingReport] = useState<{ report: any; data: any } | null>(null);
  
  const filteredReports = selectedReportCategory === "all" 
    ? mockReports 
    : mockReports.filter(report => report.category === selectedReportCategory);
  
  const refreshReports = () => {
    // Would fetch the latest reports data
    console.log("Refreshing reports after sync");
  };

  const handleViewReport = (report) => {
    const reportData = generateReportData(report.type, report.name);
    setViewingReport({ report, data: reportData });
  };
  
  const handleDownloadReport = (report) => {
    const reportData = generateReportData(report.type, report.name);
    exportReportToCsv(reportData, report.name);
  };
  
  const handleCloseReportViewer = () => {
    setViewingReport(null);
  };

  return (
    <MainLayout pageName="Reports">
      <div className="container p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                View and generate reports on business performance
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <SyncWithQuickBooks 
                entityType="reports" 
                onSyncComplete={refreshReports}
              />
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="list">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <TabsList>
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                </TabsList>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto">
                  <Select value={selectedTimeFrame} onValueChange={setSelectedTimeFrame}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <CalendarRange className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Time Frame" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeFrameOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedReportCategory} onValueChange={setSelectedReportCategory}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="inventory">Inventory</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>
                </div>
              </div>
              
              <TabsContent value="list" className="mt-0">
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredReports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{report.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownloadReport(report)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewReport(report)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="grid" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredReports.map((report) => (
                    <Card key={report.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <CardDescription className="capitalize">{report.category}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{report.date}</span>
                        </div>
                        <div className="mt-4 flex justify-center">
                          {report.category === "financial" && <BarChart className="h-16 w-16 text-muted-foreground" />}
                          {report.category === "performance" && <Users className="h-16 w-16 text-muted-foreground" />}
                          {report.category === "customer" && <Users className="h-16 w-16 text-muted-foreground" />}
                          {report.category === "inventory" && <FileText className="h-16 w-16 text-muted-foreground" />}
                          {report.category === "service" && <FileText className="h-16 w-16 text-muted-foreground" />}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex space-x-2 w-full">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleViewReport(report)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleDownloadReport(report)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredReports.length} of {mockReports.length} reports
            </div>
            <div className="text-sm text-muted-foreground">
              Time frame: {timeFrameOptions.find(option => option.value === selectedTimeFrame)?.label}
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {viewingReport && (
        <ReportViewer
          isOpen={!!viewingReport}
          onClose={handleCloseReportViewer}
          reportName={viewingReport.report.name}
          reportType={viewingReport.report.category}
          reportData={viewingReport.data}
          onDownload={() => handleDownloadReport(viewingReport.report)}
          timeFrame={selectedTimeFrame}
        />
      )}
    </MainLayout>
  );
}
