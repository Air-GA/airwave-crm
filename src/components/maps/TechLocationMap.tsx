import React, { useState, useEffect } from "react";
import { useTechnicianStore } from "@/services/technicianService";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Technician } from "@/types";

interface TechLocationMapProps {
  apiKey?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  width?: string;
  showInfoWindows?: boolean;
  onTechnicianSelect?: (technicianId: string) => void;
  selectedTechnicianId?: string;
}

const TechLocationMap: React.FC<TechLocationMapProps> = ({
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  center = { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
  zoom = 11,
  height = "500px",
  width = "100%",
  showInfoWindows = true,
  onTechnicianSelect,
  selectedTechnicianId,
}) => {
  const technicians = useTechnicianStore((state) => state.technicians);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [mapCenter, setMapCenter] = useState(center);

  // Update map center if a technician is selected
  useEffect(() => {
    if (selectedTechnicianId) {
      const tech = technicians.find((t) => t.id === selectedTechnicianId);
      if (tech && tech.currentLocationLat && tech.currentLocationLng) {
        setMapCenter({
          lat: tech.currentLocationLat,
          lng: tech.currentLocationLng,
        });
      }
    } else {
      // If no technician is selected, calculate the center based on all technicians
      if (technicians.length > 0) {
        const techsWithLocation = technicians.filter(
          (t) => t.currentLocationLat && t.currentLocationLng
        );
        
        if (techsWithLocation.length > 0) {
          const avgLat = techsWithLocation.reduce((sum, tech) => sum + (tech.currentLocationLat || 0), 0) / techsWithLocation.length;
          const avgLng = techsWithLocation.reduce((sum, tech) => sum + (tech.currentLocationLng || 0), 0) / techsWithLocation.length;
          
          setMapCenter({ lat: avgLat, lng: avgLng });
        }
      }
    }
  }, [selectedTechnicianId, technicians]);

  const handleMarkerClick = (tech: Technician) => {
    setSelectedTech(tech);
    if (onTechnicianSelect) {
      onTechnicianSelect(tech.id);
    }
  };

  const getMarkerIcon = (status: string) => {
    switch (status) {
      case "available":
        return {
          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        };
      case "busy":
        return {
          url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
        };
      case "off-duty":
        return {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        };
      default:
        return {
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500">Available</Badge>;
      case "busy":
        return <Badge className="bg-yellow-500">Busy</Badge>;
      case "off-duty":
        return <Badge variant="outline">Off Duty</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={{ width, height }}
        center={mapCenter}
        zoom={zoom}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {technicians.map((tech) => {
          // Skip technicians without location data
          if (!tech.currentLocationLat || !tech.currentLocationLng) return null;

          const position = {
            lat: tech.currentLocationLat,
            lng: tech.currentLocationLng,
          };

          return (
            <Marker
              key={tech.id}
              position={position}
              icon={getMarkerIcon(tech.status)}
              onClick={() => handleMarkerClick(tech)}
              animation={
                selectedTechnicianId === tech.id
                  ? window.google?.maps.Animation.BOUNCE
                  : undefined
              }
            />
          );
        })}

        {showInfoWindows && selectedTech && selectedTech.currentLocationLat && selectedTech.currentLocationLng && (
          <InfoWindow
            position={{
              lat: selectedTech.currentLocationLat,
              lng: selectedTech.currentLocationLng,
            }}
            onCloseClick={() => setSelectedTech(null)}
          >
            <Card className="border-0 shadow-none">
              <CardContent className="p-2">
                <div className="text-sm font-medium">{selectedTech.name}</div>
                <div className="mt-1">{getStatusBadge(selectedTech.status)}</div>
                {selectedTech.currentLocationAddress && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {selectedTech.currentLocationAddress}
                  </div>
                )}
              </CardContent>
            </Card>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default TechLocationMap;
