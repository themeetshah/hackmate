import axios from 'axios';

// API Configuration
const API_CONFIG = {
    baseURL: import.meta.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    timeout: 10000, // Increase timeout to 30 seconds
    // headers: {
    //     'Content-Type': 'application/json',
    // },
};

// Create axios instance
const apiClient = axios.create(API_CONFIG);

// Request interceptor - Add JWT token to requests
apiClient.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - Handle responses and auto-refresh tokens
apiClient.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.status, response.config.url, response.data);
        return response;
    },
    async (error) => {
        console.error('API Error:', error.response?.status, error.response?.config?.url, error.response?.data);

        const originalRequest = error.config;

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const refreshResponse = await axios.post(
                        `${API_CONFIG.baseURL}/auth/token/refresh/`,
                        { refresh: refreshToken }
                    );

                    const { access } = refreshResponse.data;
                    localStorage.setItem('access_token', access);

                    // Retry original request with new token
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, logout user
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            } else {
                // No refresh token, logout user
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);


// Generic API methods
export const api = {
    // GET request
    get: (url, params = {}, config = {}) => {
        return apiClient.get(url, { params, ...config });
    },

    // POST request
    post: (url, data = {}, config = {}) => {
        return apiClient.post(url, data, config);
    },

    // PUT request
    put: (url, data = {}, config = {}) => {
        return apiClient.put(url, data, config);
    },

    // PATCH request
    patch: (url, data = {}, config = {}) => {
        return apiClient.patch(url, data, config);
    },

    // DELETE request
    delete: (url, config = {}) => {
        return apiClient.delete(url, config);
    },

    // Upload file with progress tracking
    upload: (url, formData, onUploadProgress = null, config = {}) => {
        return apiClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress,
            ...config,
        });
    },

    // Download file
    download: (url, filename = 'download', config = {}) => {
        return apiClient.get(url, {
            responseType: 'blob',
            ...config,
        }).then(response => {
            // Create blob link to download
            const blob = new Blob([response.data]);
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(link.href);
        });
    },

    // Token management
    setAuthToken: (token) => {
        if (token) {
            localStorage.setItem('access_token', token);
            apiClient.defaults.headers.Authorization = `Bearer ${token}`;
        } else {
            localStorage.removeItem('access_token');
            delete apiClient.defaults.headers.Authorization;
        }
    },

    setRefreshToken: (token) => {
        if (token) {
            localStorage.setItem('refresh_token', token);
        } else {
            localStorage.removeItem('refresh_token');
        }
    },

    // Clear all auth tokens
    clearAuthTokens: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        delete apiClient.defaults.headers.Authorization;
    },

    // Get stored tokens
    getAccessToken: () => localStorage.getItem('access_token'),
    getRefreshToken: () => localStorage.getItem('refresh_token'),

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('access_token');
    },

    // Request helpers with better error handling
    safeRequest: async (requestFn) => {
        try {
            const response = await requestFn();
            return { data: response.data, error: null };
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'An unknown error occurred';
            return { data: null, error: errorMessage };
        }
    },

    // Batch requests
    batch: (requests) => {
        return Promise.allSettled(requests.map(req => apiClient(req)));
    },

    // Cancel requests
    cancelToken: () => axios.CancelToken.source(),
};

// Export instance for direct access if needed
export { apiClient };
export default api;
