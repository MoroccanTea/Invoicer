const createApiClient = () => {
    const getToken = () => localStorage.getItem('token');
    const baseURL = 'http://localhost:5000/api/v1'; // Direct backend connection
    // Ensure baseURL has single /api/v1 prefix
  
    const getHeaders = () => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    });
  
    const handleResponse = async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'An error occurred' }));
        throw new Error(error.error || error.message || 'Request failed');
      }
      return response.json();
    };
  
    return {
      get: async (endpoint) => {
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
