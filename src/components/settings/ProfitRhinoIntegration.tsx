
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { integrationSchema } from "@/utils/settingsSchema";
import { useAuth } from "@/hooks/useAuth";
import { 
  DollarSign, 
  Package, 
  PriceTag, 
  RefreshCw, 
  Check, 
  X, 
  Settings,
  PercentCircle
} from "lucide-react";
import { SyncButton } from "@/components/SyncButton";

const profitRhinoSchema = z.object({
  connected: z.boolean().default(false),
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().min(1, "API Secret is required"),
  environment: z.enum(["sandbox", "production"]).default("sandbox"),
  baseUrl: z.string().url("Must be a valid URL").optional(),
  autoSync: z.boolean().default(true),
  syncInterval: z.number().default(3600000),
  syncInventory: z.boolean().default(true),
  syncPricing: z.boolean().default(true),
  markupPercentage: z.number().min(0).default(30),
  useCompanyMarkups: z.boolean().default(true),
  useDefaultMaterialsCost: z.boolean().default(false),
  useCustomPricebook: z.boolean().default(false),
  pricebookId: z.string().optional(),
});

export function ProfitRhinoIntegration() {
  const { toast } = useToast();
  const { userRole, permissions } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Only admin can manage integrations
  if (userRole !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profit Rhino Integration</CardTitle>
          <CardDescription>
            Contact an administrator to set up the Profit Rhino integration.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const form = useForm<z.infer<typeof profitRhinoSchema>>({
    resolver: zodResolver(profitRhinoSchema),
    defaultValues: {
      connected: false,
      apiKey: "",
      apiSecret: "",
      environment: "sandbox",
      autoSync: true,
      syncInterval: 3600000,
      syncInventory: true,
      syncPricing: true,
      markupPercentage: 30,
      useCompanyMarkups: true,
      useDefaultMaterialsCost: false,
      useCustomPricebook: false,
    },
  });

  const onSubmit = (values: z.infer<typeof profitRhinoSchema>) => {
    console.log("Profit Rhino integration settings:", values);
    
    // In a real app, this would save to your backend/database
    toast({
      title: "Settings saved",
      description: "Profit Rhino integration settings have been updated.",
    });
    
    // Simulate connection
    if (values.apiKey && values.apiSecret) {
      setIsConnected(true);
    }
  };

  const handleConnect = () => {
    setIsConnecting(true);
    
    // This would actually connect to Profit Rhino API
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      form.setValue("connected", true);
      
      toast({
        title: "Connected to Profit Rhino",
        description: "Your account has been successfully linked with Profit Rhino.",
      });
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    form.setValue("connected", false);
    
    toast({
      title: "Disconnected from Profit Rhino",
      description: "Your account has been unlinked from Profit Rhino.",
    });
  };

  const handleSyncInventory = async () => {
    // Mock implementation for syncing inventory
    toast({
      title: "Syncing inventory...",
      description: "Fetching latest inventory data from Profit Rhino.",
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Inventory sync complete",
      description: "Successfully synchronized inventory with Profit Rhino.",
    });
    
    return true;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="mr-2 h-5 w-5 text-primary" />
          Profit Rhino Integration
        </CardTitle>
        <CardDescription>
          Connect to Profit Rhino for inventory pricing, markup calculations, and pricebook management.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connection">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connection" className="space-y-4 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Connection Status</h3>
                    <p className="text-sm text-muted-foreground">
                      {isConnected 
                        ? "Your Profit Rhino account is connected" 
                        : "Connect to Profit Rhino to enable inventory pricing"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <>
                        <div className="flex items-center text-green-600">
                          <Check className="h-4 w-4 mr-1" />
                          <span className="text-sm">Connected</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleDisconnect}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={handleConnect} 
                        disabled={isConnecting}
                      >
                        {isConnecting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                        Connect to Profit Rhino
                      </Button>
                    )}
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="environment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environment</FormLabel>
                      <div className="flex items-center space-x-4">
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="sandbox"
                              value="sandbox"
                              checked={field.value === "sandbox"}
                              onChange={() => field.onChange("sandbox")}
                              className="h-4 w-4"
                            />
                            <label htmlFor="sandbox" className="text-sm font-medium">
                              Sandbox (Testing)
                            </label>
                          </div>
                        </FormControl>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="production"
                              value="production"
                              checked={field.value === "production"}
                              onChange={() => field.onChange("production")}
                              className="h-4 w-4"
                            />
                            <label htmlFor="production" className="text-sm font-medium">
                              Production (Live)
                            </label>
                          </div>
                        </FormControl>
                      </div>
                      <FormDescription>
                        Select sandbox for testing or production for live pricing data
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your Profit Rhino API Key"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Found in your Profit Rhino Developer dashboard
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="apiSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Secret</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your Profit Rhino API Secret"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Keep this secure and do not share
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="baseUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Base URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://api.profitrhino.com/v2"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave blank to use the default URL for the selected environment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="autoSync"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Automatic Synchronization</FormLabel>
                        <FormDescription>
                          Automatically sync pricing and inventory data with Profit Rhino
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Button type="submit">Save Settings</Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="pricing" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Pricing Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure how pricing is calculated and synced with Profit Rhino
                  </p>
                </div>
                <PriceTag className="h-8 w-8 text-primary" />
              </div>
              
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="syncPricing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Sync Pricing</FormLabel>
                          <FormDescription>
                            Automatically sync pricing data with Profit Rhino
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="useCompanyMarkups"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Use Company Markups</FormLabel>
                          <FormDescription>
                            Use your company's custom markup rates instead of Profit Rhino defaults
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="markupPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <PercentCircle className="mr-2 h-4 w-4" />
                          Default Markup Percentage
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="w-20"
                            />
                            <span className="ml-2">%</span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Default markup percentage to apply when company markups are not available
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="useCustomPricebook"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Use Custom Pricebook</FormLabel>
                          <FormDescription>
                            Use a specific pricebook from your Profit Rhino account
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("useCustomPricebook") && (
                    <FormField
                      control={form.control}
                      name="pricebookId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pricebook ID</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter Pricebook ID"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            ID of the specific pricebook to use from your Profit Rhino account
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <div className="rounded-lg border p-3 space-y-3">
                    <h4 className="font-medium">Sample Pricing</h4>
                    <p className="text-sm text-muted-foreground">
                      Preview of how items will be priced using current settings
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-md bg-muted p-3">
                        <div className="font-medium">Labor Rate</div>
                        <div className="flex justify-between">
                          <span>Base Rate:</span>
                          <span className="font-bold">$85.00/hr</span>
                        </div>
                        <div className="flex justify-between">
                          <span>With Markup:</span>
                          <span className="font-bold text-primary">$110.50/hr</span>
                        </div>
                      </div>
                      <div className="rounded-md bg-muted p-3">
                        <div className="font-medium">Materials</div>
                        <div className="flex justify-between">
                          <span>Cost:</span>
                          <span className="font-bold">$100.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>With Markup:</span>
                          <span className="font-bold text-primary">$130.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit">Save Pricing Settings</Button>
                </form>
              </Form>
            </div>
          </TabsContent>
          
          <TabsContent value="inventory" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Inventory Sync</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure inventory synchronization with Profit Rhino
                  </p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Sync Status</h4>
                  <p className="text-sm text-muted-foreground">
                    Last sync: 2 hours ago
                  </p>
                </div>
                <SyncButton
                  onSync={handleSyncInventory}
                  label="Inventory"
                  autoSync={form.watch("autoSync")}
                  syncInterval={form.watch("syncInterval")}
                />
              </div>
              
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="syncInventory"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Sync Inventory</FormLabel>
                          <FormDescription>
                            Automatically sync inventory with Profit Rhino
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="useDefaultMaterialsCost"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Use Default Materials Cost</FormLabel>
                          <FormDescription>
                            Use Profit Rhino's default materials cost rather than actual inventory costs
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="rounded-lg border p-3 space-y-3">
                    <h4 className="font-medium">Inventory Statistics</h4>
                    <p className="text-sm text-muted-foreground">
                      Current inventory data from Profit Rhino
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-md bg-muted p-3">
                        <div className="font-medium">Total Items</div>
                        <div className="text-2xl font-bold text-primary">487</div>
                      </div>
                      <div className="rounded-md bg-muted p-3">
                        <div className="font-medium">Total Value</div>
                        <div className="text-2xl font-bold text-primary">$48,750</div>
                      </div>
                      <div className="rounded-md bg-muted p-3">
                        <div className="font-medium">Items Below Min</div>
                        <div className="text-2xl font-bold text-amber-500">24</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit">Save Inventory Settings</Button>
                </form>
              </Form>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Profit Rhino integration allows you to sync your inventory, pricing data, and manage markup calculations for invoicing and reporting.
        </p>
      </CardFooter>
    </Card>
  );
}
