
import { supabase } from "@/integrations/supabase/client";

export interface ProfitRhinoAuthResponse {
  status: boolean;
  message?: string;
  responseData?: {
    returnData: {
      token: string;
      companyName: string;
      userTypeId: number;
      // ... other auth fields as needed
    }
  }
}

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
  endpoint?: string;
  documentation?: string;
}

export const profitRhinoService = {
  async authenticate(credentials?: { username: string, password: string }): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { 
          action: 'authenticate', 
          payload: credentials || {
            username: 'your-username', // Will be configured in settings
            password: 'your-password',
            deviceType: 3 // Web
          }
        }
      });

      if (error || !data?.success) {
        console.error('Auth error:', error || data?.error);
        return null;
      }

      return data.token;
    } catch (err) {
      console.error('Error authenticating with Profit Rhino:', err);
      return null;
    }
  },

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
      if (response.endpoint) {
        console.log(`Successfully used endpoint: ${response.endpoint}`);
      }
      
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
