import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types";
import { workOrders as mockWorkOrders } from "@/data/mockData";
import { CACHE_DURATION, getLastFetchTime, resetCache, setCache, setLastFetchTime } from "./cacheService";
import { useWorkOrderStore } from "./workOrderStore";

// Export the store so it's available to components
export { useWorkOrderStore } from "./workOrderStore";

// Cache for work orders
let cachedWorkOrders: WorkOrder[] | null = null;

export const fetchWorkOrders = async (forceRefresh = false): Promise<WorkOrder[]> => {
  if (!forceRefresh && cachedWorkOrders && Date.now() - getLastFetchTime() < CACHE_DURATION) {
    console.log("Using cached work orders");
    return cachedWorkOrders;
  }

  try {
    console.log("Fetching work orders from Supabase...");
    const { data, error } = await supabase
      .from("work_orders")
      .select("*, customers(name), addresses!work_orders_address_id_fkey(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Error fetching work orders from Supabase:", error);
      throw error;
    }

    if (data && data.length > 0) {
      console.log(`Fetched ${data.length} work orders from Supabase`);
      
      const transformedData: WorkOrder[] = data.map(wo => {
        // Safely handle addresses, which might be null or have missing properties
        let formattedAddress = 'No address available';
        if (wo.addresses && typeof wo.addresses === 'object' && !Array.isArray(wo.addresses)) {
          try {
            // Use type assertion to bypass TypeScript's type checking for this object
            const address = wo.addresses as Record<string, any>;
            formattedAddress = `${address.street || ''}, ${address.city || ''}, ${address.state || ''} ${address.zip_code || ''}`.trim();
            // If we end up with just commas, use a default message
            if (formattedAddress.replace(/,/g, '').trim() === '') {
              formattedAddress = 'No address available';
            }
          } catch (err) {
            console.error("Error formatting address:", err);
          }
        }
          
        return {
          id: wo.id,
          customerId: wo.customer_id,
          customerName: wo.customers?.name || 'Unknown Customer',
          address: formattedAddress,
          status: 'pending' as WorkOrder['status'], // Default status
          priority: 'medium',
          type: 'repair',
          description: wo.description || '',
          scheduledDate: wo.scheduled_datetime || new Date().toISOString(),
          technicianId: wo.technician_id || undefined,
          technicianName: 'Assigned Technician',
          createdAt: wo.created_at,
          completedDate: undefined,
          estimatedHours: 1,
          notes: [],
          partsUsed: [],
          progressPercentage: 0,
          progressSteps: [],
          isMaintenancePlan: false,
          completionRequired: true
        };
      });
      
      cachedWorkOrders = transformedData;
      setLastFetchTime(Date.now());
      return transformedData;
    }

    console.log("No work orders found in Supabase, using mock data");
    cachedWorkOrders = mockWorkOrders;
    setLastFetchTime(Date.now());
    return mockWorkOrders;
  } catch (error) {
    console.error("Error fetching work orders:", error);
    console.log("Using mock work orders data due to error");
    cachedWorkOrders = mockWorkOrders;
    setLastFetchTime(Date.now());
    return mockWorkOrders;
  }
};

export const updateWorkOrder = async (workOrderId: string, updates: Partial<WorkOrder>): Promise<WorkOrder> => {
  try {
    console.log(`Updating work order ${workOrderId} in Supabase...`);
    
    // Map our WorkOrder fields to the Supabase table fields
    const supabaseWorkOrder = {
      description: updates.description,
      technician_id: updates.technicianId,
      // We'll store status in a custom field until we establish the proper mapping
      custom_status: updates.status,
      custom_completed_at: updates.completedDate
    };
    
    const { data, error } = await supabase
      .from("work_orders")
      .update(supabaseWorkOrder)
      .eq("id", workOrderId)
      .select()
      .single();

    if (error) {
      console.error("Error updating work order in Supabase:", error);
      throw error;
    }

    cachedWorkOrders = null;
    
    if (!data) {
      console.log("Work order updated but no data returned, using original work order");
      return { ...cachedWorkOrders?.find(wo => wo.id === workOrderId)!, ...updates };
    }
    
    return {
      ...cachedWorkOrders?.find(wo => wo.id === workOrderId)!,
      ...updates,
      technicianId: data.technician_id || undefined
    };
  } catch (error) {
    console.error("Error updating work order:", error);
    
    if (cachedWorkOrders) {
      cachedWorkOrders = cachedWorkOrders.map(wo => 
        wo.id === workOrderId ? { ...wo, ...updates } : wo
      );
    }
    
    return { ...cachedWorkOrders?.find(wo => wo.id === workOrderId)!, ...updates };
  }
};

export const assignTechnician = async (workOrderId: string, technicianId: string | null, technicianName?: string): Promise<boolean> => {
  try {
    console.log(`Assigning technician ${technicianId} to work order ${workOrderId} in Supabase...`);
    
    // Map to Supabase fields
    const updateData: any = {
      technician_id: technicianId,
      technician_name: technicianName,
      custom_status: technicianId ? 'scheduled' : 'pending'
    };
    
    const { error } = await supabase
      .from("work_orders")
      .update(updateData)
      .eq("id", workOrderId);

    if (error) {
      console.error("Error assigning technician in Supabase:", error);
      throw error;
    }

    cachedWorkOrders = null;
    
    return true;
  } catch (error) {
    console.error("Error assigning technician:", error);
    
    if (cachedWorkOrders) {
      cachedWorkOrders = cachedWorkOrders.map(wo => {
        if (wo.id === workOrderId) {
          return {
            ...wo,
            technicianId: technicianId || undefined,
            technicianName: technicianName || undefined,
            status: technicianId ? 'scheduled' : 'pending'
          };
        }
        return wo;
      });
    }
    
    return true;
  }
};

export const completeWorkOrder = async (workOrderId: string): Promise<boolean> => {
  try {
    console.log(`Marking work order ${workOrderId} as completed in Supabase...`);
    
    // Map to Supabase fields
    const updateData: any = {
      custom_status: 'completed', 
      custom_completed_date: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from("work_orders")
      .update(updateData)
      .eq("id", workOrderId);

    if (error) {
      console.error("Error completing work order in Supabase:", error);
      throw error;
    }

    cachedWorkOrders = null;
    
    return true;
  } catch (error) {
    console.error("Error completing work order:", error);
    
    if (cachedWorkOrders) {
      cachedWorkOrders = cachedWorkOrders.map(wo => {
        if (wo.id === workOrderId) {
          return {
            ...wo,
            status: 'completed',
            completedDate: new Date().toISOString()
          };
        }
        return wo;
      });
    }
    
    return true;
  }
};

export const cancelWorkOrder = async (workOrderId: string): Promise<boolean> => {
  try {
    console.log(`Cancelling work order ${workOrderId} in Supabase...`);
    
    // Map to Supabase fields
    const updateData: any = {
      custom_status: 'cancelled'
    };
    
    const { error } = await supabase
      .from("work_orders")
      .update(updateData)
      .eq("id", workOrderId);

    if (error) {
      console.error("Error cancelling work order in Supabase:", error);
      throw error;
    }

    cachedWorkOrders = null;
    
    return true;
  } catch (error) {
    console.error("Error cancelling work order:", error);
    
    if (cachedWorkOrders) {
      cachedWorkOrders = cachedWorkOrders.map(wo => {
        if (wo.id === workOrderId) {
          return {
            ...wo,
            status: 'cancelled'
          };
        }
        return wo;
      });
    }
    
    return true;
  }
};

// Re-export functions from workOrderUtils
export {
  createWorkOrder,
  createMaintenanceWorkOrder,
  rescheduleMaintenanceWorkOrder,
  assignWorkOrder,
  unassignWorkOrder,
  markOrderPendingCompletion
} from "./workOrderUtils";
