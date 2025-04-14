import { useState } from "react";
import { Download, Filter, BarChart, FileText, Calendar, Users, Plus } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddReportDialog } from "@/components/reports/AddReportDialog";
import { generateReportData, exportReportToCsv } from "@/services/reportService";
import ReportViewer from "@/components/reports/ReportViewer";
import { toast } from "sonner";

// Mock reports data
const mockReports = [
  { id: 1, name: "Monthly Revenue", category: "financial", date: "2025-04-01" },
  { id: 2, name: "Technician Performance", category: "performance", date: "2025-04-05" },
  { id: 3, name: "Customer Satisfaction", category: "customer", date: "2025-04-07" },
  { id: 4, name: "Inventory Status", category: "inventory", date: "2025-04-08" },
  { id: 5, name: "Service Call Analysis", category: "service", date: "2025-04-10" },
];

export default function Reports() {
  const [selectedReportCategory, setSelectedReportCategory] = useState<string>("all");
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{ id: number; name: string; category: string; date: string } | null>(null);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);
  
  const filteredReports = selectedReportCategory === "all" 
    ? mockReports 
    : mockReports.filter(report => report.category === selectedReportCategory);

  const handleViewReport = (report: typeof mockReports[0]) => {
    setSelectedReport(report);
    setIsReportViewerOpen(true);
  };

  const handleDownloadReport = (report: typeof mockReports[0]) => {
    const reportData = generateReportData(report.category, report.name);
    exportReportToCsv(reportData, report.name);
    toast.success(`Report "${report.name}" downloaded successfully`);
  };

  const handleAddReport = () => {
    setIsAddReportOpen(true);
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
              <Button variant="outline" size="sm" onClick={handleAddReport}>
                <Plus className="mr-2 h-4 w-4" />
                Add Report
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="list">
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center space-x-2">
                  <Select value={selectedReportCategory} onValueChange={setSelectedReportCategory}>
                    <SelectTrigger className="w-[180px]">
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
                  
                  <Button variant="outline" size="sm">
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
                            <Button variant="ghost" size="sm" onClick={() => handleDownloadReport(report)}>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleViewReport(report)}>
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
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewReport(report)}>
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownloadReport(report)}>
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
          </CardFooter>
        </Card>
      </div>

      {/* Add Report Dialog */}
      <AddReportDialog 
        open={isAddReportOpen}
        onOpenChange={setIsAddReportOpen}
      />

      {/* Report Viewer */}
      {selectedReport && (
        <ReportViewer
          isOpen={isReportViewerOpen}
          onClose={() => setIsReportViewerOpen(false)}
          reportName={selectedReport.name}
          reportType={selectedReport.category}
          reportData={generateReportData(selectedReport.category, selectedReport.name)}
          onDownload={() => handleDownloadReport(selectedReport)}
        />
      )}
    </MainLayout>
  );
}
