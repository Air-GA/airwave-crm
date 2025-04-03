
import { useState, useRef, useCallback } from "react";
import Papa from 'papaparse';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileWarning, Table as TableIcon, CheckCircle } from "lucide-react";
import { Customer } from "@/types";
import { processCustomerImport } from "@/services/importService";

// Define the props for the component
interface CSVImporterProps {
  type: "customers" | "workorders" | "inventory";
  onImportStart: () => void;
  onImportProgress: (current: number, total: number) => void;
  onImportComplete: (count: number) => void;
}

// Define form schema
const formSchema = z.object({
  file: z.instanceof(File),
  columnMappings: z.record(z.string()),
});

type FormData = z.infer<typeof formSchema>;

const CSVImporter = ({ 
  type, 
  onImportStart, 
  onImportProgress,
  onImportComplete 
}: CSVImporterProps) => {
  const [csvData, setCsvData] = useState<Array<Record<string, string>>>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Define required fields based on import type
  const requiredFields = {
    customers: ['name', 'phone', 'email', 'address', 'city', 'state', 'zip'],
    workorders: ['customer', 'description', 'type', 'priority', 'status'],
    inventory: ['name', 'sku', 'category', 'unit_price', 'quantity']
  };

  // Create form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      columnMappings: {},
    },
  });
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileError(null);
    
    if (!file) {
      return;
    }
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setFileError("Please select a CSV file.");
      return;
    }
    
    setFileSelected(file);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setFileError("The CSV file appears to be empty.");
          return;
        }
        
        if (results.errors.length > 0) {
          setFileError("Error parsing CSV file. Please check the format.");
          console.error("CSV parsing errors:", results.errors);
          return;
        }
        
        // Get headers and data
        const headers = Object.keys(results.data[0] as object);
        const data = results.data as Array<Record<string, string>>;
        
        setHeaders(headers);
        setCsvData(data);
        
        // Set form value for file
        form.setValue("file", file);
        
        // Switch to preview mode
        setPreviewMode(true);
        
        // Create initial mapping suggestions based on header names
        const initialMappings: Record<string, string> = {};
        
        // Get the required fields for this import type
        const requiredForType = requiredFields[type];
        
        // Try to guess the mappings based on header names
        requiredForType.forEach(field => {
          const matchingHeader = headers.find(h => 
            h.toLowerCase().includes(field) || 
            field.includes(h.toLowerCase())
          );
          
          if (matchingHeader) {
            initialMappings[field] = matchingHeader;
          }
        });
        
        // Set the initial column mappings
        form.setValue("columnMappings", initialMappings);
      },
      error: (error) => {
        setFileError(`Error reading the CSV file: ${error.message}`);
        console.error("CSV parsing error:", error);
      }
    });
  };
  
  const handleImport = useCallback(async (data: FormData) => {
    const { columnMappings } = data;
    
    // Check if all required fields are mapped
    const requiredForType = requiredFields[type];
    const missingFields = requiredForType.filter(field => !columnMappings[field]);
    
    if (missingFields.length > 0) {
      setFileError(`Please map all required fields. Missing: ${missingFields.join(', ')}`);
      return;
    }
    
    try {
      onImportStart();
      
      // Process the import based on type
      if (type === "customers") {
        // Transform csvData using the column mappings
        const customers = csvData.map(row => {
          return {
            id: crypto.randomUUID(),
            name: row[columnMappings.name] || '',
            email: row[columnMappings.email] || '',
            phone: row[columnMappings.phone] || '',
            serviceAddress: `${row[columnMappings.address] || ''}, ${row[columnMappings.city] || ''}, ${row[columnMappings.state] || ''} ${row[columnMappings.zip] || ''}`,
            billAddress: row[columnMappings.billAddress] ? 
              `${row[columnMappings.billAddress]}, ${row[columnMappings.billCity] || ''}, ${row[columnMappings.billState] || ''} ${row[columnMappings.billZip] || ''}` :
              `${row[columnMappings.address] || ''}, ${row[columnMappings.city] || ''}, ${row[columnMappings.state] || ''} ${row[columnMappings.zip] || ''}`,
            notes: row[columnMappings.notes] || '',
            // Add geolocation data if available
            location: columnMappings.latitude && columnMappings.longitude ? {
              lat: parseFloat(row[columnMappings.latitude]),
              lng: parseFloat(row[columnMappings.longitude])
            } : undefined
          };
        });
        
        // Import the customers in batches to show progress
        const batchSize = 50;
        let imported = 0;
        
        for (let i = 0; i < customers.length; i += batchSize) {
          const batch = customers.slice(i, i + batchSize);
          await processCustomerImport(batch);
          
          imported += batch.length;
          onImportProgress(imported, customers.length);
          
          // Small delay to prevent UI freezing
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        onImportComplete(customers.length);
      } else if (type === "workorders") {
        // Similar implementation for workorders
        // Would use a processWorkOrderImport function
        onImportComplete(csvData.length);
      } else if (type === "inventory") {
        // Similar implementation for inventory
        // Would use a processInventoryImport function
        onImportComplete(csvData.length);
      }
    } catch (error) {
      console.error(`Error during ${type} import:`, error);
      setFileError(`Error importing data: ${(error as Error).message}`);
      onImportComplete(0);
    }
  }, [csvData, type, onImportStart, onImportProgress, onImportComplete]);
  
  return (
    <div className="space-y-4">
      {!previewMode ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">Upload a CSV file</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your CSV file should include columns for all required {type} data
          </p>
          
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline"
            className="mt-4"
          >
            <Upload className="mr-2 h-4 w-4" />
            Select CSV File
          </Button>
          
          {fileError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center">
              <FileWarning className="h-5 w-5 mr-2" />
              {fileError}
            </div>
          )}
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleImport)} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Map CSV Columns</h3>
                <p className="text-sm text-muted-foreground">
                  Match your CSV columns to the required fields
                </p>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => {
                  setPreviewMode(false);
                  setFileSelected(null);
                  setCsvData([]);
                  setHeaders([]);
                }}
              >
                Change File
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {requiredFields[type].map((field) => (
                <FormField
                  key={field}
                  control={form.control}
                  name={`columnMappings.${field}`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>
                        {field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                        {requiredFields[type].includes(field) && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </FormLabel>
                      <Select 
                        onValueChange={formField.onChange}
                        value={formField.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={`Select column for ${field}`} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {headers.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            
            {/* Optional fields based on type */}
            {type === "customers" && (
              <div>
                <h4 className="text-sm font-medium mb-2">Optional Fields</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {['notes', 'latitude', 'longitude'].map((field) => (
                    <FormField
                      key={field}
                      control={form.control}
                      name={`columnMappings.${field}`}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel>{field.charAt(0).toUpperCase() + field.slice(1)}</FormLabel>
                          <Select 
                            onValueChange={formField.onChange}
                            value={formField.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={`Select column for ${field} (optional)`} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Not mapped</SelectItem>
                              {headers.map((header) => (
                                <SelectItem key={header} value={header}>
                                  {header}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {fileError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center">
                <FileWarning className="h-5 w-5 mr-2" />
                {fileError}
              </div>
            )}
            
            <div className="border rounded-lg">
              <div className="p-3 bg-muted flex items-center">
                <TableIcon className="h-4 w-4 mr-2" />
                <h4 className="text-sm font-medium">CSV Preview</h4>
              </div>
              <div className="overflow-auto max-h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.slice(0, 5).map((header, index) => (
                        <TableHead key={index}>{header}</TableHead>
                      ))}
                      {headers.length > 5 && (
                        <TableHead>+{headers.length - 5} more columns</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 5).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {headers.slice(0, 5).map((header, colIndex) => (
                          <TableCell key={colIndex}>{row[header]}</TableCell>
                        ))}
                        {headers.length > 5 && (
                          <TableCell>...</TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-3 border-t text-xs text-muted-foreground">
                Showing {Math.min(5, csvData.length)} of {csvData.length} rows
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Import {csvData.length} {type}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default CSVImporter;
