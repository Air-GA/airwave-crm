
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { FileSpreadsheet, Upload, Check, AlertTriangle, Database } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import CSVImporter from "@/components/importers/CSVImporter";
import { getImportedCustomers, getImportedWorkOrders, getImportedInventory, clearImportedData } from "@/services/importService";

const ImportData = () => {
  const [importTab, setImportTab] = useState<string>("customers");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [importComplete, setImportComplete] = useState(false);
  const navigate = useNavigate();
  
  // Load counts on component mount
  const customerCount = getImportedCustomers().length;
  const workOrderCount = getImportedWorkOrders().length;
  const inventoryCount = getImportedInventory().length;
  
  const handleImportComplete = (items: any[]) => {
    setImportedCount(items.length);
    setImportComplete(true);
    setImporting(false);
    setProgress(100);
    
    toast({
      title: "Import Complete",
      description: `Successfully imported ${items.length} ${importTab}.`,
    });
  };

  const handleImportProgress = (current: number, total: number) => {
    if (total > 0) {
      const calculatedProgress = Math.round((current / total) * 100);
      setProgress(calculatedProgress);
      console.log(`Import progress: ${calculatedProgress}% (${current}/${total})`);
    }
  };

  const handleClearData = () => {
    clearImportedData();
    toast({
      title: "Data Cleared",
      description: "All imported data has been removed.",
    });
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Import Data</h1>
            <p className="text-muted-foreground">
              Import data from external sources to populate your HVAC management system
            </p>
          </div>
          
          <div className="flex flex-col xs:flex-row gap-2">
            <Button variant="outline" onClick={handleClearData}>
              Clear All Imported Data
            </Button>
            <Button onClick={() => navigate("/customers")}>
              <Database className="mr-2 h-4 w-4" />
              View Imported Data
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center mb-4">
          <div className="flex items-center bg-muted p-2 rounded-md mr-4">
            <span className="text-sm font-medium mr-2">Current Data:</span>
            <span className="text-sm px-2 py-1 bg-primary/10 rounded mr-1">{customerCount} Customers</span>
            <span className="text-sm px-2 py-1 bg-primary/10 rounded mr-1">{workOrderCount} Work Orders</span>
            <span className="text-sm px-2 py-1 bg-primary/10 rounded">{inventoryCount} Inventory Items</span>
          </div>
        </div>
        
        <Tabs
          defaultValue="customers"
          value={importTab}
          onValueChange={setImportTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="customers">Customer Import</TabsTrigger>
            <TabsTrigger value="work-orders">Work Orders Import</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileSpreadsheet className="mr-2 h-5 w-5" />
                  Import Customer Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!importComplete ? (
                  <>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Important</AlertTitle>
                      <AlertDescription>
                        CSV or Excel files should contain columns for customer name, email, phone, 
                        service address (including city, state, zip), and billing address.
                      </AlertDescription>
                    </Alert>
                    
                    {importing ? (
                      <div className="space-y-4 py-4">
                        <p>Importing customers... Please do not close this window.</p>
                        <Progress value={progress} />
                        <p className="text-xs text-muted-foreground text-right">
                          {progress}% complete
                        </p>
                      </div>
                    ) : (
                      <CSVImporter 
                        type="customers"
                        onImportStart={() => {
                          setImporting(true);
                          setProgress(0);
                        }}
                        onImportProgress={handleImportProgress}
                        onComplete={handleImportComplete}
                      />
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <Alert className="bg-green-50 border-green-200">
                      <Check className="h-4 w-4 text-green-500" />
                      <AlertTitle>Import Complete</AlertTitle>
                      <AlertDescription>
                        Successfully imported {importedCount} customers.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <Button variant="outline" onClick={() => setImportComplete(false)}>
                        Import More Customers
                      </Button>
                      <Button onClick={() => navigate("/customers")}>
                        View Customers
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setImportTab("work-orders")}
                      >
                        Import Work Orders Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="work-orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileSpreadsheet className="mr-2 h-5 w-5" />
                  Import Work Order Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Import your work order data here from CSV or Excel files.</p>
                <div className="mt-4">
                  <CSVImporter 
                    type="work-orders" 
                    onImportStart={() => {
                      setImporting(true);
                      setProgress(0);
                    }}
                    onImportProgress={handleImportProgress}
                    onComplete={handleImportComplete}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileSpreadsheet className="mr-2 h-5 w-5" />
                  Import Inventory Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Import your inventory items and stock levels from CSV or Excel files.</p>
                <div className="mt-4">
                  <CSVImporter 
                    type="inventory"
                    onImportStart={() => {
                      setImporting(true);
                      setProgress(0);
                    }}
                    onImportProgress={handleImportProgress}
                    onComplete={handleImportComplete}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ImportData;
