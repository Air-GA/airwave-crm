
import React, { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Technician } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface DispatchMapProps {
  technicians: Technician[];
  onSelectTechnician: (techId: string) => void;
}

const DispatchMap = ({ technicians, onSelectTechnician }: DispatchMapProps) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    // Initialize Google Maps
    const initializeMap = () => {
      if (!window.google || mapLoaded) return;

      try {
        const mapElement = document.getElementById("dispatch-map");
        if (!mapElement) return;

        const newMap = new window.google.maps.Map(mapElement, {
          center: { lat: 37.7749, lng: -122.4194 }, // Default center (San Francisco)
          zoom: 11,
          mapTypeControl: true,
          streetViewControl: false,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        });

        setMap(newMap);
        setMapLoaded(true);
      } catch (error) {
        console.error("Error initializing Google Maps:", error);
      }
    };

    if (window.google && window.google.maps) {
      initializeMap();
    } else {
      window.initMap = initializeMap;
    }

    return () => {
      // Clean up markers
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [mapLoaded, markers]);

  useEffect(() => {
    if (!map || !mapLoaded) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));
    
    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();
    let hasValidLocations = false;

    // Add markers for technicians with locations
    technicians.forEach((tech) => {
      if (tech.currentLocation?.lat && tech.currentLocation?.lng) {
        hasValidLocations = true;
        const position = {
          lat: tech.currentLocation.lat,
          lng: tech.currentLocation.lng,
        };
        
        bounds.extend(position);
        
        const statusColor = 
          tech.status === 'available' ? 'green' :
          tech.status === 'busy' ? 'orange' : 'gray';
        
        const marker = new google.maps.Marker({
          position,
          map,
          title: tech.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: statusColor,
            fillOpacity: 0.8,
            strokeWeight: 2,
            strokeColor: 'white',
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0; font-size: 16px;">${tech.name}</h3>
              <p style="margin: 4px 0 0; font-size: 14px;">Status: ${tech.status}</p>
              <p style="margin: 4px 0 0; font-size: 14px;">${tech.currentLocation.address}</p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          onSelectTechnician(tech.id);
        });

        marker.addListener("mouseover", () => {
          infoWindow.open(map, marker);
        });

        marker.addListener("mouseout", () => {
          infoWindow.close();
        });

        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);

    // Fit map to bounds if we have valid locations
    if (hasValidLocations && !bounds.isEmpty()) {
      map.fitBounds(bounds);
      
      // Adjust zoom if too close
      const listener = google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom() > 15) {
          map.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [map, mapLoaded, technicians, onSelectTechnician]);

  if (!mapLoaded) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <CardContent className="p-6 text-center">
          <MapPin className="h-10 w-10 mb-4 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-medium">Loading Map...</h3>
          <p className="text-sm text-muted-foreground mt-2">
            The map is currently loading or Google Maps API may not be available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-md overflow-hidden">
      <div id="dispatch-map" className="h-[400px] w-full" />
    </Card>
  );
};

export default DispatchMap;
