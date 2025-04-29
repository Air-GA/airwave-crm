
import React, { useState, useEffect } from "react";
import { useTechnicianStore } from "@/services/technicianService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Technician } from "@/types";
import { MapPin, User, AlertCircle } from "lucide-react";

interface TechLocationMapProps {
  apiKey?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  width?: string;
  showInfoWindows?: boolean;
  onTechnicianSelect?: (technicianId: string) => void;
  selectedTechnicianId?: string | null;
}

// Simple version that doesn't rely on Google Maps API
const TechLocationMap: React.FC<TechLocationMapProps> = ({
  height = "500px",
  width = "100%",
  showInfoWindows = true,
  onTechnicianSelect,
  selectedTechnicianId,
}) => {
  const technicians = useTechnicianStore((state) => state.technicians);
  
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

  const handleTechnicianSelect = (techId: string) => {
    if (onTechnicianSelect) {
      onTechnicianSelect(techId);
    }
  };

  return (
    <Card className="border shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center">
            <MapPin className="w-5 h-5 mr-2"/> Technician Locations
          </h3>
          <Badge variant="outline">Map Simplified View</Badge>
        </div>
        
        <div className="border rounded p-4 bg-muted/30" style={{ height, width }}>
          <div className="flex flex-col space-y-2">
            <div className="bg-background p-3 rounded border-2 border-dashed flex items-center justify-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
              <span className="text-sm text-muted-foreground">
                Google Maps integration not available. Using simplified view.
              </span>
            </div>
            
            <div className="space-y-2 mt-4">
              {technicians.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No technicians available
                </div>
              ) : (
                technicians.map((tech) => (
                  <div
                    key={tech.id}
                    className={`
                      p-3 border rounded-md cursor-pointer transition-all
                      ${selectedTechnicianId === tech.id ? 'bg-accent border-primary' : 'bg-card hover:bg-accent/50'}
                    `}
                    onClick={() => handleTechnicianSelect(tech.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted mr-3">
                          <User className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-medium">{tech.name}</p>
                          {tech.currentLocationAddress && (
                            <p className="text-xs text-muted-foreground">
                              {tech.currentLocationAddress}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>{getStatusBadge(tech.status)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechLocationMap;
