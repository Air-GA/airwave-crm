
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('PROFIT_RHINO_API_KEY');
    const apiUrl = Deno.env.get('PROFIT_RHINO_API_URL') || 'https://secure.profitrhino.com/api/v2';
    
    if (!apiKey) {
      console.error('Profit Rhino API key not configured');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Profit Rhino API credentials not configured' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Parse the request body to get the search query or part ID
    let searchQuery = '';
    let partId = '';
    try {
      if (req.body) {
        const body = await req.json();
        searchQuery = body.query || '';
        partId = body.partId || '';
      }
    } catch (e) {
      console.error('Error parsing request body:', e);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid request body' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing request: query="${searchQuery}" partId="${partId}"`);

    // If a specific part ID was requested, try to fetch that part
    if (partId) {
      try {
        console.log(`Fetching specific part with ID: ${partId}`);
        const partUrl = `${apiUrl}/parts/${partId}`;
        const partResponse = await fetch(partUrl, {
          method: 'GET',
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (partResponse.ok) {
          const partData = await partResponse.json();
          console.log(`Part details fetch successful`);
          
          if (partData.status && partData.responseData) {
            // Format the single part data
            const formattedPart = {
              id: partData.responseData.id || partId,
              part_number: partData.responseData.partNumber || '',
              description: partData.responseData.description || '',
              category: partData.responseData.category || '',
              manufacturer: partData.responseData.manufacturer || '',
              model_number: partData.responseData.modelNumber || '',
              list_price: parseFloat(partData.responseData.listPrice || 0),
              cost: parseFloat(partData.responseData.cost || 0),
            };
            
            return new Response(
              JSON.stringify({
                success: true,
                data: [formattedPart]
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } else {
            console.log(`Part fetch successful but no data found`);
            return new Response(
              JSON.stringify({ 
                success: false,
                error: 'Part not found in response' 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
            );
          }
        } else {
          console.log(`Part fetch failed with status: ${partResponse.status}`);
          return new Response(
            JSON.stringify({ 
              success: false,
              error: `Failed to fetch part: ${partResponse.statusText}` 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          );
        }
      } catch (error) {
        console.error('Error fetching part details:', error);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Error fetching part: ${error.message}` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }

    // For search functionality, use direct API
    if (searchQuery) {
      try {
        console.log(`Attempting direct parts search with query: "${searchQuery}"`);
        const searchUrl = `${apiUrl}/parts/search`;
        
        const searchPayload = {
          search: searchQuery,
          limit: 50
        };
        
        console.log(`Sending search request to ${searchUrl} with payload: ${JSON.stringify(searchPayload)}`);
        
        const searchResponse = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(searchPayload),
        });

        // Log the response status
        console.log(`Search API response status: ${searchResponse.status} ${searchResponse.statusText}`);
        
        if (!searchResponse.ok) {
          console.error(`Search API error: ${searchResponse.status} ${searchResponse.statusText}`);
          
          // Try to get error details from response
          let errorDetails = '';
          try {
            const errorText = await searchResponse.text();
            errorDetails = errorText;
            console.error(`Error response body: ${errorText}`);
          } catch (e) {
            console.error('Could not read error response', e);
          }
          
          return new Response(
            JSON.stringify({ 
              success: false,
              error: `API returned error ${searchResponse.status}: ${errorDetails || searchResponse.statusText}`,
              data: []
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
        
        const searchData = await searchResponse.json();
        console.log(`Search API response:`, typeof searchData, Array.isArray(searchData.responseData));
        
        if (searchData.status === "success" && Array.isArray(searchData.responseData)) {
          console.log(`Direct search successful, found ${searchData.responseData.length} results`);
          
          if (searchData.responseData.length > 0) {
            // Transform the data to match our expected format
            const formattedData = searchData.responseData.map((part) => ({
              id: part.id || crypto.randomUUID(),
              part_number: part.partNumber || part.part_number || '',
              description: part.description || part.name || '',
              category: part.category || '',
              manufacturer: part.manufacturer || '',
              model_number: part.modelNumber || part.model_number || '',
              list_price: parseFloat(part.listPrice || part.list_price || 0),
              cost: parseFloat(part.cost || 0),
            }));
            
            return new Response(
              JSON.stringify({
                success: true,
                data: formattedData
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
        
        // If we get here, the search didn't return any useful results
        console.log('Search returned no results or invalid format');
        return new Response(
          JSON.stringify({
            success: true,
            data: [],
            message: "No parts found matching your search criteria"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error in direct search:', error);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Search error: ${error.message}`,
            data: []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    } else {
      // If no search query provided
      return new Response(
        JSON.stringify({ 
          success: true,
          data: [],
          message: "Please enter a search query" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Server error: ${error.message}`,
        data: []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
