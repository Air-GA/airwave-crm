
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart as LucideBarChart, FileText, LineChart as LucideLineChart, PieChart as LucidePieChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types for report data
export interface ReportData {
  headers: string[];
  rows: (string | number)[][];
  summary?: {
    title: string;
    value: string | number;
    change?: string | number;
    trend?: "up" | "down" | "neutral";
  }[];
  chartData?: {
    labels: string[];
    datasets: {
      name: string;
      values: number[];
    }[];
  };
}

interface ReportViewerProps {
  isOpen: boolean;
  onClose: () => void;
  reportName: string;
  reportType: string;
  reportData: ReportData | null;
  onDownload: () => void;
}

const ReportViewer = ({
  isOpen,
  onClose,
  reportName,
  reportType,
  reportData,
  onDownload
}: ReportViewerProps) => {
  if (!reportData) return null;
  
  // Helper to get a pastel color based on index
  const getColor = (index: number) => {
    const colors = [
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 99, 132, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)'
    ];
    return colors[index % colors.length];
  };

  // For a real implementation, these would be actual chart components using recharts
  const renderBarChart = () => {
    if (!reportData.chartData) return <div className="py-8 text-center text-muted-foreground">No chart data available</div>;
    
    return (
      <div className="h-60 w-full">
        <div className="flex flex-col h-full w-full">
          <div className="flex justify-between pb-2 text-xs text-muted-foreground">
            {reportData.chartData.labels.map((label, i) => (
              <div key={i} className="flex-1 text-center">{label}</div>
            ))}
          </div>
          <div className="flex h-full items-end gap-2">
            {reportData.chartData.datasets[0].values.map((value, i) => (
              <div 
                key={i} 
                className="flex-1 relative flex flex-col justify-end"
                style={{ height: '100%' }}
              >
                <div 
                  className="w-full rounded-t-sm"
                  style={{ 
                    backgroundColor: getColor(i),
                    height: `${(value / Math.max(...reportData.chartData!.datasets[0].values)) * 100}%` 
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    if (!reportData.chartData) return <div className="py-8 text-center text-muted-foreground">No chart data available</div>;
    
    // This is a simplified representation - a real implementation would use recharts
    return (
      <div className="h-60 w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-40 w-40 rounded-full border-8 border-gray-200 relative">
            {reportData.chartData.datasets[0].values.map((value, i) => {
              const total = reportData.chartData!.datasets[0].values.reduce((a, b) => a + b, 0);
              const percentage = (value / total) * 100;
              return (
                <div key={i} className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="absolute inset-0" 
                    style={{
                      backgroundColor: getColor(i),
                      clipPath: `polygon(50% 50%, 100% 0, 100% 100%)`,
                      transform: `rotate(${i * 60}deg)`,
                      opacity: 0.8
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {reportData.chartData.labels.map((label, i) => (
              <div key={i} className="flex items-center gap-1 text-xs">
                <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: getColor(i) }}></div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLineChart = () => {
    if (!reportData.chartData) return <div className="py-8 text-center text-muted-foreground">No chart data available</div>;
    
    return (
      <div className="h-60 w-full">
        <div className="flex flex-col h-full w-full">
          <div className="flex justify-between pb-2 text-xs text-muted-foreground">
            {reportData.chartData.labels.map((label, i) => (
              <div key={i} className="flex-1 text-center">{label}</div>
            ))}
          </div>
          <div className="relative h-full">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                points={reportData.chartData.datasets[0].values.map((value, i) => 
                  `${(i / (reportData.chartData!.labels.length - 1)) * 100}, ${100 - (value / Math.max(...reportData.chartData!.datasets[0].values)) * 100}`
                ).join(' ')}
                fill="none"
                stroke={getColor(0)}
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[80vw] md:max-w-[800px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{reportName}</DialogTitle>
          <DialogDescription>
            Generated report for {reportType} data
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {reportData.summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {reportData.summary.map((item, index) => (
                <div key={index} className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">{item.title}</div>
                  <div className="text-2xl font-bold mt-1">{item.value}</div>
                  {item.change && (
                    <div className={`text-sm mt-1 ${
                      item.trend === 'up' ? 'text-green-500' : 
                      item.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {item.change}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="barchart" className="flex items-center gap-1">
                <LucideBarChart className="h-4 w-4" /> Bar
              </TabsTrigger>
              <TabsTrigger value="linechart" className="flex items-center gap-1">
                <LucideLineChart className="h-4 w-4" /> Line
              </TabsTrigger>
              <TabsTrigger value="piechart" className="flex items-center gap-1">
                <LucidePieChart className="h-4 w-4" /> Pie
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="table" className="border rounded-md mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    {reportData.headers.map((header, index) => (
                      <TableHead key={index}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="barchart" className="border rounded-md p-4 mt-2">
              {renderBarChart()}
            </TabsContent>
            
            <TabsContent value="linechart" className="border rounded-md p-4 mt-2">
              {renderLineChart()}
            </TabsContent>
            
            <TabsContent value="piechart" className="border rounded-md p-4 mt-2">
              {renderPieChart()}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={onDownload}>
            Download Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportViewer;
