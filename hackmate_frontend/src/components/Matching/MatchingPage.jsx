import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Sparkles, Target, Zap, ChevronDown, Loader,
  Trophy, RefreshCw, Search
} from 'lucide-react';
import ParticipantCard from './ParticipantCard';
import { useAuth } from '../../contexts/AuthContext';
import hackathonServices from '../../api/hackathonServices';
import teamsServices from '../../api/teamsServices';
import { useToast } from '../../hooks/useToast';

const MatchingPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [userHackathons, setUserHackathons] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hackathonsLoading, setHackathonsLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('matches');
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchUserHackathons();
  }, []);

  useEffect(() => {
    if (selectedHackathon) {
      fetchParticipants();
      fetchTeams();
    } else {
      setParticipants([]);
      setTeams([]);
    }
  }, [selectedHackathon]);

  const fetchUserHackathons = async () => {
    try {
      setHackathonsLoading(true);
      const response = await hackathonServices.getUserHackathons();
      if (response.success) {
        setUserHackathons(response.hackathons);
        // Auto-select first hackathon if available
        if (response.hackathons.length > 0) {
          setSelectedHackathon(response.hackathons[0].id);
        }
      } else {
        setError('Failed to fetch your hackathons');
      }
    } catch (error) {
      setError('Failed to fetch your hackathons');
    } finally {
      setHackathonsLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await teamsServices.getTeams({ hackathon: selectedHackathon });
      if (response.success) setTeams(response.teams || []);
      else setTeams([]);
    } catch (error) {
      setTeams([]);
    }
  };

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await hackathonServices.getHackathonParticipants({
        hackathon_id: selectedHackathon
      });
      if (response.success) {
        setParticipants(response.participants);
      } else {
        setError(response.message || 'Failed to fetch participants');
      }
    } catch (error) {
      setError('Failed to fetch participants');
    } finally {
      setLoading(false);
    }
  };

  // Helper: checks if participant is in any team for this hackathon
  function getParticipantTeam(participantId) {
    console.log(teams)
    return teams.find(team =>
      Array.isArray(team.members) &&
      team.members.some(m => m.id === participantId && m.status === 'active')
    );
  }

  // Helper: get user's team for this hackathon as leader or member
  function getUserTeam() {
    return teams.find(t =>
      t.hackathon === selectedHackathon &&
      t.members &&
      t.members.some(m => m.user.id === user.id && m.status === 'active')
    );
  }

  function getUserLeaderTeam() {
    return teams.find(t =>
      t.hackathon === selectedHackathon &&
      t.team_leader?.id === user.id
    );
  }

  // Invite: only if participant is NOT in a team
  const handleInvite = async (participant) => {
    // Only leader of a team can invite
    const userTeam = getUserLeaderTeam();
    if (!userTeam) {
      showToast('You must be a team leader to invite.', 'error');
      return;
    }
    // Already in team, do not invite
    if (getParticipantTeam(participant.id)) {
      showToast('User is already in a team.', 'error');
      return;
    }
    // Invite participant
    const resp = await teamsServices.inviteToTeam(
      userTeam.id,
      { invitee_email: participant.email }
    );
    if (resp.success) showToast('Invitation sent!', 'success');
    else showToast(resp.message || 'Failed to send invite', 'error');
  };

  // Join team: only if participant IS in a team
  const handleJoinTeam = async (participant) => {
    const team = getParticipantTeam(participant.id);
    if (!team) {
      showToast('User is not in any team.', 'error');
      return;
    }
    const resp = await teamsServices.joinTeam(team.id);
    if (resp.success) showToast('Join request sent!', 'success');
    else showToast(resp.message || 'Failed to send join request', 'error');
  };

  // Pass function to ParticipantCard
  const enhancedParticipants = participants.map(p => ({
    ...p,
    hasTeam: !!getParticipantTeam(p.id),
    team: getParticipantTeam(p.id)
  }));

  function getSelectedHackathonData() {
    return userHackathons.find(
      h => String(h.id) === String(selectedHackathon)
    );
  }

  const bestMatches = enhancedParticipants.filter(p => p.compatibility >= 80);
  const goodMatches = enhancedParticipants.filter(p => p.compatibility >= 60 && p.compatibility < 80);
  const otherMatches = enhancedParticipants.filter(p => p.compatibility < 60);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Your Perfect Teammates</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Discover talented individuals who complement your skills
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setView('matches')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${view === 'matches'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Best Matches
            </button>
            <button
              onClick={() => setView('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${view === 'all'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Users className="w-4 h-4 mr-2" />
              All Participants
            </button>
          </div>
        </div>
      </motion.div>

      {/* Hackathon Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Select Hackathon
        </h2>

        {hackathonsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading your hackathons...</span>
          </div>
        ) : userHackathons.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Hackathons Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You haven't participated in any hackathons yet. Join a hackathon to find teammates!
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1">
              <select
                value={selectedHackathon}
                onChange={(e) => setSelectedHackathon(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="">Choose a hackathon to find teammates...</option>
                {userHackathons.map((hackathon) => (
                  <option key={hackathon.id} value={hackathon.id}>
                    {hackathon.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {selectedHackathon && getSelectedHackathonData() && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 flex-shrink-0"
              >
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">
                    Finding teammates for: {getSelectedHackathonData().title}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>


      {/* Loading State */}
      {selectedHackathon && loading && (
        <div className="flex items-center justify-center py-16">
          <Loader className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">
            Finding your perfect teammates...
          </span>
        </div>
      )}

      {/* Error State */}
      {selectedHackathon && error && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Unable to Load Participants
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchParticipants}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}

      {/* No Participants State */}
      {selectedHackathon && !loading && !error && participants.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Other Participants
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            There are no other confirmed participants in this hackathon yet.
          </p>
        </div>
      )}

      {/* Participants Display */}
      <AnimatePresence>
        {selectedHackathon && !loading && !error && enhancedParticipants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Best Matches */}
            {view === 'matches' && (
              <div className="space-y-6">
                {bestMatches.length > 0 && (
                  <div>
                    <div className="flex items-center mb-4">
                      <Target className="w-6 h-6 text-green-500 mr-2" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Perfect Matches ({bestMatches.length})
                      </h2>
                      <span className="ml-2 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                        80%+ Compatibility
                      </span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {bestMatches.map((participant, index) => (
                        <motion.div
                          key={participant.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ParticipantCard
                            participant={participant}
                            onInvite={participant.hasTeam
                              ? () => handleJoinTeam(participant)
                              : () => handleInvite(participant)}
                            // onMessage={handleMessage}
                            showInviteLabel={participant.hasTeam ? 'Join Team' : 'Invite'}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {goodMatches.length > 0 && (
                  <div>
                    <div className="flex items-center mb-4">
                      <Zap className="w-6 h-6 text-blue-500 mr-2" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Good Matches ({goodMatches.length})
                      </h2>
                      <span className="ml-2 p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                        60%+ Compatibility
                      </span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {goodMatches.map((participant, index) => (
                        <motion.div
                          key={participant.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ParticipantCard
                            participant={participant}
                            onInvite={participant.hasTeam
                              ? () => handleJoinTeam(participant)
                              : () => handleInvite(participant)}
                            // onMessage={handleMessage}
                            showInviteLabel={participant.hasTeam ? 'Join Team' : 'Invite'}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {bestMatches.length === 0 && goodMatches.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No high compatibility matches</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Try viewing all participants to see other potential teammates
                    </p>
                    <button
                      onClick={() => setView('all')}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      View all participants
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* All Participants View */}
            {view === 'all' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    All Participants ({participants.length})
                  </h2>
                </div>

                {console.log(participants)}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {enhancedParticipants.map((participant, index) =>
                  (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ParticipantCard
                        participant={participant}
                        onInvite={participant.hasTeam
                          ? () => handleJoinTeam(participant)
                          : () => handleInvite(participant)}
                        // onMessage={handleMessage}
                        showInviteLabel={participant.hasTeam ? 'Join Team' : 'Invite'}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MatchingPage;
