
import { useState, useEffect } from 'react';
import TechLocationMap from './TechLocationMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getIntegrationSettings } from "@/utils/settingsStorage";
import { MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const MapView = () => {
  const [showMap, setShowMap] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  
  // Check for Google Maps API key on component mount and when integration settings change
  useEffect(() => {
    const checkApiKey = () => {
      const integrations = getIntegrationSettings();
      const hasGoogleMapsApiKey = integrations.googleMaps.connected && 
        integrations.googleMaps.apiKey && 
        integrations.googleMaps.apiKey.length > 0;
      
      // Auto-show map if API key is available
      if (hasGoogleMapsApiKey && !showMap) {
        console.log("Auto-showing map because API key is available:", integrations.googleMaps.apiKey.substring(0, 5) + "...");
        setShowMap(true);
        setApiKeyError(null);
      } else if (!hasGoogleMapsApiKey) {
        console.log("No Google Maps API key found in settings");
        setApiKeyError("No Google Maps API key configured. Please add your API key in Settings → Integrations.");
      }
      
      setHasApiKey(hasGoogleMapsApiKey);
    };
    
    checkApiKey();
    
    // Re-check when settings might have changed
    const interval = setInterval(checkApiKey, 5000);
    
    return () => clearInterval(interval);
  }, [showMap]);

  const handleMapError = (error: string) => {
    console.error("Map error:", error);
    setApiKeyError(error);
    toast.error("Map Error", {
      description: error
    });
  };
  
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
              onClick={() => setShowMap(true)}
              disabled={!hasApiKey}
            >
              Show Map
            </Button>
          </div>
        ) : (
          <TechLocationMap onError={handleMapError} />
        )}
      </CardContent>
    </Card>
  );
};

export default MapView;
