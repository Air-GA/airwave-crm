
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { FileSpreadsheet, Upload, Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CSVImporter from "@/components/importers/CSVImporter";
import { Customer } from "@/types";

const ImportData = () => {
  const [importTab, setImportTab] = useState<string>("customers");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [importComplete, setImportComplete] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleImportComplete = (count: number) => {
    setImportedCount(count);
    setImportComplete(true);
    setImporting(false);
    setProgress(100);
    
    toast({
      title: "Import Complete",
      description: `Successfully imported ${count} ${importTab}.`,
    });
  };

  const handleImportProgress = (current: number, total: number) => {
    if (total) {
      setProgress(Math.round((current / total) * 100));
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import Data</h1>
          <p className="text-muted-foreground">
            Import data from external sources to populate your HVAC management system
          </p>
        </div>
        
        <Tabs
          defaultValue="customers"
          value={importTab}
          onValueChange={setImportTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="customers">Customer Import</TabsTrigger>
            <TabsTrigger value="workorders" disabled={!importComplete}>Work Orders Import</TabsTrigger>
            <TabsTrigger value="inventory" disabled={!importComplete}>Inventory Import</TabsTrigger>
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
                        CSV files should contain columns for customer name, email, phone, 
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
                        onImportStart={() => setImporting(true)}
                        onImportProgress={handleImportProgress}
                        onImportComplete={handleImportComplete}
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
                        onClick={() => setImportTab("workorders")}
                      >
                        Import Work Orders Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="workorders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileSpreadsheet className="mr-2 h-5 w-5" />
                  Import Work Order Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>After importing customers, you can now import work order data.</p>
                <div className="mt-4">
                  <CSVImporter 
                    type="workorders" 
                    onImportStart={() => setImporting(true)}
                    onImportProgress={handleImportProgress}
                    onImportComplete={(count) => {
                      setImporting(false);
                      toast({
                        title: "Import Complete",
                        description: `Successfully imported ${count} work orders.`,
                      });
                    }}
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
                <p>Import your inventory items and stock levels.</p>
                <div className="mt-4">
                  <CSVImporter 
                    type="inventory"
                    onImportStart={() => setImporting(true)}
                    onImportProgress={handleImportProgress}
                    onImportComplete={(count) => {
                      setImporting(false);
                      toast({
                        title: "Import Complete",
                        description: `Successfully imported ${count} inventory items.`,
                      });
                    }}
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
