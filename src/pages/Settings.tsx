
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, CheckCircle, Loader2, Plus } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { profitRhinoService } from "@/services/profitRhinoService";
import { 
  getIntegrationSettings,
  saveIntegrationSettings, 
  IntegrationSettings 
} from "@/utils/settingsStorage";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>(getIntegrationSettings());
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const { toast } = useToast();

  const handleIntegrationChange = (key: string, subKey: string, value: any) => {
    setIntegrationSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key as keyof IntegrationSettings],
        [subKey]: value
      }
    }));
  };

  const saveSettings = () => {
    saveIntegrationSettings(integrationSettings);
    toast({
      title: "Settings saved",
      description: "Your integration settings have been saved successfully."
    });
  };

  const testProfitRhinoConnection = async () => {
    setLoading(prev => ({ ...prev, profitRhino: true }));
    setTestResults(prev => ({ ...prev, profitRhino: undefined }));
    
    try {
      // First set the secrets in Supabase if they're changed locally
      if (integrationSettings.profitRhino?.apiKey) {
        const { error: secretError } = await supabase.functions.invoke('profit-rhino-parts', {
          body: { 
            action: 'setSecrets',
            secrets: {
              apiKey: integrationSettings.profitRhino.apiKey,
              baseUrl: integrationSettings.profitRhino.baseUrl || 'https://secure.profitrhino.com/api/v2'
            }
          }
        });

        if (secretError) {
          throw new Error(`Failed to update API configuration: ${secretError.message}`);
        }
      }

      // Then test the authentication
      const credentials = {
        username: integrationSettings.profitRhino?.username || '',
        password: integrationSettings.profitRhino?.password || '',
      };

      const token = await profitRhinoService.authenticate(credentials);
      
      if (!token) {
        throw new Error("Authentication failed. Please check your credentials.");
      }
      
      setTestResults(prev => ({
        ...prev,
        profitRhino: {
          success: true,
          message: "Successfully connected to Profit Rhino API!"
        }
      }));
      
      // Update the connection status in settings
      handleIntegrationChange('profitRhino', 'connected', true);
      saveIntegrationSettings({
        ...integrationSettings,
        profitRhino: {
          ...integrationSettings.profitRhino!,
          connected: true
        }
      });
      
    } catch (error) {
      console.error("Profit Rhino connection test error:", error);
      setTestResults(prev => ({
        ...prev,
        profitRhino: {
          success: false,
          message: error instanceof Error ? error.message : "Unknown error occurred"
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, profitRhino: false }));
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure your general application settings here.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Configure your general application settings here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage your notification settings and preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Manage your notification settings and preferences.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profit Rhino Integration</CardTitle>
                  <CardDescription>Connect to your Profit Rhino account to access parts catalog</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="profitRhino-enabled">Enable Profit Rhino Integration</Label>
                    <Switch 
                      id="profitRhino-enabled" 
                      checked={integrationSettings.profitRhino?.connected}
                      onCheckedChange={(checked) => handleIntegrationChange('profitRhino', 'connected', checked)}
                    />
                  </div>

                  {integrationSettings.profitRhino?.connected && (
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="profitRhino-api-key">API Key</Label>
                          <Input 
                            id="profitRhino-api-key"
                            placeholder="Enter your Profit Rhino API key"
                            value={integrationSettings.profitRhino?.apiKey || ''}
                            onChange={(e) => handleIntegrationChange('profitRhino', 'apiKey', e.target.value)}
                            type="password"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="profitRhino-username">Username</Label>
                          <Input 
                            id="profitRhino-username"
                            placeholder="Enter your Profit Rhino username"
                            value={integrationSettings.profitRhino?.username || ''}
                            onChange={(e) => handleIntegrationChange('profitRhino', 'username', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="profitRhino-password">Password</Label>
                          <Input 
                            id="profitRhino-password"
                            placeholder="Enter your Profit Rhino password"
                            value={integrationSettings.profitRhino?.password || ''}
                            onChange={(e) => handleIntegrationChange('profitRhino', 'password', e.target.value)}
                            type="password"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="profitRhino-base-url">API Base URL</Label>
                          <Input 
                            id="profitRhino-base-url"
                            placeholder="https://secure.profitrhino.com/api/v2"
                            value={integrationSettings.profitRhino?.baseUrl || 'https://secure.profitrhino.com/api/v2'}
                            onChange={(e) => handleIntegrationChange('profitRhino', 'baseUrl', e.target.value)}
                          />
                        </div>

                        {testResults.profitRhino && (
                          <Alert variant={testResults.profitRhino.success ? "default" : "destructive"}>
                            {testResults.profitRhino.success ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                            <AlertDescription>{testResults.profitRhino.message}</AlertDescription>
                          </Alert>
                        )}

                        <div className="flex space-x-2 pt-2">
                          <Button
                            onClick={testProfitRhinoConnection}
                            disabled={loading.profitRhino}
                          >
                            {loading.profitRhino ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Testing...
                              </>
                            ) : (
                              "Test Connection"
                            )}
                          </Button>
                          <Button onClick={saveSettings}>Save Settings</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Other Integrations</CardTitle>
                  <CardDescription>Configure additional third-party integrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Additional integration settings will appear here.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
