import apiClient from './apiClient';

const teamsServices = {
    // Team Management
    async getTeams(params = {}) {
        try {
            const response = await apiClient.get('/teams/', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching teams:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch teams'
            };
        }
    },

    async getMyTeams() {
        try {
            const response = await apiClient.get('/teams/my/');
            return response.data;
        } catch (error) {
            console.error('Error fetching my teams:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch your teams'
            };
        }
    },

    async getTeamById(teamId) {
        try {
            const response = await apiClient.get(`/teams/${teamId}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching team details:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch team details'
            };
        }
    },

    async createTeam(teamData) {
        try {
            const response = await apiClient.post('/teams/', teamData);
            return response.data;
        } catch (error) {
            console.error('Error creating team:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create team',
                errors: error.response?.data?.errors
            };
        }
    },

    async updateTeam(teamId, teamData) {
        try {
            const response = await apiClient.put(`/teams/${teamId}/`, teamData);
            return response.data;
        } catch (error) {
            console.error('Error updating team:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update team',
                errors: error.response?.data?.errors
            };
        }
    },

    async deleteTeam(teamId) {
        try {
            const response = await apiClient.delete(`/teams/${teamId}/`);
            return { success: true, message: 'Team deleted successfully' };
        } catch (error) {
            console.error('Error deleting team:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete team'
            };
        }
    },

    async getAvailableHackathons() {
        try {
            const response = await apiClient.get('/teams/available-hackathons/');
            return response.data;
        } catch (error) {
            console.error('Error fetching available hackathons:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch hackathons'
            };
        }
    },

    // Team Membership
    async joinTeam(teamId, data = {}) {
        try {
            const response = await apiClient.post(`/teams/${teamId}/join/`, data);
            return response.data;
        } catch (error) {
            console.error('Error joining team:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to join team'
            };
        }
    },

    async leaveTeam(teamId) {
        try {
            const response = await apiClient.post(`/teams/${teamId}/leave/`);
            return response.data;
        } catch (error) {
            console.error('Error leaving team:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to leave team'
            };
        }
    },

    async manageMember(teamId, memberId, action) {
        try {
            const response = await apiClient.post(`/teams/${teamId}/members/${memberId}/`, { action });
            return response.data;
        } catch (error) {
            console.error('Error managing team member:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to manage team member'
            };
        }
    },

    // Team Invitations
    async getInvitations(type = 'received') {
        try {
            const response = await apiClient.get('/team-invitations/', { params: { type } });
            return response.data;
        } catch (error) {
            console.error('Error fetching invitations:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch invitations'
            };
        }
    },

    async sendInvitation(invitationData) {
        try {
            const response = await apiClient.post('/team-invitations/', invitationData);
            return response.data;
        } catch (error) {
            console.error('Error sending invitation:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to send invitation',
                errors: error.response?.data?.errors
            };
        }
    },

    async acceptInvitation(invitationId) {
        try {
            const response = await apiClient.post(`/team-invitations/${invitationId}/accept/`);
            return response.data;
        } catch (error) {
            console.error('Error accepting invitation:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to accept invitation'
            };
        }
    },

    async declineInvitation(invitationId) {
        try {
            const response = await apiClient.post(`/team-invitations/${invitationId}/decline/`);
            return response.data;
        } catch (error) {
            console.error('Error declining invitation:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to decline invitation'
            };
        }
    },

    // Team Messages
    async getTeamMessages(teamId, page = 1) {
        try {
            const response = await apiClient.get(`/teams/${teamId}/messages/`, { params: { page } });
            return response.data;
        } catch (error) {
            console.error('Error fetching team messages:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch messages'
            };
        }
    },

    async sendMessage(teamId, messageData) {
        try {
            const response = await apiClient.post(`/teams/${teamId}/messages/`, messageData);
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to send message',
                errors: error.response?.data?.errors
            };
        }
    },

    async editMessage(teamId, messageId, messageData) {
        try {
            const response = await apiClient.put(`/teams/${teamId}/messages/${messageId}/`, messageData);
            return response.data;
        } catch (error) {
            console.error('Error editing message:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to edit message'
            };
        }
    },

    async deleteMessage(teamId, messageId) {
        try {
            const response = await apiClient.delete(`/teams/${teamId}/messages/${messageId}/`);
            return { success: true, message: 'Message deleted successfully' };
        } catch (error) {
            console.error('Error deleting message:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete message'
            };
        }
    }
};

export default teamsServices;
