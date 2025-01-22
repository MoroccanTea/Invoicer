const createApiClient = () => {
    const getToken = () => localStorage.getItem('token');
    const baseURL = '/api/v1';
  
    const getHeaders = () => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    });
  
    const handleResponse = async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'An error occurred' }));
        throw new Error(error.message || 'Request failed');
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