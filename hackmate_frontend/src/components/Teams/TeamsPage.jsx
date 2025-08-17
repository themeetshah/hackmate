import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Plus, Settings, Calendar, Trophy, Star } from 'lucide-react';
import { mockTeams } from '../../data/mockData';
import TeamChat from './TeamChat';

const TeamsPage = () => {
  const [selectedTeam, setSelectedTeam] = useState(mockTeams[0]);
  const [activeTab, setActiveTab] = useState('overview');

  const statusColors = {
    looking: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    full: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Teams</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your hackathon teams and collaborate with teammates
          </p>
        </div>

        <button className="mt-4 md:mt-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Create Team
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Teams List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Teams</h2>
          {mockTeams.map((team) => (
            <motion.div
              key={team.id}
              whileHover={{ x: 4 }}
              onClick={() => setSelectedTeam(team)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${selectedTeam.id === team.id
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
                {team.hackathon}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-1">
                  {team.members.slice(0, 3).map((member) => (
                    <img
                      key={member.id}
                      src={member.avatar}
                      alt={member.name}
                      className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                      title={member.name}
                    />
                  ))}
                  {team.members.length > 3 && (
                    <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300">
                      +{team.members.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  <span>{team.members.length}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Team Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3"
        >
          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: Users },
                  { id: 'chat', label: 'Team Chat', icon: MessageCircle },
                  { id: 'progress', label: 'Progress', icon: Trophy }
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
                })}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
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
                        {selectedTeam.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Created {new Date(selectedTeam.created).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{selectedTeam.members.length} members</span>
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
                      Hackathon: {selectedTeam.hackathon}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Building an AI-powered productivity assistant for developers
                    </p>
                  </div>

                  {/* Team Members */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Team Members</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTeam.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
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
                            <span>4.8</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Looking For */}
                  {selectedTeam.lookingFor.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Looking For</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTeam.lookingFor.map((role) => (
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
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Team Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTeam.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'chat' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-96"
                >
                  <TeamChat />
                </motion.div>
              )}

              {activeTab === 'progress' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Project Progress
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Track your team's progress and milestones
                    </p>
                    <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                      Add Milestone
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeamsPage;
