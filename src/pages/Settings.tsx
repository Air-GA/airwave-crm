
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Settings as SettingsIcon, 
  User, 
  Building, 
  Mail, 
  Bell, 
  Shield, 
  Users, 
  CreditCard, 
  Lock,
  Save,
  Upload,
  Smartphone,
  Globe,
  Plus,
  Clock,
  Eye,
  EyeOff,
  Check
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  getCompanySettings, 
  saveCompanySettings, 
  getIntegrationSettings, 
  saveIntegrationSettings,
  getUserSettings,
  saveUserSettings,
  CompanySettings,
  IntegrationSettings,
  UserSettings
} from "@/utils/settingsStorage";
import { companyFormSchema, userFormSchema, integrationSchema } from "@/utils/settingsSchema";
import { apiIntegrationService } from "@/services/apiIntegrationService";

const Settings = () => {
  // Load settings from local storage
  const [companySettings, setCompanySettings] = useState<CompanySettings>(getCompanySettings());
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>(getIntegrationSettings());
  const [userSettings, setUserSettings] = useState<UserSettings>(getUserSettings());
  
  // UI State
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({
    googleMaps: false,
    smsProvider: false
  });

  // Setup forms with react-hook-form
  const companyForm = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyName: companySettings.companyName,
      companyEmail: companySettings.companyEmail,
      companyPhone: companySettings.companyPhone,
      companyAddress: companySettings.companyAddress,
      companyDescription: companySettings.companyDescription,
      is24Hours: companySettings.businessHours.is24Hours,
      emergency24h: companySettings.preferences.emergency24h,
    },
  });

  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: userSettings.firstName,
      lastName: userSettings.lastName,
      email: userSettings.email,
      phone: userSettings.phone,
      timezone: userSettings.timezone,
    },
  });

  const integrationForm = useForm<z.infer<typeof integrationSchema>>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      googleMaps: {
        connected: integrationSettings.googleMaps.connected,
        apiKey: integrationSettings.googleMaps.apiKey || "",
      },
      smsProvider: {
        connected: integrationSettings.smsProvider.connected,
        apiKey: integrationSettings.smsProvider.apiKey || "",
      },
      profitRhino: integrationSettings.profitRhino
    },
  });

  // Save functions
  const saveCompanyForm = (data: z.infer<typeof companyFormSchema>) => {
    const updatedSettings = {
      ...companySettings,
      companyName: data.companyName,
      companyEmail: data.companyEmail,
      companyPhone: data.companyPhone,
      companyAddress: data.companyAddress,
      companyDescription: data.companyDescription || "",
      businessHours: {
        ...companySettings.businessHours,
        is24Hours: data.is24Hours,
      },
      preferences: {
        ...companySettings.preferences,
        emergency24h: data.emergency24h,
      },
    };
    
    saveCompanySettings(updatedSettings);
    setCompanySettings(updatedSettings);
    toast.success("Company settings saved successfully!");
  };

  const saveUserForm = (data: z.infer<typeof userFormSchema>) => {
    const updatedSettings = {
      ...userSettings,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      timezone: data.timezone,
    };
    
    saveUserSettings(updatedSettings);
    setUserSettings(updatedSettings);
    toast.success("User settings saved successfully!");
  };

  const saveIntegrationForm = (data: z.infer<typeof integrationSchema>) => {
    // Ensure profitRhino has all the required properties with proper types
    const updatedProfitRhino = {
      ...integrationSettings.profitRhino,
      ...data.profitRhino,
      connected: data.profitRhino?.connected || false,
      environment: data.profitRhino?.environment || "sandbox",
      autoSync: data.profitRhino?.autoSync || false,
      syncInterval: data.profitRhino?.syncInterval || 3600000,
      syncInventory: data.profitRhino?.syncInventory || false,
      syncPricing: data.profitRhino?.syncPricing || false,
      markupPercentage: data.profitRhino?.markupPercentage || 30,
      useCompanyMarkups: data.profitRhino?.useCompanyMarkups || false,
      useDefaultMaterialsCost: data.profitRhino?.useDefaultMaterialsCost || false,
      useCustomPricebook: data.profitRhino?.useCustomPricebook || false
    };

    const updatedSettings: IntegrationSettings = {
      ...integrationSettings,
      googleMaps: {
        connected: data.googleMaps.connected,
        apiKey: data.googleMaps.apiKey,
      },
      smsProvider: {
        connected: data.smsProvider.connected,
        apiKey: data.smsProvider.apiKey,
      },
      profitRhino: updatedProfitRhino,
    };
    
    saveIntegrationSettings(updatedSettings);
    setIntegrationSettings(updatedSettings);
    toast.success("Integration settings saved successfully!");
  };

  // Preference toggles
  const handlePreferenceChange = (key: keyof typeof companySettings.preferences, value: boolean) => {
    const updatedSettings = {
      ...companySettings,
      preferences: {
        ...companySettings.preferences,
        [key]: value,
      },
    };
    
    saveCompanySettings(updatedSettings);
    setCompanySettings(updatedSettings);
    toast.success(`${key} setting updated`);
  };

  const toggleShowApiKey = (key: string) => {
    setShowApiKey({
      ...showApiKey,
      [key]: !showApiKey[key]
    });
  };

  useEffect(() => {
    // Load settings from local storage on initial render
    setCompanySettings(getCompanySettings());
    setIntegrationSettings(getIntegrationSettings());
    setUserSettings(getUserSettings());
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account and application preferences</p>
          </div>
        </div>
        
        <Tabs defaultValue="account" className="w-full">
          <div className="flex flex-col sm:flex-row">
            <TabsList className="h-auto flex sm:flex-col justify-start p-1 sm:border-r gap-1 mb-4 sm:mb-0 sm:w-60 sm:h-full">
              <TabsTrigger value="account" className="justify-start w-auto text-left">
                <User className="h-4 w-4 mr-2" />
                <span>Your Account</span>
              </TabsTrigger>
              <TabsTrigger value="company" className="justify-start w-auto text-left">
                <Building className="h-4 w-4 mr-2" />
                <span>Company Profile</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="justify-start w-auto text-left">
                <Users className="h-4 w-4 mr-2" />
                <span>Users & Permissions</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="justify-start w-auto text-left">
                <Bell className="h-4 w-4 mr-2" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="justify-start w-auto text-left">
                <Shield className="h-4 w-4 mr-2" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="justify-start w-auto text-left">
                <CreditCard className="h-4 w-4 mr-2" />
                <span>Billing</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="justify-start w-auto text-left">
                <Globe className="h-4 w-4 mr-2" />
                <span>Integrations</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 sm:ml-4">
              {/* Account Tab */}
              <TabsContent value="account" className="space-y-4">
                <Form {...userForm}>
                  <form onSubmit={userForm.handleSubmit(saveUserForm)}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Profile</CardTitle>
                        <CardDescription>Manage your personal information and preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                          <Avatar className="h-24 w-24">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-xl">JD</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1 text-center sm:text-left">
                            <h3 className="font-medium">John Doe</h3>
                            <p className="text-sm text-muted-foreground">Administrator</p>
                            <div className="flex justify-center sm:justify-start space-x-2 mt-2">
                              <Button variant="outline" size="sm" type="button">
                                <Upload className="mr-2 h-3.5 w-3.5" />
                                Change Photo
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" type="button">
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            control={userForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={userForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={userForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={userForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input type="tel" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={userForm.control}
                            name="timezone"
                            render={({ field }) => (
                              <FormItem className="sm:col-span-2">
                                <FormLabel>Timezone</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a timezone" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="america_new_york">Eastern Time (US & Canada)</SelectItem>
                                    <SelectItem value="america_chicago">Central Time (US & Canada)</SelectItem>
                                    <SelectItem value="america_denver">Mountain Time (US & Canada)</SelectItem>
                                    <SelectItem value="america_los_angeles">Pacific Time (US & Canada)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" type="button" onClick={() => userForm.reset()}>Cancel</Button>
                        <Button type="submit">
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>
                </Form>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Set your application display preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Set the application to use dark color theme
                        </p>
                      </div>
                      <Switch 
                        checked={companySettings.preferences.darkMode}
                        onCheckedChange={(checked) => handlePreferenceChange('darkMode', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Compact View</Label>
                        <p className="text-sm text-muted-foreground">
                          Show more information with less spacing
                        </p>
                      </div>
                      <Switch 
                        checked={companySettings.preferences.compactView}
                        onCheckedChange={(checked) => handlePreferenceChange('compactView', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Company Tab */}
              <TabsContent value="company" className="space-y-4">
                <Form {...companyForm}>
                  <form onSubmit={companyForm.handleSubmit(saveCompanyForm)}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                        <CardDescription>Manage your company profile details</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                          <Avatar className="h-24 w-24">
                            <AvatarImage src="/lovable-uploads/4150f513-0a64-4f43-9f7c-aded810cf322.png" />
                            <AvatarFallback className="text-xl">AG</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1 text-center sm:text-left">
                            <h3 className="font-medium">{companySettings.companyName}</h3>
                            <p className="text-sm text-muted-foreground">HVAC Contractor</p>
                            <div className="flex justify-center sm:justify-start space-x-2 mt-2">
                              <Button variant="outline" size="sm" type="button">
                                <Upload className="mr-2 h-3.5 w-3.5" />
                                Change Logo
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" type="button">
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <FormField
                          control={companyForm.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Legal Business Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            control={companyForm.control}
                            name="companyEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Email</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={companyForm.control}
                            name="companyPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Phone</FormLabel>
                                <FormControl>
                                  <Input type="tel" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={companyForm.control}
                          name="companyAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Address</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={companyForm.control}
                          name="companyDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field}
                                  defaultValue={companySettings.companyDescription} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" type="button" onClick={() => companyForm.reset()}>Cancel</Button>
                        <Button type="submit">
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>Business Hours</CardTitle>
                        <CardDescription>Set your company's operating hours</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={companyForm.control}
                          name="is24Hours"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 mb-6">
                              <FormControl>
                                <Switch 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange} 
                                  id="24hours" 
                                />
                              </FormControl>
                              <FormLabel className="font-medium" htmlFor="24hours">
                                24/7 Operation (Open all hours, every day)
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        {!companyForm.watch("is24Hours") ? (
                          <div className="space-y-2">
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                              <div key={day} className="flex items-center justify-between">
                                <Label className="w-24">{day}</Label>
                                <div className="flex items-center gap-2">
                                  <Select defaultValue="09:00">
                                    <SelectTrigger className="w-24">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="08:00">8:00 AM</SelectItem>
                                      <SelectItem value="09:00">9:00 AM</SelectItem>
                                      <SelectItem value="10:00">10:00 AM</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <span>to</span>
                                  <Select defaultValue="17:00">
                                    <SelectTrigger className="w-24">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="17:00">5:00 PM</SelectItem>
                                      <SelectItem value="18:00">6:00 PM</SelectItem>
                                      <SelectItem value="19:00">7:00 PM</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            ))}
                            <div className="flex items-center justify-between">
                              <Label className="w-24">Saturday</Label>
                              <div className="flex items-center gap-2">
                                <Select defaultValue="10:00">
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="closed">Closed</SelectItem>
                                    <SelectItem value="09:00">9:00 AM</SelectItem>
                                    <SelectItem value="10:00">10:00 AM</SelectItem>
                                  </SelectContent>
                                </Select>
                                <span>to</span>
                                <Select defaultValue="15:00">
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="closed">Closed</SelectItem>
                                    <SelectItem value="15:00">3:00 PM</SelectItem>
                                    <SelectItem value="16:00">4:00 PM</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="w-24">Sunday</Label>
                              <div className="flex items-center gap-2">
                                <Select defaultValue="closed">
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="closed">Closed</SelectItem>
                                    <SelectItem value="10:00">10:00 AM</SelectItem>
                                    <SelectItem value="11:00">11:00 AM</SelectItem>
                                  </SelectContent>
                                </Select>
                                <span>to</span>
                                <Select defaultValue="closed">
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="closed">Closed</SelectItem>
                                    <SelectItem value="14:00">2:00 PM</SelectItem>
                                    <SelectItem value="15:00">3:00 PM</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border p-4 bg-muted/50 flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-primary" />
                            <div>
                              <h3 className="font-medium">Always Open</h3>
                              <p className="text-sm text-muted-foreground">Your business is set to operate 24 hours a day, 7 days a week.</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <FormField
                          control={companyForm.control}
                          name="emergency24h"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange} 
                                  id="emergency" 
                                />
                              </FormControl>
                              <FormLabel htmlFor="emergency">
                                24/7 Emergency Service Available
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        <Button type="submit">Save Changes</Button>
                      </CardFooter>
                    </Card>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Users Tab */}
              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                      <CardTitle>Users</CardTitle>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                      </Button>
                    </div>
                    <CardDescription>Manage users and their access permissions</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">John Doe</p>
                            <p className="text-sm text-muted-foreground">john.doe@air-ga.com</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge>Admin</Badge>
                          <Select defaultValue="admin">
                            <SelectTrigger className="w-[110px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="csr">CSR</SelectItem>
                              <SelectItem value="tech">Technician</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback>MJ</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Mike Johnson</p>
                            <p className="text-sm text-muted-foreground">mike.j@air-ga.com</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Tech</Badge>
                          <Select defaultValue="tech">
                            <SelectTrigger className="w-[110px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="csr">CSR</SelectItem>
                              <SelectItem value="tech">Technician</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback>SW</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Sarah Williams</p>
                            <p className="text-sm text-muted-foreground">sarah.w@air-ga.com</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">CSR</Badge>
                          <Select defaultValue="csr">
                            <SelectTrigger className="w-[110px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="csr">CSR</SelectItem>
                              <SelectItem value="tech">Technician</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Role Permissions</CardTitle>
                    <CardDescription>Configure what each role can access</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-md font-medium mb-2">Admin</h3>
                        <div className="text-sm text-muted-foreground mb-2">Full access to all system features and settings</div>
                        <div className="grid grid-cols-2 gap-2">
                          <Badge className="justify-center" variant="outline">All Permissions</Badge>
                          <Badge className="justify-center" variant="outline">View Financials</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-medium mb-2">Manager</h3>
                        <div className="text-sm text-muted-foreground mb-2">Access to most features except company financials</div>
                        <div className="grid grid-cols-2 gap-2">
                          <Badge className="justify-center" variant="outline">Customer Access</Badge>
                          <Badge className="justify-center" variant="outline">Create Work Orders</Badge>
                          <Badge className="justify-center" variant="outline">Dispatch</Badge>
                          <Badge className="justify-center" variant="outline">Limited Reports</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-medium mb-2">CSR</h3>
                        <div className="text-sm text-muted-foreground mb-2">Customer service tasks and scheduling</div>
                        <div className="grid grid-cols-2 gap-2">
                          <Badge className="justify-center" variant="outline">View Customers</Badge>
                          <Badge className="justify-center" variant="outline">Schedule Jobs</Badge>
                          <Badge className="justify-center" variant="outline">View Work Orders</Badge>
                          <Badge className="justify-center" variant="outline">Customer Messages</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-medium mb-2">Technician</h3>
                        <div className="text-sm text-muted-foreground mb-2">Field service and work order management</div>
                        <div className="grid grid-cols-2 gap-2">
                          <Badge className="justify-center" variant="outline">Assigned Work Orders</Badge>
                          <Badge className="justify-center" variant="outline">Timesheets</Badge>
                          <Badge className="justify-center" variant="outline">View Schedule</Badge>
                          <Badge className="justify-center" variant="outline">Add Parts Used</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-medium mb-2">Customer</h3>
                        <div className="text-sm text-muted-foreground mb-2">Limited access to their own information and services</div>
                        <div className="grid grid-cols-2 gap-2">
                          <Badge className="justify-center" variant="outline">View Own Profile</Badge>
                          <Badge className="justify-center" variant="outline">Request Service</Badge>
                          <Badge className="justify-center" variant="outline">View Work History</Badge>
                          <Badge className="justify-center" variant="outline">Make Payments</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline">Edit Permissions</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Control how and when you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="font-medium">Email Notifications</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-workorders">Work Orders</Label>
                          <Switch id="email-workorders" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-dispatch">Dispatch Updates</Label>
                          <Switch id="email-dispatch" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-customer">Customer Messages</Label>
                          <Switch id="email-customer" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-inventory">Inventory Alerts</Label>
                          <Switch id="email-inventory" />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">SMS Notifications</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sms-workorders">Work Order Assignments</Label>
                          <Switch id="sms-workorders" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sms-urgent">Urgent Matters</Label>
                          <Switch id="sms-urgent" defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Push Notifications</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="push-all">Enable Push Notifications</Label>
                          <Switch id="push-all" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="push-sound">Notification Sounds</Label>
                          <Switch id="push-sound" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your account security preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="font-medium">Password</h3>
                      <div className="space-y-2">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" />
                          </div>
                          <div></div>
                          <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" />
                          </div>
                        </div>
                        <Button variant="outline" className="mt-2">
                          Change Password
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <Switch id="2fa" />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Session Management</h3>
                      <div className="rounded-lg border divide-y">
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Current Session</p>
                              <p className="text-sm text-muted-foreground">
                                Chrome on Windows • Atlanta, GA • Started 2 hours ago
                              </p>
                            </div>
                            <Badge>Active</Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Mobile App</p>
                              <p className="text-sm text-muted-foreground">
                                iPhone 13 • Atlanta, GA • Last active 12 min ago
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Logout
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline">Logout of All Devices</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Billing Tab */}
              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                    <CardDescription>Manage your subscription and payment methods</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Current Plan</h3>
                          <p className="text-sm text-muted-foreground">
                            Professional Plan • $49.99/month
                          </p>
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Change Plan
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                          Cancel Subscription
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Payment Methods</h3>
                      <div className="rounded-lg border divide-y">
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-6 w-6" />
                            <div>
                              <p className="font-medium">Visa ending in 4242</p>
                              <p className="text-sm text-muted-foreground">
                                Expires 12/2024
                              </p>
                            </div>
                          </div>
                          <Badge>Default</Badge>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-6 w-6" />
                            <div>
                              <p className="font-medium">Mastercard ending in 5555</p>
                              <p className="text-sm text-muted-foreground">
                                Expires 09/2025
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Make Default
                          </Button>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-2">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Payment Method
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Billing History</h3>
                      <div className="rounded-lg border divide-y">
                        <div className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">April 2023 • $49.99</p>
                            <p className="text-sm text-muted-foreground">
                              Professional Plan
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">March 2023 • $49.99</p>
                            <p className="text-sm text-muted-foreground">
                              Professional Plan
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">February 2023 • $49.99</p>
                            <p className="text-sm text-muted-foreground">
                              Professional Plan
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Integrations Tab */}
              <TabsContent value="integrations" className="space-y-4">
                <Form {...integrationForm}>
                  <form onSubmit={integrationForm.handleSubmit(saveIntegrationForm)}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Integrations & API</CardTitle>
                        <CardDescription>Connect third-party services and APIs</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">Google Maps API</h3>
                              <p className="text-sm text-muted-foreground">
                                Used for mapping and geolocation features
                              </p>
                            </div>
                            <FormField
                              control={integrationForm.control}
                              name="googleMaps.connected"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Switch 
                                      checked={field.value} 
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          {integrationForm.watch("googleMaps.connected") && (
                            <div className="rounded-lg border p-4">
                              <FormField
                                control={integrationForm.control}
                                name="googleMaps.apiKey"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>API Key</FormLabel>
                                    <div className="flex">
                                      <FormControl>
                                        <Input 
                                          type={showApiKey.googleMaps ? "text" : "password"} 
                                          {...field} 
                                          className="flex-1"
                                        />
                                      </FormControl>
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => toggleShowApiKey('googleMaps')}
                                        className="ml-2"
                                      >
                                        {showApiKey.googleMaps ? (
                                          <EyeOff className="h-4 w-4" />
                                        ) : (
                                          <Eye className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex justify-end mt-4">
                                <Button variant="outline" size="sm" type="button" onClick={async () => {
                                  try {
                                    await apiIntegrationService.verifyConnection('googleMaps', {
                                      apiKey: integrationForm.getValues('googleMaps.apiKey')
                                    });
                                    toast.success('Google Maps API connection verified successfully!');
                                  } catch (error) {
                                    toast.error('Failed to verify Google Maps API connection');
                                  }
                                }}>
                                  Verify Connection
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">SMS Service Provider</h3>
                              <p className="text-sm text-muted-foreground">
                                Used for sending text message notifications
                              </p>
                            </div>
                            <FormField
                              control={integrationForm.control}
                              name="smsProvider.connected"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Switch 
                                      checked={field.value} 
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          {integrationForm.watch("smsProvider.connected") && (
                            <div className="rounded-lg border p-4">
                              <FormField
                                control={integrationForm.control}
                                name="smsProvider.apiKey"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>API Key</FormLabel>
                                    <div className="flex">
                                      <FormControl>
                                        <Input 
                                          type={showApiKey.smsProvider ? "text" : "password"} 
                                          {...field}
                                          className="flex-1"
                                        />
                                      </FormControl>
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => toggleShowApiKey('smsProvider')}
                                        className="ml-2"
                                      >
                                        {showApiKey.smsProvider ? (
                                          <EyeOff className="h-4 w-4" />
                                        ) : (
                                          <Eye className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex justify-end mt-4">
                                <Button variant="outline" size="sm" type="button" onClick={async () => {
                                  try {
                                    await apiIntegrationService.verifyConnection('smsProvider', {
                                      apiKey: integrationForm.getValues('smsProvider.apiKey')
                                    });
                                    toast.success('SMS Provider connection verified successfully!');
                                  } catch (error) {
                                    toast.error('Failed to verify SMS Provider connection');
                                  }
                                }}>
                                  Verify Connection
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">Profit Rhino Integration</h3>
                              <p className="text-sm text-muted-foreground">
                                Sync pricing books and service items
                              </p>
                            </div>
                            <FormField
                              control={integrationForm.control}
                              name="profitRhino.connected"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Switch 
                                      checked={field.value} 
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          {integrationForm.watch("profitRhino.connected") && (
                            <div className="rounded-lg border p-4">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                  control={integrationForm.control}
                                  name="profitRhino.apiKey"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>API Key</FormLabel>
                                      <FormControl>
                                        <Input {...field} type="password" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={integrationForm.control}
                                  name="profitRhino.environment"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Environment</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value || "sandbox"}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select environment" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="sandbox">Sandbox</SelectItem>
                                          <SelectItem value="production">Production</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <div className="mt-4">
                                <FormField
                                  control={integrationForm.control}
                                  name="profitRhino.autoSync"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                      <FormControl>
                                        <Switch 
                                          checked={field.value} 
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <FormLabel>Enable Auto-Sync</FormLabel>
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              {integrationForm.watch("profitRhino.autoSync") && (
                                <div className="mt-4">
                                  <FormField
                                    control={integrationForm.control}
                                    name="profitRhino.syncInterval"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Sync Interval (Hours)</FormLabel>
                                        <Select
                                          onValueChange={(value) => field.onChange(parseInt(value) * 3600000)}
                                          value={(parseInt(String(field.value || 3600000)) / 3600000).toString()}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select interval" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="1">Every hour</SelectItem>
                                            <SelectItem value="6">Every 6 hours</SelectItem>
                                            <SelectItem value="12">Every 12 hours</SelectItem>
                                            <SelectItem value="24">Once a day</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              )}
                              
                              <div className="mt-4 space-y-4">
                                <h4 className="text-sm font-medium">Sync Options</h4>
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <FormField
                                    control={integrationForm.control}
                                    name="profitRhino.syncInventory"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                          <Switch 
                                            checked={field.value} 
                                            onCheckedChange={field.onChange}
                                          />
                                        </FormControl>
                                        <FormLabel>Sync Inventory</FormLabel>
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={integrationForm.control}
                                    name="profitRhino.syncPricing"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                          <Switch 
                                            checked={field.value} 
                                            onCheckedChange={field.onChange}
                                          />
                                        </FormControl>
                                        <FormLabel>Sync Pricing</FormLabel>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                              
                              <div className="flex justify-end mt-4 space-x-2">
                                <Button variant="outline" size="sm" type="button" onClick={async () => {
                                  try {
                                    await apiIntegrationService.verifyConnection('profitRhino', {
                                      apiKey: integrationForm.getValues('profitRhino.apiKey'),
                                      environment: integrationForm.getValues('profitRhino.environment')
                                    });
                                    toast.success('Profit Rhino connection verified successfully!');
                                  } catch (error) {
                                    toast.error('Failed to verify Profit Rhino connection');
                                  }
                                }}>
                                  Verify Connection
                                </Button>
                                
                                <Button type="button" size="sm" onClick={async () => {
                                  try {
                                    await apiIntegrationService.syncData('profitRhino', {
                                      apiKey: integrationForm.getValues('profitRhino.apiKey'),
                                      environment: integrationForm.getValues('profitRhino.environment'),
                                      syncInventory: integrationForm.getValues('profitRhino.syncInventory'),
                                      syncPricing: integrationForm.getValues('profitRhino.syncPricing')
                                    });
                                    toast.success('Profit Rhino data synced successfully!');
                                  } catch (error) {
                                    toast.error('Failed to sync Profit Rhino data');
                                  }
                                }}>
                                  Sync Now
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button type="submit">
                          <Save className="mr-2 h-4 w-4" />
                          Save Integration Settings
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>
                </Form>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
