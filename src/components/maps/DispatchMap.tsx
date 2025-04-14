
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, User, Briefcase, CalendarClock } from 'lucide-react';
import { Technician } from '@/types';

export interface DispatchMapProps {
  technicians: Technician[];
  onSelectTechnician?: (technicianId: string) => void;
  selectedTechnicianId?: string | null;
  highlightedLocation?: {lat: number; lng: number} | null;
}

// This is a placeholder component. In a real implementation, we would integrate with a mapping library
// like Google Maps, Mapbox, or Leaflet to show actual map and locations
const DispatchMap = ({ 
  technicians, 
  onSelectTechnician,
  selectedTechnicianId,
  highlightedLocation
}: DispatchMapProps) => {
  const handleSelectTechnician = (techId: string) => {
    if (onSelectTechnician) {
      onSelectTechnician(techId);
    }
  };

  return (
    <Card className="h-[500px] overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>Technician Locations</CardTitle>
        <CardDescription>Map view of technician locations and work orders</CardDescription>
      </CardHeader>
      
      <CardContent className="p-0 relative">
        <div className="bg-gray-100 w-full h-[400px] relative">
          {/* This would be replaced with an actual map component */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2" />
              <p>Map view would display here</p>
              <p className="text-sm max-w-sm mx-auto mt-2">
                In a production environment, this would show an interactive map with technician locations and work order sites
              </p>
            </div>
          </div>
          
          {/* Simulate technician markers */}
          {technicians.map((tech, index) => {
            // Calculate simulated positions for demo purposes
            const left = 20 + (index * 60) % 300;
            const top = 100 + (index * 40) % 200;
            
            return (
              <div 
                key={tech.id}
                className={`absolute cursor-pointer transition-all duration-200
                  ${selectedTechnicianId === tech.id ? 'z-10 scale-125' : 'z-0 hover:scale-110'}
                `}
                style={{ left: `${left}px`, top: `${top}px` }}
                onClick={() => handleSelectTechnician(tech.id)}
              >
                <div className={`
                  p-1 rounded-full border-2 border-white shadow-md
                  ${tech.status === 'available' ? 'bg-green-500' : ''}
                  ${tech.status === 'busy' ? 'bg-amber-500' : ''}
                  ${tech.status === 'off-duty' ? 'bg-gray-500' : ''}
                `}>
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="absolute mt-1 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded shadow-sm text-xs whitespace-nowrap">
                  {tech.name}
                </div>
              </div>
            );
          })}
          
          {/* Simulate highlighted location */}
          {highlightedLocation && (
            <div 
              className="absolute z-20 animate-pulse"
              style={{ left: '150px', top: '180px' }}
            >
              <div className="p-1 rounded-full bg-primary border-2 border-white shadow-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-card pt-2 pb-4">
        <div className="flex text-xs items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Busy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>Off Duty</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DispatchMap;
