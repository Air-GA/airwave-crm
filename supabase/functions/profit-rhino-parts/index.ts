
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
      endpoint = `${apiUrl}/parts/${partId}`;
    } else {
      endpoint = `${apiUrl}/parts`;
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
        'Authorization': `Bearer ${apiKey}`,
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
    
    // Map the Profit Rhino response to our expected format
    let formattedData;
    
    if (partId) {
      // Single part response
      formattedData = {
        id: apiResponse.id || partId,
        part_number: apiResponse.part_number || apiResponse.sku || '',
        description: apiResponse.description || apiResponse.name || '',
        category: apiResponse.category || '',
        manufacturer: apiResponse.manufacturer || '',
        model_number: apiResponse.model_number || '',
        list_price: apiResponse.list_price || apiResponse.price || 0,
        cost: apiResponse.cost || 0,
      };
    } else {
      // List of parts
      formattedData = Array.isArray(apiResponse) ? apiResponse.map(part => ({
        id: part.id || '',
        part_number: part.part_number || part.sku || '',
        description: part.description || part.name || '',
        category: part.category || '',
        manufacturer: part.manufacturer || '',
        model_number: part.model_number || '',
        list_price: part.list_price || part.price || 0,
        cost: part.cost || 0,
      })) : [];
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
