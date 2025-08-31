import React, { useEffect, useState } from 'react';
import { Shield, Clock, CheckCircle, XCircle, UserPlus, Users, Mail, Send, AlertCircle } from 'lucide-react';
import teamsServices from '../../api/teamsServices';
import { useToast } from '../../hooks/useToast';

const InvitationsTab = ({ team, user, onMemberChange, managingMembers, onManageMember }) => {
    const isLeader = team?.team_leader?.id === user?.id;
    const [allTeamData, setAllTeamData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (team && isLeader) {
            fetchAllTeamData();
        }
    }, [team, isLeader]);

    const fetchAllTeamData = async () => {
        setLoading(true);
        try {
            // ✅ NEW: Get ALL team requests in one call
            const response = await teamsServices.getAllTeamRequests(team.id);
            if (response.success) {
                setAllTeamData(response.data);
            } else {
                showToast('Failed to load team requests', 'error');
            }
        } catch (error) {
            showToast('Failed to load team requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleManageJoinRequest = async (memberId, action) => {
        try {
            await onManageMember(memberId, action);
            fetchAllTeamData();
        } catch (error) {
            showToast('Failed to manage request', 'error');
        }
    };

    const handleApproveInvitation = async (invitationId, action) => {
        try {
            const response = await teamsServices.approveInvitationRequest(invitationId, action);
            if (response.success) {
                showToast(response.message, 'success');
                fetchAllTeamData();
            } else {
                showToast(response.message, 'error');
            }
        } catch (error) {
            showToast('Failed to process invitation', 'error');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
            case 'leader_pending':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
            case 'active':
            case 'accepted':
                return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
            case 'declined':
            case 'rejected':
                return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
            case 'left':
            case 'removed':
                return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
            case 'expired':
                return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
            default:
                return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
            case 'leader_pending':
                return <Clock className="w-4 h-4" />;
            case 'active':
            case 'accepted':
                return <CheckCircle className="w-4 h-4" />;
            case 'declined':
            case 'rejected':
                return <XCircle className="w-4 h-4" />;
            case 'left':
            case 'removed':
                return <UserPlus className="w-4 h-4" />;
            case 'expired':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    if (!isLeader) {
        return (
            <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Only team leaders can access this section</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
        );
    }

    if (!allTeamData) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Failed to load team requests</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ALL Join Requests */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5" />
                    All Join Requests ({allTeamData.join_requests?.length || 0})
                </h3>

                {!allTeamData.join_requests?.length ? (
                    <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No join requests</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {allTeamData.join_requests.map((request) => (
                            <div key={request.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                {request.user.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {request.user.name}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {request.user.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(request.status)}`}>
                                                {getStatusIcon(request.status)}
                                                {request.status}
                                            </span>
                                            {request.role && (
                                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                                                    {request.role}
                                                </span>
                                            )}
                                        </div>

                                        {request.invitation_message && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">
                                                "{request.invitation_message}"
                                            </p>
                                        )}

                                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                            <p>Requested: {new Date(request.invited_at).toLocaleDateString()}</p>
                                            {request.joined_at && (
                                                <p>Joined: {new Date(request.joined_at).toLocaleDateString()}</p>
                                            )}
                                            {request.left_at && (
                                                <p>Left: {new Date(request.left_at).toLocaleDateString()}</p>
                                            )}
                                        </div>
                                    </div>

                                    {request.status === 'pending' && (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleManageJoinRequest(request.user.id, 'approve')}
                                                disabled={managingMembers}
                                                className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleManageJoinRequest(request.user.id, 'reject')}
                                                disabled={managingMembers}
                                                className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ALL Invitation Requests */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <Send className="w-5 h-5" />
                    All Invitation Requests ({allTeamData.invitation_requests?.length || 0})
                </h3>

                {!allTeamData.invitation_requests?.length ? (
                    <div className="text-center py-8 text-gray-500">
                        <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No invitation requests</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {allTeamData.invitation_requests.map((request) => (
                            <div key={request.id} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                                {request.inviter.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {request.inviter.name} wants to invite {request.invitee.name}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    To: {request.invitee.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(request.status)}`}>
                                                {getStatusIcon(request.status)}
                                                {request.status === 'leader_pending' ? 'Waiting for Your Approval' : request.status}
                                            </span>
                                        </div>

                                        {request.message && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">
                                                "{request.message}"
                                            </p>
                                        )}

                                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                            <p>Requested: {new Date(request.created_at).toLocaleDateString()}</p>
                                            {request.responded_at && (
                                                <p>Responded: {new Date(request.responded_at).toLocaleDateString()}</p>
                                            )}
                                            {request.expires_at && (
                                                <p>Expires: {new Date(request.expires_at).toLocaleDateString()}</p>
                                            )}
                                        </div>
                                    </div>

                                    {request.status === 'leader_pending' && (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleApproveInvitation(request.id, 'approve')}
                                                className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleApproveInvitation(request.id, 'reject')}
                                                className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-1"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvitationsTab;
