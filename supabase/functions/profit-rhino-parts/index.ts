
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

    // First, get the pricebook export URL
    console.log('Requesting pricebook export...');
    const exportResponse = await fetch(`${apiUrl}/pricebookexport`, {
      method: 'GET',
      headers: {
        'X-HTTP-ProfitRhino-Service-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!exportResponse.ok) {
      throw new Error(`Failed to get pricebook export: ${exportResponse.statusText}`);
    }

    const exportData = await exportResponse.json();
    
    if (!exportData.responseData?.fileUrl) {
      throw new Error('No file URL in response');
    }

    // Download the Excel file
    console.log('Downloading Excel file...');
    const fileResponse = await fetch(exportData.responseData.fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to download Excel file');
    }

    // Convert the response to an ArrayBuffer
    const fileBuffer = await fileResponse.arrayBuffer();

    // Parse the Excel file
    console.log('Parsing Excel file...');
    const workbook = read(new Uint8Array(fileBuffer));
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet);

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
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
