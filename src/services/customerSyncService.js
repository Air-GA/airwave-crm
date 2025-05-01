
import { supabase } from "@/lib/supabase";

// Static customer data as a fallback
export const getStaticCustomers = () => {
  return [
    {
      id: 'c1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '404-555-1234',
      address: '123 Main St, Atlanta, GA 30301',
      billAddress: '123 Main St, Atlanta, GA 30301',
      serviceAddresses: [
        {
          id: 'addr-1',
          address: '123 Main St, Atlanta, GA 30301',
          isPrimary: true,
          notes: 'Primary residence'
        }
      ],
      type: 'residential',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'c2',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '404-555-3456',
      address: '456 Oak Dr, Marietta, GA 30060',
      billAddress: '456 Oak Dr, Marietta, GA 30060',
      serviceAddresses: [
        {
          id: 'addr-4',
          address: '456 Oak Dr, Marietta, GA 30060',
          isPrimary: true,
          notes: 'Home address'
        }
      ],
      type: 'residential',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'c3',
      name: 'Thomas Family',
      email: 'thomasfamily@outlook.com',
      phone: '770-555-7890',
      address: '789 Pine Road, Alpharetta, GA',
      billAddress: '789 Pine Road, Alpharetta, GA',
      serviceAddresses: [
        {
          id: 'addr-5',
          address: '789 Pine Road, Alpharetta, GA',
          isPrimary: true,
          notes: 'Beware of dog'
        }
      ],
      type: 'residential',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ];
};

// Function to sync three customers
export const syncThreeCustomers = async () => {
  try {
    console.log("Starting to sync three residential sample customers...");
    
    const customers = getStaticCustomers();
    
    for (const customer of customers) {
      // Format the customer data for database insertion
      const customerData = {
        id: customer.id,
        name: customer.name,
        email: customer.email || null,
        phone: customer.phone || null,
        address: customer.address || null,
        bill_address: customer.billAddress || null,
        type: customer.type || 'residential',
        created_at: customer.createdAt,
        status: customer.status || 'active'
      };
      
      // Insert customer data
      const { error: customerError } = await supabase
        .from('customers')
        .upsert(customerData, { onConflict: 'id' });
      
      if (customerError) {
        console.error("Error inserting customer:", customerError);
        throw new Error(`Failed to insert customer ${customer.name}: ${customerError.message}`);
      }
      
      // Add service addresses if provided
      if (customer.serviceAddresses && customer.serviceAddresses.length > 0) {
        for (const addr of customer.serviceAddresses) {
          const addressData = {
            customer_id: customer.id,
            address: addr.address,
            is_primary: addr.isPrimary || false,
            notes: addr.notes || null
          };
          
          // Use the service_addresses table if it exists
          const { error: addressError } = await supabase
            .from('service_addresses')
            .upsert(addressData, { onConflict: 'customer_id, address' });
          
          if (addressError) {
            console.warn("Error inserting service address:", addressError);
            // Don't throw here, just log warning
          }
        }
      }
      
      console.log(`Customer ${customer.name} synced successfully`);
    }
    
    return customers;
  } catch (error) {
    console.error("Error in syncThreeCustomers:", error);
    throw error;
  }
};
