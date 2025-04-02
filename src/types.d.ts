
export interface Technician {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'off-duty';
  specialties: string[];
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface WorkOrder {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  type: 'repair' | 'maintenance' | 'installation' | 'inspection';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  createdAt: string; // Changed from createdDate to match mockData
  completedDate?: string;
  estimatedHours?: number;
  technicianId?: string;
  technicianName?: string;
  notes?: string[];
  partsUsed?: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}
