
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Technician } from "@/types";

// Fetch all work orders
export const fetchWorkOrdersFromSupabase = async (): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        id, 
        description,
        type_id,
        customer_id,
        scheduled_datetime, 
        scheduled_date,
        scheduled_time,
        technician_id,
        service_address_id,
        status_id
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Transform data to match WorkOrder type
    const workOrders: WorkOrder[] = data.map(wo => ({
      id: wo.id,
      description: wo.description || 'No description',
      type: getWorkOrderType(wo.type_id) as "repair" | "maintenance" | "installation" | "inspection", // Ensure proper typing
      customerId: wo.customer_id,
      customerName: 'Loading...', // Will be filled in with customer data later
      address: 'Loading...', // Will be filled in with address data later
      scheduledDate: wo.scheduled_date || wo.scheduled_datetime,
      status: getWorkOrderStatus(wo.status_id),
      priority: 'medium', // Default priority
      technicianId: wo.technician_id,
      createdAt: new Date().toISOString(), // Adding required field with default value
      updatedAt: new Date().toISOString(), // Adding required field with default value
      serviceAddressId: wo.service_address_id, // Add serviceAddressId field
    }));

    return workOrders;
  } catch (error) {
    console.error("Error fetching work orders:", error);
    throw error;
  }
};

// Fetch customer data for work orders
export const fetchCustomersForWorkOrders = async (workOrders: WorkOrder[]): Promise<WorkOrder[]> => {
  try {
    // Get unique customer IDs
    const customerIds = [...new Set(workOrders.map(wo => wo.customerId))];
    
    if (customerIds.length === 0) return workOrders;

    // Fetch customer data
    const { data: customers, error } = await supabase
      .from('customers')
      .select('id, name')
      .in('id', customerIds);

    if (error) throw error;

    // Create a lookup map
    const customerMap = customers.reduce((acc, customer) => {
      acc[customer.id] = customer.name;
      return acc;
    }, {} as Record<string, string>);

    // Enhance work orders with customer names
    return workOrders.map(wo => ({
      ...wo,
      customerName: customerMap[wo.customerId] || 'Unknown Customer'
    }));
  } catch (error) {
    console.error("Error fetching customers:", error);
    return workOrders; // Return original work orders if there's an error
  }
};

// Fetch service addresses for work orders
export const fetchAddressesForWorkOrders = async (workOrders: WorkOrder[]): Promise<WorkOrder[]> => {
  try {
    // Get unique service address IDs - checking if serviceAddressId exists in the custom type extensions
    const serviceAddressIds = workOrders
      .filter(wo => wo.serviceAddressId !== undefined)
      .map(wo => wo.serviceAddressId as string);
    
    if (serviceAddressIds.length === 0) return workOrders;

    // Fetch address data
    const { data: addresses, error } = await supabase
      .from('service_addresses')
      .select('id, address_line1, address_line2, city, state, zip')
      .in('id', serviceAddressIds);

    if (error) throw error;

    // Create a lookup map
    const addressMap = addresses.reduce((acc, address) => {
      const fullAddress = [
        address.address_line1,
        address.address_line2,
        `${address.city}, ${address.state} ${address.zip}`
      ].filter(Boolean).join(', ');
      
      acc[address.id] = fullAddress;
      return acc;
    }, {} as Record<string, string>);

    // Enhance work orders with addresses
    return workOrders.map(wo => {
      return {
        ...wo,
        address: wo.serviceAddressId !== undefined && addressMap[wo.serviceAddressId as string] 
          ? addressMap[wo.serviceAddressId as string] 
          : 'No address'
      };
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return workOrders; // Return original work orders if there's an error
  }
};

// Fetch all technicians
export const fetchTechniciansFromSupabase = async (): Promise<Technician[]> => {
  try {
    // First fetch technicians from technicians table
    const { data: techData, error: techError } = await supabase
      .from('technicians')
      .select('id, user_id, availability_status, specialty, certification');
    
    if (techError) throw techError;
    
    // Fetch corresponding user data
    const userIds = techData.map(tech => tech.user_id).filter(Boolean);
    
    let userData: any[] = [];
    if (userIds.length > 0) {
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .in('id', userIds);
      
      if (userError) throw userError;
      userData = users;
    }
    
    // Create a lookup map for users
    const userMap = userData.reduce((acc, user) => {
      acc[user.id] = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      return acc;
    }, {} as Record<string, string>);
    
    // Transform data to match Technician type
    const technicians: Technician[] = techData.map(tech => ({
      id: tech.id,
      name: tech.user_id ? userMap[tech.user_id] || 'Unnamed Technician' : `Tech ${tech.id.substring(0, 4)}`,
      status: mapAvailabilityStatus(tech.availability_status),
      specialties: tech.specialty ? [tech.specialty] : [],
      createdAt: new Date().toISOString() // Default value
    }));
    
    return technicians;
  } catch (error) {
    console.error("Error fetching technicians:", error);
    throw error;
  }
};

// Helper functions for mapping values
function getWorkOrderType(typeId: string | null): string {
  // In a real application, you would look up the type from a types table
  // For now, return a default value that matches the expected union type
  return 'repair'; // One of the allowed values: "repair" | "maintenance" | "installation" | "inspection"
}

function getWorkOrderStatus(statusId: string | null): "pending" | "scheduled" | "in-progress" | "completed" | "cancelled" {
  // In a real application, you would look up the status from a statuses table
  // For now, return a default value
  return statusId ? 'scheduled' : 'pending';
}

function mapAvailabilityStatus(status: string | null): "available" | "busy" | "off-duty" {
  switch (status?.toLowerCase()) {
    case 'available':
      return 'available';
    case 'busy':
    case 'on_job':
    case 'on job':
      return 'busy';
    case 'off_duty':
    case 'off duty':
    case 'unavailable':
      return 'off-duty';
    default:
      return 'available';
  }
}
