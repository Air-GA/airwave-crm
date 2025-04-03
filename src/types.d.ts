
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
  status: 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'pending-completion' | 'cancelled';
  scheduledDate: string;
  createdAt: string;
  completedDate?: string;
  estimatedHours?: number;
  technicianId?: string;
  technicianName?: string;
  notes?: string[];
  pendingReason?: string;
  completionRequired?: boolean;
}
