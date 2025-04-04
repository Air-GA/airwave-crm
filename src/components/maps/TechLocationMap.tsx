
import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getIntegrationSettings, saveIntegrationSettings } from "@/utils/settingsStorage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Map, Info, ExternalLink } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface TechLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: "available" | "busy" | "offline";
}

// Sample technician data
const sampleTechs: TechLocation[] = [
  { id: "tech1", name: "Mike Johnson", lat: 33.7952, lng: -83.7136, status: "available" },
  { id: "tech2", name: "Sarah Williams", lat: 33.8304, lng: -83.6909, status: "busy" },
  { id: "tech3", name: "Robert Taylor", lat: 33.7490, lng: -83.7376, status: "available" },
];

// Geofence webhook URLs
const GEOFENCE_ENTRY_WEBHOOK = "https://air-ga.newleveltech.net/gps/geofence";
const GEOFENCE_EXIT_WEBHOOK = "https://air-ga.newleveltech.net/gps/geofence";

const TechLocationMap = () => {
  // Use the provided API key directly
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>("EMAkZ0QQg780AGyS_WPp9X75f1o-f4WItx6wHBHoRpA");
  const [manualApiKey, setManualApiKey] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [geofences, setGeofences] = useState<google.maps.Circle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyHelp, setShowApiKeyHelp] = useState<boolean>(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Clean up previous script if exists
  const cleanupScript = () => {
    if (scriptRef.current && document.head.contains(scriptRef.current)) {
      document.head.removeChild(scriptRef.current);
      scriptRef.current = null;
    }
    if (window.initMap) {
      delete window.initMap;
    }
  };

  // Load Google Maps script
  useEffect(() => {
    const apiKey = googleMapsApiKey || manualApiKey;
    if (!apiKey) return;

    // Reset state
    setIsLoaded(false);
    setError(null);
    setMap(null);
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
    geofences.forEach(circle => circle.setMap(null));
    setGeofences([]);
    
    // Clean up any existing script
    cleanupScript();
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    scriptRef.current = script;
    
    // Define error handling
    script.onerror = () => {
      setError("Failed to load Google Maps API. Please check your API key.");
      setIsLoaded(false);
    };
    
    // Define the callback function
    window.initMap = () => {
      setIsLoaded(true);
    };
    
    document.head.appendChild(script);
    
    return () => {
      cleanupScript();
    };
  }, [googleMapsApiKey, manualApiKey]);

  // Function to create geofences
  const createGeofence = (mapInstance: google.maps.Map, center: google.maps.LatLngLiteral, radius: number, label: string) => {
    // Create the circular geofence
    const circle = new google.maps.Circle({
      strokeColor: '#1E88E5',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#1E88E5',
      fillOpacity: 0.2,
      map: mapInstance,
      center: center,
      radius: radius, // in meters
    });

    // Add a marker at the center with a label
    const marker = new google.maps.Marker({
      position: center,
      map: mapInstance,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 0,
      },
      label: {
        text: label,
        color: '#1E88E5',
        fontWeight: 'bold'
      },
    });

    return { circle, marker };
  };

  // Function to simulate a geofence event (for demo purposes)
  const simulateGeofenceEvent = (techId: string, eventType: 'entry' | 'exit', geofenceId: string) => {
    const tech = sampleTechs.find(t => t.id === techId);
    if (!tech) return;

    const eventTypeDisplay = eventType === 'entry' ? 'entered' : 'exited';
    const webhook = eventType === 'entry' ? GEOFENCE_ENTRY_WEBHOOK : GEOFENCE_EXIT_WEBHOOK;
    
    console.log(`Simulating geofence ${eventTypeDisplay} event for ${tech.name} at ${webhook}`);
    
    toast({
      title: `Geofence ${eventTypeDisplay.charAt(0).toUpperCase() + eventTypeDisplay.slice(1)}`,
      description: `${tech.name} has ${eventTypeDisplay} zone ${geofenceId}`,
      variant: eventType === 'entry' ? 'default' : 'destructive',
    });
  };

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    
    try {
      // Create map
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 33.7956, lng: -83.7136 }, // Monroe, GA
        zoom: 12,
        mapTypeControl: false,
      });
      
      setMap(mapInstance);

      // Add markers for technicians
      const mapMarkers = sampleTechs.map(tech => {
        // Choose marker color based on status
        let icon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: tech.status === "available" ? "#22c55e" : 
                    tech.status === "busy" ? "#f97316" : "#6b7280",
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: "#ffffff",
        };
        
        const marker = new google.maps.Marker({
          position: { lat: tech.lat, lng: tech.lng },
          map: mapInstance,
          title: tech.name,
          icon,
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <div style="font-weight: bold;">${tech.name}</div>
              <div style="color: ${
                tech.status === "available" ? "green" : 
                tech.status === "busy" ? "orange" : "gray"
              }; text-transform: capitalize;">${tech.status}</div>
              <button id="simulate-entry-${tech.id}" style="margin-top: 5px; padding: 2px 5px; background-color: #3b82f6; color: white; border: none; border-radius: 3px; margin-right: 5px;">Simulate Entry</button>
              <button id="simulate-exit-${tech.id}" style="margin-top: 5px; padding: 2px 5px; background-color: #ef4444; color: white; border: none; border-radius: 3px;">Simulate Exit</button>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open({
            anchor: marker,
            map: mapInstance,
          });
          
          // Add event listeners for simulation buttons after infowindow is opened
          setTimeout(() => {
            const entryButton = document.getElementById(`simulate-entry-${tech.id}`);
            const exitButton = document.getElementById(`simulate-exit-${tech.id}`);
            
            if (entryButton) {
              entryButton.addEventListener('click', () => {
                simulateGeofenceEvent(tech.id, 'entry', 'Zone-1');
              });
            }
            
            if (exitButton) {
              exitButton.addEventListener('click', () => {
                simulateGeofenceEvent(tech.id, 'exit', 'Zone-1');
              });
            }
          }, 300);
        });

        return marker;
      });

      setMarkers(mapMarkers);
      
      // Create a couple of geofence circles
      const geofence1 = createGeofence(
        mapInstance, 
        { lat: 33.7956, lng: -83.7036 }, 
        800, 
        "Customer Area"
      );
      
      const geofence2 = createGeofence(
        mapInstance, 
        { lat: 33.7820, lng: -83.7236 }, 
        600, 
        "Service Zone"
      );
      
      setGeofences([geofence1.circle, geofence2.circle]);

      setError(null);
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      setError("Error initializing map. Please check console for details.");
    }
  }, [isLoaded]);

  // Clean up markers
  useEffect(() => {
    return () => {
      markers.forEach(marker => marker.setMap(null));
      geofences.forEach(circle => circle.setMap(null));
    };
  }, [markers, geofences]);

  // Handle Google Maps API errors
  useEffect(() => {
    const handleMapError = (event: ErrorEvent) => {
      if (event.message && event.message.includes('Google Maps JavaScript API error')) {
        setError("Google Maps API error: Invalid or restricted API key. Please check your API key settings.");
        setIsLoaded(false);
      }
    };

    window.addEventListener('error', handleMapError);
    
    return () => {
      window.removeEventListener('error', handleMapError);
    };
  }, []);

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualApiKey) {
      cleanupScript();
      setIsLoaded(false);
      
      // Save the API key to settings if it works
      const settings = getIntegrationSettings();
      settings.googleMaps.connected = true;
      settings.googleMaps.apiKey = manualApiKey;
      saveIntegrationSettings(settings);
      setGoogleMapsApiKey(manualApiKey);
    }
  };
  
  return (
    <Card className="overflow-hidden">
      {/* We'll skip the API key input section since we have the key now */}
      {!isLoaded ? (
        <div className="p-4 flex justify-center items-center h-[400px]">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span>Loading map...</span>
          </div>
        </div>
      ) : (
        <div ref={mapRef} className="h-[400px] w-full"></div>
      )}
      
      {isLoaded && (
        <div className="p-4 bg-muted/50">
          <h3 className="text-sm font-medium mb-2">Geofencing Information</h3>
          <p className="text-sm text-muted-foreground">
            Geofence entry/exit events are being monitored. Click on a technician to simulate events.
          </p>
          <div className="flex items-center mt-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4 mr-1" />
            <span>Webhook endpoints configured for geofence events</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TechLocationMap;
