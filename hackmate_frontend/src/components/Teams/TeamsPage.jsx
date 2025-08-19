import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MessageCircle, Mail, Send, Settings, Calendar, Plus,
  Star, Loader, Trophy, Filter
} from 'lucide-react';
import CreateTeamForm from './CreateTeamForm';
import JoinTeamsPage from './JoinTeamsPage';
import TeamChat from './TeamChat';
import InvitationsTab from './InvitationsTab';
import teamsServices from '../../api/teamsServices';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import Toast from '../ui/Toast';
import RequestsTab from './RequestsTab';

const TeamsPage = () => {
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTeamDetails, setSelectedTeamDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinPage, setShowJoinPage] = useState(false);
  const [managingMembers, setManagingMembers] = useState(false);

  const statusColors = {
    looking: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    full: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamsServices.getMyTeams();
      if (response.success) {
        setTeams(response.teams);
        if (response.teams.length > 0 && !selectedTeam) {
          handleSelectTeam(response.teams[0]);
        } else if (response.teams.length === 0) {
          // If no teams, show requests tab by default
          setActiveTab('requests');
        }
      } else {
        showToast('Failed to fetch teams', 'error');
        setActiveTab('requests'); // Show requests tab on error too
      }
    } catch (error) {
      showToast('Error fetching teams', 'error');
      setActiveTab('requests'); // Show requests tab on error
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeam = async (team) => {
    setSelectedTeam(team);
    setActiveTab('overview');
    await fetchTeamDetails(team.id);
  };

  const fetchTeamDetails = async (teamId) => {
    try {
      const response = await teamsServices.getTeamById(teamId);
      if (response.success) {
        setSelectedTeamDetails(response.team);
      }
    } catch (error) {
      showToast('Error fetching team details', 'error');
    }
  };

  const handleManageMember = async (memberId, action) => {
    try {
      setManagingMembers(true);
      const response = await teamsServices.manageMember(selectedTeam.id, memberId, action);
      if (response.success) {
        showToast(response.message, 'success');
        await fetchTeamDetails(selectedTeam.id);
        await fetchTeams();
      } else {
        showToast(response.message, 'error');
      }
    } catch (error) {
      showToast('Error managing member', 'error');
    } finally {
      setManagingMembers(false);
    }
  };

  if (showCreateForm) {
    return (
      <CreateTeamForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={() => {
          setShowCreateForm(false);
          fetchTeams();
          showToast('Team created successfully!', 'success');
        }}
      />
    );
  }

  if (showJoinPage) {
    return (
      <JoinTeamsPage
        isOpen={showJoinPage}
        onClose={() => setShowJoinPage(false)}
        user={user}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Toast toasts={toasts} onRemove={removeToast} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teams</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your teams and collaborate on projects
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowJoinPage(true)}
              className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
            >
              <Users className="w-4 h-4 mr-2" />
              Join Team
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Teams List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-4"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Teams</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading teams...</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No teams yet</p>
                <p className="text-sm">Create your first team!</p>
              </div>
            ) : (
              teams.map((team) => (
                <motion.div
                  key={team.id}
                  whileHover={{ x: 4 }}
                  onClick={() => handleSelectTeam(team)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${selectedTeam && selectedTeam.id === team.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md'
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {team.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[team.status]}`}>
                      {team.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    {team.hackathon_title || team.hackathon}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1">
                      {Array.from({ length: Math.min(team.current_member_count || 0, 3) }).map((_, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold"
                          title={`Member ${index + 1}`}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                      ))}
                      {(team.current_member_count || 0) > 3 && (
                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300">
                          +{(team.current_member_count || 0) - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      <span>{team.current_member_count || 0}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Team Details or Global Tabs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            {/* Always show tab navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {/* Show different tabs based on whether a team is selected */}
                  {selectedTeam ? (
                    // Team-specific tabs
                    [
                      { id: 'overview', label: 'Overview', icon: Users },
                      { id: 'chat', label: 'Team Chat', icon: MessageCircle },
                      { id: 'invitations', label: 'Invitations', icon: Mail, leaderOnly: true },
                      { id: 'requests', label: 'Requests', icon: Send },
                    ].map((tab) => {
                      const Icon = tab.icon;

                      // Hide invitations tab for non-leaders
                      if (tab.leaderOnly && selectedTeamDetails?.team_leader?.id !== user?.id) {
                        return null;
                      }

                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {tab.label}
                        </button>
                      );
                    })
                  ) : (
                    // Global tabs when no team is selected
                    [
                      { id: 'requests', label: 'My Requests', icon: Send },
                    ].map((tab) => {
                      const Icon = tab.icon;

                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {tab.label}
                        </button>
                      );
                    })
                  )}
                </nav>
              </div>

              <div className={activeTab === 'chat' ? 'p-3' : 'p-6'}>
                {/* Team-specific content when a team is selected */}
                {selectedTeam && activeTab === 'overview' && selectedTeamDetails && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Team Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {selectedTeam.name}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {selectedTeamDetails.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>Created {new Date(selectedTeamDetails.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            <span>{selectedTeamDetails.current_member_count} members</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Settings className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>

                    {/* Hackathon Info */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Hackathon: {selectedTeamDetails.hackathon_title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedTeamDetails.project_idea || selectedTeamDetails.project_name || 'Building an amazing project together'}
                      </p>
                    </div>

                    {/* Team Members */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Team Members</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedTeamDetails.members?.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {member.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {member.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {member.role}
                              </p>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                              <span>{member.average_rating || '4.8'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Looking For */}
                    {selectedTeamDetails.looking_for_roles?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Looking For</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedTeamDetails.looking_for_roles.map((role) => (
                            <span
                              key={role}
                              className="px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg text-sm font-medium flex items-center"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              {role}
                            </span>
                          ))}
                        </div>
                        <button className="mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                          Send invites to potential teammates →
                        </button>
                      </div>
                    )}

                    {/* Team Skills */}
                    {selectedTeamDetails.required_skills?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Team Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedTeamDetails.required_skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {selectedTeam && activeTab === 'chat' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-96"
                  >
                    <TeamChat teamId={selectedTeam.id} />
                  </motion.div>
                )}

                {/* INVITATIONS TAB - Only for team leaders */}
                {selectedTeam && activeTab === 'invitations' && selectedTeamDetails && selectedTeamDetails.team_leader?.id === user?.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <InvitationsTab
                      team={selectedTeamDetails}
                      user={user}
                      onMemberChange={() => fetchTeamDetails(selectedTeam.id)}
                      managingMembers={managingMembers}
                      onManageMember={handleManageMember}
                    />
                  </motion.div>
                )}

                {/* REQUESTS TAB - For all users (shown regardless of team selection) */}
                {activeTab === 'requests' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <RequestsTab user={user} />
                  </motion.div>
                )}

                {/* Show placeholder when no team is selected and not on requests tab */}
                {!selectedTeam && activeTab !== 'requests' && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">No teams selected</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Select a team from the sidebar or create a new one to get started
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;
