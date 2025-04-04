
import { useState, useEffect } from 'react';
import TechLocationMap from './TechLocationMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getIntegrationSettings, saveIntegrationSettings } from "@/utils/settingsStorage";
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Hardcoded API key from user
const API_KEY = 'EMAkZ0QQg780AGyS_WPp9X75f1o-f4WItx6wHBHoRpA';

const MapView = () => {
  const [showMap, setShowMap] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapKey, setMapKey] = useState<string>(`tech-map-${Date.now()}`);
  
  // Check for Google Maps API key on component mount
  useEffect(() => {
    const checkApiKey = () => {
      try {
        // Save the provided API key in settings if not already present
        const integrations = getIntegrationSettings();
        if (!integrations.googleMaps?.apiKey) {
          integrations.googleMaps = {
            ...integrations.googleMaps,
            connected: true,
            apiKey: API_KEY,
          };
          saveIntegrationSettings(integrations);
          console.log("Saved Google Maps API key to settings");
        }
        
        // Auto-show map
        if (!showMap) {
          console.log("Auto-showing map with API key");
          setShowMap(true);
          setApiKeyError(null);
        }
      } catch (error) {
        console.error("Error checking API key:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Initial check
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
        {apiKeyError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{apiKeyError}</AlertDescription>
          </Alert>
        )}
        
        {!showMap ? (
          <div className="text-center py-8">
            <p className="mb-4">
              Click the button below to load the map and see technician locations.
            </p>
            <Button 
              onClick={() => {
                setShowMap(true);
                toast.info("Loading map", {
                  description: "Please wait while the map is being loaded..."
                });
              }}
            >
              Show Map
            </Button>
          </div>
        ) : (
          <div>
            <TechLocationMap key={mapKey} onError={handleMapError} apiKey={API_KEY} />
            <div className="mt-2 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reload Map
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapView;
