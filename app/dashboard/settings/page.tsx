import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="johnsmith" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input id="display-name" defaultValue="John Smith" />
              </div>

              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="rounded-md border px-3 py-2 text-sm">
                  <span className="font-medium">Customer</span>
                </div>
                <p className="text-xs text-muted-foreground">Contact an administrator to change your account type</p>
              </div>

              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <Switch id="two-factor" />
                </div>
                <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
              </div>

              <Button>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "Service Reminders", description: "Receive reminders about upcoming service appointments" },
                {
                  title: "Billing Notifications",
                  description: "Get notified about new invoices and payment due dates",
                },
                { title: "System Updates", description: "Receive updates about your HVAC system status" },
                { title: "Promotional Offers", description: "Get notified about special offers and discounts" },
              ].map((notification, i) => (
                <div key={i} className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor={`notification-${i}`}>{notification.title}</Label>
                    <p className="text-xs text-muted-foreground">{notification.description}</p>
                  </div>
                  <Switch id={`notification-${i}`} defaultChecked={i < 3} />
                </div>
              ))}

              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="justify-start">
                    <span className="h-4 w-4 rounded-full bg-background border mr-2"></span>
                    Light
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span className="h-4 w-4 rounded-full bg-slate-950 mr-2"></span>
                    Dark
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <span className="h-4 w-4 rounded-full bg-gradient-to-r from-slate-100 to-slate-950 mr-2"></span>
                    System
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Text Size</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="text-sm">
                    Small
                  </Button>
                  <Button variant="outline" className="bg-primary text-primary-foreground">
                    Medium
                  </Button>
                  <Button variant="outline" className="text-lg">
                    Large
                  </Button>
                </div>
              </div>

              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
