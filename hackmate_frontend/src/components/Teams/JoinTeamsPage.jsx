import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, Users } from 'lucide-react';
import teamsServices from '../../api/teamsServices';
import hackathonServices from '../../api/hackathonServices';
import TeamCard from './TeamCard';
import { useToast } from '../../hooks/useToast';
import Toast from '../ui/Toast';

const JoinTeamsPage = ({ isOpen, onClose, user }) => {
    const [userHackathons, setUserHackathons] = useState([]);
    const [joinedHackathonIds, setJoinedHackathonIds] = useState([]);
    const [selectedHackathon, setSelectedHackathon] = useState('');
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [joining, setJoining] = useState(false);
    const { toasts, showToast, removeToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            fetchUserHackathons();
            fetchJoinedHackathons();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedHackathon) {
            fetchTeams(selectedHackathon);
        } else {
            setTeams([]); // Clear teams when no hackathon selected
        }
    }, [selectedHackathon]);

    async function fetchUserHackathons() {
        const resp = await hackathonServices.getUserHackathons();
        if (resp.success) {
            setUserHackathons(resp.hackathons || []);
        }
    }

    async function fetchJoinedHackathons() {
        const resp = await teamsServices.getMyTeams();
        if (resp.success) {
            const ids = resp.teams.map(t => String(t.hackathon));
            setJoinedHackathonIds([...new Set(ids)]);
        }
    }

    const selectableHackathons = useMemo(() => {
        return userHackathons.filter(h => !joinedHackathonIds.includes(String(h.id)));
    }, [userHackathons, joinedHackathonIds]);

    useEffect(() => {
        if (selectableHackathons.length > 0 && !selectedHackathon) {
            setSelectedHackathon((selectableHackathons[0].id));
        } else if (selectableHackathons.length === 0) {
            setSelectedHackathon('');
            setTeams([]);
        }
    }, [selectableHackathons, selectedHackathon]);

    async function fetchTeams(hackathonId) {
        if (!hackathonId) return;

        setLoading(true);
        try {
            const resp = await teamsServices.getTeams({ hackathon: hackathonId });
            setTeams(resp.teams || []);
        } catch (error) {
            console.error('Error fetching teams:', error);
            setTeams([]);
        } finally {
            setLoading(false);
        }
    }

    // ✅ FILTER TEAMS BY SELECTED HACKATHON (Frontend safety check)
    const filteredTeams = useMemo(() => {
        if (!selectedHackathon) return [];
        return teams.filter(team => String(team.hackathon) === String(selectedHackathon));
    }, [teams, selectedHackathon]);

    const handleJoin = async (teamId) => {
        setJoining(true);
        try {
            const response = await teamsServices.joinTeam(teamId);
            if (response.success) {
                showToast('Join request sent successfully!', 'success');
                await fetchTeams(selectedHackathon);
            } else {
                showToast(response.message || 'Failed to send join request', 'error');
            }
        } catch (error) {
            showToast('An error occurred while sending join request', 'error');
        } finally {
            setJoining(false);
        }
    };

    const handleAcceptInvite = async (invitationId) => {
        setJoining(true);
        try {
            const response = await teamsServices.acceptInvitation(invitationId);
            if (response.success) {
                showToast('Invitation accepted successfully!', 'success');
                await fetchTeams(selectedHackathon);
                await fetchJoinedHackathons();
                onClose();
            } else {
                showToast(response.message || 'Failed to accept invitation', 'error');
            }
        } catch (error) {
            showToast('An error occurred while accepting invitation', 'error');
        } finally {
            setJoining(false);
        }
    };

    const handleRejectInvite = async (invitationId) => {
        setJoining(true);
        try {
            const response = await teamsServices.declineInvitation(invitationId);
            if (response.success) {
                showToast('Invitation declined', 'info');
                await fetchTeams(selectedHackathon);
            } else {
                showToast(response.message || 'Failed to decline invitation', 'error');
            }
        } catch (error) {
            showToast('An error occurred while declining invitation', 'error');
        } finally {
            setJoining(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <Toast toasts={toasts} onRemove={removeToast} />
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-40 backdrop-blur-sm"
                    onClick={e => e.target === e.currentTarget && onClose()}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 12 }}
                        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[85vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Join Teams</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Browse and join teams for hackathons</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Hackathon Selector */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                Choose Hackathon:
                            </label>
                            <select
                                value={selectedHackathon}
                                onChange={e => setSelectedHackathon(e.target.value)}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                disabled={selectableHackathons.length === 0}
                            >
                                <option value="">Select a hackathon</option>
                                {selectableHackathons.map(h => (
                                    <option key={h.id} value={h.id}>
                                        {h.title} ({new Date(h.start_date).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                            {selectableHackathons.length === 0 && (
                                <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                    <p className="text-sm text-orange-700 dark:text-orange-300">
                                        You have already joined a team for all your hackathons.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Teams List */}
                        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                                    <span className="text-gray-600 dark:text-gray-400">Loading teams...</span>
                                </div>
                            ) : !selectedHackathon ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg mb-2">Select a hackathon</p>
                                    <p className="text-sm">Choose a hackathon to view available teams</p>
                                </div>
                            ) : filteredTeams.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg mb-2">No teams available</p>
                                    <p className="text-sm">No teams found for this hackathon yet</p>
                                </div>
                            ) : (
                                filteredTeams.map(team => (
                                    <TeamCard
                                        key={team.id}
                                        team={team}
                                        currentUserId={user?.id}
                                        onJoin={handleJoin}
                                        onAcceptInvite={handleAcceptInvite}
                                        onRejectInvite={handleRejectInvite}
                                        isLoading={joining}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </>
    );
};

export default JoinTeamsPage;
