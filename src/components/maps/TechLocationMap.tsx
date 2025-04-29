
// Update the import to use the correct import path
import { useTechnicianStore } from "@/services/technicianService";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TechLocationMapProps {
  height?: string;
  selectedTechnicianId?: string | null;
}

const TechLocationMap = ({ height = "500px", selectedTechnicianId }: TechLocationMapProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  
  const technicians = useTechnicianStore(state => state.technicians);
  const filteredTechnicians = selectedTechnicianId 
    ? technicians.filter(tech => tech.id === selectedTechnicianId)
    : technicians;
    
  // Load the Google Maps API
  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      if (window.google && window.google.maps) {
        console.log("Google Maps API already loaded");
        setIsLoaded(true);
        return;
      }
      
      // Load Google Maps API
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Maps API loaded");
        setIsLoaded(true);
      };
      script.onerror = () => {
        console.error("Error loading Google Maps API");
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsAPI();

    return () => {
      // Clean up markers when component unmounts
      markers.forEach(marker => marker.setMap(null));
    };
  }, []);

  // Initialize the map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    
    try {
      // Create a new map
      const mapOptions = {
        center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false
      };
      
      const newMap = new google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
      
      console.log("Map initialized");
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, [isLoaded]);

  // Update markers when technicians change
  const updateMarkers = useCallback(() => {
    if (!map || !isLoaded) return;
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];
    
    // Add markers for each technician with location
    const techsWithLocation = filteredTechnicians.filter(
      tech => tech.currentLocationLat && tech.currentLocationLng
    );
    
    if (techsWithLocation.length === 0) {
      console.log("No technicians with location data");
      setMarkers([]);
      return;
    }
    
    const bounds = new google.maps.LatLngBounds();
    
    techsWithLocation.forEach(tech => {
      if (!tech.currentLocationLat || !tech.currentLocationLng) return;
      
      const position = {
        lat: tech.currentLocationLat,
        lng: tech.currentLocationLng
      };
      
      const marker = new google.maps.Marker({
        position,
        map,
        title: tech.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: tech.status === "available" ? "#22c55e" : 
                    tech.status === "busy" ? "#f59e0b" : "#6b7280",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 8
        }
      });
      
      const infoContent = `
        <div style="padding: 8px; max-width: 200px;">
          <div style="font-weight: bold; margin-bottom: 4px;">${tech.name}</div>
          <div style="font-size: 12px; color: #666;">
            ${tech.currentLocationAddress || "Location Unknown"}
          </div>
          <div style="font-size: 12px; margin-top: 4px;">
            Status: ${tech.status.charAt(0).toUpperCase() + tech.status.slice(1)}
          </div>
        </div>
      `;
      
      const infoWindow = new google.maps.InfoWindow({
        content: infoContent
      });
      
      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
      
      newMarkers.push(marker);
      bounds.extend(position);
    });
    
    // Fit map to bounds if we have markers
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      
      // Don't zoom in too far on small areas
      const listener = google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom() > 16) {
          map.setZoom(16);
        }
        google.maps.event.removeListener(listener);
      });
    }
    
    setMarkers(newMarkers);
    console.log(`Added ${newMarkers.length} technician markers to map`);
  }, [map, isLoaded, filteredTechnicians, markers]);

  useEffect(() => {
    updateMarkers();
  }, [map, filteredTechnicians, updateMarkers]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>
          {selectedTechnicianId 
            ? `Technician Location`
            : `All Technician Locations`
          }
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isLoaded ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div 
            ref={mapRef} 
            style={{ height, width: "100%" }}
            className="rounded-md overflow-hidden"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TechLocationMap;
