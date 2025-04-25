import { supabase } from "@/integrations/supabase/client";
import { BusinessInformation, LaborType, PartsType, InvoiceType } from "@/types/profitRhino";
import { 
  ContentUpdateResponse, 
  ContentUpdateTasksResponse,
  ContentUpdatePartsResponse,
  TaskDetail,
  TaskCompareResponse,
  PartDetail,
  PartCompareResponse,
  CategoryTree
} from "@/types/profitRhinoContent";

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
  },

  async getBusinessInformation(id: number): Promise<BusinessInformation | null> {
    try {
      console.log(`Fetching business information for ID: ${id}`);
      
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { 
          action: 'getBusinessInfo',
          businessId: id
        }
      });
      
      if (error || !data?.success) {
        console.error('Error fetching business info:', error || data?.error);
        return null;
      }
      
      return data.responseData as BusinessInformation;
    } catch (err) {
      console.error('Error in getBusinessInformation:', err);
      return null;
    }
  },

  async copyBusinessInformation(id: number): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { 
          action: 'copyBusinessInfo',
          businessId: id
        }
      });
      
      if (error || !data?.success) {
        console.error('Error copying business info:', error || data?.error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error in copyBusinessInformation:', err);
      return false;
    }
  },

  async setTaskTimeToWrenchTime(id: number): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { 
          action: 'setTaskTimeToWrenchTime',
          businessId: id
        }
      });
      
      if (error || !data?.success) {
        console.error('Error setting task time:', error || data?.error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error in setTaskTimeToWrenchTime:', err);
      return false;
    }
  },

  async saveAndRecalculateBusinessType(id: number, businessInfo: Partial<BusinessInformation>): Promise<BusinessInformation | null> {
    try {
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { 
          action: 'saveAndRecalculate',
          businessId: id,
          businessInfo
        }
      });
      
      if (error || !data?.success) {
        console.error('Error saving business info:', error || data?.error);
        return null;
      }
      
      return data.responseData as BusinessInformation;
    } catch (err) {
      console.error('Error in saveAndRecalculateBusinessType:', err);
      return null;
    }
  },

  async getContentUpdateInfo(): Promise<ContentUpdateResponse | null> {
    try {
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { 
          action: 'getContentUpdateInfo'
        }
      });
      
      if (error || !data?.success) {
        console.error('Error fetching content update info:', error || data?.error);
        return null;
      }
      
      return data.responseData as ContentUpdateResponse;
    } catch (err) {
      console.error('Error in getContentUpdateInfo:', err);
      return null;
    }
  },

  async createContentUpdate(revisionCompanyId: number, startFieldEdgeSync: boolean = true, generateSqlLiteFile: boolean = true): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { 
          action: 'createContentUpdate',
          revisionCompanyId,
          startFieldEdgeSync,
          generateSqlLiteFile
        }
      });
      
      if (error || !data?.success) {
        console.error('Error creating content update:', error || data?.error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error in createContentUpdate:', err);
      return false;
    }
  },

  async getContentUpdateTasks(updateId: number, searchText?: string): Promise<ContentUpdateTasksResponse | null> {
    try {
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { 
          action: 'getContentUpdateTasks',
          updateId,
          searchText
        }
      });
      
      if (error || !data?.success) {
        console.error('Error fetching content update tasks:', error || data?.error);
        return null;
      }
      
      return data.responseData as ContentUpdateTasksResponse;
    } catch (err) {
      console.error('Error in getContentUpdateTasks:', err);
      return null;
    }
  },

  async getContentUpdateParts(updateId: number, searchText?: string): Promise<ContentUpdatePartsResponse | null> {
    try {
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { 
          action: 'getContentUpdateParts',
          updateId,
          searchText
        }
      });
      
      if (error || !data?.success) {
        console.error('Error fetching content update parts:', error || data?.error);
        return null;
      }
      
      return data.responseData as ContentUpdatePartsResponse;
    } catch (err) {
      console.error('Error in getContentUpdateParts:', err);
      return null;
    }
  },

  async resetTask(taskId: number): Promise<TaskDetail | null> {
    try {
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { 
          action: 'resetTask',
          taskId
        }
      });
      
      if (error || !data?.success) {
        console.error('Error resetting task:', error || data?.error);
        return null;
      }
      
      return data.responseData as TaskDetail;
    } catch (err) {
      console.error('Error in resetTask:', err);
      return null;
    }
  },

  async copyTaskField(taskId: number, fieldName: string): Promise<TaskDetail | null> {
    try {
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { 
          action: 'copyTaskField',
          taskId,
          fieldName
        }
      });
      
      if (error || !data?.success) {
        console.error('Error copying task field:', error || data?.error);
        return null;
      }
      
      return data.responseData as TaskDetail;
    } catch (err) {
      console.error('Error in copyTaskField:', err);
      return null;
    }
  },

  async compareTask(taskId: number): Promise<TaskCompareResponse | null> {
    try {
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { 
          action: 'compareTask',
          taskId
        }
      });
      
      if (error || !data?.success) {
        console.error('Error comparing task:', error || data?.error);
        return null;
      }
      
      return data.responseData as TaskCompareResponse;
    } catch (err) {
      console.error('Error in compareTask:', err);
      return null;
    }
  },

  async comparePart(partId: number): Promise<PartCompareResponse | null> {
    try {
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { 
          action: 'comparePart',
          partId
        }
      });
      
      if (error || !data?.success) {
        console.error('Error comparing part:', error || data?.error);
        return null;
      }
      
      return data.responseData as PartCompareResponse;
    } catch (err) {
      console.error('Error in comparePart:', err);
      return null;
    }
  },

  async getLicenseTask(taskId: number): Promise<TaskDetail | null> {
    try {
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { 
          action: 'getLicenseTask',
          taskId
        }
      });
      
      if (error || !data?.success) {
        console.error('Error getting license task:', error || data?.error);
        return null;
      }
      
      return data.responseData as TaskDetail;
    } catch (err) {
      console.error('Error in getLicenseTask:', err);
      return null;
    }
  },

  async getLicensePart(partId: number): Promise<PartDetail | null> {
    try {
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { 
          action: 'getLicensePart',
          partId
        }
      });
      
      if (error || !data?.success) {
        console.error('Error getting license part:', error || data?.error);
        return null;
      }
      
      return data.responseData as PartDetail;
    } catch (err) {
      console.error('Error in getLicensePart:', err);
      return null;
    }
  },

  async moveCategory(sourceId: number, destinationId: number, index: number): Promise<CategoryTree | null> {
    try {
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { 
          action: 'moveCategory',
          sourceId,
          destinationId,
          index
        }
      });
      
      if (error || !data?.success) {
        console.error('Error moving category:', error || data?.error);
        return null;
      }
      
      return data.responseData as CategoryTree;
    } catch (err) {
      console.error('Error in moveCategory:', err);
      return null;
    }
  },

  async moveTaskAssignment(assignmentId: number, destinationCategoryId: number, index: number): Promise<CategoryTree | null> {
    try {
      const { data, error } = await supabase.functions.invoke('profit-rhino-parts', {
        body: { 
          action: 'moveTaskAssignment',
          assignmentId,
          destinationCategoryId,
          index
        }
      });
      
      if (error || !data?.success) {
        console.error('Error moving task assignment:', error || data?.error);
        return null;
      }
      
      return data.responseData as CategoryTree;
    } catch (err) {
      console.error('Error in moveTaskAssignment:', err);
      return null;
    }
  }
};
