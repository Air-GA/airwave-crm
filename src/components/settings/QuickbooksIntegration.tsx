
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
  CreditCard, 
  Receipt, 
  ReceiptText,
  RefreshCw, 
  Check, 
  X,
  Clock,
  CalendarClock,
  Users
} from "lucide-react";

const quickbooksSchema = z.object({
  connected: z.boolean().default(false),
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
  redirectUri: z.string().url("Must be a valid URL"),
  environment: z.enum(["sandbox", "production"]).default("sandbox"),
  companyId: z.string().optional(),
  realmId: z.string().optional(),
  autoSync: z.boolean().default(true),
  syncInventory: z.boolean().default(true),
  syncCustomers: z.boolean().default(true),
  syncInvoices: z.boolean().default(true),
  enableAutoPay: z.boolean().default(false),
  // New timesheet sync settings
  syncTimesheets: z.boolean().default(true),
  payrollIntegration: z.boolean().default(true),
  overtimeThreshold: z.number().default(40),
  payrollCycleStart: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).default("thursday"),
  payrollCycleEnd: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).default("wednesday"),
});

export function QuickbooksIntegration() {
  const { toast } = useToast();
  const { userRole, permissions } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Only admin can see profit numbers
  const canViewProfitNumbers = userRole === 'admin';
  
  const form = useForm<z.infer<typeof quickbooksSchema>>({
    resolver: zodResolver(quickbooksSchema),
    defaultValues: {
      connected: false,
      clientId: "",
      clientSecret: "",
      redirectUri: window.location.origin + "/settings",
      environment: "sandbox",
      autoSync: true,
      syncInventory: true,
      syncCustomers: true,
      syncInvoices: true,
      enableAutoPay: false,
      syncTimesheets: true,
      payrollIntegration: true,
      overtimeThreshold: 40,
      payrollCycleStart: "thursday",
      payrollCycleEnd: "wednesday",
    },
  });

  const onSubmit = (values: z.infer<typeof quickbooksSchema>) => {
    console.log("QuickBooks integration settings:", values);
    
    // In a real app, this would save to your backend/database
    toast({
      title: "Settings saved",
      description: "QuickBooks integration settings have been updated.",
    });
    
    // Simulate connection
    if (values.clientId && values.clientSecret) {
      setIsConnected(true);
    }
  };

  const handleConnect = () => {
    setIsConnecting(true);
    
    // This would actually redirect to QuickBooks OAuth flow
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      form.setValue("connected", true);
      
      toast({
        title: "Connected to QuickBooks",
        description: "Your account has been successfully linked with QuickBooks.",
      });
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    form.setValue("connected", false);
    
    toast({
      title: "Disconnected from QuickBooks",
      description: "Your account has been unlinked from QuickBooks.",
    });
  };

  // Only admins should see this component
  if (userRole !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>QuickBooks Integration</CardTitle>
          <CardDescription>
            Contact an administrator to set up the QuickBooks integration.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="mr-2 h-5 w-5 text-primary" />
          QuickBooks Integration
        </CardTitle>
        <CardDescription>
          Connect your account to QuickBooks for financial management, invoicing, and payment processing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connection">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
            <TabsTrigger value="autopay">AutoPay</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connection" className="space-y-4 pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Connection Status</h3>
                    <p className="text-sm text-muted-foreground">
                      {isConnected 
                        ? "Your QuickBooks account is connected" 
                        : "Connect to QuickBooks to enable integration"}
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
                        Connect to QuickBooks
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
                        Select sandbox for testing or production for live transactions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your QuickBooks Client ID"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Found in your QuickBooks Developer dashboard
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="clientSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Secret</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your QuickBooks Client Secret"
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
                  name="redirectUri"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Redirect URI</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://yourdomain.com/callback"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Must match the redirect URI in your QuickBooks app settings
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
                          Automatically sync data with QuickBooks
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
          
          <TabsContent value="invoicing" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Invoicing Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure how invoices are synced with QuickBooks
                  </p>
                </div>
                <ReceiptText className="h-8 w-8 text-primary" />
              </div>
              
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="syncInvoices"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Sync Invoices</FormLabel>
                          <FormDescription>
                            Automatically sync invoices with QuickBooks
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
                  
                  {/* Only show profit-related settings to admin */}
                  {canViewProfitNumbers && (
                    <div className="rounded-lg border p-3 space-y-3">
                      <h4 className="font-medium">Profit Reporting</h4>
                      <p className="text-sm text-muted-foreground">
                        Configure how profit is calculated and reported from QuickBooks
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-md bg-muted p-3">
                          <div className="font-medium">Profit Margin</div>
                          <div className="text-2xl font-bold text-primary">24.8%</div>
                          <div className="text-xs text-muted-foreground">Last 30 days</div>
                        </div>
                        <div className="rounded-md bg-muted p-3">
                          <div className="font-medium">Net Profit</div>
                          <div className="text-2xl font-bold text-primary">$12,458</div>
                          <div className="text-xs text-muted-foreground">Last 30 days</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button type="submit">Save Invoice Settings</Button>
                </form>
              </Form>
            </div>
          </TabsContent>
          
          <TabsContent value="autopay" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">AutoPay Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure automatic payment options for customers
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="enableAutoPay"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Enable AutoPay</FormLabel>
                          <FormDescription>
                            Allow customers to set up automatic payments
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
                  
                  <div className="rounded-lg border p-3 space-y-2">
                    <h4 className="font-medium">Payment Methods</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure accepted payment methods for AutoPay
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="credit-card" className="h-4 w-4" defaultChecked />
                        <label htmlFor="credit-card" className="text-sm font-medium">Credit Card</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="ach" className="h-4 w-4" defaultChecked />
                        <label htmlFor="ach" className="text-sm font-medium">ACH/Bank Transfer</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="paypal" className="h-4 w-4" />
                        <label htmlFor="paypal" className="text-sm font-medium">PayPal</label>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit">Save AutoPay Settings</Button>
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
                    Configure inventory synchronization with QuickBooks
                  </p>
                </div>
                <Receipt className="h-8 w-8 text-primary" />
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
                            Automatically sync inventory with QuickBooks
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
                    <h4 className="font-medium">Restocking Settings</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure automatic purchase orders when inventory is low
                    </p>
                    
                    <div className="grid gap-4">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="auto-po" className="h-4 w-4" defaultChecked />
                        <label htmlFor="auto-po" className="text-sm font-medium">
                          Create Purchase Orders automatically
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <label htmlFor="threshold" className="text-sm w-48">
                          Restock when below:
                        </label>
                        <Input
                          id="threshold"
                          type="number"
                          defaultValue={5}
                          className="w-24"
                        />
                        <span className="text-sm">items</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <label htmlFor="preferred-vendor" className="text-sm w-48">
                          Preferred Vendor:
                        </label>
                        <select 
                          id="preferred-vendor"
                          className="flex h-9 w-64 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                        >
                          <option value="">Select vendor</option>
                          <option value="vendor1">HVAC Supply Co.</option>
                          <option value="vendor2">Cool Air Parts Inc.</option>
                          <option value="vendor3">Refrigeration Warehouse</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit">Save Inventory Settings</Button>
                </form>
              </Form>
            </div>
          </TabsContent>
          
          {/* New Timesheets Tab */}
          <TabsContent value="timesheets" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Timesheet Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure timesheet synchronization with QuickBooks for payroll
                  </p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
              
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="syncTimesheets"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Sync Timesheets</FormLabel>
                          <FormDescription>
                            Automatically sync employee time tracking data with QuickBooks
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
                    name="payrollIntegration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Payroll Integration</FormLabel>
                          <FormDescription>
                            Automatically send timesheet data to QuickBooks Payroll
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
                    <h4 className="font-medium flex items-center">
                      <CalendarClock className="mr-2 h-4 w-4" />
                      Pay Period Settings
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Configure pay period cycle for timesheet synchronization
                    </p>
                    
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="payrollCycleStart"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pay Period Start Day</FormLabel>
                              <FormControl>
                                <select
                                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                  value={field.value}
                                  onChange={(e) => field.onChange(e.target.value)}
                                >
                                  <option value="monday">Monday</option>
                                  <option value="tuesday">Tuesday</option>
                                  <option value="wednesday">Wednesday</option>
                                  <option value="thursday">Thursday</option>
                                  <option value="friday">Friday</option>
                                  <option value="saturday">Saturday</option>
                                  <option value="sunday">Sunday</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="payrollCycleEnd"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pay Period End Day</FormLabel>
                              <FormControl>
                                <select
                                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                  value={field.value}
                                  onChange={(e) => field.onChange(e.target.value)}
                                >
                                  <option value="monday">Monday</option>
                                  <option value="tuesday">Tuesday</option>
                                  <option value="wednesday">Wednesday</option>
                                  <option value="thursday">Thursday</option>
                                  <option value="friday">Friday</option>
                                  <option value="saturday">Saturday</option>
                                  <option value="sunday">Sunday</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="overtimeThreshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Overtime Threshold (hours/week)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Hours above this threshold will be marked as overtime
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-3 space-y-3">
                    <h4 className="font-medium flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Employee Mapping
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Map your employees to QuickBooks employees
                    </p>
                    
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2 text-sm">Employee</th>
                            <th className="text-left p-2 text-sm">QuickBooks Employee</th>
                            <th className="text-left p-2 text-sm">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t">
                            <td className="p-2 text-sm">Mike Johnson</td>
                            <td className="p-2 text-sm">
                              <select className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm">
                                <option>Mike Johnson</option>
                                <option>-- Select Employee --</option>
                              </select>
                            </td>
                            <td className="p-2 text-sm">
                              <span className="text-green-600 flex items-center">
                                <Check className="h-3 w-3 mr-1" />
                                Mapped
                              </span>
                            </td>
                          </tr>
                          <tr className="border-t">
                            <td className="p-2 text-sm">Sarah Williams</td>
                            <td className="p-2 text-sm">
                              <select className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm">
                                <option>Sarah Williams</option>
                                <option>-- Select Employee --</option>
                              </select>
                            </td>
                            <td className="p-2 text-sm">
                              <span className="text-green-600 flex items-center">
                                <Check className="h-3 w-3 mr-1" />
                                Mapped
                              </span>
                            </td>
                          </tr>
                          <tr className="border-t">
                            <td className="p-2 text-sm">David Chen</td>
                            <td className="p-2 text-sm">
                              <select className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm">
                                <option>-- Select Employee --</option>
                                <option>David C.</option>
                                <option>David Chen</option>
                              </select>
                            </td>
                            <td className="p-2 text-sm">
                              <span className="text-amber-600 flex items-center">
                                <X className="h-3 w-3 mr-1" />
                                Not Mapped
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <Button type="submit">Save Timesheet Settings</Button>
                </form>
              </Form>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <p className="text-sm text-muted-foreground">
          QuickBooks integration allows you to sync your financial data, invoices, timesheets, and inventory with QuickBooks Online.
        </p>
      </CardFooter>
    </Card>
  );
}
