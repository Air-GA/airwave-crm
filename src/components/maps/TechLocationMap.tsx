import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getIntegrationSettings, saveIntegrationSettings } from "@/utils/settingsStorage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Map, Info, ExternalLink, RefreshCw } from "lucide-react";
import { Technician } from '@/types';
import { useTechnicianStore } from '@/services/technicianService';
import { toast } from "sonner";

// Sample technician data if we need fallbacks
const sampleTechs: Technician[] = [
  { 
    id: "tech1", 
    name: "Mike Johnson", 
    status: "available", 
    specialties: ["HVAC", "Cooling"],
    currentLocation: {
      lat: 33.7952, 
      lng: -83.7136,
      address: "Monroe, GA"
    }
  },
  { 
    id: "tech2", 
    name: "Sarah Williams", 
    status: "busy", 
    specialties: ["Installation", "Repair"],
    currentLocation: {
      lat: 33.8304, 
      lng: -83.6909,
      address: "Downtown Monroe, GA"
    }
  },
  { 
    id: "tech3", 
    name: "Robert Taylor", 
    status: "available", 
    specialties: ["Heating", "Maintenance"],
    currentLocation: {
      lat: 33.7490, 
      lng: -83.7376,
      address: "East Monroe, GA"
    }
  },
];

interface TechLocationMapProps {
  onError?: (error: string) => void;
}

const TechLocationMap = ({ onError }: TechLocationMapProps) => {
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>("");
  const [manualApiKey, setManualApiKey] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyHelp, setShowApiKeyHelp] = useState<boolean>(false);
  const [scriptLoading, setScriptLoading] = useState<boolean>(false);
  const [mapInitialized, setMapInitialized] = useState<boolean>(false);
  
  const technicians = useTechnicianStore(state => state.technicians);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Handler for reporting errors
  const reportError = useCallback((errorMessage: string) => {
    console.error(errorMessage);
    setError(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
  }, [onError]);

  // Load API key from settings
  useEffect(() => {
    const settings = getIntegrationSettings();
    if (settings.googleMaps.connected && settings.googleMaps.apiKey) {
      setGoogleMapsApiKey(settings.googleMaps.apiKey);
      console.log("Found Google Maps API key in settings, length:", settings.googleMaps.apiKey.length);
    } else {
      console.log("No Google Maps API key found in settings");
    }
  }, []);

  // Clean up previous script if exists
  const cleanupScript = useCallback(() => {
    if (scriptRef.current && document.head.contains(scriptRef.current)) {
      document.head.removeChild(scriptRef.current);
      scriptRef.current = null;
    }
    if (window.initMap) {
      // @ts-ignore - initMap is added to window but TS doesn't know about it
      delete window.initMap;
    }
  }, []);

  // Load Google Maps script
  useEffect(() => {
    const apiKey = googleMapsApiKey || manualApiKey;
    if (!apiKey) {
      console.log("No API key available for Google Maps");
      return;
    }

    console.log("Attempting to load Google Maps with API key, length:", apiKey.length);
    
    // Reset state
    setIsLoaded(false);
    setError(null);
    setMap(null);
    setScriptLoading(true);
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
    setMapInitialized(false);
    
    // Clean up any existing script
    cleanupScript();
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    scriptRef.current = script;
    
    // Define error handling
    script.onerror = () => {
      const errorMsg = "Failed to load Google Maps API. Please check your API key.";
      reportError(errorMsg);
      setIsLoaded(false);
      setScriptLoading(false);
    };
    
    // Define the callback function
    window.initMap = () => {
      console.log("Google Maps API loaded successfully");
      setIsLoaded(true);
      setScriptLoading(false);
    };
    
    document.head.appendChild(script);
    
    return () => {
      cleanupScript();
    };
  }, [googleMapsApiKey, manualApiKey, cleanupScript, markers, reportError]);

  // Initialize map with technician markers
  useEffect(() => {
    if (!isLoaded || !mapRef.current) {
      console.log("Map not ready to initialize:", { isLoaded, mapRefExists: !!mapRef.current });
      return;
    }
    
    try {
      console.log("Initializing map with", technicians.length, "technicians");
      
      // Create map centered on Monroe, GA (or average of technician locations)
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 33.7956, lng: -83.7136 }, // Monroe, GA
        zoom: 12,
        mapTypeControl: false,
      });
      
      setMap(mapInstance);
      setMapInitialized(true);

      // Use real technicians if available, otherwise use sample data
      const techsToShow = technicians.length > 0 
        ? technicians.filter(t => t.currentLocation) 
        : sampleTechs;

      console.log("Using technicians for map:", techsToShow.map(t => ({
        name: t.name,
        hasCurrentLocation: !!t.currentLocation,
        lat: t.currentLocation?.lat,
        lng: t.currentLocation?.lng,
        address: t.currentLocation?.address
      })));

      if (techsToShow.length === 0) {
        console.log("No technicians with location data available");
        toast.info("No technicians with location data", {
          description: "Using sample data for demonstration"
        });
        techsToShow.push(...sampleTechs);
      }

      // Add markers for technicians
      const mapMarkers = techsToShow.map(tech => {
        // Get location from technician data
        if (!tech.currentLocation) {
          console.log(`Technician ${tech.name} has no location data, skipping marker`);
          return null;
        }
        
        const location = { 
          lat: tech.currentLocation.lat, 
          lng: tech.currentLocation.lng 
        };
        
        console.log(`Creating marker for ${tech.name} at position:`, location);
        
        // Choose marker color based on status
        const status = tech.status || 'offline';
        let icon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: status === "available" ? "#22c55e" : 
                    status === "busy" ? "#f97316" : "#6b7280",
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: "#ffffff",
        };
        
        const marker = new google.maps.Marker({
          position: location,
          map: mapInstance,
          title: tech.name,
          icon,
        });

        // Add info window
        const address = tech.currentLocation.address || "Location not specified";
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <div style="font-weight: bold;">${tech.name}</div>
              <div style="color: ${
                status === "available" ? "green" : 
                status === "busy" ? "orange" : "gray"
              }; text-transform: capitalize;">${status}</div>
              <div style="margin-top: 4px; font-size: 12px;">${address}</div>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open({
            anchor: marker,
            map: mapInstance,
          });
        });

        return marker;
      }).filter(Boolean) as google.maps.Marker[];

      setMarkers(mapMarkers);
      setError(null);
      
      // Fit map to markers if there are multiple
      if (mapMarkers.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        mapMarkers.forEach(marker => {
          bounds.extend(marker.getPosition()!);
        });
        mapInstance.fitBounds(bounds);
      }
      
      // Add a message to confirm map loaded successfully
      toast.success("Map loaded successfully", {
        description: `Showing ${mapMarkers.length} technician locations`
      });
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      reportError("Error initializing map. Please check console for details.");
    }
  }, [isLoaded, technicians, reportError]);

  // Clean up markers
  useEffect(() => {
    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, [markers]);

  // Handle Google Maps API errors
  useEffect(() => {
    const handleMapError = (event: ErrorEvent) => {
      if (event.message && (
          event.message.includes('Google Maps JavaScript API error') || 
          event.message.includes('google is not defined')
        )) {
        const errorMsg = "Google Maps API error: Invalid or restricted API key. Please check your API key settings.";
        reportError(errorMsg);
        setIsLoaded(false);
        setScriptLoading(false);
      }
    };

    window.addEventListener('error', handleMapError);
    
    return () => {
      window.removeEventListener('error', handleMapError);
    };
  }, [reportError]);

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualApiKey) {
      console.log("Setting new API key, length:", manualApiKey.length);
      cleanupScript();
      setIsLoaded(false);
      
      // Save the API key to settings
      const settings = getIntegrationSettings();
      settings.googleMaps.connected = true;
      settings.googleMaps.apiKey = manualApiKey;
      saveIntegrationSettings(settings);
      setGoogleMapsApiKey(manualApiKey);
      
      // Notify user
      toast.success("API Key saved", {
        description: "Google Maps API key has been saved to your settings"
      });
    }
  };

  const handleRetry = () => {
    cleanupScript();
    setError(null);
    const apiKey = googleMapsApiKey || manualApiKey;
    if (apiKey) {
      console.log("Retrying with API key, length:", apiKey.length);
      setManualApiKey(apiKey);
      setTimeout(() => {
        const settings = getIntegrationSettings();
        settings.googleMaps.connected = true;
        settings.googleMaps.apiKey = apiKey;
        saveIntegrationSettings(settings);
        window.location.reload();
      }, 500);
    }
  };

  return (
    <Card className="overflow-hidden">
      {((!googleMapsApiKey && !manualApiKey) || error) ? (
        <div className="p-4">
          <Alert className="mb-4" variant={error ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {error ? "Map Error" : "Google Maps API Key Required"}
            </AlertTitle>
            <AlertDescription>
              {error || "Please enter a Google Maps API key to display the map. You can also add it in the Integrations settings tab."}
            </AlertDescription>
          </Alert>
          
          <button 
            onClick={() => setShowApiKeyHelp(!showApiKeyHelp)}
            className="flex items-center text-sm text-primary mb-3 hover:underline"
          >
            <Info className="h-4 w-4 mr-1" />
            {showApiKeyHelp ? "Hide API Key Instructions" : "How to get a Google Maps API Key"}
          </button>
          
          {showApiKeyHelp && (
            <Alert className="mb-4">
              <AlertDescription className="text-sm space-y-2">
                <p>To create a Google Maps API key:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to the <a href="https://console.cloud.google.com/google/maps-apis/overview" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center">Google Cloud Console <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                  <li>Create a new project or select an existing one</li>
                  <li>Enable the "Maps JavaScript API"</li>
                  <li>Create an API key in the "Credentials" section</li>
                  <li>Under API restrictions, restrict the key to "Maps JavaScript API" only</li>
                  <li>Optionally, restrict the key to your website domain for security</li>
                </ol>
                <p className="mt-1">After creating your API key, enter it below or add it in the Settings → Integrations page.</p>
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleApiKeySubmit} className="flex flex-col space-y-2">
            <Input
              type="password"
              placeholder="Enter Google Maps API Key"
              value={manualApiKey}
              onChange={(e) => setManualApiKey(e.target.value)}
              required
            />
            <Button type="submit">Load Map</Button>
          </form>
        </div>
      ) : scriptLoading ? (
        <div className="p-4 flex justify-center items-center h-[400px]">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span>Loading map...</span>
          </div>
        </div>
      ) : !isLoaded || !mapInitialized ? (
        <div className="p-4 flex justify-center items-center h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span>Initializing map...</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading Map
            </Button>
          </div>
        </div>
      ) : (
        <div ref={mapRef} className="h-[400px] w-full"></div>
      )}
    </Card>
  );
};

export default TechLocationMap;
