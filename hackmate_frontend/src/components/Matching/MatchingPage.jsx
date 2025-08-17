import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Sparkles, Target, Zap, ChevronDown, Loader,
  Trophy, RefreshCw, Search
} from 'lucide-react';
import ParticipantCard from './ParticipantCard';
import { useAuth } from '../../contexts/AuthContext';
import hackathonServices from '../../api/hackathonServices';

const MatchingPage = () => {
  const { user } = useAuth();
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [userHackathons, setUserHackathons] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hackathonsLoading, setHackathonsLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('matches');

  // Fetch user's hackathons on component mount
  useEffect(() => {
    fetchUserHackathons();
  }, []);

  // Fetch participants when hackathon selection changes
  useEffect(() => {
    if (selectedHackathon) {
      fetchParticipants();
    } else {
      setParticipants([]);
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
      console.error('Error fetching user hackathons:', error);
      setError('Failed to fetch your hackathons');
    } finally {
      setHackathonsLoading(false);
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
      console.error('Error fetching participants:', error);
      setError('Failed to fetch participants');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = (participant) => {
    // TODO: Implement invite functionality
    console.log('Inviting participant:', participant);
  };

  const handleMessage = (participant) => {
    // TODO: Implement messaging functionality
    console.log('Messaging participant:', participant);
  };

  const getSelectedHackathonData = () => {
    return userHackathons.find(h => h.id === parseInt(selectedHackathon));
  };

  // Group participants by compatibility score
  const bestMatches = participants.filter(p => p.compatibility >= 80);
  const goodMatches = participants.filter(p => p.compatibility >= 60 && p.compatibility < 80);
  const otherMatches = participants.filter(p => p.compatibility < 60);

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
        {selectedHackathon && !loading && !error && participants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Best Matches View */}
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
                            onInvite={handleInvite}
                            onMessage={handleMessage}
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
                            onInvite={handleInvite}
                            onMessage={handleMessage}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {participants.map((participant, index) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ParticipantCard
                        participant={participant}
                        onInvite={handleInvite}
                        onMessage={handleMessage}
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
