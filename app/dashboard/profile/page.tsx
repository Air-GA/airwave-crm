import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Camera } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <Button>Save Changes</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Update your profile photo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src="/placeholder.svg?height=128&width=128" alt="Profile" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <Button variant="outline" className="mt-4 gap-2">
              <Camera className="h-4 w-4" />
              Change Photo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" defaultValue="Smith" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center rounded-md border px-3 py-2 text-sm">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>john.smith@example.com</span>
                </div>
                <p className="text-xs text-muted-foreground">Your email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex">
                  <Input id="phone" defaultValue="(404) 555-1234" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" defaultValue="123 Main St, Atlanta, GA 30303" />
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="notifications">Email Notifications</Label>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="notifications" className="h-4 w-4 rounded border-gray-300" defaultChecked />
              <label htmlFor="notifications" className="text-sm">
                Receive email notifications for service updates and appointments
              </label>
            </div>
          </div>

          <div className="pt-4">
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
