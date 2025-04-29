
import { create } from 'zustand';
import { Technician } from '@/types';

interface TechnicianState {
  technicians: Technician[];
  setTechnicians: (technicians: Technician[]) => void;
  addTechnician: (technician: Technician) => void;
  updateTechnician: (technician: Technician) => void;
  getTechnicianById: (id: string) => Technician | undefined;
}

export const useTechnicianStore = create<TechnicianState>((set, get) => ({
  technicians: [],
  setTechnicians: (technicians) => set({ technicians }),
  addTechnician: (technician) => set((state) => ({
    technicians: [technician, ...state.technicians]
  })),
  updateTechnician: (technician) => set((state) => ({
    technicians: state.technicians.map((tech) => 
      tech.id === technician.id ? technician : tech
    )
  })),
  getTechnicianById: (id) => get().technicians.find((tech) => tech.id === id)
}));
