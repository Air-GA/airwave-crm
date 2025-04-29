export interface ServiceAddress {
  id: string;
  address: string;
  isPrimary: boolean;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  billAddress?: string;
  billCity?: string;  // Added billing city field
  serviceAddress?: string;
  serviceAddresses?: ServiceAddress[];
  type: 'residential' | 'commercial';
  status: 'active' | 'inactive' | 'pending' | 'new';
  createdAt: string;
  lastService?: string;
}
