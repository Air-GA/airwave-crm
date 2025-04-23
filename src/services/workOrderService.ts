import { Customer } from "@/types";

// Add status: 'active' to any customer object creation
const createCustomer = (data: any): Customer => {
  return {
    id: data.id || generateId(),
    name: data.name || 'Unknown Customer',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',
    serviceAddress: data.serviceAddress || data.address || '',
    billAddress: data.billAddress || data.address || '',
    type: 'residential',
    status: 'active', // Add the status field which is required
    createdAt: data.createdAt || new Date().toISOString(),
    serviceAddresses: data.serviceAddresses || [
      { 
        id: `addr-${generateId()}`, 
        address: data.serviceAddress || data.address || '', 
        isPrimary: true 
      }
    ],
  };
};

// Helper function to generate ID
const generateId = () => Math.random().toString(36).substring(2, 10);
