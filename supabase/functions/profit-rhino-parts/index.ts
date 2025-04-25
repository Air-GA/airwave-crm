
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get API credentials from environment variables
    const apiKey = Deno.env.get('PROFIT_RHINO_API_KEY');
    const apiUrl = Deno.env.get('PROFIT_RHINO_API_URL') || 'https://secure.profitrhino.com/api/v2';
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Profit Rhino API credentials not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Parse the request body
    const requestData = await req.json();
    const { query, partId } = requestData;

    let endpoint;
    let queryParams = new URLSearchParams();

    // Determine which API endpoint to call
    if (partId) {
      endpoint = `${apiUrl}/pricebookexport/parts/${partId}`;
    } else {
      endpoint = `${apiUrl}/pricebookexport/parts`;
      if (query) {
        queryParams.append('search', query);
      }
      queryParams.append('limit', '50'); // Limit results
    }

    const finalUrl = `${endpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    console.log(`Calling Profit Rhino API: ${finalUrl}`);
    
    // Make the API request to Profit Rhino
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'X-HTTP-ProfitRhino-Service-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Profit Rhino API error:', response.status, errorText);
      
      // If API fails, fall back to database search
      if (response.status === 404 || response.status === 401) {
        console.log('Falling back to database search');
        const { data: dbParts, error: dbError } = await supabaseClient
          .from('profit_rhino_parts')
          .select('*')
          .ilike('part_number', query ? `%${query}%` : '%')
          .limit(50);

        if (dbError) throw dbError;
        
        return new Response(
          JSON.stringify(dbParts || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `API Error: ${response.status} ${errorText}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }

    // Parse and transform the API response
    const apiResponse = await response.json();
    
    // Check if response has the expected format
    let formattedData;
    
    // Handle the new response structure
    if (apiResponse.responseData && Array.isArray(apiResponse.responseData.data)) {
      // New API format with responseData wrapper
      formattedData = apiResponse.responseData.data.map(part => ({
        id: part.id || '',
        part_number: part.partNumber || part.sku || '',
        description: part.description || part.name || '',
        category: part.category || '',
        manufacturer: part.manufacturer || '',
        model_number: part.modelNumber || '',
        list_price: part.listPrice || part.price || 0,
        cost: part.cost || 0,
      }));
    } else if (partId && apiResponse.responseData) {
      // Single part with responseData wrapper
      const part = apiResponse.responseData;
      formattedData = {
        id: part.id || partId,
        part_number: part.partNumber || part.sku || '',
        description: part.description || part.name || '',
        category: part.category || '',
        manufacturer: part.manufacturer || '',
        model_number: part.modelNumber || '',
        list_price: part.listPrice || part.price || 0,
        cost: part.cost || 0,
      };
    } else if (Array.isArray(apiResponse)) {
      // Original API format - direct array
      formattedData = apiResponse.map(part => ({
        id: part.id || '',
        part_number: part.part_number || part.partNumber || part.sku || '',
        description: part.description || part.name || '',
        category: part.category || '',
        manufacturer: part.manufacturer || '',
        model_number: part.model_number || part.modelNumber || '',
        list_price: part.list_price || part.listPrice || part.price || 0,
        cost: part.cost || 0,
      }));
    } else if (partId) {
      // Single part - original format
      formattedData = {
        id: apiResponse.id || partId,
        part_number: apiResponse.part_number || apiResponse.partNumber || apiResponse.sku || '',
        description: apiResponse.description || apiResponse.name || '',
        category: apiResponse.category || '',
        manufacturer: apiResponse.manufacturer || '',
        model_number: apiResponse.model_number || apiResponse.modelNumber || '',
        list_price: apiResponse.list_price || apiResponse.listPrice || apiResponse.price || 0,
        cost: apiResponse.cost || 0,
      };
    } else if (apiResponse.responseData && apiResponse.responseData.fileUrl) {
      // This is a response with a file URL, which isn't what we need for direct parts search
      console.log('Received file URL response instead of parts data:', apiResponse.responseData.fileUrl);
      
      // Fall back to database search
      console.log('Falling back to database search');
      const { data: dbParts, error: dbError } = await supabaseClient
        .from('profit_rhino_parts')
        .select('*')
        .ilike('part_number', query ? `%${query}%` : '%')
        .limit(50);

      if (dbError) throw dbError;
      
      formattedData = dbParts || [];
    } else {
      // Empty or unrecognized format
      console.log('Unrecognized API response format:', JSON.stringify(apiResponse));
      formattedData = [];
    }

    return new Response(
      JSON.stringify(formattedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
