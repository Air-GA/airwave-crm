
import { supabase } from "@/lib/supabase";
import { Customer } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const syncThreeCustomers = async (): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('sync-three-customers');
    
    if (error) {
      console.error("Error syncing three customers:", error);
      throw error;
    }
    
    if (!data || !data.data || !data.data.customers) {
      console.error("Invalid response from sync function:", data);
      throw new Error("Invalid response from sync function");
    }
    
    // Convert the database customers to our Customer type
    const customers = data.data.customers.map(dbCustomer => 
      supabase.formatDbToCustomer(dbCustomer)
    );
    
    return customers;
  } catch (error) {
    console.error("Error in syncThreeCustomers:", error);
    throw error;
  }
};
