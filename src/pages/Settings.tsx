
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RolePermissionsSettings } from "@/components/settings/RolePermissionsSettings";
import { useAuth } from "@/hooks/useAuth";

const Settings = () => {
  const { permissions } = useAuth();
  
  return (
    <MainLayout pageName="Settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and set preferences.
          </p>
        </div>
        
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            {permissions.canEditData && (
              <TabsTrigger value="permissions">User Permissions</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Manage your general account settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>General settings content will go here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Notification settings content will go here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize how the application looks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Appearance settings content will go here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {permissions.canEditData && (
            <TabsContent value="permissions" className="space-y-4">
              <RolePermissionsSettings />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
