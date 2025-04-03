
import { supabase } from '../lib/supabase';
import { WorkOrder, Technician } from '../types';
import { toast } from '@/components/ui/use-toast';

// Base URL for the Supabase Edge Function
const CRM_SYNC_URL = `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'}/functions/v1/crm-sync`;

/**
 * Fetch and sync technicians from the external CRM
 */
export const syncTechniciansFromCRM = async (): Promise<Technician[]> => {
  try {
    console.log("Attempting to sync technicians from CRM...");
    console.log("Using CRM sync URL:", CRM_SYNC_URL);
    
    // Since supabase client may not have functions property in the current setup
    // Use direct fetch to the edge function URL instead
    const response = await fetch(`${CRM_SYNC_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ action: 'sync-technicians' })
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error response from sync technicians:", errorData);
      throw new Error(errorData.error || `Failed to sync technicians: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Successfully synced technicians:", data);
    
    toast({
      title: "Sync Complete",
      description: `Successfully synced ${data.technicians?.length || 0} technicians from CRM`,
    });

    return data.technicians || [];
  } catch (error) {
    console.error("Error in syncTechniciansFromCRM:", error);
    
    // Provide more detailed error message
    let errorMessage = "Could not sync technicians due to a network error";
    if (error instanceof Error) {
      errorMessage = `Sync failed: ${error.message}`;
    }
    
    toast({
      title: "Sync Failed",
      description: errorMessage,
      variant: "destructive",
    });
    
    // Return empty array to prevent further issues
    return [];
  }
};

/**
 * Fetch and sync work orders from the external CRM
 */
export const syncWorkOrdersFromCRM = async (): Promise<WorkOrder[]> => {
  try {
    console.log("Attempting to sync work orders from CRM...");
    console.log("Using CRM sync URL:", CRM_SYNC_URL);
    
    // Use mock data if we're in development and there's no Supabase connection
    if (import.meta.env.DEV && (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder'))) {
      console.log("Using mock data for work orders in development environment");
      
      // Import mock data dynamically to avoid bundling it in production
      const { getWorkOrderMockData } = await import('../data/mockData');
      const mockWorkOrders = getWorkOrderMockData();
      
      toast({
        title: "Mock Sync Complete",
        description: `Using ${mockWorkOrders.length} mock work orders (development mode)`,
      });
      
      return mockWorkOrders;
    }
    
    // Since supabase client may not have functions property in the current setup
    // Use direct fetch to the edge function URL instead
    const response = await fetch(`${CRM_SYNC_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ action: 'sync-work-orders' })
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error response from sync work orders:", errorData);
      throw new Error(errorData.error || `Failed to sync work orders: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Successfully synced work orders:", data);
    
    toast({
      title: "Sync Complete",
      description: `Successfully synced ${data.workOrders?.length || 0} work orders from CRM`,
    });

    return data.workOrders?.map(mapWorkOrderFromDB) || [];
  } catch (error) {
    console.error("Error in syncWorkOrdersFromCRM:", error);
    
    // Provide more detailed error message
    let errorMessage = "Could not sync work orders due to a network error";
    if (error instanceof Error) {
      errorMessage = `Sync failed: ${error.message}`;
    }
    
    toast({
      title: "Sync Failed",
      description: errorMessage,
      variant: "destructive",
    });
    
    // Return empty array to prevent further issues
    return [];
  }
};

/**
 * Push a work order update back to the external CRM
 */
export const pushWorkOrderUpdateToCRM = async (workOrder: WorkOrder): Promise<boolean> => {
  try {
    console.log("Pushing work order update to CRM:", workOrder);
    
    // If we're in development with no Supabase, just simulate a successful update
    if (import.meta.env.DEV && (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder'))) {
      console.log("Development mode: Simulating successful work order update to CRM");
      
      toast({
        title: "Update Successful",
        description: "Work order was successfully updated (development mode)",
      });
      
      return true;
    }
    
    // Since supabase client may not have functions property in the current setup
    // Use direct fetch to the edge function URL instead
    const response = await fetch(`${CRM_SYNC_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ 
        action: 'push-update',
        type: 'work-order',
        payload: mapWorkOrderToDB(workOrder) 
      })
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error response from updating work order:", errorData);
      throw new Error(errorData.error || `Failed to update work order: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Successfully updated work order in CRM:", data);

    toast({
      title: "Update Successful",
      description: "Work order was successfully updated in CRM",
    });

    return true;
  } catch (error) {
    console.error("Error in pushWorkOrderUpdateToCRM:", error);
    
    // Provide more detailed error message
    let errorMessage = "Could not update work order due to a network error";
    if (error instanceof Error) {
      errorMessage = `Update failed: ${error.message}`;
    }
    
    toast({
      title: "Update Failed",
      description: errorMessage,
      variant: "destructive",
    });
    
    return false;
  }
};

/**
 * Push a technician update back to the external CRM
 */
export const pushTechnicianUpdateToCRM = async (technician: Technician): Promise<boolean> => {
  try {
    console.log("Pushing technician update to CRM:", technician);
    
    // If we're in development with no Supabase, just simulate a successful update
    if (import.meta.env.DEV && (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder'))) {
      console.log("Development mode: Simulating successful technician update to CRM");
      
      toast({
        title: "Update Successful",
        description: "Technician was successfully updated (development mode)",
      });
      
      return true;
    }
    
    // Map the technician to the format expected by the CRM
    const techForCRM = {
      id: technician.id,
      name: technician.name,
      status: technician.status,
      skills: technician.specialties,
      location: technician.currentLocation ? {
        address: technician.currentLocation.address,
        latitude: technician.currentLocation.lat,
        longitude: technician.currentLocation.lng
      } : undefined
    };

    // Since supabase client may not have functions property in the current setup
    // Use direct fetch to the edge function URL instead
    const response = await fetch(`${CRM_SYNC_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ 
        action: 'push-update',
        type: 'technician',
        payload: techForCRM
      })
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error response from updating technician:", errorData);
      throw new Error(errorData.error || `Failed to update technician: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Successfully updated technician in CRM:", data);

    toast({
      title: "Update Successful",
      description: "Technician was successfully updated in CRM",
    });

    return true;
  } catch (error) {
    console.error("Error in pushTechnicianUpdateToCRM:", error);
    
    // Provide more detailed error message
    let errorMessage = "Could not update technician due to a network error";
    if (error instanceof Error) {
      errorMessage = `Update failed: ${error.message}`;
    }
    
    toast({
      title: "Update Failed",
      description: errorMessage,
      variant: "destructive",
    });
    
    return false;
  }
};

// Utility functions to map between Supabase and our app's data structures
// These are copied from workOrderService.ts to maintain consistency

// Map the Supabase schema to our application types
const mapWorkOrderFromDB = (order: any): WorkOrder => {
  return {
    id: order.id,
    customerId: order.customer_id,
    customerName: order.customer_name,
    address: order.address,
    type: order.type,
    description: order.description,
    priority: order.priority,
    status: order.status,
    scheduledDate: order.scheduled_date,
    createdAt: order.created_at,
    completedDate: order.completed_date || undefined,
    estimatedHours: order.estimated_hours || undefined,
    technicianId: order.technician_id || undefined,
    technicianName: order.technician_name || undefined,
    notes: order.notes || undefined,
  };
};

// Map our application type to the Supabase schema
const mapWorkOrderToDB = (order: WorkOrder) => {
  return {
    id: order.id,
    customer_id: order.customerId,
    customer_name: order.customerName,
    address: order.address,
    type: order.type,
    description: order.description,
    priority: order.priority,
    status: order.status,
    scheduled_date: order.scheduledDate,
    created_at: order.createdAt,
    completed_date: order.completedDate || null,
    estimated_hours: order.estimatedHours || null,
    technician_id: order.technicianId || null,
    technician_name: order.technicianName || null,
    notes: order.notes || null,
  };
};
