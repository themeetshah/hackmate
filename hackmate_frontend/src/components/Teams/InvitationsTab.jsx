import React, { useEffect, useState } from 'react';
import { Shield, Clock, CheckCircle, XCircle, Users, Send, Mail } from 'lucide-react';

const InvitationsTab = ({ team, user, onMemberChange, managingMembers, onManageMember, statusColors }) => {
    const isLeader = team.team_leader?.id === user?.id;
    const [invites, setInvites] = useState([]);
    const [requests, setRequests] = useState([]);
    const [sentInvites, setSentInvites] = useState([]);
    const [joinRequestsToTeam, setJoinRequestsToTeam] = useState([]);

    useEffect(() => {
        // For leader: requests users send (pending membership), invites leader sent (TeamInvitation)
        // For member: their own requests/invites
        if (isLeader) {
            // Join requests to team (pending memberships not invited)
            setJoinRequestsToTeam((team.members || []).filter(
                m => m.status === 'pending' && (!m.invited_by || m.invited_by.id !== user.id)
            ));
            // Invites sent by leader
            setSentInvites((team.members || []).filter(
                m => m.invited_by && m.invited_by.id === user.id && m.status === 'pending'
            ));
        } else {
            setInvites(
                team.members?.filter(
                    (m) =>
                        m.user.id === user.id &&
                        m.status === 'pending' &&
                        m.invited_by &&
                        m.invited_by.id !== user.id
                ) || []
            );
            setRequests(
                team.members?.filter(
                    (m) =>
                        m.user.id === user.id &&
                        m.status === 'pending' &&
                        (!m.invited_by || m.invited_by.id === user.id)
                ) || []
            );
        }
    }, [team, user, isLeader]);

    if (isLeader) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-indigo-600" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Invitations & Join Requests</h3>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Send className="w-5 h-5 text-blue-500" />
                        Invitations You Sent (to users)
                    </h4>
                    {sentInvites.length === 0 ? (
                        <div className="text-gray-500 py-4">No user has been invited by you yet.</div>
                    ) : (
                        <div className="space-y-2">
                            {sentInvites.map(m => (
                                <div key={m.user.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                    <div>
                                        <span className="font-medium">{m.user.name}</span>
                                        <span className="text-xs text-gray-500 ml-2">{m.user.email}</span>
                                    </div>
                                    <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">{m.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-500" />
                        Join Requests To Your Team
                    </h4>
                    {joinRequestsToTeam.length === 0 ? (
                        <div className="text-gray-500 py-4">No one has sent a join request yet.</div>
                    ) : (
                        <div className="space-y-2">
                            {joinRequestsToTeam.map(member =>
                                <div key={member.user.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                    <div>
                                        <span className="font-medium">{member.user.name}</span>
                                        <span className="text-xs text-gray-500 ml-2">{member.user.email}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onManageMember(member.user.id, 'approve')}
                                            disabled={managingMembers || team.is_full}
                                            className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-xs"
                                        ><CheckCircle className="w-4 h-4" /> Accept</button>
                                        <button
                                            onClick={() => onManageMember(member.user.id, 'reject')}
                                            disabled={managingMembers}
                                            className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-xs"
                                        ><XCircle className="w-4 h-4" /> Reject</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // For Member
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Mail className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">My Invitations & Requests</h3>
            </div>
            <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Your Join Requests:</h4>
                {requests.length === 0 ? (
                    <div className="text-gray-500 py-4">No join requests sent.</div>
                ) : (
                    <div className="space-y-2">
                        {requests.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                                <div>
                                    <span className="text-sm font-medium">This team</span>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        req.status === 'declined' ? 'bg-red-100 text-red-800' :
                                            req.status === 'active' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Your Invites:</h4>
                {invites.length === 0 ? (
                    <div className="text-gray-500 py-4">No invites received.</div>
                ) : (
                    <div className="space-y-2">
                        {invites.map(inv => (
                            <div key={inv.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <div>
                                    <span className="text-sm">Invited by: {inv.invited_by?.name}</span>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs ${inv.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                        inv.status === 'declined' ? 'bg-red-100 text-red-800' :
                                            inv.status === 'active' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvitationsTab;
