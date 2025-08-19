import React, { useEffect, useState } from 'react';
import { Mail, Clock, CheckCircle, XCircle, Send, AlertCircle, User } from 'lucide-react';
import teamsServices from '../../api/teamsServices';
import { useToast } from '../../hooks/useToast';

const RequestsTab = ({ user }) => {
    const [allUserRequests, setAllUserRequests] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (user) {
            fetchAllUserRequests();
        }
    }, [user]);

    const fetchAllUserRequests = async () => {
        setLoading(true);
        try {
            const response = await teamsServices.getAllUserRequests();
            if (response.success) {
                setAllUserRequests(response.data);
            } else {
                showToast('Failed to load your requests', 'error');
            }
        } catch (error) {
            showToast('Failed to load your requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptInvite = async (inviteId) => {
        try {
            const response = await teamsServices.acceptInvitation(inviteId);
            if (response.success) {
                showToast('Invitation accepted!', 'success');
                fetchAllUserRequests();
            } else {
                showToast(response.message, 'error');
            }
        } catch (error) {
            showToast('Failed to accept invitation', 'error');
        }
    };

    const handleDeclineInvite = async (inviteId) => {
        try {
            const response = await teamsServices.declineInvitation(inviteId);
            if (response.success) {
                showToast('Invitation declined', 'info');
                fetchAllUserRequests();
            } else {
                showToast(response.message, 'error');
            }
        } catch (error) {
            showToast('Failed to decline invitation', 'error');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
            case 'leader_pending':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
            case 'accepted':
            case 'active':
                return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
            case 'declined':
            case 'rejected':
                return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
            case 'expired':
                return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
            default:
                return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
            case 'leader_pending':
                return <Clock className="w-4 h-4" />;
            case 'accepted':
            case 'active':
                return <CheckCircle className="w-4 h-4" />;
            case 'declined':
            case 'rejected':
                return <XCircle className="w-4 h-4" />;
            case 'expired':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading all requests & invitations...</span>
            </div>
        );
    }

    if (!allUserRequests) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Failed to load requests</p>
            </div>
        );
    }

    const hasAny =
        (allUserRequests?.invitations_received?.length > 0) ||
        (allUserRequests?.join_requests?.length > 0) ||
        (allUserRequests?.invitation_requests_sent?.length > 0);

    return (
        <div className="space-y-8">
            {/* All Join requests sent */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <Send className="w-5 h-5" />
                    Join Requests Sent ({allUserRequests.join_requests?.length || 0})
                </h3>
                {allUserRequests.join_requests?.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                        <Send className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No join requests sent</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {allUserRequests.join_requests.map((request) => (
                            <div key={request.id} className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                            {request.team.name} - {request.team.hackathon_title}
                                        </h4>
                                        {request.role &&
                                            <span className="text-xs text-blue-500 dark:text-blue-300 font-medium mx-2">{request.role}</span>
                                        }
                                        {request.invitation_message &&
                                            <span className="italic text-xs mx-2 text-gray-500">{request.invitation_message}</span>
                                        }
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(request.status)}`}>
                                                {getStatusIcon(request.status)}
                                                {request.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Sent {new Date(request.created_at).toLocaleDateString()}
                                            {request.joined_at && ` · Joined: ${new Date(request.joined_at).toLocaleDateString()}`}
                                            {request.left_at && ` · Left: ${new Date(request.left_at).toLocaleDateString()}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* All Invitations received */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <Mail className="w-5 h-5" />
                    Invitations Received ({allUserRequests.invitations_received?.length || 0})
                </h3>
                {allUserRequests.invitations_received?.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                        <Mail className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No invitations received</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {allUserRequests.invitations_received.map((invite) => (
                            <div key={invite.id} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                            {invite.team.name} - {invite.team.hackathon_title}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                            From: {invite.inviter}
                                        </p>
                                        {invite.message && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">
                                                "{invite.message}"
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(invite.status)}`}>
                                                {getStatusIcon(invite.status)}
                                                {invite.status === 'leader_pending' ? 'Waiting Leader Approval' : invite.status}
                                            </span>
                                            {invite.expires_at && (
                                                <span className="text-xs text-gray-400">Expires: {new Date(invite.expires_at).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Received {new Date(invite.created_at).toLocaleDateString()}
                                            {invite.responded_at && ` · Responded: ${new Date(invite.responded_at).toLocaleDateString()}`}
                                        </p>
                                    </div>
                                    {invite.status === 'pending' && (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleAcceptInvite(invite.id)}
                                                className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleDeclineInvite(invite.id)}
                                                className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* All Invitations Sent */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <User className="w-5 h-5" />
                    Invitation Requests Sent ({allUserRequests.invitation_requests_sent?.length || 0})
                </h3>
                {allUserRequests.invitation_requests_sent?.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                        <User className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No invitation requests sent</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {allUserRequests.invitation_requests_sent.map((request) => (
                            <div key={request.id} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                            Invited {request.invitee} to {request.team.name}
                                        </h4>
                                        {request.message &&
                                            <span className="italic text-xs mx-2 text-gray-500">{request.message}</span>
                                        }
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(request.status)}`}>
                                                {getStatusIcon(request.status)}
                                                {request.status === 'leader_pending' ? 'Waiting Leader Approval' : request.status}
                                            </span>
                                            {request.expires_at && (
                                                <span className="text-xs text-gray-400">Expires: {new Date(request.expires_at).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Sent {new Date(request.created_at).toLocaleDateString()}
                                            {request.responded_at && ` · Responded: ${new Date(request.responded_at).toLocaleDateString()}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Empty state */}
            {/* {!hasAny && (
                <div className="text-center py-12">
                    <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">No requests or invitations yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Send join requests or invitations to get started
                    </p>
                </div>
            )} */}
        </div>
    );
};

export default RequestsTab;
