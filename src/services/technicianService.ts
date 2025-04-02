
import { supabase } from '../lib/supabase';
import { Technician } from '../types';

// Sample technician data for development/fallback
const mockTechnicians: Technician[] = [
  {
    id: "tech1",
    name: "Mike Johnson",
    status: "available",
    specialties: ["HVAC", "Installation"],
    currentLocation: {
      lat: 33.7956, 
      lng: -83.7136,
      address: "123 Main St, Monroe, GA"
    }
  },
  {
    id: "tech2",
    name: "Sarah Williams",
    status: "busy",
    specialties: ["Repair", "Maintenance"],
    currentLocation: {
      lat: 33.8304, 
      lng: -83.6909,
      address: "456 Oak Ave, Monroe, GA"
    }
  },
  {
    id: "tech3",
    name: "Robert Taylor",
    status: "available",
    specialties: ["Installation", "Inspection"],
    currentLocation: {
      lat: 33.7490, 
      lng: -83.7376,
      address: "789 Pine Rd, Monroe, GA"
    }
  },
];

// Map the Supabase schema to our application types
const mapTechnicianFromDB = (tech: any): Technician => {
  return {
    id: tech.id,
    name: tech.name,
    status: tech.status,
    specialties: tech.specialties || [],
    ...(tech.current_location_address && {
      currentLocation: {
        lat: tech.current_location_lat || 0,
        lng: tech.current_location_lng || 0,
        address: tech.current_location_address
      }
    })
  };
};

export const fetchTechnicians = async (): Promise<Technician[]> => {
  try {
    const { data, error } = await supabase
      .from('technicians')
      .select('*');
    
    if (error) {
      console.warn('Using mock technician data due to Supabase error:', error.message);
      return mockTechnicians;
    }
    
    return data.map(mapTechnicianFromDB);
  } catch (error) {
    console.warn('Using mock technician data due to error:', error);
    return mockTechnicians;
  }
};

export const updateTechnicianStatus = async (id: string, status: 'available' | 'busy' | 'off-duty'): Promise<void> => {
  try {
    const { error } = await supabase
      .from('technicians')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      console.warn('Could not update technician status in Supabase:', error.message);
    }
  } catch (error) {
    console.warn('Error updating technician status:', error);
  }
};
