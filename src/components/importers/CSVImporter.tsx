
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileSpreadsheet, AlertTriangle } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from 'xlsx';
import { Customer, WorkOrder, InventoryItem } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { 
  processCustomerImport, 
  processWorkOrderImport, 
  processInventoryImport,
  getObjectSizeInBytes,
  wouldExceedQuota
} from "@/services/importService";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CSVImporterProps {
  type: "customers" | "work-orders" | "inventory";
  onComplete: (items: any[], type: string) => void;
  onImportStart?: () => void;
  onImportProgress?: (current: number, total: number) => void;
}

const CSVImporter = ({ type, onComplete, onImportStart, onImportProgress }: CSVImporterProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };
  
  const isExcelFile = (file: File) => {
    const excelTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12'
    ];
    return excelTypes.includes(file.type) || 
           file.name.endsWith('.xlsx') || 
           file.name.endsWith('.xls') || 
           file.name.endsWith('.xlsm');
  };
  
  const isCsvFile = (file: File) => {
    return file.type === "text/csv" || 
           file.name.endsWith('.csv');
  };
  
  const handleFile = (file: File) => {
    if (!isCsvFile(file) && !isExcelFile(file)) {
      toast({
        title: "Invalid file format",
        description: "Please upload a CSV or Excel file (.csv, .xlsx, .xls)",
        variant: "destructive",
      });
      return;
    }
    
    // Clear any previous errors
    setImportError(null);
    setIsProcessing(true);
    if (onImportStart) onImportStart();

    try {
      console.log(`Starting ${isExcelFile(file) ? 'Excel' : 'CSV'} import for file:`, file.name);
      console.log(`File size: ${(file.size / 1024).toFixed(2)} KB`);
      
      // Check if file size is very large (might cause browser storage issues)
      if (file.size > 5 * 1024 * 1024) { // 5MB
        console.warn("Large file detected, may cause browser storage issues");
        toast({
          title: "Large file detected",
          description: "This file is quite large and may exceed browser storage limits. Consider splitting into smaller files.",
          variant: "warning",
        });
      }
      
      if (isExcelFile(file)) {
        handleExcelFile(file);
      } else {
        handleCsvFile(file);
      }
    } catch (error) {
      console.error("File parsing error:", error);
      setImportError(`Failed to process the file: ${(error as Error).message}`);
      toast({
        title: "Import failed",
        description: "Failed to process the file.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };
  
  const handleExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error("Could not read file");
        }
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`Excel parsed successfully. Found ${jsonData.length} rows.`);
        
        if (jsonData.length === 0) {
          toast({
            title: "Empty file",
            description: "The uploaded file doesn't contain any valid data.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
        
        // Update progress
        if (onImportProgress) {
          onImportProgress(jsonData.length, jsonData.length);
        }
        
        processData(jsonData);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast({
          title: "Error parsing file",
          description: "There was an error parsing the Excel file. Please check the format and try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "Could not read the file content",
        variant: "destructive",
      });
      setIsProcessing(false);
    };
    
    reader.readAsBinaryString(file);
  };
  
  const handleCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        toast({
          title: "Error reading file",
          description: "Could not read the file content",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      const csvData = event.target.result as string;
      
      // Set up row counter for progress tracking
      let totalRows = 0;
      let processedRows = 0;
      
      // First count total rows for accurate progress reporting
      const rowCount = csvData.split('\n').length - 1; // -1 for header
      totalRows = Math.max(1, rowCount); // Ensure at least 1 to avoid division by zero
      
      // Now parse the data
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<any>) => {
          if (results.data.length === 0) {
            toast({
              title: "Empty file",
              description: "The uploaded file doesn't contain any valid data.",
              variant: "destructive",
            });
            setIsProcessing(false);
            return;
          }
          
          console.log(`CSV parsed successfully. Found ${results.data.length} rows.`);
          processData(results.data);
        },
        error: (error: any) => {
          console.error("Error parsing CSV:", error);
          toast({
            title: "Error parsing file",
            description: "There was an error parsing the CSV file. Please check the format and try again.",
            variant: "destructive",
          });
          setIsProcessing(false);
        },
        step: (row: Papa.ParseStepResult<any>) => {
          // Update progress based on rows processed
          processedRows++;
          if (onImportProgress) {
            onImportProgress(processedRows, totalRows);
          }
        }
      });
    };
    
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "Could not read the file content",
        variant: "destructive",
      });
      setIsProcessing(false);
    };
    
    reader.readAsText(file);
  };
  
  const processData = async (data: any[]) => {
    if (data.length === 0) {
      setImportError("The uploaded file doesn't contain any valid data.");
      toast({
        title: "Empty file",
        description: "The uploaded file doesn't contain any valid data.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }
    
    try {
      console.log(`Processing ${data.length} rows of ${type} data...`);
      
      // Estimate data size to check if it might exceed storage
      const roughSizeInBytes = getObjectSizeInBytes(data);
      console.log(`Estimated data size: ${(roughSizeInBytes / 1024).toFixed(2)} KB`);
      
      // Check if the storage might be exceeded
      if (wouldExceedQuota(`imported_${type}`, data)) {
        console.warn("Data may exceed storage limits");
        toast({
          title: "Storage Warning",
          description: "This import may exceed browser storage limits. Consider importing fewer records.",
          variant: "warning",
        });
      }
      
      if (type === "customers") {
        try {
          const importedCount = await processCustomerImport(data);
          console.log(`Successfully imported ${importedCount} customer records`);
          onComplete(data.slice(0, importedCount), "customers");
          
          toast({
            title: "Import successful",
            description: `${importedCount} customers have been imported successfully.`,
          });
        } catch (error) {
          console.error("Error processing customer import:", error);
          let errorMessage = `Error importing customers: ${(error as Error).message}`;
          
          // Check for storage quota errors
          if (errorMessage.includes("quota") || errorMessage.includes("Storage")) {
            errorMessage = "Browser storage limit reached. Try clearing existing data or import fewer customers.";
          }
          
          setImportError(errorMessage);
          toast({
            title: "Import failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } 
      else if (type === "work-orders") {
        try {
          const importedCount = await processWorkOrderImport(data);
          console.log(`Successfully imported ${importedCount} work order records`);
          onComplete(data.slice(0, importedCount), "work-orders");
          
          toast({
            title: "Import successful",
            description: `${importedCount} work orders have been imported successfully.`,
          });
        } catch (error) {
          console.error("Error processing work order import:", error);
          toast({
            title: "Import failed",
            description: `Error importing work orders: ${(error as Error).message}`,
            variant: "destructive",
          });
        }
      }
      else if (type === "inventory") {
        try {
          const importedCount = await processInventoryImport(data);
          console.log(`Successfully imported ${importedCount} inventory records`);
          onComplete(data.slice(0, importedCount), "inventory");
          
          toast({
            title: "Import successful",
            description: `${importedCount} inventory items have been imported successfully.`,
          });
        } catch (error) {
          console.error("Error processing inventory import:", error);
          toast({
            title: "Import failed",
            description: `Error importing inventory: ${(error as Error).message}`,
            variant: "destructive",
          });
        }
      }
      else {
        // Handle other import types
        toast({
          title: "Import type not supported",
          description: `Import of "${type}" is not yet supported.`,
          variant: "destructive",
        });
      }
      
      setIsProcessing(false);
      
    } catch (error) {
      console.error("Import error:", error);
      setImportError(`Import failed: ${(error as Error).message}`);
      toast({
        title: "Import failed",
        description: "There was an error importing the data. Please check the console for details.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };
  
  const processCustomers = (data: any[]): Customer[] => {
    return data.map(item => {
      // Generate random coordinates near Georgia for the map view
      const lat = 33.7490 + (Math.random() - 0.5) * 2;
      const lng = -84.3880 + (Math.random() - 0.5) * 2;
      
      return {
        id: uuidv4(),
        name: item.name || item.Name || item.customer_name || item.CustomerName || "",
        email: item.email || item.Email || "",
        phone: item.phone || item.Phone || item.phone_number || item.PhoneNumber || "",
        address: item.address || item.Address || "",
        serviceAddress: item.serviceAddress || item.service_address || item.ServiceAddress || item.address || item.Address || "",
        billAddress: item.billAddress || item.billing_address || item.BillingAddress || item.address || item.Address || "",
        type: item.type || item.Type || item.customer_type || item.CustomerType || "residential",
        createdAt: new Date().toISOString(),
        serviceAddresses: [
          {
            id: uuidv4(),
            address: item.serviceAddress || item.service_address || item.ServiceAddress || item.address || item.Address || "",
            isPrimary: true
          }
        ],
        notes: item.notes || item.Notes || "",
        location: {
          lat,
          lng
        }
      };
    });
  };
  
  const processWorkOrders = (data: any[]): WorkOrder[] => {
    return data.map(item => ({
      id: item.id || uuidv4(),
      customerId: item.customerId || item.customer_id || item.CustomerId || "",
      customerName: item.customerName || item.customer_name || item.CustomerName || "",
      address: item.address || item.Address || "",
      status: item.status || item.Status || "pending",
      priority: item.priority || item.Priority || "medium",
      type: item.type || item.Type || "repair",
      description: item.description || item.Description || "",
      scheduledDate: item.scheduledDate || item.scheduled_date || item.ScheduledDate || new Date().toISOString(),
      createdAt: item.createdAt || item.created_at || item.CreatedAt || new Date().toISOString(),
      technicianId: item.technicianId || item.technician_id || item.TechnicianId || undefined,
      technicianName: item.technicianName || item.technician_name || item.TechnicianName || undefined,
      completedAt: item.completedAt || item.completed_at || item.CompletedAt || undefined,
      notes: item.notes || item.Notes || []
    }));
  };
  
  const processInventory = (data: any[]): InventoryItem[] => {
    return data.map(item => ({
      id: item.id || uuidv4(),
      name: item.name || item.Name || "",
      category: item.category || item.Category || "",
      description: item.description || item.Description || "",
      quantity: Number(item.quantity || item.Quantity || 0),
      price: Number(item.price || item.Price || 0),
      reorderLevel: Number(item.reorderLevel || item.reorder_level || item.ReorderLevel || 5),
      supplier: item.supplier || item.Supplier || "",
      location: item.location || item.Location || "",
      sku: item.sku || item.SKU || "",
      unit_price: Number(item.unit_price || item.unitPrice || item.UnitPrice || 0),
    }));
  };
  
  return (
    <Card
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-dashed border-2 p-6 text-center ${
        isDragging ? "border-primary bg-primary/5" : ""
      } transition-colors duration-200`}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        {importError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Import Error</AlertTitle>
            <AlertDescription>{importError}</AlertDescription>
          </Alert>
        )}
        
        <div className="rounded-full bg-primary/10 p-3">
          <FileSpreadsheet className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Upload {type} File</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop your CSV or Excel file here, or click to select a file
          </p>
          {!isProcessing && (
            <>
              <p className="text-xs text-muted-foreground mt-1">
                Note: Data will be stored locally in your browser
              </p>
              {type === "customers" && (
                <p className="text-xs text-muted-foreground mt-1">
                  Tip: For large datasets, consider splitting into multiple files to avoid storage limits
                </p>
              )}
            </>
          )}
        </div>
        <input
          type="file"
          id="csv-upload"
          className="hidden"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
        />
        <label htmlFor="csv-upload">
          <Button variant="outline" disabled={isProcessing} asChild>
            <span>{isProcessing ? "Processing..." : "Select CSV or Excel File"}</span>
          </Button>
        </label>
      </div>
    </Card>
  );
};

export default CSVImporter;
