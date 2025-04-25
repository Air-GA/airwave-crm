
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { read, utils } from 'https://deno.land/x/excel@v1.4.3/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const apiKey = Deno.env.get('PROFIT_RHINO_API_KEY');
    const apiUrl = Deno.env.get('PROFIT_RHINO_API_URL') || 'https://secure.profitrhino.com/api/v2';
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Profit Rhino API credentials not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Parse the request body to get the search query
    let searchQuery = '';
    try {
      if (req.body) {
        const body = await req.json();
        searchQuery = body.query || '';
      }
    } catch (e) {
      console.error('Error parsing request body:', e);
    }

    console.log(`Processing search for query: "${searchQuery}"`);

    // Try two approaches:
    // 1. First try direct search if query is provided
    if (searchQuery) {
      try {
        console.log(`Attempting direct parts search with query: "${searchQuery}"`);
        const searchUrl = `${apiUrl}/parts/search`;
        const searchResponse = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            search: searchQuery,
            limit: 50
          }),
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          console.log(`Direct search successful, found ${searchData.responseData?.length || 0} results`);
          
          if (searchData.status && searchData.responseData?.length > 0) {
            // Transform the data to match our expected format
            const formattedData = searchData.responseData.map((part: any) => ({
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
              JSON.stringify(formattedData),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          console.log(`Direct search failed with status: ${searchResponse.status}`);
        }
      } catch (error) {
        console.error('Error in direct search:', error);
      }
    }

    // 2. If direct search fails or returns no results, fall back to the pricebook export
    console.log('Falling back to pricebook export...');
    const exportResponse = await fetch(`${apiUrl}/pricebookexport`, {
      method: 'GET',
      headers: {
        'X-HTTP-ProfitRhino-Service-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!exportResponse.ok) {
      console.error(`Pricebook export failed: ${exportResponse.status} ${exportResponse.statusText}`);
      throw new Error(`Failed to get pricebook export: ${exportResponse.statusText}`);
    }

    const exportData = await exportResponse.json();
    
    if (!exportData.responseData?.fileUrl) {
      console.error('No file URL in response:', exportData);
      throw new Error('No file URL in response');
    }

    // Download the Excel file
    console.log('Downloading Excel file from:', exportData.responseData.fileUrl);
    const fileResponse = await fetch(exportData.responseData.fileUrl);
    if (!fileResponse.ok) {
      console.error(`Failed to download Excel file: ${fileResponse.status} ${fileResponse.statusText}`);
      throw new Error('Failed to download Excel file');
    }

    // Convert the response to an ArrayBuffer
    const fileBuffer = await fileResponse.arrayBuffer();
    console.log('Excel file downloaded, size:', fileBuffer.byteLength);

    // Parse the Excel file
    try {
      console.log('Parsing Excel file...');
      const workbook = read(new Uint8Array(fileBuffer));
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      let jsonData = utils.sheet_to_json(worksheet);
      console.log(`Excel parsed, found ${jsonData.length} records`);
      
      // Filter the data based on search query if provided
      if (searchQuery && jsonData.length > 0) {
        const lowerQuery = searchQuery.toLowerCase();
        jsonData = jsonData.filter((row: any) => {
          const partNumber = String(row.PartNumber || row['Part Number'] || row.SKU || '').toLowerCase();
          const description = String(row.Description || row.Name || '').toLowerCase();
          const manufacturer = String(row.Manufacturer || '').toLowerCase();
          const modelNumber = String(row.ModelNumber || row['Model Number'] || '').toLowerCase();
          
          return partNumber.includes(lowerQuery) || 
                 description.includes(lowerQuery) || 
                 manufacturer.includes(lowerQuery) || 
                 modelNumber.includes(lowerQuery);
        });
        console.log(`Filtered to ${jsonData.length} records matching query: "${searchQuery}"`);
      }

      // Limit results to reasonable number
      if (jsonData.length > 100) {
        jsonData = jsonData.slice(0, 100);
        console.log('Limited to 100 results for performance');
      }

      // Transform the data to match our expected format
      const formattedData = jsonData.map((row: any) => ({
        id: row.ID || row.id || crypto.randomUUID(),
        part_number: row.PartNumber || row['Part Number'] || row.SKU || '',
        description: row.Description || row.Name || '',
        category: row.Category || '',
        manufacturer: row.Manufacturer || '',
        model_number: row.ModelNumber || row['Model Number'] || '',
        list_price: parseFloat(row.ListPrice || row['List Price'] || row.Price || 0),
        cost: parseFloat(row.Cost || 0),
      }));

      return new Response(
        JSON.stringify(formattedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error parsing Excel file:', parseError);
      throw parseError;
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
