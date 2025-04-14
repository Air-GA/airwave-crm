
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
  EyeOff
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

const Settings = () => {
  // Load settings from local storage
  const [companySettings, setCompanySettings] = useState<CompanySettings>(getCompanySettings());
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>(getIntegrationSettings());
  const [userSettings, setUserSettings] = useState<UserSettings>(getUserSettings());
  
  // UI State
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({
    quickbooks: false,
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
      quickbooks: {
        connected: integrationSettings.quickbooks.connected,
        apiKey: integrationSettings.quickbooks.apiKey || "",
      },
      googleMaps: {
        connected: integrationSettings.googleMaps.connected,
        apiKey: integrationSettings.googleMaps.apiKey || "",
      },
      smsProvider: {
        connected: integrationSettings.smsProvider.connected,
        apiKey: integrationSettings.smsProvider.apiKey || "",
      },
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
    const updatedSettings = {
      ...integrationSettings,
      quickbooks: {
        connected: data.quickbooks.connected,
        apiKey: data.quickbooks.apiKey,
      },
      googleMaps: {
        connected: data.googleMaps.connected,
        apiKey: data.googleMaps.apiKey,
      },
      smsProvider: {
        connected: data.smsProvider.connected,
        apiKey: data.smsProvider.apiKey,
      },
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
                          <Switch id="push-all" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Notification Settings</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your account security preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Change Password</h3>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input id="current-password" type="password" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input id="confirm-password" type="password" />
                        </div>
                        <Button className="mt-1">Update Password</Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">Currently disabled</p>
                        </div>
                        <Button variant="outline">Enable</Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Login Sessions</h3>
                      <p className="text-sm text-muted-foreground mb-4">Manage your active sessions</p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-muted-foreground">Windows • Chrome • Monroe, GA</p>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active Now</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Mobile Session</p>
                            <p className="text-sm text-muted-foreground">iOS • Safari • Atlanta, GA</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">Sign Out</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="text-red-500">Sign Out All Devices</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing & Subscription</CardTitle>
                    <CardDescription>Manage your billing information and subscription plan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Current Plan</h3>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200">Professional</Badge>
                            <Badge variant="outline">Annual</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">Billed annually at $1,999.00</p>
                          <p className="text-sm text-muted-foreground">Renews on October 1, 2025</p>
                        </div>
                        <Button variant="outline">Change Plan</Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Payment Method</h3>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">Visa ending in 4242</p>
                            <p className="text-sm text-muted-foreground">Expires 12/2026</p>
                          </div>
                        </div>
                        <Button variant="outline">Update</Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Billing History</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted px-4 py-2 flex items-center font-medium text-sm">
                          <div className="w-1/3">Invoice</div>
                          <div className="w-1/3">Date</div>
                          <div className="w-1/3">Amount</div>
                        </div>
                        <div className="divide-y">
                          <div className="px-4 py-3 flex items-center text-sm">
                            <div className="w-1/3">
                              <div className="flex items-center space-x-2">
                                <span>INV-001</span>
                                <Button variant="ghost" size="sm" className="h-7 px-2">
                                  Download
                                </Button>
                              </div>
                            </div>
                            <div className="w-1/3">October 1, 2024</div>
                            <div className="w-1/3">$1,999.00</div>
                          </div>
                          <div className="px-4 py-3 flex items-center text-sm">
                            <div className="w-1/3">
                              <div className="flex items-center space-x-2">
                                <span>INV-002</span>
                                <Button variant="ghost" size="sm" className="h-7 px-2">
                                  Download
                                </Button>
                              </div>
                            </div>
                            <div className="w-1/3">October 1, 2023</div>
                            <div className="w-1/3">$1,999.00</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" className="text-red-500">Cancel Subscription</Button>
                    <Button>Download Tax Receipts</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="integrations">
                <Card>
                  <CardHeader>
                    <CardTitle>QuickBooks Integration</CardTitle>
                    <CardDescription>Connect your QuickBooks Online account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8" fill="#2CA01C">
                          <path d="M21.308 9.885c0-4.745-3.984-8.585-8.89-8.585-3.355 0-6.282 1.84-7.794 4.53H2.831v8.105h1.794c1.526 2.699 4.455 4.525 7.793 4.525 4.906 0 8.89-3.84 8.89-8.575zm-5.225 5.356l-1.655-1.565c-.666.494-1.17.726-1.968.726-1.245 0-2.232-.926-2.232-2.222 0-1.296.987-2.301 2.232-2.301.883 0 1.513.313 2.017.812l1.588-1.735c-.911-.866-2.065-1.346-3.605-1.346-3.074 0-5.45 2.179-5.45 4.57 0 2.393 2.341 4.438 5.45 4.438 1.605 0 2.766-.485 3.623-1.377z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">QuickBooks Online</h3>
                        <p className="text-sm text-muted-foreground">Sync customers, invoices, and payments</p>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      <FormField
                        control={integrationForm.control}
                        name="quickbooks.connected"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Connection Status</FormLabel>
                              <FormDescription>
                                {field.value ? "Your QuickBooks account is connected" : "Connect to your QuickBooks account"}
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
                      {integrationForm.watch("quickbooks.connected") && (
                        <>
                          <FormField
                            control={integrationForm.control}
                            name="quickbooks.apiKey"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>API Key</FormLabel>
                                <div className="flex space-x-2">
                                  <FormControl>
                                    <Input
                                      type={showApiKey.quickbooks ? "text" : "password"}
                                      placeholder="Enter your QuickBooks API key"
                                      {...field}
                                    />
                                  </FormControl>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => toggleShowApiKey("quickbooks")}
                                  >
                                    {showApiKey.quickbooks ? (
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
                          <div className="space-y-2">
                            <Label>Auto-Sync Settings</Label>
                            <div className="rounded-md border p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label htmlFor="autosync">Enable Auto-Sync</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Automatically sync data with QuickBooks
                                  </p>
                                </div>
                                <Switch id="autosync" defaultChecked />
                              </div>
                              <Separator />
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label htmlFor="livesync">Live Sync</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Update QuickBooks in real-time when changes occur
                                  </p>
                                </div>
                                <Switch id="livesync" defaultChecked />
                              </div>
                              <Separator />
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label htmlFor="syncinterval">Sync Interval</Label>
                                  <p className="text-sm text-muted-foreground">
                                    How often to sync with QuickBooks
                                  </p>
                                </div>
                                <Select defaultValue="300000">
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select interval" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="60000">Every minute</SelectItem>
                                    <SelectItem value="300000">Every 5 minutes</SelectItem>
                                    <SelectItem value="900000">Every 15 minutes</SelectItem>
                                    <SelectItem value="3600000">Every hour</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Data Sync Options</Label>
                            <div className="rounded-md border p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label htmlFor="sync-invoices">Invoices</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Sync invoices with QuickBooks
                                  </p>
                                </div>
                                <Switch id="sync-invoices" defaultChecked />
                              </div>
                              <Separator />
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label htmlFor="sync-customers">Customers</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Sync customer data with QuickBooks
                                  </p>
                                </div>
                                <Switch id="sync-customers" defaultChecked />
                              </div>
                              <Separator />
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label htmlFor="sync-inventory">Inventory</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Sync inventory items with QuickBooks
                                  </p>
                                </div>
                                <Switch id="sync-inventory" defaultChecked />
                              </div>
                              <Separator />
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label htmlFor="autopay">Auto-Pay Invoices</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Automatically collect payments for invoices
                                  </p>
                                </div>
                                <Switch id="autopay" />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="button" onClick={() => integrationForm.handleSubmit(saveIntegrationForm)()}>
                      Save QuickBooks Settings
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Google Maps Integration</CardTitle>
                    <CardDescription>Connect to Google Maps for location services</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8">
                          <path d="M5.77 17.2l-.61-.6a9.13 9.13 0 0 1 0-12.89l.61-.6L7.2 5.33l-.92 1.02c.67-.95 1.55-1.75 2.59-2.33L10.2 5.3c-.97.93-1.73 2.1-2.2 3.36h1.39l-.78 1.62h-.85c-.11.6-.17 1.22-.17 1.82v.17h1.8V14h-1.81c.06.91.22 1.77.48 2.58.44-.38.89-.71 1.36-1.01l1.1 1.69c-.6.39-1.16.84-1.67 1.34L5.77 17.2M19.25 12c0 .24-.01.48-.03.71h-1.77c.03-.23.05-.47.05-.71s-.02-.48-.05-.72h1.77c.02.24.03.48.03.72M12 19.25c-.24 0-.48-.01-.72-.03v-1.77c.24.03.48.05.72.05s.48-.02.72-.05v1.77c-.24.02-.48.03-.72.03m0-14.5c.24 0 .48.01.72.03V6.5l-.72-.05-.72.05v-1.8c.24-.02.48-.03.72-.03m5.03 10.2 1.27 1.27c-.17.18-.35.34-.53.5l-1.23-1.23c.17-.17.34-.35.49-.54M13.45 5h1.95c.28.27.54.56.77.86l-1.24 1.1c-.12-.16-.25-.31-.38-.46a5.82 5.82 0 0 0-1.1-1.05v-.45M7.55 12c0-2.46 2-4.46 4.45-4.46.37 0 .7.06 1.25.15l.68-1.46C13.12 6.09 12.57 6 12 6c-3.31 0-6 2.69-6 6 0 1.68.72 3.31 2.04 4.44l.96-1.23A4.4 4.4 0 0 1 7.55 12m9.55 2.44-.94-1.23c.42-.41.72-.94.87-1.49h1.81a5.9 5.9 0 0 1-1.74 2.72Z" fill="#1976D2"/>
                          <path d="M18.89 13.77A6.98 6.98 0 0 0 19 12c0-.6-.09-1.19-.22-1.76h-2.08c.03.23.05.47.05.71 0 .24-.02.48-.05.71l2.19.11M12 19c-1.63 0-3.09-.64-4.19-1.67l-1.39 1.79C7.88 20.26 9.86 21 12 21c1.36 0 2.66-.31 3.81-.84l-.71-1.96c-.91.49-1.96.8-3.1.8m0-14c1.63 0 3.09.64 4.19 1.66l1.38-1.78C16.12 3.73 14.14 3 12 3c-1.36 0-2.66.31-3.81.84l.71 1.96C9.81 5.32 10.86 5 12 5Z" fill="#1976D2"/>
                          <path d="m19.22 4.78-.71-.71-3.18 3.18c.21.3.39.63.53.97l3.36-3.44M4.78 19.22l.7.71 3.19-3.19c-.21-.3-.39-.62-.53-.97l-3.36 3.45M15.4 14.02c-.19.26-.4.5-.64.71l2.2 2.2c.39-.41.73-.87 1.03-1.35l-2.59-1.56M13.68 8.85C13.28 8.55 12.66 8 12 8c-2.21 0-4 1.79-4 4 0 .66.55 1.28.85 1.67l4.83-4.82Z" fill="#1976D2"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Google Maps</h3>
                        <p className="text-sm text-muted-foreground">Track technicians and optimize routes</p>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      <FormField
                        control={integrationForm.control}
                        name="googleMaps.connected"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Connection Status</FormLabel>
                              <FormDescription>
                                {field.value ? "Google Maps API is connected" : "Connect to Google Maps API"}
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
                      {integrationForm.watch("googleMaps.connected") && (
                        <FormField
                          control={integrationForm.control}
                          name="googleMaps.apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <div className="flex space-x-2">
                                <FormControl>
                                  <Input
                                    type={showApiKey.googleMaps ? "text" : "password"}
                                    placeholder="Enter your Google Maps API key"
                                    {...field}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => toggleShowApiKey("googleMaps")}
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
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="button" onClick={() => integrationForm.handleSubmit(saveIntegrationForm)()}>
                      Save Google Maps Settings
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>SMS Provider</CardTitle>
                    <CardDescription>Connect to SMS provider for text notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                        <Smartphone className="h-8 w-8 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">SMS Integration</h3>
                        <p className="text-sm text-muted-foreground">Send automated text messages to customers</p>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      <FormField
                        control={integrationForm.control}
                        name="smsProvider.connected"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Connection Status</FormLabel>
                              <FormDescription>
                                {field.value ? "SMS Provider is connected" : "Connect to SMS Provider"}
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
                      {integrationForm.watch("smsProvider.connected") && (
                        <FormField
                          control={integrationForm.control}
                          name="smsProvider.apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <div className="flex space-x-2">
                                <FormControl>
                                  <Input
                                    type={showApiKey.smsProvider ? "text" : "password"}
                                    placeholder="Enter your SMS Provider API key"
                                    {...field}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => toggleShowApiKey("smsProvider")}
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
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="button" onClick={() => integrationForm.handleSubmit(saveIntegrationForm)()}>
                      Save SMS Settings
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
