
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import { Customer, WorkOrder, InventoryItem } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { importCustomers, importWorkOrders, importInventory } from "@/services/importService";
import { useToast } from "@/hooks/use-toast";

interface CSVImporterProps {
  type: "customers" | "work-orders" | "inventory";
  onComplete: (items: any[], type: string) => void;
  onImportStart?: () => void;
  onImportProgress?: (current: number, total: number) => void;
}

const CSVImporter = ({ type, onComplete, onImportStart, onImportProgress }: CSVImporterProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
  
  const handleFile = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file format",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    if (onImportStart) onImportStart();

    try {
      console.log("Starting CSV import for file:", file.name);
      
      // First read the file contents
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
      
    } catch (error) {
      console.error("CSV parsing error:", error);
      toast({
        title: "Import failed",
        description: "Failed to process the CSV file.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };
  
  const processData = async (data: any[]) => {
    if (data.length === 0) {
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
      
      if (type === "customers") {
        const processedCustomers = processCustomers(data);
        console.log(`Processed ${processedCustomers.length} customer records`);
        const result = await importCustomers(processedCustomers);
        onComplete(result, "customers");
        
        toast({
          title: "Import successful",
          description: `${result.length} customers have been imported successfully.`,
        });
      } 
      else if (type === "work-orders") {
        const processedWorkOrders = processWorkOrders(data);
        console.log(`Processed ${processedWorkOrders.length} work order records`);
        const result = await importWorkOrders(processedWorkOrders);
        onComplete(result, "work-orders");
        
        toast({
          title: "Import successful",
          description: `${result.length} work orders have been imported successfully.`,
        });
      }
      else if (type === "inventory") {
        const processedInventory = processInventory(data);
        console.log(`Processed ${processedInventory.length} inventory records`);
        const result = await importInventory(processedInventory);
        onComplete(result, "inventory");
        
        toast({
          title: "Import successful",
          description: `${result.length} inventory items have been imported successfully.`,
        });
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
        <div className="rounded-full bg-primary/10 p-3">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Upload {type} CSV File</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop your CSV file here, or click to select a file
          </p>
          {!isProcessing && (
            <p className="text-xs text-muted-foreground mt-1">
              Note: Data will be stored locally since no database is connected
            </p>
          )}
        </div>
        <input
          type="file"
          id="csv-upload"
          className="hidden"
          accept=".csv"
          onChange={handleFileChange}
        />
        <label htmlFor="csv-upload">
          <Button variant="outline" disabled={isProcessing} asChild>
            <span>{isProcessing ? "Processing..." : "Select CSV File"}</span>
          </Button>
        </label>
      </div>
    </Card>
  );
};

export default CSVImporter;

