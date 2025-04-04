import { useState, useEffect } from 'react';
import TechLocationMap from './TechLocationMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getIntegrationSettings, saveIntegrationSettings } from "@/utils/settingsStorage";
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const API_KEY = 'EMAkZ0QQg780AGyS_WPp9X75f1o-f4WItx6wHBHoRpA';

const MapView = () => {
  const [showMap, setShowMap] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapKey, setMapKey] = useState<string>(`tech-map-${Date.now()}`);
  
  useEffect(() => {
    const checkApiKey = () => {
      try {
        const integrations = getIntegrationSettings();
        if (!integrations.googleMaps?.apiKey) {
          integrations.googleMaps = {
            ...integrations.googleMaps,
            connected: false,
            apiKey: API_KEY,
          };
          saveIntegrationSettings(integrations);
          console.log("Saved Google Maps API key to settings (disabled)");
        }
        
        if (!showMap) {
          console.log("Map integration is disabled");
          setApiKeyError("Map integration is currently disabled");
        }
      } catch (error) {
        console.error("Error checking API key:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkApiKey();
  }, [showMap]);

  const handleMapError = (error: string) => {
    console.error("Map error in MapView:", error);
    setApiKeyError(error);
    toast.error("Map Error", {
      description: error
    });
  };
  
  const handleRetry = () => {
    console.log("Retrying map load");
    setMapKey(`tech-map-${Date.now()}`);
    toast.info("Reloading map", {
      description: "Please wait while the map is being reloaded..."
    });
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Technician Location Map
          </CardTitle>
          <CardDescription>
            View the current location of your field technicians
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-[400px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Technician Location Map
        </CardTitle>
        <CardDescription>
          View the current location of your field technicians
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Map integration is currently disabled.
          </AlertDescription>
        </Alert>
        
        <div className="text-center py-8">
          <p className="mb-4">
            The map integration has been temporarily disabled.
          </p>
          <Button 
            disabled
            variant="outline"
          >
            Map Feature Disabled
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapView;
