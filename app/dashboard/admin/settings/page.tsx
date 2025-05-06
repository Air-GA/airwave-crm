import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Globe } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <Button>Save Changes</Button>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" defaultValue="Air Georgia Home Comfort Systems" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <div className="flex items-center rounded-md border px-3 py-2 text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>info@airgeorgia.com</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-website">Website</Label>
                  <div className="flex items-center rounded-md border px-3 py-2 text-sm">
                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>www.airgeorgia.com</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-address">Address</Label>
                <Input id="company-address" defaultValue="123 Main Street, Atlanta, GA 30303" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-phone">Phone Number</Label>
                <Input id="company-phone" defaultValue="(404) 555-0000" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-description">Company Description</Label>
                <textarea
                  id="company-description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue="Air Georgia provides premium HVAC services to residential and commercial customers throughout the greater Atlanta area."
                />
              </div>

              <Button>Update Company Information</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage system security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="two-factor">Require Two-Factor Authentication</Label>
                  <Switch id="two-factor" defaultChecked />
                </div>
                <p className="text-xs text-muted-foreground">Require all users to set up two-factor authentication</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password-expiry">Password Expiration</Label>
                  <Switch id="password-expiry" defaultChecked />
                </div>
                <p className="text-xs text-muted-foreground">Require password changes every 90 days</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="session-timeout">Session Timeout</Label>
                  <Switch id="session-timeout" defaultChecked />
                </div>
                <p className="text-xs text-muted-foreground">Automatically log out inactive users after 30 minutes</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ip-restriction">IP Restriction</Label>
                  <Switch id="ip-restriction" />
                </div>
                <p className="text-xs text-muted-foreground">Restrict access to specific IP addresses</p>
              </div>

              <Button>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "Service Reminders",
                  description: "Send automated reminders for upcoming service appointments",
                },
                { title: "Invoice Notifications", description: "Send notifications when new invoices are created" },
                { title: "Payment Reminders", description: "Send reminders for overdue payments" },
                { title: "System Alerts", description: "Send alerts for system issues or maintenance" },
                { title: "Customer Feedback", description: "Send requests for feedback after service completion" },
              ].map((notification, i) => (
                <div key={i} className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor={`notification-${i}`}>{notification.title}</Label>
                    <p className="text-xs text-muted-foreground">{notification.description}</p>
                  </div>
                  <Switch id={`notification-${i}`} defaultChecked={i < 4} />
                </div>
              ))}

              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure general system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>System Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="justify-start">
                    <span className="h-4 w-4 rounded-full bg-background border mr-2"></span>
                    Light
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span className="h-4 w-4 rounded-full bg-slate-950 mr-2"></span>
                    Dark
                  </Button>
                  <Button variant="outline" className="bg-primary text-primary-foreground justify-start">
                    <span className="h-4 w-4 rounded-full bg-gradient-to-r from-slate-100 to-slate-950 mr-2"></span>
                    System
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <select
                  id="timezone"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option>Eastern Time (ET)</option>
                  <option>Central Time (CT)</option>
                  <option>Mountain Time (MT)</option>
                  <option>Pacific Time (PT)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-retention">Data Retention Period</Label>
                <select
                  id="data-retention"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option>1 Year</option>
                  <option>3 Years</option>
                  <option selected>5 Years</option>
                  <option>7 Years</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-backup">Automatic Backups</Label>
                  <Switch id="auto-backup" defaultChecked />
                </div>
                <p className="text-xs text-muted-foreground">Automatically backup system data daily</p>
              </div>

              <Button>Save System Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
