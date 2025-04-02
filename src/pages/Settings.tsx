import { useState } from "react";
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
  Plus
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const [companyName, setCompanyName] = useState("Air-GA HVAC Services");
  const [companyEmail, setCompanyEmail] = useState("contact@air-ga.com");
  const [companyPhone, setCompanyPhone] = useState("(404) 555-1234");
  const [companyAddress, setCompanyAddress] = useState("123 Main St, Atlanta, GA 30303");
  
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
                          <Button variant="outline" size="sm">
                            <Upload className="mr-2 h-3.5 w-3.5" />
                            Change Photo
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue="Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="john.doe@air-ga.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" type="tel" defaultValue="(404) 555-5678" />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select defaultValue="america_new_york">
                          <SelectTrigger>
                            <SelectValue placeholder="Select a timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="america_new_york">Eastern Time (US & Canada)</SelectItem>
                            <SelectItem value="america_chicago">Central Time (US & Canada)</SelectItem>
                            <SelectItem value="america_denver">Mountain Time (US & Canada)</SelectItem>
                            <SelectItem value="america_los_angeles">Pacific Time (US & Canada)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Cancel</Button>
                    <Button>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
                
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
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Compact View</Label>
                        <p className="text-sm text-muted-foreground">
                          Show more information with less spacing
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Company Tab */}
              <TabsContent value="company" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>Manage your company profile details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xl">AG</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 text-center sm:text-left">
                        <h3 className="font-medium">Air-GA HVAC Services</h3>
                        <p className="text-sm text-muted-foreground">HVAC Contractor</p>
                        <div className="flex justify-center sm:justify-start space-x-2 mt-2">
                          <Button variant="outline" size="sm">
                            <Upload className="mr-2 h-3.5 w-3.5" />
                            Change Logo
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Legal Business Name</Label>
                      <Input 
                        id="companyName" 
                        value={companyName} 
                        onChange={(e) => setCompanyName(e.target.value)} 
                      />
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="companyEmail">Business Email</Label>
                        <Input 
                          id="companyEmail" 
                          type="email" 
                          value={companyEmail} 
                          onChange={(e) => setCompanyEmail(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyPhone">Business Phone</Label>
                        <Input 
                          id="companyPhone" 
                          type="tel" 
                          value={companyPhone} 
                          onChange={(e) => setCompanyPhone(e.target.value)} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyAddress">Business Address</Label>
                      <Input 
                        id="companyAddress" 
                        value={companyAddress} 
                        onChange={(e) => setCompanyAddress(e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyDescription">Business Description</Label>
                      <Textarea 
                        id="companyDescription" 
                        defaultValue="Air-GA is a leading HVAC service provider in the Atlanta area, offering installation, maintenance, and repair services for residential and commercial customers."
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Cancel</Button>
                    <Button>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Business Hours</CardTitle>
                    <CardDescription>Set your company's operating hours</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="emergency" />
                      <Label htmlFor="emergency">24/7 Emergency Service Available</Label>
                    </div>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
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
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline">Edit Permissions</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Other tabs would be similarly structured */}
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
                      <h3 className="font-medium">In-App Notifications</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="app-all">All Updates</Label>
                          <Switch id="app-all" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Preferences</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your account security preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    
                    <Alert>
                      <Lock className="h-4 w-4" />
                      <AlertTitle>Password requirements</AlertTitle>
                      <AlertDescription>
                        Password must be at least 12 characters long, include uppercase and lowercase letters, a number, and a special character.
                      </AlertDescription>
                    </Alert>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable 2FA</Label>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Cancel</Button>
                    <Button>Update Password</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing & Subscription</CardTitle>
                    <CardDescription>Manage your billing information and subscription</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Professional Plan</h3>
                          <p className="text-sm text-muted-foreground">
                            $99/month, billed monthly
                          </p>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                      <div className="mt-4 text-sm text-muted-foreground">
                        <p>Your next bill is on October 12, 2023</p>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium">Payment Method</h3>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="rounded-md bg-muted p-2">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div className="text-sm">
                          <p>Visa ending in 4242</p>
                          <p className="text-muted-foreground">Expires 09/24</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Billing History</h3>
                      <div className="rounded-lg border">
                        <div className="grid grid-cols-3 gap-4 p-4 font-medium">
                          <div>Date</div>
                          <div>Amount</div>
                          <div>Status</div>
                        </div>
                        <div className="divide-y">
                          <div className="grid grid-cols-3 gap-4 p-4">
                            <div className="text-sm">Sept 12, 2023</div>
                            <div className="text-sm">$99.00</div>
                            <div className="text-sm">
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                Paid
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 p-4">
                            <div className="text-sm">Aug 12, 2023</div>
                            <div className="text-sm">$99.00</div>
                            <div className="text-sm">
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                Paid
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 p-4">
                            <div className="text-sm">Jul 12, 2023</div>
                            <div className="text-sm">$99.00</div>
                            <div className="text-sm">
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                Paid
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Update Payment Method</Button>
                    <Button>View All Invoices</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="integrations">
                <Card>
                  <CardHeader>
                    <CardTitle>Integrations</CardTitle>
                    <CardDescription>Connect with other services and APIs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="rounded bg-[#2CA01C] p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10"/><path d="M16 8h-8v8h8v-8z"/></svg>
                          </div>
                          <div>
                            <h3 className="font-medium">QuickBooks</h3>
                            <p className="text-sm text-muted-foreground">
                              Import/export invoices and financial data
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700">Connected</Badge>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="rounded bg-[#4285F4] p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                          </div>
                          <div>
                            <h3 className="font-medium">Google Maps</h3>
                            <p className="text-sm text-muted-foreground">
                              Display technician locations and optimize routes
                            </p>
                          </div>
                        </div>
                        <div>
                          <Button variant="outline" size="sm">Connect</Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="rounded bg-[#1DA1F2] p-1">
                            <Smartphone className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium">SMS Provider</h3>
                            <p className="text-sm text-muted-foreground">
                              Send text notifications to customers and staff
                            </p>
                          </div>
                        </div>
                        <div>
                          <Button variant="outline" size="sm">Connect</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Integration
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
