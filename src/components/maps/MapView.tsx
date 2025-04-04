
import { useState, useEffect } from 'react';
import TechLocationMap from './TechLocationMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getIntegrationSettings, saveIntegrationSettings } from "@/utils/settingsStorage";
import { MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Hard-coded API key from user
const DEFAULT_API_KEY = 'EMAkZ0QQg780AGyS_WPp9X75f1o-f4WItx6wHBHoRpA';

const MapView = () => {
  const [showMap, setShowMap] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true); // Default to true since we have a hard-coded key
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check for Google Maps API key on component mount
  useEffect(() => {
    const checkApiKey = () => {
      try {
        // Store the provided API key in settings if not already present
        const integrations = getIntegrationSettings();
        if (!integrations.googleMaps?.apiKey) {
          integrations.googleMaps = {
            ...integrations.googleMaps,
            connected: true,
            apiKey: DEFAULT_API_KEY,
          };
          saveIntegrationSettings(integrations);
          console.log("Saved default Google Maps API key to settings");
        }
        
        // Always set hasApiKey to true since we have a default
        setHasApiKey(true);
        
        // Auto-show map
        if (!showMap) {
          console.log("Auto-showing map with default API key");
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
    
    // Re-check when settings might have changed
    const interval = setInterval(checkApiKey, 30000);
    
    return () => clearInterval(interval);
  }, [showMap]);

  const handleMapError = (error: string) => {
    console.error("Map error in MapView:", error);
    setApiKeyError(error);
    toast.error("Map Error", {
      description: error
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
          <TechLocationMap key={`tech-map-${Date.now()}`} onError={handleMapError} defaultApiKey={DEFAULT_API_KEY} />
        )}
      </CardContent>
    </Card>
  );
};

export default MapView;
