
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceAddress: string;
  billAddress: string;
  notes?: string;
  type?: 'residential' | 'commercial';
  createdAt?: string;
  lastService?: string;
  location?: {
    lat: number;
    lng: number;
  };
  address?: string;
}

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
  completedAt?: string;
  partsUsed?: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  price: number;
  reorderLevel: number;
  supplier: string;
  location: string;
  sku?: string;
  unit_price?: number;
}
