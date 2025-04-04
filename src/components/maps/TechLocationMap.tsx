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

// Track script loading state
let googleMapsScriptLoaded = false;
let googleMapsInitialized = false;

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
  const [scriptLoadAttempts, setScriptLoadAttempts] = useState<number>(0);
  
  const technicians = useTechnicianStore(state => state.technicians);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Handler for reporting errors
  const reportError = useCallback((errorMessage: string) => {
    console.error("Map error:", errorMessage);
    setError(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
    setScriptLoading(false);
  }, [onError]);

  // Load API key from settings
  useEffect(() => {
    try {
      const settings = getIntegrationSettings();
      if (settings.googleMaps?.connected && settings.googleMaps?.apiKey) {
        const apiKey = settings.googleMaps.apiKey;
        setGoogleMapsApiKey(apiKey);
        console.log("Found Google Maps API key in settings, length:", apiKey.length);
      } else {
        console.log("No Google Maps API key found in settings");
      }
    } catch (err) {
      console.error("Error loading API key from settings:", err);
    }
  }, []);

  // Clean up previous script and prepare for new load
  const cleanupScript = useCallback(() => {
    console.log("Cleaning up Google Maps script");
    // Clean up any previously loaded scripts
    if (scriptRef.current && document.head.contains(scriptRef.current)) {
      document.head.removeChild(scriptRef.current);
      scriptRef.current = null;
    }
    
    // Clean up markers
    markers.forEach(marker => {
      if (marker) marker.setMap(null);
    });
    setMarkers([]);
    
    // Clean up map instance
    if (map) {
      // @ts-ignore - setMap is not in the types but it works
      map.setMap(null);
      setMap(null);
    }
    
    // Reset global initMap function to avoid conflicts
    if (window.initMap) {
      // @ts-ignore - initMap is added to window but TS doesn't know about it
      delete window.initMap;
    }
  }, [markers, map]);

  // Reset global state for complete reload
  const resetMapState = useCallback(() => {
    console.log("Resetting map state completely");
    googleMapsScriptLoaded = false;
    googleMapsInitialized = false;
    setIsLoaded(false);
    setMapInitialized(false);
    setMap(null);
    setError(null);
    setScriptLoading(false);
    
    // Clean up script and markers
    cleanupScript();
    
    // Force reloading by incrementing attempts counter
    setScriptLoadAttempts(prev => prev + 1);
  }, [cleanupScript]);

  // Load Google Maps script
  useEffect(() => {
    const apiKey = googleMapsApiKey || manualApiKey;
    if (!apiKey) {
      console.log("No API key available for Google Maps");
      return;
    }

    // Don't reload if already loaded and working
    if (isLoaded && mapInitialized && map) {
      console.log("Map already initialized and working");
      return;
    }
    
    // Don't try to load if already loading
    if (scriptLoading) {
      console.log("Script already loading, waiting...");
      return;
    }

    console.log(`Loading Google Maps script (attempt #${scriptLoadAttempts + 1}) with API key: ${apiKey.substring(0, 4)}...`);
    setScriptLoading(true);
    
    // Clean up any existing script first
    cleanupScript();
    
    // Create a unique callback name to avoid conflicts
    const callbackName = `initGoogleMaps_${Date.now()}`;
    
    // Set up the callback function
    // @ts-ignore - adding to window
    window[callbackName] = () => {
      console.log("Google Maps API loaded successfully via callback");
      googleMapsScriptLoaded = true;
      googleMapsInitialized = true;
      setIsLoaded(true);
      setScriptLoading(false);
      
      // Small delay before initializing the map to ensure DOM is ready
      setTimeout(() => {
        if (mapRef.current && !mapInitialized) {
          initializeMap();
        }
      }, 100);
    };
    
    // Create and append the script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}&v=weekly`;
    script.async = true;
    script.defer = true;
    scriptRef.current = script;
    
    // Error handling for script loading
    script.onerror = () => {
      console.error("Failed to load Google Maps API script");
      reportError("Failed to load Google Maps API. Please check your API key.");
      googleMapsScriptLoaded = false;
      
      // Clean up failed script
      cleanupScript();
    };
    
    // Add a timeout in case the script never loads
    const timeout = setTimeout(() => {
      if (!googleMapsInitialized) {
        console.error("Google Maps script loading timed out");
        reportError("Google Maps loading timed out. Please try again.");
        cleanupScript();
      }
    }, 15000); // 15 second timeout
    
    // Append the script to document
    document.head.appendChild(script);
    
    return () => {
      clearTimeout(timeout);
      // Keep callback function around in case it's called late
      // but we'll be ready for the next render
    };
  }, [googleMapsApiKey, manualApiKey, scriptLoadAttempts, cleanupScript, reportError, isLoaded, mapInitialized, map, scriptLoading]);

  // Initialize map function
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google?.maps) {
      console.log("Cannot initialize map: map reference or Google Maps not available");
      return;
    }
    
    if (mapInitialized && map) {
      console.log("Map already initialized, skipping");
      return;
    }
    
    try {
      console.log("Initializing map with technicians");
      
      // Create map centered on Monroe, GA
      const mapOptions = {
        center: { lat: 33.7956, lng: -83.7136 }, // Monroe, GA
        zoom: 12,
        mapTypeControl: false,
      };
      
      console.log("Creating new map with options:", mapOptions);
      const mapInstance = new google.maps.Map(mapRef.current, mapOptions);
      
      setMap(mapInstance);
      setMapInitialized(true);
      setError(null);

      // Use real technicians if available, otherwise use sample data
      const techsToShow = technicians.length > 0 
        ? technicians.filter(t => t.currentLocation) 
        : sampleTechs;

      console.log(`Adding ${techsToShow.length} technician markers to map`);
      
      if (techsToShow.length === 0) {
        console.log("No technicians with location data available, using samples");
        techsToShow.push(...sampleTechs);
      }

      // Add markers for each technician
      const newMarkers = techsToShow.map(tech => {
        if (!tech.currentLocation) {
          console.log(`Technician ${tech.name} has no location data, skipping marker`);
          return null;
        }
        
        const position = { 
          lat: tech.currentLocation.lat, 
          lng: tech.currentLocation.lng 
        };
        
        console.log(`Creating marker for ${tech.name} at position:`, position);
        
        // Choose marker color based on status
        const status = tech.status || 'offline';
        const icon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: status === "available" ? "#22c55e" : 
                    status === "busy" ? "#f97316" : "#6b7280",
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: "#ffffff",
        };
        
        const marker = new google.maps.Marker({
          position,
          map: mapInstance,
          title: tech.name,
          icon,
        });

        // Add info window with technician details
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

      setMarkers(newMarkers);
      
      // Fit map to markers if there are multiple
      if (newMarkers.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        newMarkers.forEach(marker => {
          if (marker && marker.getPosition()) {
            bounds.extend(marker.getPosition()!);
          }
        });
        mapInstance.fitBounds(bounds);
      }
      
      // Confirm map loaded successfully
      toast.success("Map loaded successfully", {
        description: `Showing ${newMarkers.length} technician locations`
      });
      
      console.log("Map initialization complete");
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      reportError(`Error initializing map: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMapInitialized(false);
    }
  }, [map, mapInitialized, reportError, technicians]);

  // Initialize map once loaded
  useEffect(() => {
    if (isLoaded && !mapInitialized && mapRef.current && window.google?.maps) {
      console.log("Google Maps loaded, initializing map");
      initializeMap();
    }
  }, [isLoaded, mapInitialized, initializeMap]);

  // Handle API key submission
  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualApiKey || manualApiKey.trim() === '') {
      toast.error("Please enter a valid API key");
      return;
    }
    
    console.log("Setting new API key");
    
    // Reset state for fresh start
    resetMapState();
    
    // Save the API key to settings
    try {
      const settings = getIntegrationSettings();
      settings.googleMaps = {
        ...settings.googleMaps,
        connected: true,
        apiKey: manualApiKey
      };
      saveIntegrationSettings(settings);
      setGoogleMapsApiKey(manualApiKey);
      
      toast.success("API Key saved", {
        description: "Google Maps API key has been saved to your settings"
      });
    } catch (err) {
      console.error("Error saving API key to settings:", err);
      toast.error("Failed to save API key to settings");
    }
  };

  // Manual retry handler
  const handleRetry = () => {
    console.log("Manual retry requested by user");
    
    toast.info("Reloading map", {
      description: "Please wait while the map is being reloaded..."
    });
    
    // Reset everything and try again
    resetMapState();
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
