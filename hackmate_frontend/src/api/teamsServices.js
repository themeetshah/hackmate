import api from './api';

const teamsServices = {
    // Team Management
    async getTeams(params = {}) {
        try {
            const response = await api.get('/teams/', { params });
            console.log(params)
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
            const response = await api.get('/teams/my/');
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
            const response = await api.get(`/teams/${teamId}/`);
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
            const response = await api.post('/teams/', teamData);
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
            const response = await api.put(`/teams/${teamId}/`, teamData);
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
            await api.delete(`/teams/${teamId}/`);
            return { success: true, message: 'Team deleted successfully' };
        } catch (error) {
            console.error('Error deleting team:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete team'
            };
        }
    },

    // Team Membership
    async joinTeam(teamId, data = {}) {
        try {
            const response = await api.post(`/teams/${teamId}/join/`, data);
            return response.data;
        } catch (error) {
            console.error('Error joining team:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to join team'
            };
        }
    },

    async inviteToTeam(teamId, inviteData) {
        try {
            const response = await api.post(`/teams/${teamId}/invite/`, inviteData);
            return response.data;
        } catch (error) {
            console.error('Error inviting to team:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to invite to team'
            };
        }
    },

    async leaveTeam(teamId) {
        try {
            const response = await api.post(`/teams/${teamId}/leave/`);
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
            const response = await api.post(`/teams/${teamId}/members/${memberId}/`, { action });
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
    async acceptInvitation(invitationId) {
        try {
            const response = await api.post(`/teams/team-invitations/${invitationId}/accept/`);
            return response.data;
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to accept invitation' };
        }
    },

    async declineInvitation(invitationId) {
        try {
            const response = await api.post(`/teams/team-invitations/${invitationId}/decline/`);
            return response.data;
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to decline invitation' };
        }
    },

    // Team Messages
    async getTeamMessages(teamId, page = 1) {
        try {
            const response = await api.get(`/teams/${teamId}/messages/`, { params: { page } });
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
            const response = await api.post(`/teams/${teamId}/messages/`, messageData);
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
            const response = await api.put(`/teams/${teamId}/messages/${messageId}/`, messageData);
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
            await api.delete(`/teams/${teamId}/messages/${messageId}/`);
            return { success: true, message: 'Message deleted successfully' };
        } catch (error) {
            console.error('Error deleting message:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete message'
            };
        }
    },

    async getPendingRequests(teamId) {
        try {
            const response = await api.get(`/teams/${teamId}/pending-requests/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching pending requests:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch pending requests'
            };
        }
    },

    async getMyInvitations() {
        try {
            const response = await api.get('/teams/team-invitations/?type=received');
            return response.data;
        } catch (error) {
            console.error('Error fetching my invitations:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch invitations'
            };
        }
    },

    async getMyRequests() {
        try {
            const response = await api.get('/teams/my-requests/');
            return response.data;
        } catch (error) {
            console.error('Error fetching my requests:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch requests'
            };
        }
    },

    async inviteToTeam(teamId, inviteData) {
        try {
            const response = await api.post(`/teams/${teamId}/invite/`, inviteData);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to send invitation'
            };
        }
    },

    async getInvitationRequests(teamId) {
        try {
            const response = await api.get(`/teams/${teamId}/invitation-requests/`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch invitation requests'
            };
        }
    },

    async approveInvitationRequest(invitationId, action) {
        try {
            const response = await api.post(`/teams/invitation-requests/${invitationId}/approve/`, { action });
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to process invitation request'
            };
        }
    },

    async getAllUserRequests() {
        try {
            const response = await api.get('/teams/all-requests/');
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch user requests'
            };
        }
    },

    async getAllTeamRequests(teamId) {
        try {
            const response = await api.get(`/teams/${teamId}/all-requests/`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch team requests'
            };
        }
    },
};

export default teamsServices;
