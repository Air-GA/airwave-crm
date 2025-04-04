
import { useState, useEffect } from 'react';
import TechLocationMap from './TechLocationMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getIntegrationSettings } from "@/utils/settingsStorage";
import { MapPin } from 'lucide-react';

const MapView = () => {
  const [showMap, setShowMap] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true); // Set to true since we now have a key
  
  // Check for Google Maps API key on component mount and when integration settings change
  useEffect(() => {
    const integrations = getIntegrationSettings();
    // We now have a hardcoded API key, so always set hasApiKey to true
    setHasApiKey(true);
  }, []);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Technician Location Map
        </CardTitle>
        <CardDescription>
          View the current location of your field technicians with geofencing support
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showMap ? (
          <div className="text-center py-8">
            <p className="mb-4">
              Click the button below to load the map and see technician locations.
            </p>
            <Button 
              onClick={() => setShowMap(true)}
              disabled={!hasApiKey}
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
