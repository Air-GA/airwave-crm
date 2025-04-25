
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
    const apiBaseUrl = Deno.env.get('PROFIT_RHINO_API_URL') || 'https://secure.profitrhino.com/api/v2';
    
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

    if (partId) {
      try {
        console.log(`Fetching specific part with ID: ${partId}`);
        // Based on the API docs, we'll use /v2/task/{Id} pattern for getting part details
        const partUrl = `${apiBaseUrl}/parts/${partId}`;
        console.log(`Trying endpoint: ${partUrl}`);
        
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

    if (searchQuery) {
      // Based on your API documentation, try multiple possible endpoints for part searches
      const endpoints = [
        `${apiBaseUrl}/tasks`, // This might return tasks with parts
        `${apiBaseUrl}/kendotasks`, // Another endpoint that might have parts info 
        `${apiBaseUrl}/bulkaction/parts`,
        `${apiBaseUrl}/parts` // Direct parts endpoint
      ];

      let successResponse = null;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`Attempting search with endpoint: ${endpoint}`);
          
          // Different endpoints might require different request formats
          const searchPayload = {
            search: searchQuery,
            limit: 50
          };
          
          console.log(`Sending search request to ${endpoint} with payload: ${JSON.stringify(searchPayload)}`);
          
          const searchResponse = await fetch(endpoint, {
            method: 'GET', // Changed to GET based on most API docs endpoints
            headers: {
              'X-HTTP-ProfitRhino-Service-Key': apiKey,
              'Content-Type': 'application/json',
            }
          });

          console.log(`Search API response status: ${searchResponse.status} ${searchResponse.statusText}`);
          
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            console.log(`Search API response:`, typeof searchData);
            
            if (Array.isArray(searchData)) {
              // Some endpoints might return an array directly
              console.log(`Search successful with endpoint ${endpoint}, found ${searchData.length} results`);
              
              if (searchData.length > 0) {
                const formattedData = searchData.map((part) => ({
                  id: part.id || crypto.randomUUID(),
                  part_number: part.partNumber || part.part_number || '',
                  description: part.description || part.name || '',
                  category: part.category || '',
                  manufacturer: part.manufacturer || '',
                  model_number: part.modelNumber || part.model_number || '',
                  list_price: parseFloat(part.listPrice || part.list_price || 0),
                  cost: parseFloat(part.cost || 0),
                }));
                
                successResponse = new Response(
                  JSON.stringify({
                    success: true,
                    data: formattedData,
                    endpoint: endpoint
                  }),
                  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
                
                break;
              }
            } else if (searchData.responseData && Array.isArray(searchData.responseData)) {
              // Some endpoints return data in a responseData property
              console.log(`Search successful with endpoint ${endpoint}, found ${searchData.responseData.length} results`);
              
              if (searchData.responseData.length > 0) {
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
                
                successResponse = new Response(
                  JSON.stringify({
                    success: true,
                    data: formattedData,
                    endpoint: endpoint
                  }),
                  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
                
                break;
              }
            }
          } else {
            const errorText = await searchResponse.text();
            console.error(`Error with endpoint ${endpoint}:`, searchResponse.status, errorText);
            lastError = {
              status: searchResponse.status,
              statusText: searchResponse.statusText,
              endpoint,
              details: errorText
            };
          }
        } catch (error) {
          console.error(`Error with endpoint ${endpoint}:`, error);
          lastError = {
            message: error.message,
            endpoint
          };
        }
      }
      
      if (successResponse) {
        return successResponse;
      }
      
      console.log('All search endpoints failed');
      return new Response(
        JSON.stringify({
          success: false,
          error: `API endpoints failed. Last error: ${JSON.stringify(lastError)}`,
          documentation: "Please contact Profit Rhino support to confirm your API access and correct endpoints",
          data: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else {
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
