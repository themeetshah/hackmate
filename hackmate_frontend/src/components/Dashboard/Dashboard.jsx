import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Users, ArrowRight, Calendar, MapPin,
  ExternalLink, Award, ChevronRight, User, Settings,
  Sparkles, Code, Zap, Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import hackathonServices from '../../api/hackathonServices';

// Smaller, Better Banner Section
const Banner = ({ user }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 md:p-8 mb-10 text-white overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Welcome back, {user?.name?.split(' ')[0] || 'Developer'}!
            <motion.span
              animate={{ rotate: [0, 20, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block ml-2"
            >
              👋
            </motion.span>
          </h1>
          <p className="text-lg text-indigo-100 mb-6">
            Ready to join amazing hackathons and build incredible projects?
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/hackathons"
              className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Join Hackathon
            </Link>
            <Link
              to="/matching"
              className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-indigo-600 transition-all duration-300 flex items-center justify-center"
            >
              <Users className="w-5 h-5 mr-2" />
              Find Teammates
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

// Enhanced Quick Links Section
const QuickLinks = () => {
  const links = [
    {
      title: "Discover",
      description: "Explore all hackathons and opportunities",
      to: "/hackathons",
      icon: Trophy,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      borderColor: "border-blue-200 dark:border-blue-700"
    },
    {
      title: "Connect",
      description: "Find teammates and build networks",
      to: "/matching",
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
      borderColor: "border-purple-200 dark:border-purple-700"
    },
    {
      title: "Profile",
      description: "Manage your skills and experience",
      to: "/profile",
      icon: User,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20",
      borderColor: "border-emerald-200 dark:border-emerald-700"
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-12"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {links.map((link, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="group"
          >
            <Link
              to={link.to}
              className={`block bg-gradient-to-br ${link.bgColor} rounded-2xl p-6 border ${link.borderColor} hover:shadow-xl transition-all duration-300 h-full`}
            >
              <div className={`w-14 h-14 bg-gradient-to-r ${link.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                <link.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {link.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                {link.description}
              </p>
              <div className="flex items-center text-indigo-600 dark:text-indigo-400 group-hover:translate-x-2 transition-transform">
                <span className="text-sm font-semibold">Get started</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

// Enhanced Hackathon Card
const HackathonCard = ({ hackathon, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.15 }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
  >
    <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-tight">{hackathon.title}</h3>
            <div className="flex items-center gap-4 text-white/90 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{hackathon.start_date ? new Date(hackathon.start_date).toLocaleDateString() : 'TBD'}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="capitalize">{hackathon.mode || 'Online'}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/80 mb-1">Prize Pool</div>
            <div className="text-2xl font-black">
              ₹{hackathon.total_prize_pool?.toLocaleString() || '0'}
            </div>
          </div>
        </div>

        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${hackathon.status === 'published'
            ? 'bg-green-400/20 text-green-100 border border-green-400/30'
            : 'bg-yellow-400/20 text-yellow-100 border border-yellow-400/30'
          }`}>
          {hackathon.status === 'published' ? '🟢 Open Now' : '🟡 Coming Soon'}
        </div>
      </div>
    </div>

    <div className="p-6">
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
        {hackathon.description || 'Join this exciting hackathon and showcase your skills while building something incredible!'}
      </p>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="font-semibold">{hackathon.confirmed_participants || 0} joined</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            <span>Multi-day event</span>
          </div>
        </div>
      </div>

      <Link
        to={`/hackathons/${hackathon.id}`}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <span>Join Adventure</span>
        <ExternalLink className="w-4 h-4" />
      </Link>
    </div>
  </motion.div>
);

// Enhanced Explore Hackathons Section
const ExploreHackathons = ({ hackathons, loading }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="mb-12"
  >
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          Explore Hackathons
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Discover amazing coding competitions and challenges</p>
      </div>
      <Link
        to="/hackathons"
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
      >
        <span>See All</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>

    {loading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    ) : hackathons.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hackathons.slice(0, 3).map((hackathon, index) => (
          <HackathonCard key={hackathon.id} hackathon={hackathon} index={index} />
        ))}
      </div>
    ) : (
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
        <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Hackathons Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          New exciting opportunities are coming soon!
        </p>
        <Link
          to="/hackathons"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Code className="w-4 h-4" />
          Explore More
        </Link>
      </div>
    )}
  </motion.section>
);

// Enhanced My Hackathons Section
const MyHackathonsSection = ({ appliedCount, organizedCount }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="mb-12"
  >
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          My Hackathons
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Track your hackathon journey and achievements</p>
      </div>
      <Link
        to="/hackathons/my"
        className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
      >
        <span>View All</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-blue-800/30 rounded-2xl p-8 border border-blue-200 dark:border-blue-700 group"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div className="text-right">
            <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {appliedCount}
            </div>
            <div className="text-sm text-blue-600/80 font-semibold">Applications</div>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Applied Hackathons
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          Track your hackathon applications and their status. Keep building amazing projects!
        </p>
        <div className="mt-4 text-xs text-blue-600 font-semibold">
          🚀 Keep exploring new opportunities!
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-purple-800/30 rounded-2xl p-8 border border-purple-200 dark:border-purple-700 group"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <div className="text-right">
            <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {organizedCount}
            </div>
            <div className="text-sm text-purple-600/80 font-semibold">Organized</div>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Organized Events
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          Manage your organized hackathons and participants. Create amazing experiences!
        </p>
        <div className="mt-4 text-xs text-purple-600 font-semibold">
          👑 Great leadership skills!
        </div>
      </motion.div>
    </div>

    <motion.div
      whileHover={{ scale: 1.02 }}
      className="mt-8 text-center"
    >
      <Link
        to="/hackathons/my"
        className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-gray-900 px-8 py-4 rounded-2xl font-bold hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-100 dark:hover:to-gray-200 transition-all shadow-xl hover:shadow-2xl"
      >
        <Heart className="w-5 h-5" />
        <span>View My Journey</span>
        <Sparkles className="w-5 h-5" />
      </Link>
    </motion.div>
  </motion.section>
);

// Main Dashboard Component
const Dashboard = () => {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [myHackathonsData, setMyHackathonsData] = useState({ applied: 0, organized: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch hackathons
        const hackathonsResponse = await hackathonServices.getHackathons();
        if (hackathonsResponse.success) {
          setHackathons(hackathonsResponse.data.hackathons || []);
        }

        // Fetch my hackathons data
        try {
          const myApplicationsResponse = await hackathonServices.getMyApplications();
          const appliedCount = myApplicationsResponse.success ? (myApplicationsResponse.data.applications?.length || 0) : 0;

          let organizedCount = 0;
          if (user?.role === 'organizer' || user?.role === 'admin') { // Fixed comparison operators
            const organizedResponse = await hackathonServices.getHackathons();
            if (organizedResponse.success) {
              organizedCount = (organizedResponse.data.hackathons || []).filter(h =>
                h.organizer === user?.id || h.organizer_id === user?.id // Fixed comparison operators
              ).length;
            }
          }

          setMyHackathonsData({ applied: appliedCount, organized: organizedCount });
        } catch (error) {
          console.error('Failed to fetch my hackathons data:', error);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Smaller Banner */}
        <Banner user={user} />

        {/* Enhanced Quick Links */}
        <QuickLinks />

        {/* Enhanced Explore Hackathons */}
        <ExploreHackathons hackathons={hackathons} loading={loading} />

        {/* Enhanced My Hackathons */}
        <MyHackathonsSection
          appliedCount={myHackathonsData.applied}
          organizedCount={myHackathonsData.organized}
        />
      </div>
    </div>
  );
};

export default Dashboard;
