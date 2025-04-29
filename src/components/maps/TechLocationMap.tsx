import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, ExternalLink, RefreshCw } from "lucide-react";
import { Technician } from '@/types';
import { useTechnicianStore } from '@/services/technicianService';
import { toast } from "sonner";

// Sample technician data for fallbacks
const sampleTechs: Technician[] = [
  { 
    id: "tech1", 
    name: "Mike Johnson", 
    status: "available", 
    specialties: ["HVAC", "Cooling"],
    currentLocationLat: 33.7952,
    currentLocationLng: -83.7136,
    currentLocationAddress: "Monroe, GA",
    createdAt: new Date().toISOString()
  },
  { 
    id: "tech2", 
    name: "Sarah Williams", 
    status: "busy", 
    specialties: ["Installation", "Repair"],
    currentLocationLat: 33.8304,
    currentLocationLng: -83.6909,
    currentLocationAddress: "Downtown Monroe, GA",
    createdAt: new Date().toISOString()
  },
  { 
    id: "tech3", 
    name: "Robert Taylor", 
    status: "available", 
    specialties: ["Heating", "Maintenance"],
    currentLocationLat: 33.7490,
    currentLocationLng: -83.7376,
    currentLocationAddress: "East Monroe, GA",
    createdAt: new Date().toISOString()
  },
];

interface TechLocationMapProps {
  onError?: (error: string) => void;
  apiKey: string;
}

// Global Google Maps script state tracker
const googleMapsLoaded = {
  status: false,
  loading: false,
  error: null as string | null
};

const TechLocationMap = ({ onError, apiKey }: TechLocationMapProps) => {
  const [manualApiKey, setManualApiKey] = useState<string>("");
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapInitialized, setMapInitialized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyHelp, setShowApiKeyHelp] = useState<boolean>(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const scriptId = 'google-maps-script';
  
  const technicians = useTechnicianStore(state => state.technicians);

  // Report errors to parent component and console
  const reportError = (errorMessage: string) => {
    console.error("Map error:", errorMessage);
    setError(errorMessage);
    setLoading(false);
    if (onError) {
      onError(errorMessage);
    }
  };

  // Clean up markers and map instance
  const cleanupMap = () => {
    // Clean up markers
    if (markers.current.length > 0) {
      markers.current.forEach(marker => {
        if (marker) marker.setMap(null);
      });
      markers.current = [];
    }
    
    // Clean up map instance
    if (mapInstance.current) {
      mapInstance.current = null;
    }
    
    setMapInitialized(false);
  };

  // Load Google Maps script
  const loadGoogleMapsScript = () => {
    if (!apiKey && !manualApiKey) {
      reportError("No Google Maps API key provided");
      return;
    }
    
    const keyToUse = manualApiKey || apiKey;
    
    // If Google Maps is already loaded
    if (window.google?.maps && googleMapsLoaded.status) {
      console.log("Google Maps already loaded, initializing map");
      setMapLoaded(true);
      setLoading(false);
      initializeMap();
      return;
    }
    
    // If script is already being loaded, don't load it again
    if (googleMapsLoaded.loading) {
      console.log("Google Maps script is already loading");
      return;
    }
    
    // Remove any existing script tags
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }
    
    console.log(`Loading Google Maps script with API key: ${keyToUse.substring(0, 5)}...`);
    googleMapsLoaded.loading = true;
    
    // Create script element
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${keyToUse}&v=weekly`;
    script.async = true;
    script.defer = true;
    
    // Set up callbacks
    script.onload = () => {
      console.log("Google Maps script loaded successfully");
      googleMapsLoaded.status = true;
      googleMapsLoaded.loading = false;
      googleMapsLoaded.error = null;
      setMapLoaded(true);
      setLoading(false);
      
      // Initialize map with a slight delay to ensure DOM and Google Maps are fully ready
      setTimeout(() => {
        initializeMap();
      }, 100);
    };
    
    script.onerror = () => {
      const errorMsg = "Failed to load Google Maps API. Please check your API key.";
      console.error(errorMsg);
      googleMapsLoaded.loading = false;
      googleMapsLoaded.error = errorMsg;
      reportError(errorMsg);
    };
    
    // Add the script to the document
    document.head.appendChild(script);
    
    // Set a timeout in case the script never loads
    setTimeout(() => {
      if (!googleMapsLoaded.status && googleMapsLoaded.loading) {
        const errorMsg = "Google Maps script loading timed out. Please try again.";
        console.error(errorMsg);
        googleMapsLoaded.loading = false;
        googleMapsLoaded.error = errorMsg;
        reportError(errorMsg);
      }
    }, 10000); // 10 second timeout
  };

  // Initialize the map once Google Maps is loaded
  const initializeMap = () => {
    if (!mapRef.current || !window.google?.maps) {
      console.log("Cannot initialize map: map reference or Google Maps not available");
      return;
    }
    
    if (mapInitialized) {
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
      const newMapInstance = new google.maps.Map(mapRef.current, mapOptions);
      mapInstance.current = newMapInstance;
      
      setMapInitialized(true);
      setError(null);

      // Use real technicians if available, otherwise use sample data
      const techsToShow = technicians.length > 0 
        ? technicians.filter(t => t.currentLocationLat && t.currentLocationLng) 
        : sampleTechs;

      console.log(`Adding ${techsToShow.length} technician markers to map`);
      
      if (techsToShow.length === 0) {
        console.log("No technicians with location data available, using samples");
        techsToShow.push(...sampleTechs);
      }

      // Add markers for each technician
      const newMarkers = techsToShow.map(tech => {
        if (!tech.currentLocationLat || !tech.currentLocationLng) {
          console.log(`Technician ${tech.name} has no location data, skipping marker`);
          return null;
        }
        
        const position = { 
          lat: tech.currentLocationLat, 
          lng: tech.currentLocationLng 
        };
        
        // Choose marker color based on status
        const status = tech.status || 'off-duty';
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
          map: newMapInstance,
          title: tech.name,
          icon,
        });

        // Add info window with technician details
        const address = tech.currentLocationAddress || "Location not specified";
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
            map: newMapInstance,
          });
        });

        return marker;
      }).filter(Boolean) as google.maps.Marker[];
      
      markers.current = newMarkers;
      
      // Fit map to markers if there are multiple
      if (newMarkers.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        newMarkers.forEach(marker => {
          if (marker && marker.getPosition()) {
            bounds.extend(marker.getPosition()!);
          }
        });
        newMapInstance.fitBounds(bounds);
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
  };

  // Initial setup
  useEffect(() => {
    // Load the map script when component mounts
    loadGoogleMapsScript();
    
    // Cleanup function
    return () => {
      cleanupMap();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Handle API key manual submission
  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Try to use the default key if manual input is empty
    const keyToUse = manualApiKey.trim() ? manualApiKey : apiKey;
    
    if (!keyToUse) {
      toast.error("Please enter a valid API key");
      return;
    }
    
    console.log("Setting new API key");
    
    // Reset state for fresh start
    cleanupMap();
    setMapLoaded(false);
    googleMapsLoaded.status = false;
    
    // Reload with new key
    loadGoogleMapsScript();
    
    toast.success("API Key applied", {
      description: "Attempting to load map with the provided API key"
    });
  };

  // Handle retry button click
  const handleRetry = () => {
    console.log("Manual retry requested by user");
    
    toast.info("Reloading map", {
      description: "Please wait while the map is being reloaded..."
    });
    
    // Reset everything and try again
    cleanupMap();
    setMapLoaded(false);
    googleMapsLoaded.status = false;
    loadGoogleMapsScript();
  };

  // Render API key input form if no key available
  if ((!apiKey && !manualApiKey) || error) {
    return (
      <Card className="overflow-hidden">
        <div className="p-4">
          <Alert className="mb-4" variant={error ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {error ? "Map Error" : "Google Maps API Key Required"}
            </AlertTitle>
            <AlertDescription>
              {error || "Please enter a Google Maps API key to display the map."}
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
                </ol>
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleApiKeySubmit} className="flex flex-col space-y-2">
            <Input
              type="text"
              placeholder="Enter Google Maps API Key"
              value={manualApiKey}
              onChange={(e) => setManualApiKey(e.target.value)}
            />
            <Button type="submit">Load Map</Button>
          </form>
        </div>
      </Card>
    );
  }

  // Show loading state
  if (loading || !mapLoaded) {
    return (
      <Card className="overflow-hidden">
        <div className="p-4 flex justify-center items-center h-[400px]">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span>Loading map...</span>
          </div>
        </div>
      </Card>
    );
  }

  // Show initializing state
  if (mapLoaded && !mapInitialized) {
    return (
      <Card className="overflow-hidden">
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
      </Card>
    );
  }

  // Show the map
  return (
    <Card className="overflow-hidden">
      <div ref={mapRef} className="h-[400px] w-full"></div>
    </Card>
  );
};

export default TechLocationMap;
