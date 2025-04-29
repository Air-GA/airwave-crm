
import { create } from "zustand";
import { Technician } from "@/types";
import { technicians as mockTechnicians } from "@/data/mockData";
import { useWorkOrderStore } from "./workOrderStore";

interface TechnicianState {
  technicians: Technician[];
  setTechnicians: (technicians: Technician[]) => void;
  updateTechnicianLocation: (technicianId: string, lat: number, lng: number, address: string) => void;
  updateTechnicianStatus: (technicianId: string, status: "available" | "busy" | "off-duty") => void;
}

// Create the technician store
export const useTechnicianStore = create<TechnicianState>((set) => ({
  technicians: [],
  setTechnicians: (technicians) => set({ technicians }),
  updateTechnicianLocation: (technicianId, lat, lng, address) => {
    set((state) => ({
      technicians: state.technicians.map((tech) =>
        tech.id === technicianId
          ? {
              ...tech,
              currentLocationLat: lat,
              currentLocationLng: lng,
              currentLocationAddress: address,
              currentLocation: { lat, lng }
            }
          : tech
      ),
    }));
  },
  updateTechnicianStatus: (technicianId, status) => {
    set((state) => ({
      technicians: state.technicians.map((tech) =>
        tech.id === technicianId ? { ...tech, status } : tech
      ),
    }));
  },
}));

// Function to fetch technicians
export const fetchTechnicians = async (): Promise<Technician[]> => {
  try {
    // In a real app, this would be an API call
    // For now, return mock data
    console.log("Fetching technicians...");
    
    // Add createdAt field to meet the Technician type requirement
    const techsWithCreatedAt = mockTechnicians.map(tech => ({
      ...tech,
      createdAt: tech.createdAt || new Date().toISOString()
    }));
    
    // Update the technician store
    useTechnicianStore.getState().setTechnicians(techsWithCreatedAt);
    
    return techsWithCreatedAt;
  } catch (error) {
    console.error("Error fetching technicians:", error);
    throw error;
  }
};

// Function to get a technician by ID
export const getTechnicianById = (id: string): Technician | undefined => {
  return useTechnicianStore.getState().technicians.find((tech) => tech.id === id);
};

// Function to update a technician's location
export const updateTechnicianLocation = (
  technicianId: string,
  lat: number,
  lng: number,
  address: string
): void => {
  useTechnicianStore.getState().updateTechnicianLocation(technicianId, lat, lng, address);
};

// Function to update a technician
export const updateTechnician = (
  technicianId: string,
  updates: Partial<Technician>
): Technician | null => {
  try {
    const { technicians, setTechnicians } = useTechnicianStore.getState();
    const technician = technicians.find((tech) => tech.id === technicianId);
    
    if (!technician) {
      console.error("Technician not found:", technicianId);
      return null;
    }
    
    const updatedTechnician = {
      ...technician,
      ...updates,
    };
    
    // Update the technicians array
    setTechnicians(
      technicians.map((tech) =>
        tech.id === technicianId ? updatedTechnician : tech
      )
    );
    
    return updatedTechnician;
  } catch (error) {
    console.error("Error updating technician:", error);
    return null;
  }
};

// Add the missing functions for assigning and unassigning work orders
export const assignWorkOrder = async (
  workOrderId: string,
  technicianId: string,
  technicianName: string
): Promise<void> => {
  try {
    const { workOrders, setWorkOrders } = useWorkOrderStore.getState();
    
    // Find the work order to update
    const updatedWorkOrders = workOrders.map(wo => 
      wo.id === workOrderId 
        ? { ...wo, technicianId, technicianName, updatedAt: new Date().toISOString() }
        : wo
    );
    
    // Update the store
    setWorkOrders(updatedWorkOrders);
    console.log(`Work order ${workOrderId} assigned to ${technicianName}`);
    
    // In a real app, this would make an API call to update the database
    return Promise.resolve();
  } catch (error) {
    console.error("Error assigning work order:", error);
    throw error;
  }
};

export const unassignWorkOrder = async (workOrderId: string): Promise<void> => {
  try {
    const { workOrders, setWorkOrders } = useWorkOrderStore.getState();
    
    // Find the work order to update
    const updatedWorkOrders = workOrders.map(wo => 
      wo.id === workOrderId 
        ? { ...wo, technicianId: null, technicianName: null, updatedAt: new Date().toISOString() }
        : wo
    );
    
    // Update the store
    setWorkOrders(updatedWorkOrders);
    console.log(`Work order ${workOrderId} unassigned`);
    
    // In a real app, this would make an API call to update the database
    return Promise.resolve();
  } catch (error) {
    console.error("Error unassigning work order:", error);
    throw error;
  }
};
