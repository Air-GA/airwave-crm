
import { useState } from 'react';
import TechLocationMap from './TechLocationMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getIntegrationSettings } from "@/utils/settingsStorage";
import { MapPin } from 'lucide-react';

const MapView = () => {
  const [showMap, setShowMap] = useState(false);
  const integrations = getIntegrationSettings();
  
  const hasGoogleMapsApiKey = integrations.googleMaps.connected && 
    integrations.googleMaps.apiKey && 
    integrations.googleMaps.apiKey.length > 0;
  
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
        {!showMap ? (
          <div className="text-center py-8">
            <p className="mb-4">
              {hasGoogleMapsApiKey
                ? "Click the button below to load the map and see technician locations."
                : "Set up Google Maps in Settings -> Integrations to enable this feature."}
            </p>
            <Button 
              onClick={() => setShowMap(true)}
              disabled={!hasGoogleMapsApiKey}
            >
              Show Map
            </Button>
          </div>
        ) : (
          <TechLocationMap />
        )}
      </CardContent>
    </Card>
  );
};

export default MapView;
