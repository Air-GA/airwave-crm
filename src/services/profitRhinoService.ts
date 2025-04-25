
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
      // Call our edge function to fetch parts from Profit Rhino API
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { query }
      });
      
      if (error) throw error;
      
      return {
        success: true,
        data: data as ProfitRhinoPart[]
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
      // Call our edge function to fetch specific part details
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { partId }
      });
      
      if (error) throw error;
      
      return {
        success: true,
        data: [data] as ProfitRhinoPart[]
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
