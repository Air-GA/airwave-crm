
import { Technician } from "@/types";
import { technicians as mockTechnicians } from "@/data/mockData";
import { useTechnicianStore } from "./technicianStore";

// Export the technician store
export { useTechnicianStore } from "./technicianStore";

export const fetchTechnicians = async (): Promise<Technician[]> => {
  // This would be a real API call in a production environment
  console.log("Fetching technicians...");
  
  // Fake a short loading time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For now, just return mock data
  return mockTechnicians;
};

export const updateTechnician = async (technicianId: string, updates: Partial<Technician>): Promise<Technician> => {
  const technician = mockTechnicians.find(tech => tech.id === technicianId);
  
  if (!technician) {
    throw new Error(`Technician with ID ${technicianId} not found`);
  }
  
  // In a real app, this would make an API call
  const updatedTechnician = {
    ...technician,
    ...updates
  };
  
  console.log(`Updated technician ${technicianId}:`, updatedTechnician);
  
  return updatedTechnician;
};

export const updateTechnicianLocation = async (
  technicianId: string, 
  latitude: number, 
  longitude: number, 
  address: string
): Promise<boolean> => {
  console.log(`Updating location for technician ${technicianId}: ${latitude}, ${longitude}, ${address}`);
  return true;
};
