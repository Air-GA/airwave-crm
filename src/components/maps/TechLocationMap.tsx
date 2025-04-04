import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getIntegrationSettings, saveIntegrationSettings } from "@/utils/settingsStorage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Map, Info, ExternalLink } from "lucide-react";

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
  // Use the provided API key directly
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>("EMAkZ0QQg780AGyS_WPp9X75f1o-f4WItx6wHBHoRpA");
  const [manualApiKey, setManualApiKey] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyHelp, setShowApiKeyHelp] = useState<boolean>(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // We'll skip loading API key from settings since we have it hardcoded
  useEffect(() => {
    // Keep the API key we already have
  }, []);

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
    };
  }, [markers]);

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
    </Card>
  );
};

export default TechLocationMap;
