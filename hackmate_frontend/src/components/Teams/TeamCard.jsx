import React from 'react';
import { Users, MapPin, CheckCircle, XCircle } from 'lucide-react';

const TeamCard = ({ team, currentUserId, onJoin, onAcceptInvite, onRejectInvite, isLoading }) => {
    let actionControl = null;
    if (team.is_full) {
        actionControl = (
            <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed">
                Team Full
            </button>
        );
    } else if (team.current_member_status === 'active') {
        actionControl = (
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                You are a member
            </span>
        );
    } else if (team.invite_status === 'received') {
        actionControl = (
            <div className="flex gap-2">
                <button
                    onClick={() => onAcceptInvite(team.invite_id)}
                    disabled={isLoading}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    Accept Invite
                </button>
                <button
                    onClick={() => onRejectInvite(team.invite_id)}
                    disabled={isLoading}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                    Reject
                </button>
            </div>
        );
    } else if (team.join_status === 'pending' || team.join_status === 'sent') {
        actionControl = (
            <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium">
                Request Sent
            </span>
        );
    } else if (team.join_status === 'declined') {
        actionControl = (
            <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium">
                Request Declined
            </span>
        );
    } else {
        actionControl = (
            <button
                onClick={() => onJoin(team.id)}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                Join Team
            </button>
        );
    }

    return (
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{team.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${team.status === 'looking' ? 'bg-blue-100 text-blue-800' :
                                team.status === 'full' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {team.status}
                        </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{team.description || 'No description provided'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{team.current_member_count} / {team.max_members} members</span>
                        </div>
                        {team.allow_remote && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>Remote OK</span>
                            </div>
                        )}
                    </div>
                    {team.required_skills?.length > 0 && (
                        <div className="mb-4">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Skills needed:</div>
                            <div className="flex flex-wrap gap-1">
                                {team.required_skills.slice(0, 3).map(skill =>
                                    <span key={skill} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">{skill}</span>
                                )}
                                {team.required_skills.length > 3 && (
                                    <span className="text-xs text-gray-500">+{team.required_skills.length - 3} more</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="ml-4">
                    {actionControl}
                </div>
            </div>
        </div>
    );
};

export default TeamCard;
