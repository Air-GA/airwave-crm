
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Technician, Customer } from "@/types";
import { workOrders as mockWorkOrders, technicians as mockTechnicians } from "@/data/mockData";

let cachedWorkOrders: WorkOrder[] | null = null;
let cachedTechnicians: Technician[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

export const fetchWorkOrders = async (forceRefresh = false): Promise<WorkOrder[]> => {
  if (!forceRefresh && cachedWorkOrders && Date.now() - lastFetchTime < CACHE_DURATION) {
    console.log("Using cached work orders");
    return cachedWorkOrders;
  }

  try {
    console.log("Fetching work orders from Supabase...");
    const { data, error } = await supabase
      .from("work_orders")
      .select("*, customers(name), addresses(street, city, state, zip_code)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching work orders from Supabase:", error);
      throw error;
    }

    if (data && data.length > 0) {
      console.log(`Fetched ${data.length} work orders from Supabase`);
      
      const transformedData: WorkOrder[] = data.map(wo => {
        const addressObj = wo.addresses;
        const formattedAddress = addressObj 
          ? `${addressObj.street}, ${addressObj.city}, ${addressObj.state} ${addressObj.zip_code}`
          : 'No address available';
          
        return {
          id: wo.id,
          customerId: wo.customer_id,
          customerName: wo.customers?.name || 'Unknown Customer',
          address: formattedAddress,
          status: wo.status as WorkOrder['status'],
          priority: 'medium',
          type: 'repair',
          description: wo.description || '',
          scheduledDate: new Date().toISOString(),
          technicianId: wo.technician_id || undefined,
          technicianName: 'Assigned Technician',
          createdAt: wo.created_at,
          completedDate: wo.completed_at || undefined,
          estimatedHours: 1,
          notes: []
        };
      });
      
      cachedWorkOrders = transformedData;
      lastFetchTime = Date.now();
      return transformedData;
    }

    console.log("No work orders found in Supabase, using mock data");
    cachedWorkOrders = mockWorkOrders;
    lastFetchTime = Date.now();
    return mockWorkOrders;
  } catch (error) {
    console.error("Error fetching work orders:", error);
    console.log("Using mock work orders data due to error");
    cachedWorkOrders = mockWorkOrders;
    lastFetchTime = Date.now();
    return mockWorkOrders;
  }
};

export const fetchTechnicians = async (forceRefresh = false): Promise<Technician[]> => {
  if (!forceRefresh && cachedTechnicians && Date.now() - lastFetchTime < CACHE_DURATION) {
    console.log("Using cached technicians");
    return cachedTechnicians;
  }

  try {
    console.log("Fetching technicians from Supabase...");
    const { data, error } = await supabase
      .from("technicians")
      .select("*, users(first_name, last_name)")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching technicians from Supabase:", error);
      throw error;
    }

    if (data && data.length > 0) {
      console.log(`Fetched ${data.length} technicians from Supabase`);
      
      const transformedData: Technician[] = data.map(tech => {
        const fullName = tech.users 
          ? `${tech.users.first_name || ''} ${tech.users.last_name || ''}`.trim()
          : `Technician ${tech.id.substring(0, 4)}`;
          
        return {
          id: tech.id,
          name: fullName,
          status: (tech.availability_status === 'available' ? 'available' : 
                 tech.availability_status === 'busy' ? 'busy' : 'off-duty') as Technician['status'],
          specialties: tech.specialty ? [tech.specialty] : [],
          email: `${fullName.toLowerCase().replace(/\s+/g, '.')}@airga.com`,
          phone: `404-555-${Math.floor(1000 + Math.random() * 9000)}`,
          currentLocation: undefined
        };
      });
      
      cachedTechnicians = transformedData;
      lastFetchTime = Date.now();
      return transformedData;
    }

    console.log("No technicians found in Supabase, using mock data");
    cachedTechnicians = mockTechnicians;
    lastFetchTime = Date.now();
    return mockTechnicians;
  } catch (error) {
    console.error("Error fetching technicians:", error);
    console.log("Using mock technicians data due to error");
    cachedTechnicians = mockTechnicians;
    lastFetchTime = Date.now();
    return mockTechnicians;
  }
};

export const updateWorkOrder = async (workOrder: WorkOrder): Promise<WorkOrder> => {
  try {
    console.log(`Updating work order ${workOrder.id} in Supabase...`);
    
    const { data, error } = await supabase
      .from("work_orders")
      .update({
        status: workOrder.status,
        description: workOrder.description,
        technician_id: workOrder.technicianId,
        completed_at: workOrder.completedDate,
        resolution: workOrder.notes?.join('\n') || null
      })
      .eq("id", workOrder.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating work order in Supabase:", error);
      throw error;
    }

    cachedWorkOrders = null;
    
    if (!data) {
      console.log("Work order updated but no data returned, using original work order");
      return workOrder;
    }
    
    return {
      ...workOrder,
      status: data.status as WorkOrder['status'],
      completedDate: data.completed_at || undefined,
      technicianId: data.technician_id || undefined
    };
  } catch (error) {
    console.error("Error updating work order:", error);
    
    if (cachedWorkOrders) {
      cachedWorkOrders = cachedWorkOrders.map(wo => 
        wo.id === workOrder.id ? workOrder : wo
      );
    }
    
    return workOrder;
  }
};

export const assignTechnician = async (workOrderId: string, technicianId: string | null, technicianName?: string): Promise<boolean> => {
  try {
    console.log(`Assigning technician ${technicianId} to work order ${workOrderId} in Supabase...`);
    
    const updateData: any = {
      technician_id: technicianId,
      technician_name: technicianName,
      status: technicianId ? 'scheduled' : 'pending'
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
    
    const { error } = await supabase
      .from("work_orders")
      .update({
        status: 'completed',
        completed_date: new Date().toISOString()
      })
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
    
    const { error } = await supabase
      .from("work_orders")
      .update({
        status: 'cancelled'
      })
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

export const refreshAllData = () => {
  cachedWorkOrders = null;
  cachedTechnicians = null;
  lastFetchTime = 0;
};
