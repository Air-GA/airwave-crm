
import { create } from "zustand";
import { Technician } from "@/types";
import mockTechnicians from "@/data/mockData";
import { useMemo } from "react";

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
    const techsWithCreatedAt = mockTechnicians.technicians.map(tech => ({
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
