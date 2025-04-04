
import { useState, useEffect } from 'react';
import TechLocationMap from './TechLocationMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getIntegrationSettings } from "@/utils/settingsStorage";
import { MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const MapView = () => {
  const [showMap, setShowMap] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check for Google Maps API key on component mount and when integration settings change
  useEffect(() => {
    const checkApiKey = () => {
      try {
        const integrations = getIntegrationSettings();
        const hasGoogleMapsApiKey = integrations.googleMaps?.connected && 
          integrations.googleMaps?.apiKey && 
          integrations.googleMaps?.apiKey.length > 0;
        
        // Auto-show map if API key is available
        if (hasGoogleMapsApiKey && !showMap) {
          console.log("Auto-showing map because API key is available:", 
            integrations.googleMaps?.apiKey?.substring(0, 5) + "...");
          setShowMap(true);
          setApiKeyError(null);
        } else if (!hasGoogleMapsApiKey) {
          console.log("No Google Maps API key found in settings");
          setApiKeyError("No Google Maps API key configured. Please add your API key in Settings → Integrations.");
        }
        
        setHasApiKey(!!hasGoogleMapsApiKey);
      } catch (error) {
        console.error("Error checking API key:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Initial check
    checkApiKey();
    
    // Re-check when settings might have changed - use a slower interval to reduce load
    const interval = setInterval(checkApiKey, 30000); // Increased from 10s to 30s to reduce frequency
    
    return () => clearInterval(interval);
  }, [showMap]);

  const handleMapError = (error: string) => {
    console.error("Map error:", error);
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
              {hasApiKey
                ? "Click the button below to load the map and see technician locations."
                : "Set up Google Maps in Settings -> Integrations to enable this feature."}
            </p>
            <Button 
              onClick={() => {
                setShowMap(true);
                toast.info("Loading map", {
                  description: "Please wait while the map is being loaded..."
                });
              }}
              disabled={!hasApiKey}
            >
              Show Map
            </Button>
          </div>
        ) : (
          <TechLocationMap key="tech-map" onError={handleMapError} />
        )}
      </CardContent>
    </Card>
  );
};

export default MapView;
