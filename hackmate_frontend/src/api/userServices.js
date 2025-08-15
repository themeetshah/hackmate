import { api } from './api';

// API endpoints
const ENDPOINTS = {
    // Authentication
    signup: '/auth/signup/',
    login: '/auth/login/',
    logout: '/auth/logout/',
    tokenRefresh: '/auth/token/refresh/',
    tokenVerify: '/auth/token/verify/',

    // Profile
    profile: '/auth/profile/',
    updateProfile: '/auth/profile/update/',
    changePassword: '/auth/change-password/',

    // Utilities
    checkEmail: '/auth/check-email/',
    checkUsername: '/auth/check-username/',

    // Users (if you need user listing/search functionality)
    users: '/users/',
    userDetail: (id) => `auth/users/${id}/`,
};

export const userServices = {
    // Register new user
    register: async (userData) => {
        try {
            console.log('Sending registration data:', userData);
            const response = await api.post(ENDPOINTS.signup, userData);
            console.log('Registration response:', response.data);

            // Store tokens after successful registration
            if (response.data.tokens) {
                api.setAuthToken(response.data.tokens.access);
                api.setRefreshToken(response.data.tokens.refresh);
            }

            return response.data;
        } catch (error) {
            console.error('Registration error details:', error.response);

            let errorMessage = 'Registration failed';

            if (error.response) {
                // Server responded with error status
                const errorData = error.response.data;

                if (errorData.details) {
                    // Handle field-specific errors
                    const details = errorData.details;
                    if (details.email && details.email[0]) {
                        errorMessage = `Email: ${details.email[0]}`;
                    } else if (details.username && details.username[0]) {
                        errorMessage = `Username: ${details.username[0]}`;
                    } else if (details.password && details.password[0]) {
                        errorMessage = `Password: ${details.password[0]}`;
                    } else if (details.non_field_errors && details.non_field_errors[0]) {
                        errorMessage = details.non_field_errors[0];
                    } else {
                        // Get first error from any field
                        const firstField = Object.keys(details)[0];
                        const firstError = details[firstField];
                        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
                    }
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } else if (error.request) {
                // Network error
                errorMessage = 'Network error. Please check your connection.';
            }

            throw new Error(errorMessage);
        }
    },

    // Login user  
    login: async (credentials) => {
        try {
            console.log('Sending login data:', credentials);
            const response = await api.post(ENDPOINTS.login, credentials);
            console.log('Login response:', response.data);

            // Store tokens after successful login
            if (response.data.tokens) {
                api.setAuthToken(response.data.tokens.access);
                api.setRefreshToken(response.data.tokens.refresh);
            }

            return response.data;
        } catch (error) {
            console.error('Login error details:', error.response);

            let errorMessage = 'Login failed';

            if (error.response) {
                const errorData = error.response.data;

                if (errorData.details) {
                    if (errorData.details.non_field_errors && errorData.details.non_field_errors[0]) {
                        errorMessage = errorData.details.non_field_errors[0];
                    } else {
                        errorMessage = 'Invalid credentials';
                    }
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection.';
            }

            throw new Error(errorMessage);
        }
    },

    // Logout user
    logout: async () => {
        try {
            const refreshToken = api.getRefreshToken();
            if (refreshToken) {
                await api.post(ENDPOINTS.logout, { refresh: refreshToken });
            }
        } catch (error) {
            console.warn('Logout error:', error.message);
        } finally {
            // Always clear local tokens
            api.clearAuthTokens();
        }
    },

    // Refresh access token
    refreshToken: async () => {
        try {
            const refreshToken = api.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await api.post(ENDPOINTS.tokenRefresh, {
                refresh: refreshToken
            });

            // Update access token
            api.setAuthToken(response.data.access);

            // Update refresh token if provided
            if (response.data.refresh) {
                api.setRefreshToken(response.data.refresh);
            }

            return response.data;
        } catch (error) {
            api.clearAuthTokens();
            throw new Error('Token refresh failed');
        }
    },

    // Verify token
    verifyToken: async (token) => {
        try {
            const response = await api.post(ENDPOINTS.tokenVerify, { token });
            return response.data;
        } catch (error) {
            throw new Error('Token verification failed');
        }
    },

    // ==================== Profile Management ====================

    // Get user by ID
    getUserById: async (userId) => {
        try {
            const response = await api.get(ENDPOINTS.userDetail(userId));
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch user details');
        }
    },

    // Get current user profile
    getProfile: async () => {
        try {
            const response = await api.get(ENDPOINTS.profile);
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.error ||
                'Failed to fetch profile'
            );
        }
    },

    // Update user profile
    updateProfile: async (profileData, isPartial = false) => {
        try {
            const method = isPartial ? 'patch' : 'put';
            const response = await api[method](ENDPOINTS.updateProfile, profileData);
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.details ?
                    Object.values(error.response.data.details)[0] :
                    error.response?.data?.error ||
                    'Profile update failed'
            );
        }
    },

    // Change password
    changePassword: async (passwordData) => {
        try {
            const response = await api.post(ENDPOINTS.changePassword, passwordData);
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.error ||
                'Password change failed'
            );
        }
    },

    // ==================== Utility Functions ====================

    // Check email availability
    checkEmailAvailability: async (email) => {
        try {
            const response = await api.get(ENDPOINTS.checkEmail, { email });
            return response.data.available;
        } catch (error) {
            console.error('Email check failed:', error);
            return false;
        }
    },

    // Check username availability
    checkUsernameAvailability: async (username) => {
        try {
            const response = await api.get(ENDPOINTS.checkUsername, { username });
            return response.data.available;
        } catch (error) {
            console.error('Username check failed:', error);
            return false;
        }
    },

    // ==================== User Management (if needed) ====================

    // Get all users (with pagination and filtering)
    getUsers: async (params = {}) => {
        try {
            const response = await api.get(ENDPOINTS.users, params);
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch users');
        }
    },

    // Get user by ID
    getUserById: async (userId) => {
        try {
            const response = await api.get(ENDPOINTS.userDetail(userId));
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch user details');
        }
    },

    // Search users
    searchUsers: async (query, filters = {}) => {
        try {
            const params = { search: query, ...filters };
            const response = await api.get(ENDPOINTS.users, params);
            return response.data;
        } catch (error) {
            throw new Error('User search failed');
        }
    },

    // ==================== Batch Operations ====================

    // Batch update multiple fields
    batchUpdateProfile: async (updates) => {
        const updatePromises = updates.map(update =>
            api.patch(ENDPOINTS.updateProfile, update)
        );

        try {
            const results = await Promise.allSettled(updatePromises);
            return results;
        } catch (error) {
            throw new Error('Batch update failed');
        }
    },

    // ==================== Helper Methods ====================

    // Get current user ID from token
    getCurrentUserId: () => {
        const token = api.getAccessToken();
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.user_id;
        } catch (error) {
            return null;
        }
    },

    // Check if current user is authenticated
    isAuthenticated: () => {
        return api.isAuthenticated();
    },

    // Safe request wrapper
    safeRequest: async (requestFn, fallback = null) => {
        try {
            return await requestFn();
        } catch (error) {
            console.error('Safe request error:', error.message);
            return fallback;
        }
    },
};

export default userServices;
