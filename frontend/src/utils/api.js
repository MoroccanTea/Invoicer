const createApiClient = () => {
    // Always use relative path since nginx handles routing
    const baseURL = '/api/v1';
    
    const getToken = () => localStorage.getItem('token');
    const getRefreshToken = () => localStorage.getItem('refreshToken');
    
    const getHeaders = (token = getToken()) => {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      return headers;
    };
  
    const handleResponse = async (response, config = {}) => {
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
  
    const refreshAccessToken = async () => {
      console.log('Attempting to refresh token');
      console.log('Available tokens in localStorage:', {
        token: localStorage.getItem('token'),
        refreshToken: localStorage.getItem('refreshToken')
      });

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.error('No refresh token found in localStorage');
        throw new Error('No refresh token available');
      }
      
      try {
        console.log('Sending refresh token request');
          const response = await fetch(`${baseURL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshToken}`
            },
            body: JSON.stringify({ refreshToken })
          });
        
        console.log('Refresh token response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Refresh token error:', errorText);
          throw new Error('Failed to refresh token');
        }
        
        const { token: newAccessToken } = await response.json();
        console.log('New access token received');
        localStorage.setItem('token', newAccessToken);
        return newAccessToken;
      } catch (error) {
        console.error('Token refresh error:', error);
        // If refresh fails, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw error;
      }
    };
  
    const fetchWithRetry = async (endpoint, config = {}) => {
      try {
        const fullURL = `${baseURL}${endpoint}`;
        const fetchConfig = {
          ...config,
          headers: endpoint.includes('/auth/login') 
            ? config.headers 
            : {
                ...getHeaders(config.token),
                ...(config.headers || {})
              },
          cache: 'no-store',
          credentials: 'include'
        };
    
        const response = await fetch(fullURL, fetchConfig);
        
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          const newToken = await refreshAccessToken();
          return fetch(fullURL, {
            ...fetchConfig,
            headers: {
              ...getHeaders(newToken),
              ...(config.headers || {})
            }
          });
        }
        
        return response;
      } catch (error) {
        console.error('Fetch Error:', error);
        throw error;
      }
    };
  
    return {
      get: async (endpoint) => {
        console.log(`Fetching endpoint: ${baseURL}${endpoint}`);
        const response = await fetchWithRetry(endpoint, { 
          method: 'GET',
          credentials: 'include'
        });
        return handleResponse(response);
      },
  
      post: async (endpoint, data) => {
        const response = await fetchWithRetry(endpoint, { 
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        return handleResponse(response);
      },
  
      put: async (endpoint, data) => {
        const response = await fetchWithRetry(endpoint, { 
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        return handleResponse(response);
      },

      patch: async (endpoint, data) => {
        const response = await fetchWithRetry(endpoint, { 
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        return handleResponse(response);
      },
  
      delete: async (endpoint) => {
        const response = await fetchWithRetry(endpoint, { 
          method: 'DELETE',
          credentials: 'include'
        });
        return handleResponse(response);
      },

      downloadPdf: async (endpoint) => {
        try {
          const response = await fetchWithRetry(endpoint, { 
            method: 'GET',
            headers: {
              'Accept': 'application/pdf',
              ...getHeaders()
            },
            credentials: 'include'
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to download PDF: ${errorText}`);
          }
          
          const blob = await response.blob();
          if (blob.size === 0) {
            throw new Error('Empty PDF generated');
          }
          
          return blob;
        } catch (error) {
          console.error('PDF Download Error:', error);
          throw error;
        }
      }
    };
  };
  
  export const api = createApiClient();
  export default api;
