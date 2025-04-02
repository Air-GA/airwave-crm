
import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getIntegrationSettings } from "@/utils/settingsStorage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Map } from "lucide-react";

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

const TechLocationMap = () => {
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>("");
  const [manualApiKey, setManualApiKey] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  // Load API key from settings
  useEffect(() => {
    const settings = getIntegrationSettings();
    if (settings.googleMaps.connected && settings.googleMaps.apiKey) {
      setGoogleMapsApiKey(settings.googleMaps.apiKey);
    }
  }, []);

  // Load Google Maps script
  useEffect(() => {
    const apiKey = googleMapsApiKey || manualApiKey;
    if (!apiKey || isLoaded) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // Define the callback function
    window.initMap = () => {
      setIsLoaded(true);
    };
    
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
      // @ts-ignore
      delete window.initMap;
    };
  }, [googleMapsApiKey, manualApiKey, isLoaded]);

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
      });

      setMarkers(mapMarkers);
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
    }
  }, [isLoaded]);

  // Clean up markers
  useEffect(() => {
    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, [markers]);

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualApiKey) {
      setIsLoaded(false);
      // This will trigger the useEffect to reload the map
    }
  };

  return (
    <Card className="overflow-hidden">
      {!googleMapsApiKey && !manualApiKey ? (
        <div className="p-4">
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Google Maps API Key Required</AlertTitle>
            <AlertDescription>
              Please enter a Google Maps API key to display the map. You can also add it in the Integrations settings tab.
            </AlertDescription>
          </Alert>
          
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
      ) : !isLoaded ? (
        <div className="p-4 flex justify-center items-center h-[400px]">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span>Loading map...</span>
          </div>
        </div>
      ) : (
        <div ref={mapRef} className="h-[400px] w-full"></div>
      )}
    </Card>
  );
};

export default TechLocationMap;
