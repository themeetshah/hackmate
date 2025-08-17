import { api } from './api';

const ENDPOINTS = {
    hackathons: '/hackathons/',
    hackathonDetail: (id) => `/hackathons/${id}/`,
    hackathonApply: (id) => `/hackathons/${id}/apply/`,
    updatePayment: (applicationId) => `/hackathons/applications/${applicationId}/payment/`,
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

    getHackathonApplications: async (hackathonId) => {
        try {
            const response = await api.get(`/hackathons/${hackathonId}/applications/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Failed to fetch applications' };
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

    updateApplicationPayment: async (applicationId, paymentData) => {
        try {
            const response = await api.patch(ENDPOINTS.updatePayment(applicationId), paymentData);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to update payment' };
        }
    },

    // Get specific application details
    getApplicationDetails: async (applicationId) => {
        try {
            const response = await api.get(`/hackathons/applications/${applicationId}/`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to fetch application details' };
        }
    },

    // Withdraw application
    withdrawApplication: async (applicationId) => {
        try {
            const response = await api.patch(`/hackathons/applications/${applicationId}/withdraw/`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to withdraw application' };
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
    },

    async getUserHackathons() {
        try {
            const response = await api.get('/hackathons/matching/user-hackathons/');
            return response.data;
        } catch (error) {
            console.error('Error fetching user hackathons:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch hackathons'
            };
        }
    },

    // Get participants for a specific hackathon with matching
    async getHackathonParticipants(data) {
        try {
            const response = await api.post('/hackathons/matching/participants/', data);
            return response.data;
        } catch (error) {
            console.error('Error fetching hackathon participants:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch participants'
            };
        }
    }
};

export default hackathonServices;
