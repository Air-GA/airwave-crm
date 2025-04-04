
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

// CORS headers to allow cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration for your existing CRM API
const CRM_API_BASE_URL = Deno.env.get("CRM_API_BASE_URL") || "";
const CRM_API_KEY = Deno.env.get("CRM_API_KEY") || "";

// Utility function to call your existing CRM API
async function callCrmApi(endpoint: string, method = "GET", body?: any) {
  try {
    console.log(`Calling CRM API: ${CRM_API_BASE_URL}${endpoint}`);
    
    // In development or when CRM isn't configured, use mock data
    if (!CRM_API_BASE_URL || !CRM_API_KEY) {
      console.log("No CRM API configuration found, returning mock data");
      return getMockData(endpoint);
    }
    
    const response = await fetch(`${CRM_API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CRM_API_KEY}`
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => "No error details");
      throw new Error(`CRM API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error calling CRM API:", error);
    throw error;
  }
}

// Function to provide mock data when CRM API is not available
function getMockData(endpoint: string) {
  console.log(`Generating mock data for endpoint: ${endpoint}`);
  
  if (endpoint === "/technicians") {
    return [
      {
        id: "tech-001",
        name: "John Smith",
        status: "available",
        skills: ["HVAC", "Plumbing", "Electrical"],
        location: {
          address: "123 Main St, City, State",
          latitude: 37.7749,
          longitude: -122.4194
        }
      },
      {
        id: "tech-002",
        name: "Alice Johnson",
        status: "busy",
        skills: ["Plumbing", "Carpentry"],
        location: {
          address: "456 Oak Ave, Town, State",
          latitude: 37.7748,
          longitude: -122.4208
        }
      },
      {
        id: "tech-003",
        name: "Bob Williams",
        status: "off-duty",
        skills: ["Electrical", "Security Systems"],
        location: null
      }
    ];
  } else if (endpoint === "/work-orders") {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return [
      {
        id: "wo-001",
        customerId: "cust-001",
        customerName: "Sarah Parker",
        address: "789 Pine St, City, State",
        type: "repair",
        description: "Air conditioner not cooling",
        priority: "high",
        status: "scheduled",
        scheduledDate: today.toISOString(),
        createdAt: yesterday.toISOString(),
        technicianId: "tech-001",
        technicianName: "John Smith",
        estimatedHours: 2
      },
      {
        id: "wo-002",
        customerId: "cust-002",
        customerName: "Michael Brown",
        address: "101 Elm St, City, State",
        type: "maintenance",
        description: "Annual HVAC maintenance",
        priority: "medium",
        status: "pending",
        scheduledDate: tomorrow.toISOString(),
        createdAt: yesterday.toISOString(),
        estimatedHours: 1.5
      },
      {
        id: "wo-003",
        customerId: "cust-003",
        customerName: "Emily Davis",
        address: "202 Cedar Ave, City, State",
        type: "installation",
        description: "Install new water heater",
        priority: "medium",
        status: "in-progress",
        scheduledDate: today.toISOString(),
        createdAt: yesterday.toISOString(),
        completedDate: null,
        technicianId: "tech-002",
        technicianName: "Alice Johnson",
        estimatedHours: 3
      }
    ];
  }
  
  // Default empty response
  return [];
}

// Handler for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("CRM sync function called:", req.url);
    
    const body = req.method !== "GET" ? await req.json() : undefined;
    console.log("Request body:", body);
    
    if (!body || !body.action) {
      return new Response(
        JSON.stringify({ error: "Invalid request, action parameter is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;
    
    // Route to different sync functions based on the action parameter
    switch (body.action) {
      case "sync-technicians":
        result = await syncTechnicians();
        break;
      case "sync-work-orders":
        result = await syncWorkOrders();
        break;
      case "push-update":
        result = await pushUpdate(body);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Invalid action specified: ${body.action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in CRM sync:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Function to sync technicians from your CRM to Supabase
async function syncTechnicians() {
  console.log("Syncing technicians from CRM");
  
  try {
    // 1. Fetch technicians from your CRM
    const crmTechnicians = await callCrmApi("/technicians");
    console.log(`Retrieved ${crmTechnicians.length} technicians from CRM`);
    
    // 2. Map CRM technician data to your Supabase schema
    const mappedTechnicians = crmTechnicians.map((tech: any) => ({
      id: tech.id || crypto.randomUUID(),
      name: tech.name,
      status: mapStatus(tech.status),
      specialties: tech.skills || [],
      current_location_address: tech.location?.address,
      current_location_lat: tech.location?.latitude,
      current_location_lng: tech.location?.longitude,
      created_at: new Date().toISOString()
    }));
    
    // 3. Upsert technicians into Supabase
    const { data, error } = await supabase
      .from("technicians")
      .upsert(mappedTechnicians, { 
        onConflict: "id",
        ignoreDuplicates: false 
      });
    
    if (error) throw error;
    
    return { 
      status: "success", 
      message: `Synchronized ${mappedTechnicians.length} technicians`,
      technicians: mappedTechnicians
    };
    
  } catch (error) {
    console.error("Error syncing technicians:", error);
    throw new Error(`Failed to sync technicians: ${error.message}`);
  }
}

// Function to sync work orders from your CRM to Supabase
async function syncWorkOrders() {
  console.log("Syncing work orders from CRM");
  
  try {
    // 1. Fetch work orders from your CRM
    const crmWorkOrders = await callCrmApi("/work-orders");
    console.log(`Retrieved ${crmWorkOrders.length} work orders from CRM`);
    
    // 2. Map CRM work order data to your Supabase schema
    const mappedWorkOrders = crmWorkOrders.map((order: any) => ({
      id: order.id || crypto.randomUUID(),
      customer_id: order.customerId,
      customer_name: order.customerName,
      address: order.address,
      type: mapOrderType(order.type),
      description: order.description,
      priority: mapPriority(order.priority),
      status: mapOrderStatus(order.status),
      scheduled_date: order.scheduledDate,
      created_at: order.createdAt || new Date().toISOString(),
      completed_date: order.completedDate || null,
      estimated_hours: order.estimatedHours,
      technician_id: order.technicianId,
      technician_name: order.technicianName,
      notes: order.notes || []
    }));
    
    // 3. Upsert work orders into Supabase
    const { data, error } = await supabase
      .from("work_orders")
      .upsert(mappedWorkOrders, { 
        onConflict: "id",
        ignoreDuplicates: false 
      });
    
    if (error) throw error;
    
    return { 
      status: "success", 
      message: `Synchronized ${mappedWorkOrders.length} work orders`,
      workOrders: mappedWorkOrders
    };
    
  } catch (error) {
    console.error("Error syncing work orders:", error);
    throw new Error(`Failed to sync work orders: ${error.message}`);
  }
}

// Function to push updates back to your CRM
async function pushUpdate(data: any) {
  if (!data || !data.type || !data.payload) {
    throw new Error("Invalid update data. Required fields: type, payload");
  }
  
  console.log(`Pushing update to CRM: ${data.type}`);
  
  try {
    let endpoint = "";
    let method = "PUT";
    
    // Determine which CRM endpoint to call based on the update type
    switch (data.type) {
      case "work-order":
        endpoint = `/work-orders/${data.payload.id}`;
        break;
      case "technician":
        endpoint = `/technicians/${data.payload.id}`;
        break;
      default:
        throw new Error(`Unsupported update type: ${data.type}`);
    }
    
    // Call CRM API to update the resource
    const result = await callCrmApi(endpoint, method, data.payload);
    
    return { 
      status: "success", 
      message: `Successfully updated ${data.type} in CRM`,
      result 
    };
    
  } catch (error) {
    console.error("Error pushing update to CRM:", error);
    throw new Error(`Failed to push update to CRM: ${error.message}`);
  }
}

// Helper functions to map between CRM and Supabase schemas
function mapStatus(crmStatus: string): 'available' | 'busy' | 'off-duty' {
  if (!crmStatus) return 'off-duty';
  
  const statusMap: Record<string, 'available' | 'busy' | 'off-duty'> = {
    'available': 'available',
    'active': 'available',
    'free': 'available',
    'busy': 'busy',
    'occupied': 'busy',
    'working': 'busy',
    'off': 'off-duty',
    'offline': 'off-duty',
    'unavailable': 'off-duty'
  };
  
  return statusMap[crmStatus.toLowerCase()] || 'off-duty';
}

function mapOrderType(crmType: string): 'repair' | 'maintenance' | 'installation' | 'inspection' {
  if (!crmType) return 'maintenance';
  
  const typeMap: Record<string, 'repair' | 'maintenance' | 'installation' | 'inspection'> = {
    'repair': 'repair',
    'fix': 'repair',
    'maintenance': 'maintenance',
    'service': 'maintenance',
    'install': 'installation',
    'installation': 'installation',
    'inspect': 'inspection',
    'inspection': 'inspection',
    'check': 'inspection'
  };
  
  return typeMap[crmType.toLowerCase()] || 'maintenance';
}

function mapPriority(crmPriority: string): 'low' | 'medium' | 'high' | 'emergency' {
  if (!crmPriority) return 'medium';
  
  const priorityMap: Record<string, 'low' | 'medium' | 'high' | 'emergency'> = {
    'low': 'low',
    'normal': 'medium',
    'medium': 'medium',
    'high': 'high',
    'urgent': 'high',
    'emergency': 'emergency',
    'critical': 'emergency'
  };
  
  return priorityMap[crmPriority.toLowerCase()] || 'medium';
}

function mapOrderStatus(crmStatus: string): 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled' {
  if (!crmStatus) return 'pending';
  
  const statusMap: Record<string, 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled'> = {
    'pending': 'pending',
    'new': 'pending',
    'scheduled': 'scheduled',
    'assigned': 'scheduled',
    'in-progress': 'in-progress',
    'working': 'in-progress',
    'completed': 'completed',
    'done': 'completed',
    'finished': 'completed',
    'cancelled': 'cancelled',
    'canceled': 'cancelled'
  };
  
  return statusMap[crmStatus.toLowerCase()] || 'pending';
}
