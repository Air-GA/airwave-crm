import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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

    let body;
    try {
      body = await req.json();
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

    const { 
      action, 
      payload, 
      query, 
      partId, 
      businessId, 
      businessInfo,
      updateId,
      searchText,
      taskId,
      fieldName,
      sourceId,
      destinationId,
      index,
      assignmentId,
      destinationCategoryId,
      revisionCompanyId,
      startFieldEdgeSync,
      generateSqlLiteFile
    } = body;

    // Handle authentication
    if (action === 'authenticate') {
      try {
        console.log('Authenticating with Profit Rhino API...');
        const authResponse = await fetch(`${apiBaseUrl}/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-DeviceType-Key': '3', // Web
          },
          body: JSON.stringify(payload)
        });

        if (!authResponse.ok) {
          const errorText = await authResponse.text();
          console.error(`Auth failed: ${authResponse.status} ${authResponse.statusText}. Details: ${errorText}`);
          throw new Error(`Auth failed: ${authResponse.statusText}`);
        }

        const authData = await authResponse.json();
        console.log('Authentication successful');
        
        return new Response(
          JSON.stringify({
            success: true,
            token: authData.responseData?.returnData?.token
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Authentication error:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Authentication failed'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
    }

    // Handle part search/details
    if (query || partId) {
      try {
        console.log(`Processing request: query="${query}" partId="${partId}"`);
    
        if (partId) {
          try {
            console.log(`Fetching specific part with ID: ${partId}`);
            // Try multiple possible part detail endpoints
            const possibleEndpoints = [
              `${apiBaseUrl}/parts/${partId}`,
              `${apiBaseUrl}/part/${partId}` 
            ];
            
            let partData = null;
            let lastError = null;
            
            for (const endpoint of possibleEndpoints) {
              try {
                console.log(`Trying endpoint: ${endpoint}`);
                
                const partResponse = await fetch(endpoint, {
                  method: 'GET',
                  headers: {
                    'X-HTTP-ProfitRhino-Service-Key': apiKey,
                    'Content-Type': 'application/json',
                  },
                });
        
                if (partResponse.ok) {
                  partData = await partResponse.json();
                  console.log(`Part details fetch successful from ${endpoint}`);
                  break;
                } else {
                  const errorText = await partResponse.text();
                  console.error(`Error with endpoint ${endpoint}:`, partResponse.status, errorText);
                  lastError = {
                    status: partResponse.status,
                    statusText: partResponse.statusText,
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
            
            if (partData && partData.status && partData.responseData) {
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
              console.log(`Part fetch failed. Last error:`, lastError);
              return new Response(
                JSON.stringify({ 
                  success: false,
                  error: `Failed to fetch part: ${JSON.stringify(lastError)}` 
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
    
        if (query) {
          // Based on the API documentation, try multiple possible endpoints for part searches
          // These are endpoints based on your API documentation that might contain parts information
          const endpoints = [
            `${apiBaseUrl}/parts`,
            `${apiBaseUrl}/kendotasks`, // This might have parts nested within tasks
            `${apiBaseUrl}/tasks/${query}`, // Direct task lookup if query is a task ID
            `${apiBaseUrl}/task/${query}/part`, // Parts associated with a task
            `${apiBaseUrl}/parts/updateallparts` // This is a POST endpoint but might accept GET for searching
          ];
    
          let successResponse = null;
          let lastError = null;
    
          for (const endpoint of endpoints) {
            try {
              console.log(`Attempting search with endpoint: ${endpoint}`);
              
              // Different endpoints might require different request formats
              const searchPayload = {
                search: query,
                limit: 50
              };
              
              let method = 'GET'; // Default to GET for most endpoints
              let url = endpoint;
              
              // Add search parameter to URL for GET requests
              if (method === 'GET' && !endpoint.includes(query)) {
                url = `${endpoint}?search=${encodeURIComponent(query)}`;
              }
              
              console.log(`Sending ${method} request to ${url}`);
              
              const searchResponse = await fetch(url, {
                method: method,
                headers: {
                  'X-HTTP-ProfitRhino-Service-Key': apiKey,
                  'Content-Type': 'application/json',
                }
              });
    
              console.log(`Search API response status: ${searchResponse.status} ${searchResponse.statusText}`);
              
              if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                console.log(`Search API response type:`, typeof searchData);
                
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
                } else if (searchData.status && searchData.status === true) {
                  // Handle other successful response formats
                  console.log(`Search successful with endpoint ${endpoint}, processing custom format`);
                  
                  let formattedData = [];
                  
                  // Try to extract part data from various response structures
                  if (searchData.responseData) {
                    if (Array.isArray(searchData.responseData.parts)) {
                      formattedData = searchData.responseData.parts.map(part => ({
                        id: part.id || crypto.randomUUID(),
                        part_number: part.partNumber || part.part_number || '',
                        description: part.description || '',
                        category: part.category || '',
                        manufacturer: part.manufacturer || '',
                        model_number: part.modelNumber || '',
                        list_price: parseFloat(part.listPrice || 0),
                        cost: parseFloat(part.cost || 0),
                      }));
                    } else if (typeof searchData.responseData === 'object') {
                      // Single part object
                      formattedData = [{
                        id: searchData.responseData.id || crypto.randomUUID(),
                        part_number: searchData.responseData.partNumber || searchData.responseData.part_number || '',
                        description: searchData.responseData.description || '',
                        category: searchData.responseData.category || '',
                        manufacturer: searchData.responseData.manufacturer || '',
                        model_number: searchData.responseData.modelNumber || '',
                        list_price: parseFloat(searchData.responseData.listPrice || 0),
                        cost: parseFloat(searchData.responseData.cost || 0),
                      }];
                    }
                  }
                  
                  if (formattedData.length > 0) {
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
    }

    // Handle business information related actions
    if (action === 'getBusinessInfo') {
      try {
        const response = await fetch(`${apiBaseUrl}/businessinformation/${businessId}`, {
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Business info request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } catch (error) {
        console.error('Error fetching business info:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }

    if (action === 'copyBusinessInfo') {
      try {
        const response = await fetch(`${apiBaseUrl}/businessinformation/${businessId}/copybusinessinformation`, {
          method: 'POST',
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Copy business info request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } catch (error) {
        console.error('Error copying business info:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    if (action === 'setTaskTimeToWrenchTime') {
      try {
        const response = await fetch(`${apiBaseUrl}/businessinformation/${businessId}/actions/settasktimetowrenchtime`, {
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Set task time request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } catch (error) {
        console.error('Error setting task time:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    if (action === 'saveAndRecalculate') {
      try {
        const response = await fetch(`${apiBaseUrl}/businesstypes/${businessId}/actions/saveandrecalculate`, {
          method: 'POST',
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(businessInfo)
        });

        if (!response.ok) {
          throw new Error(`Save business info request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } catch (error) {
        console.error('Error saving business info:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }

    // Handle content management related actions
    if (action === 'getContentUpdateInfo') {
      try {
        const response = await fetch(`${apiBaseUrl}/contentupdate/GetUpdateInfo`, {
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Get content update info request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } catch (error) {
        console.error('Error fetching content update info:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    if (action === 'createContentUpdate') {
      try {
        const model = {
          revisionCompanyId: revisionCompanyId,
          startFieldEdgeSync: startFieldEdgeSync === undefined ? true : startFieldEdgeSync,
          generateSqlLiteFile: generateSqlLiteFile === undefined ? true : generateSqlLiteFile
        };
        
        const response = await fetch(`${apiBaseUrl}/contentupdate`, {
          method: 'POST',
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(model)
        });

        if (!response.ok) {
          throw new Error(`Create content update request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } catch (error) {
        console.error('Error creating content update:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    if (action === 'getContentUpdateTasks') {
      try {
        const searchParam = searchText ? `?SearchText=${encodeURIComponent(searchText)}` : '';
        const response = await fetch(`${apiBaseUrl}/contentupdates/${updateId}/tasks${searchParam}`, {
          method: 'POST', // API requires POST even for fetching data
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}) // Empty body for POST request
        });

        if (!response.ok) {
          throw new Error(`Get content update tasks request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } catch (error) {
        console.error('Error fetching content update tasks:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    if (action === 'getContentUpdateParts') {
      try {
        const searchParam = searchText ? `?SearchText=${encodeURIComponent(searchText)}` : '';
        const response = await fetch(`${apiBaseUrl}/contentupdates/${updateId}/parts${searchParam}`, {
          method: 'POST', // API requires POST even for fetching data
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}) // Empty body for POST request
        });

        if (!response.ok) {
          throw new Error(`Get content update parts request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } catch (error) {
        console.error('Error fetching content update parts:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    if (action === 'resetTask') {
      try {
        const response = await fetch(`${apiBaseUrl}/contentupdates/tasks/${taskId}/reset`, {
          method: 'POST',
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Reset task request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } catch (error) {
        console.error('Error resetting task:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    if (action === 'copyTaskField') {
      try {
        const response = await fetch(`${apiBaseUrl}/contentupdate/tasks/${taskId}/copyfield?FieldName=${fieldName}`, {
          method: 'POST',
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Copy task field request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } catch (error) {
        console.error('Error copying task field:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    if (action === 'compareTask') {
      try {
        const response = await fetch(`${apiBaseUrl}/contentupdate/task/${taskId}/compare`, {
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Compare task request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } catch (error) {
        console.error('Error comparing task:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    if (action === 'comparePart') {
      try {
        const response = await fetch(`${apiBaseUrl}/contentupdate/part/${partId}/compare`, {
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Compare part request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } catch (error) {
        console.error('Error comparing part:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    if (action === 'getLicenseTask') {
      try {
        const response = await fetch(`${apiBaseUrl}/contentupdate/task/${taskId}/licensetask`, {
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Get license task request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } catch (error) {
        console.error('Error getting license task:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    if (action === 'getLicensePart') {
      try {
        const response = await fetch(`${apiBaseUrl}/contentupdate/part/${partId}/licensepart`, {
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Get license part request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } catch (error) {
        console.error('Error getting license part:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    if (action === 'moveCategory') {
      try {
        const categoryMoveRequest = {
          sourceId,
          destinationId,
          index
        };
        
        const response = await fetch(`${apiBaseUrl}/categorytree/actions/movecategory`, {
          method: 'POST',
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(categoryMoveRequest)
        });

        if (!response.ok) {
          throw new Error(`Move category request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } catch (error) {
        console.error('Error moving category:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    if (action === 'moveTaskAssignment') {
      try {
        const taskAssignmentMoveRequest = {
          assignmentId,
          destinationCategoryId,
          index
        };
        
        const response = await fetch(`${apiBaseUrl}/categorytree/actions/movetaskassignment`, {
          method: 'POST',
          headers: {
            'X-HTTP-ProfitRhino-Service-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskAssignmentMoveRequest)
        });

        if (!response.ok) {
          throw new Error(`Move task assignment request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      } catch (error) {
        console.error('Error moving task assignment:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: [],
        message: "Please specify an action" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Server error: ${error.message}`,
        data: []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
