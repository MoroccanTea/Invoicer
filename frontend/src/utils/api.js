const createApiClient = () => {
    // Dynamic API URL configuration for development vs production
    const getBaseURL = () => {
        // Check if we're in development (React dev server)
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        // Use environment variable if provided, otherwise use defaults
        if (process.env.REACT_APP_API_URL) {
            return process.env.REACT_APP_API_URL;
        }
        
        // Development: Direct backend URL
        if (isDevelopment) {
            return 'http://localhost:5000/api/v1';
        }
        
        // Production: Relative path (handled by Nginx proxy)
        return '/api/v1';
    };
    
    const baseURL = getBaseURL();
    
    console.log('API Client Configuration:', {
        NODE_ENV: process.env.NODE_ENV,
        REACT_APP_API_URL: process.env.REACT_APP_API_URL,
        baseURL: baseURL,
        isDevelopment: process.env.NODE_ENV === 'development'
    });
    
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
      console.log('API Response:', {
        url: response.url,
        status: response.status,
        statusText: response.statusText
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          errorText: errorText
        });
        
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || errorJson.message || `HTTP ${response.status}: ${response.statusText}`);
        } catch (parseError) {
          throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
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
        console.log('Sending refresh token request to:', `${baseURL}/auth/refresh`);
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
          throw new Error('Failed to refresh token');
        }
        
        const data = await response.json();
        console.log('Token refresh successful');
        
        // Update stored tokens
        localStorage.setItem('token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        
        return data.token;
      } catch (error) {
        console.error('Token refresh failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        throw error;
      }
    };
  
    const makeRequest = async (endpoint, options = {}) => {
      const url = `${baseURL}${endpoint}`;
      const config = {
        ...options,
        headers: {
          ...getHeaders(),
          ...options.headers
        }
      };
      
      console.log('Making API request:', {
        method: config.method || 'GET',
        url: url,
        headers: config.headers
      });
      
      try {
        let response = await fetch(url, config);
        
        // If unauthorized and we have a refresh token, try to refresh
        if (response.status === 401 && getRefreshToken()) {
          console.log('Received 401, attempting token refresh');
          try {
            const newToken = await refreshAccessToken();
            // Retry original request with new token
            config.headers.Authorization = `Bearer ${newToken}`;
            response = await fetch(url, config);
          } catch (refreshError) {
            console.error('Token refresh failed, redirecting to login');
            throw refreshError;
          }
        }
        
        return await handleResponse(response, config);
      } catch (error) {
        console.error('API Request failed:', {
          url: url,
          method: config.method || 'GET',
          error: error.message
        });
        
        // Network error or fetch failed
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
        }
        
        throw error;
      }
    };
  
    return {
      get: (endpoint) => makeRequest(endpoint),
      post: (endpoint, data) => makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
      put: (endpoint, data) => makeRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
      patch: (endpoint, data) => makeRequest(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
      delete: (endpoint) => makeRequest(endpoint, {
        method: 'DELETE'
      }),
      // Expose baseURL for debugging
      getBaseURL: () => baseURL
    };
  };
  
  const api = createApiClient();
  export default api;