
import { supabase } from '../lib/supabase';
import { WorkOrder, Technician } from '../types';
import { toast } from '@/components/ui/use-toast';

// Base URL for the Supabase Edge Function
const CRM_SYNC_URL = `${import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'}/functions/v1/crm-sync`;

/**
 * Fetch and sync technicians from the external CRM
 */
export const syncTechniciansFromCRM = async (): Promise<Technician[]> => {
  try {
    const { data: functionData, error: functionError } = await supabase.functions.invoke('crm-sync', {
      body: { action: 'sync-technicians' }
    });

    if (functionError) {
      console.error("Error syncing technicians:", functionError);
      toast({
        title: "Sync Failed",
        description: `Could not sync technicians: ${functionError.message}`,
        variant: "destructive",
      });
      return [];
    }

    toast({
      title: "Sync Complete",
      description: `Successfully synced ${functionData.technicians?.length || 0} technicians from CRM`,
    });

    return functionData.technicians || [];
  } catch (error) {
    console.error("Error in syncTechniciansFromCRM:", error);
    toast({
      title: "Sync Failed",
      description: "Could not sync technicians due to an unexpected error",
      variant: "destructive",
    });
    return [];
  }
};

/**
 * Fetch and sync work orders from the external CRM
 */
export const syncWorkOrdersFromCRM = async (): Promise<WorkOrder[]> => {
  try {
    const { data: functionData, error: functionError } = await supabase.functions.invoke('crm-sync', {
      body: { action: 'sync-work-orders' }
    });

    if (functionError) {
      console.error("Error syncing work orders:", functionError);
      toast({
        title: "Sync Failed",
        description: `Could not sync work orders: ${functionError.message}`,
        variant: "destructive",
      });
      return [];
    }

    toast({
      title: "Sync Complete",
      description: `Successfully synced ${functionData.workOrders?.length || 0} work orders from CRM`,
    });

    return functionData.workOrders?.map(mapWorkOrderFromDB) || [];
  } catch (error) {
    console.error("Error in syncWorkOrdersFromCRM:", error);
    toast({
      title: "Sync Failed",
      description: "Could not sync work orders due to an unexpected error",
      variant: "destructive",
    });
    return [];
  }
};

/**
 * Push a work order update back to the external CRM
 */
export const pushWorkOrderUpdateToCRM = async (workOrder: WorkOrder): Promise<boolean> => {
  try {
    const { data: functionData, error: functionError } = await supabase.functions.invoke('crm-sync', {
      body: { 
        action: 'push-update',
        type: 'work-order',
        payload: mapWorkOrderToDB(workOrder)
      }
    });

    if (functionError) {
      console.error("Error pushing work order update:", functionError);
      toast({
        title: "Update Failed",
        description: `Could not update work order in CRM: ${functionError.message}`,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Update Successful",
      description: "Work order was successfully updated in CRM",
    });

    return true;
  } catch (error) {
    console.error("Error in pushWorkOrderUpdateToCRM:", error);
    toast({
      title: "Update Failed",
      description: "Could not update work order in CRM due to an unexpected error",
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

    const { data: functionData, error: functionError } = await supabase.functions.invoke('crm-sync', {
      body: { 
        action: 'push-update',
        type: 'technician',
        payload: techForCRM
      }
    });

    if (functionError) {
      console.error("Error pushing technician update:", functionError);
      toast({
        title: "Update Failed",
        description: `Could not update technician in CRM: ${functionError.message}`,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Update Successful",
      description: "Technician was successfully updated in CRM",
    });

    return true;
  } catch (error) {
    console.error("Error in pushTechnicianUpdateToCRM:", error);
    toast({
      title: "Update Failed",
      description: "Could not update technician in CRM due to an unexpected error",
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
