
import { Customer } from "@/types";

// Format customer data consistently across the app
export const formatCustomerData = (customer: any): Customer => {
  // Map service addresses to the expected format
  const serviceAddresses = customer.serviceAddresses?.map(addr => ({
    id: addr.id || `addr-${Math.random().toString(36).substring(2, 11)}`,
    address: addr.address || '',
    isPrimary: typeof addr.isPrimary === 'boolean' ? addr.isPrimary : true,
    notes: addr.notes || ''
  })) || [];

  // Ensure the primary address is available
  const primaryAddress = serviceAddresses.find(addr => addr.isPrimary)?.address ||
    serviceAddresses[0]?.address ||
    customer.address || '';

  // Format the customer object with all required fields
  return {
    id: customer.id,
    name: customer.name || 'Unknown',
    email: customer.email || '',
    phone: customer.phone || '',
    address: primaryAddress,
    billAddress: customer.billAddress || '',
    billCity: customer.billCity || '',
    serviceAddresses: serviceAddresses,
    type: (customer.type === 'commercial' ? 'commercial' : 'residential') as Customer["type"],
    status: (customer.status === 'active' || customer.status === 'inactive' || 
             customer.status === 'pending' || customer.status === 'new') ? 
             customer.status as Customer["status"] : 'active',
    createdAt: customer.createdAt || new Date().toISOString(),
    lastService: customer.lastService || null
  };
};
