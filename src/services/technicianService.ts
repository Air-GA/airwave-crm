
import { supabase } from "@/integrations/supabase/client";
import { Technician } from "@/types";
import { technicians as mockTechnicians } from "@/data/mockData";
import { CACHE_DURATION, getLastFetchTime, setCache, setLastFetchTime } from "./cacheService";

// Cache for technicians
let cachedTechnicians: Technician[] | null = null;

export const fetchTechnicians = async (forceRefresh = false): Promise<Technician[]> => {
  if (!forceRefresh && cachedTechnicians && Date.now() - getLastFetchTime() < CACHE_DURATION) {
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
          currentLocation: {
            lat: Math.random() * 0.1 + 33.74,
            lng: Math.random() * 0.1 - 84.38,
            address: "Atlanta, GA"
          },
          createdAt: tech.created_at || new Date().toISOString()
        };
      });
      
      cachedTechnicians = transformedData;
      setLastFetchTime(Date.now());
      return transformedData;
    }

    console.log("No technicians found in Supabase, using mock data");
    // Add createdAt to mockTechnicians
    const mockTechniciansWithCreatedAt = mockTechnicians.map(tech => ({
      ...tech,
      createdAt: new Date().toISOString()
    })) as Technician[];
    
    cachedTechnicians = mockTechniciansWithCreatedAt;
    setLastFetchTime(Date.now());
    return mockTechniciansWithCreatedAt;
  } catch (error) {
    console.error("Error fetching technicians:", error);
    console.log("Using mock technicians data due to error");
    // Add createdAt to mockTechnicians
    const mockTechniciansWithCreatedAt = mockTechnicians.map(tech => ({
      ...tech,
      createdAt: new Date().toISOString()
    })) as Technician[];
    
    cachedTechnicians = mockTechniciansWithCreatedAt;
    setLastFetchTime(Date.now());
    return mockTechniciansWithCreatedAt;
  }
};
