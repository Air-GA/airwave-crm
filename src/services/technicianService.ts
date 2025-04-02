
import { supabase } from '../lib/supabase';
import { Technician } from '../types';

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
  const { data, error } = await supabase
    .from('technicians')
    .select('*');
  
  if (error) {
    console.error('Error fetching technicians:', error);
    throw error;
  }
  
  return data.map(mapTechnicianFromDB);
};

export const updateTechnicianStatus = async (id: string, status: 'available' | 'busy' | 'off-duty'): Promise<void> => {
  const { error } = await supabase
    .from('technicians')
    .update({ status })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating technician status:', error);
    throw error;
  }
};
