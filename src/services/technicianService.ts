
import { Technician } from "@/types";
import { create } from "zustand";
import { fetchMockTechnicians, updateMockTechnician } from "./mockService";

interface TechnicianStore {
  technicians: Technician[];
  setTechnicians: (technicians: Technician[]) => void;
  updateTechnician: (updatedTech: Technician) => void;
}

export const useTechnicianStore = create<TechnicianStore>((set) => ({
  technicians: [],
  setTechnicians: (technicians) => set({ technicians }),
  updateTechnician: (updatedTech) =>
    set((state) => ({
      technicians: state.technicians.map((tech) =>
        tech.id === updatedTech.id ? updatedTech : tech
      ),
    })),
}));

export const fetchTechnicians = async () => {
  try {
    const techs = await fetchMockTechnicians();
    useTechnicianStore.getState().setTechnicians(techs);
    return techs;
  } catch (error) {
    console.error("Error fetching technicians:", error);
    return [];
  }
};

export const updateTechnician = async (technician: Technician) => {
  try {
    const updatedTech = await updateMockTechnician(technician);
    useTechnicianStore.getState().updateTechnician(updatedTech);
    return updatedTech;
  } catch (error) {
    console.error("Error updating technician:", error);
    throw error;
  }
};
