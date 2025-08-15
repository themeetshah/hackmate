import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Trophy, Star, Plus, ArrowRight, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatsCard from './StatsCard';
import { mockHackathons, mockTeams } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { format, isAfter, isBefore } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();

  const upcomingHackathons = mockHackathons.filter(h =>
    isAfter(new Date(h.startDate), new Date())
  ).slice(0, 3);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Ready to find your next hackathon teammates?
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-4">
          <Link
            to="/hackathons"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Join Hackathon
          </Link>
          <Link
            to="/matching"
            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
          >
            <Users className="w-5 h-5 mr-2" />
            Find Teammates
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Hackathons"
          value="3"
          change="+2 this month"
          changeType="positive"
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title="Team Matches"
          value="12"
          change="+4 new matches"
          changeType="positive"
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Hackathons Won"
          value="2"
          change="Last: TechCrunch"
          changeType="neutral"
          icon={Trophy}
          color="green"
        />
        <StatsCard
          title="Team Rating"
          value={user?.rating || "4.8"}
          change="96th percentile"
          changeType="positive"
          icon={Star}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming Hackathons</h2>
            <Link
              to="/hackathons"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center text-sm font-medium"
            >
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingHackathons.map((hackathon) => (
              <motion.div
                key={hackathon.id}
                whileHover={{ x: 4 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <img
                        src={hackathon.image}
                        alt={hackathon.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {hackathon.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                          {hackathon.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-3">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="w-4 h-4 mr-1" />
                            {format(new Date(hackathon.startDate), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <MapPin className="w-4 h-4 mr-1" />
                            {hackathon.location}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {hackathon.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Prize Pool</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {hackathon.prizePool}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {hackathon.participants} registered
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {hackathon.teamsFormed} teams formed • Max {hackathon.maxTeamSize} per team
                  </div>
                  <Link
                    to={`/hackathons/${hackathon.id}`}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Teams</h2>
              <Link
                to="/teams"
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center text-sm font-medium"
              >
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="space-y-4">
              {mockTeams.map((team) => (
                <div
                  key={team.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">{team.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {team.hackathon}
                  </p>
                  <div className="flex -space-x-2 mt-3">
                    {team.members.map((member) => (
                      <img
                        key={member.id}
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                        title={member.name}
                      />
                    ))}
                    {team.lookingFor.length > 0 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {team.skills.slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {team.skills.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                        +{team.skills.length - 2}
                      </span>
                    )}
                  </div>
                  {team.lookingFor.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Looking for: {team.lookingFor.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🎯 Quick Tip</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Complete your profile and add more skills to get better teammate matches!
            </p>
            <Link
              to="/profile"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium flex items-center"
            >
              Update profile
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
