// Netlify Functions handler - Direct Lambda style
export async function handler(event, context) {
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || 'GET';
  
  console.log(`API Request: ${method} ${path}`);
  
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Health check
    if (path === '/api/health' || path.endsWith('/api/health')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          status: 'OK', 
          timestamp: new Date().toISOString(),
          message: 'DreamBid API is running on Netlify Functions'
        }),
      };
    }

    // Test route
    if (path === '/api/test' || path.endsWith('/api/test')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'API is working' }),
      };
    }

    // Catch-all 404
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: `Route ${method} ${path} not found` }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message 
      }),
    };
  }
}
