const createApiClient = () => {
    const getToken = () => localStorage.getItem('token');
    const baseURL = 'http://localhost:5000/api/v1'; // Direct backend connection
    // Ensure baseURL has single /api/v1 prefix
  
    const getHeaders = () => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    });
  
    const handleResponse = async (response) => {
      console.log('API Response:', response);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || errorJson.message || 'Request failed');
        } catch {
          throw new Error(errorText || 'Request failed');
        }
      }
      
      const data = await response.json();
      console.log('API Response Data:', data);
      return data;
    };
  
    return {
      get: async (endpoint) => {
        console.log(`Fetching endpoint: ${baseURL}${endpoint}`);
        const response = await fetch(`${baseURL}${endpoint}`, {
          headers: getHeaders()
        });
        return handleResponse(response);
      },
  
      post: async (endpoint, data) => {
        const response = await fetch(`${baseURL}${endpoint}`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        return handleResponse(response);
      },
  
      put: async (endpoint, data) => {
        const response = await fetch(`${baseURL}${endpoint}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        return handleResponse(response);
      },

      patch: async (endpoint, data) => {
        const response = await fetch(`${baseURL}${endpoint}`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        return handleResponse(response);
      },
  
      delete: async (endpoint) => {
        const response = await fetch(`${baseURL}${endpoint}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        return handleResponse(response);
      }
    };
  };
  
  export const api = createApiClient();
  export default api;
