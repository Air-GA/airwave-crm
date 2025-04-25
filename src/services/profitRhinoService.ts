
import { supabase } from "@/integrations/supabase/client";

export interface ProfitRhinoPart {
  id: string;
  part_number: string;
  description: string | null;
  category: string | null;
  manufacturer: string | null;
  model_number: string | null;
  list_price: number | null;
  cost: number | null;
}

export interface ProfitRhinoApiResponse {
  success: boolean;
  message?: string;
  data?: ProfitRhinoPart[];
  error?: string;
}

export const profitRhinoService = {
  async searchParts(query: string): Promise<ProfitRhinoApiResponse> {
    try {
      console.log(`Searching for Profit Rhino parts with query: "${query}"`);
      
      // Call our edge function to fetch parts from Profit Rhino API
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { query }
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      // Check if data is an array (search results) or a single object (part details)
      const partsData = Array.isArray(data) ? data : (data ? [data] : []);
      console.log(`Retrieved ${partsData.length} parts from API`);
      
      return {
        success: true,
        data: partsData as ProfitRhinoPart[]
      };
    } catch (error) {
      console.error('Error searching Profit Rhino parts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: []
      };
    }
  },

  async getPartDetails(partId: string): Promise<ProfitRhinoApiResponse> {
    try {
      console.log(`Fetching details for part ID: ${partId}`);
      
      // Call our edge function to fetch specific part details
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { partId }
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      // The response might already be a single part object, not an array
      const partData = Array.isArray(data) ? data[0] : data;
      
      if (!partData) {
        throw new Error('Part not found');
      }
      
      return {
        success: true,
        data: [partData] as ProfitRhinoPart[]
      };
    } catch (error) {
      console.error('Error getting Profit Rhino part details:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: []
      };
    }
  }
};
