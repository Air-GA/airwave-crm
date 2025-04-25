
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
      
      if (!query || query.trim() === '') {
        return {
          success: true,
          message: "Please enter a search term",
          data: []
        };
      }
      
      // Call our edge function to fetch parts from Profit Rhino API
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { query }
      });
      
      if (error) {
        console.error('Error calling Profit Rhino API:', error);
        throw error;
      }
      
      // API should return a response with success, data, and potentially error fields
      const response = data as ProfitRhinoApiResponse;
      
      if (!response.success) {
        console.error('API returned error:', response.error);
        return response;  // Return the error response directly
      }
      
      console.log(`Retrieved ${response.data?.length || 0} parts from API`);
      return response;  // Return the successful response
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
        console.error('Error fetching part details:', error);
        throw error;
      }
      
      // API should return a response with success, data, and potentially error fields
      const response = data as ProfitRhinoApiResponse;
      
      if (!response.success) {
        console.error('API returned error:', response.error);
        return response;
      }
      
      console.log(`Retrieved part details successfully`);
      return response;
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
