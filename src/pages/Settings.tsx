
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagement } from "@/components/settings/UserManagement";
import { useAuth } from "@/hooks/useAuth";
import { RoleGuard } from "@/components/guards/RoleGuard";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <TabsTrigger value="users">Users</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your general application settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>General settings content will go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Account settings content will go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <RoleGuard allowedRoles={['admin', 'manager']}>
            <UserManagement />
          </RoleGuard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
