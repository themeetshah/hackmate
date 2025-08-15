import { api } from './api';

const ENDPOINTS = {
    hackathons: '/hackathons/',
    hackathonDetail: (id) => `/hackathons/${id}/`,
    hackathonApply: (id) => `/hackathons/${id}/apply/`,
    myApplications: '/hackathons/my/applications/',
    myOrganizedHackathons: '/hackathons/my/organized/',
    categories: '/hackathons/api/categories/',
};

const hackathonServices = {
    // Get all hackathons
    getHackathons: async () => {
        try {
            const response = await api.get(ENDPOINTS.hackathons);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to fetch hackathons' };
        }
    },

    // Get specific hackathon by ID
    getHackathonById: async (id) => {
        try {
            const response = await api.get(ENDPOINTS.hackathonDetail(id));
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to fetch hackathon details' };
        }
    },

    // Create new hackathon
        createHackathon: async (data) => {
            try {
                // console.log(data.banner_image)
                const response = await api.post(ENDPOINTS.hackathons, data);
                return { success: true, data: response.data };
            } catch (error) {
                return { success: false, error: error.message || 'Failed to create hackathon' };
            }
        },

    // Apply to hackathon
    applyToHackathon: async (id, applicationData) => {
        try {
            const response = await api.post(ENDPOINTS.hackathonApply(id), applicationData);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to apply to hackathon' };
        }
    },

    // Get user's applications
    getMyApplications: async () => {
        try {
            const response = await api.get(ENDPOINTS.myApplications);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to fetch applications' };
        }
    },

    // Get user's organized hackathons
    getMyOrganizedHackathons: async () => {
        try {
            const response = await api.get(ENDPOINTS.myOrganizedHackathons);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to fetch organized hackathons' };
        }
    },

    // Get categories
    getCategories: async () => {
        try {
            const response = await api.get(ENDPOINTS.categories);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: 'Failed to fetch categories' };
        }
    }
};

export default hackathonServices;
