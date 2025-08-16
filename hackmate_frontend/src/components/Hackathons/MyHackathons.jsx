import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import hackathonServices from "../../api/hackathonServices";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy, Users, CheckCircle, Clock, X, Calendar,
    MapPin, DollarSign, Eye, ExternalLink, Settings,
    User, Award, ChevronRight, AlertCircle, Info,
    Star, TrendingUp, Activity, Zap, UserCheck, Hash,
    Search, Filter, BarChart3, Medal, Target, Plus,
    ArrowUp, ArrowDown, Sparkles, Flame, Crown, Menu
} from "lucide-react";

// Fully Responsive Search & Filter Bar
const SearchFilterBar = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => {
    const [showFilters, setShowFilters] = useState(false);

    // const statusOptions = [
    //     { value: 'all', label: 'All Status', count: 12 },
    //     { value: 'confirmed', label: 'Confirmed', count: 8 },
    //     { value: 'applied', label: 'Applied', count: 3 },
    //     { value: 'rejected', label: 'Rejected', count: 1 }
    // ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 space-y-3 sm:space-y-4"
        >
            {/* Mobile & Desktop Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                        type="text"
                        placeholder="Search hackathons..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white/80 dark:bg-gray-800/80 dark:text-white backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                </div>
                {/* <motion.button
                    onClick={() => setShowFilters(!showFilters)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl border transition-all text-sm sm:text-base ${showFilters
                        ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/25"
                        : "bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300"
                        }`}
                >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                </motion.button> */}
            </div>

            {/* Advanced Filters - Fully Responsive */}
            {/* <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 shadow-xl"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {/* Status Filter
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Status
                                </label>
                                <div className="space-y-2">
                                    {statusOptions.map((option) => (
                                        <motion.button
                                            key={option.value}
                                            onClick={() => setStatusFilter(option.value)}
                                            whileHover={{ scale: 1.01 }}
                                            className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-lg border transition-all text-sm ${statusFilter === option.value
                                                ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
                                                : "border-gray-200 dark:text-white dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                }`}
                                        >
                                            <span className="font-medium">{option.label}</span>
                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                                {option.count}
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Range
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Date Range
                                </label>
                                <div className="space-y-3">
                                    <input
                                        type="date"
                                        className="w-full p-2.5 sm:p-3 text-sm bg-white dark:text-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="From"
                                    />
                                    <input
                                        type="date"
                                        className="w-full p-2.5 sm:p-3 text-sm bg-white dark:text-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="To"
                                    />
                                </div>
                            </div>

                            {/* Prize Range
            <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Prize Range
                </label>
                <div className="space-y-3">
                    <input
                        type="number"
                        placeholder="Min Prize (₹)"
                        className="w-full p-2.5 sm:p-3 text-sm bg-white dark:text-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                        type="number"
                        placeholder="Max Prize (₹)"
                        className="w-full p-2.5 sm:p-3 text-sm bg-white dark:text-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>
        </div>
                    </motion.div >
                )}
            </AnimatePresence > */}
        </motion.div >
    );
};

// Responsive Quick Action Menu
const QuickActionMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const actions = [
        { label: "Browse Hackathons", icon: Eye, action: () => navigate("/hackathons") },
        { label: "Create Hackathon", icon: Plus, action: () => navigate("/hackathons/create") },
        { label: "View Analytics", icon: BarChart3, action: () => navigate("/dashboard/analytics") }
    ];

    return (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-14 sm:bottom-16 right-0 space-y-2 w-48 sm:w-auto"
                    >
                        {actions.map((action, index) => (
                            <motion.button
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={action.action}
                                className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all whitespace-nowrap text-sm w-full"
                            >
                                <action.icon className="w-4 h-4 text-indigo-600" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {action.label}
                                </span>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            >
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.div>
            </motion.button>
        </div>
    );
};

// Responsive Tab Navigation
const TabNavigation = ({ activeTab, onTabChange, tabs }) => (
    <div className="relative mb-6 sm:mb-10">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-2 rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            {tabs.map((tab) => (
                <motion.button
                    key={tab.key}
                    onClick={() => onTabChange(tab.key)}
                    className={`relative flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === tab.key
                        ? "text-white shadow-lg"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                        }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    {/* Active background gradient */}
                    {activeTab === tab.key && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl"
                            transition={{ type: "spring", duration: 0.5 }}
                        />
                    )}

                    <div className="relative flex items-center gap-2 sm:gap-3">
                        <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">{tab.label}</span>
                        {tab.count > 0 && (
                            <motion.span
                                className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-bold ${activeTab === tab.key
                                    ? "bg-white/20 text-white"
                                    : "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300"
                                    }`}
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {tab.count}
                            </motion.span>
                        )}
                    </div>
                </motion.button>
            ))}
        </div>
    </div>
);

// Enhanced Status Badge - Already responsive
const StatusBadge = ({ status }) => {
    const statusConfig = {
        confirmed: {
            label: "Confirmed",
            gradient: "from-emerald-500 to-green-600",
            icon: CheckCircle,
            pulse: true
        },
        applied: {
            label: "Applied",
            gradient: "from-blue-500 to-indigo-600",
            icon: Clock,
            pulse: false
        },
        rejected: {
            label: "Rejected",
            gradient: "from-red-500 to-rose-600",
            icon: X,
            pulse: false
        },
        team_pending: {
            label: "Team Pending",
            gradient: "from-purple-500 to-violet-600",
            icon: Users,
            pulse: true
        },
        payment_pending: {
            label: "Payment Due",
            gradient: "from-yellow-500 to-orange-600",
            icon: AlertCircle,
            pulse: true
        },
        published: {
            label: "Published",
            gradient: "from-indigo-500 to-blue-600",
            icon: Eye,
            pulse: false
        },
        registration_open: {
            label: "Registration Open",
            gradient: "from-emerald-500 to-teal-600",
            icon: UserCheck,
            pulse: true
        },
        ongoing: {
            label: "Live",
            gradient: "from-orange-500 to-red-600",
            icon: Activity,
            pulse: true
        },
        completed: {
            label: "Completed",
            gradient: "from-gray-500 to-slate-600",
            icon: CheckCircle,
            pulse: false
        }
    };

    const config = statusConfig[status] || statusConfig.applied;
    const Icon = config.icon;

    return (
        <motion.div
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${config.gradient} shadow-md border border-white/20`}
            animate={config.pulse ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
        >
            <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="tracking-wide text-xs">{config.label}</span>
        </motion.div>
    );
};

// Responsive Applied Hackathon Card
const AppliedHackathonCard = ({ hackathon, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
        className="group bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 rounded-xl sm:rounded-2xl border border-gray-200/60 dark:border-gray-700/60 p-4 sm:p-6 cursor-pointer transition-all duration-300 backdrop-blur-sm hover:border-indigo-300 dark:hover:border-indigo-600"
        onClick={onClick}
    >
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-5">
            <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {hackathon.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-blue-100/70 dark:bg-blue-900/30 rounded-full">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        <span className="font-medium text-blue-700 dark:text-blue-300 text-xs sm:text-sm">Individual</span>
                    </div>
                </div>
            </div>
            <div className="ml-3 flex-shrink-0">
                <StatusBadge status={hackathon.status || hackathon.applicationStatus} />
            </div>
        </div>

        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
            <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-gray-50/70 dark:bg-gray-700/50 rounded-lg sm:rounded-xl">
                <div className="p-1.5 sm:p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Applied</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {hackathon.appliedAt ? new Date(hackathon.appliedAt).toLocaleDateString() : 'Recently'}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-gray-50/70 dark:bg-gray-700/50 rounded-lg sm:rounded-xl">
                <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex-shrink-0">
                    <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0">
                    <div className="text-xs text-gray-500 dark:text-gray-400">App ID</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                        #{hackathon.applicationId}
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                <span className="hidden sm:inline">View application status & details</span>
                <span className="sm:hidden">View details</span>
            </div>
            <motion.div
                whileHover={{ x: 3 }}
                className="p-1.5 sm:p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg group-hover:bg-indigo-600 transition-all flex-shrink-0"
            >
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400 group-hover:text-white" />
            </motion.div>
        </div>
    </motion.div>
);

// Responsive Organized Hackathon Card
const OrganizedHackathonCard = ({ hackathon, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
        className="group bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/10 rounded-xl sm:rounded-2xl border border-gray-200/60 dark:border-gray-700/60 p-4 sm:p-6 cursor-pointer transition-all duration-300 backdrop-blur-sm hover:border-purple-300 dark:hover:border-purple-600"
        onClick={onClick}
    >
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-5">
            <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                    {hackathon.title}
                </h3>
                <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full">
                        <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-medium text-purple-700 dark:text-purple-300 text-xs">Your Event</span>
                    </div>
                </div>
            </div>
            <div className="ml-3 flex-shrink-0">
                <StatusBadge status={hackathon.status} />
            </div>
        </div>

        {/* Stats Grid - Mobile friendly */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
            <motion.div
                className="text-center w-fit p-2 sm:p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg sm:rounded-xl border border-green-200/50 dark:border-green-800/50"
                whileHover={{ scale: 1.02 }}
            >
                <div className="flex items-center justify-center mb-1">
                    <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <div className="text-sm sm:text-lg font-bold text-green-700 dark:text-green-400">
                    {hackathon.confirmed_participants || 0}
                </div>
                <div className="text-xs text-green-600 dark:text-green-500 font-medium">Confirmed</div>
            </motion.div>

            <motion.div
                className="text-center p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg sm:rounded-xl border border-blue-200/50 dark:border-blue-800/50"
                whileHover={{ scale: 1.02 }}
            >
                <div className="flex items-center justify-center mb-1">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </div>
                <div className="text-sm sm:text-lg font-bold text-blue-700 dark:text-blue-400">
                    {hackathon.max_participants || 0}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-500 font-medium">Capacity</div>
            </motion.div>

            <motion.div
                className="text-center w-fit p-2 sm:p-3 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg sm:rounded-xl border border-yellow-200/50 dark:border-yellow-800/50"
                whileHover={{ scale: 1.02 }}
            >
                <div className="flex items-center justify-center mb-1">
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                </div>
                <div className="text-xs sm:text-lg font-bold text-yellow-700 dark:text-yellow-400">
                    ₹{hackathon.total_prize_pool?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-500 font-medium">Prize</div>
            </motion.div>
        </div>

        {/* Event Details - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
            <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-gray-50/70 dark:bg-gray-700/50 rounded-lg sm:rounded-xl">
                <div className="p-1.5 sm:p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Start Date</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {hackathon.start_date ? new Date(hackathon.start_date).toLocaleDateString() : 'TBD'}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-gray-50/70 dark:bg-gray-700/50 rounded-lg sm:rounded-xl">
                <div className="p-1.5 sm:p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Mode</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white capitalize truncate">
                        {hackathon.mode || 'Online'}
                    </div>
                </div>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3 sm:mb-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Registration Progress</span>
                <span>{Math.round(((hackathon.confirmed_participants || 0) / (hackathon.max_participants || 1)) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                <motion.div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 sm:h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((hackathon.confirmed_participants || 0) / (hackathon.max_participants || 1)) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                />
            </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                <span className="hidden sm:inline">Manage your hackathon</span>
                <span className="sm:hidden">Manage</span>
            </div>
            <motion.div
                whileHover={{ x: 3, rotate: 45 }}
                className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg group-hover:bg-purple-600 transition-all flex-shrink-0"
            >
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400 group-hover:text-white" />
            </motion.div>
        </div>
    </motion.div>
);

// Responsive Empty State
const EmptyState = ({ title, description, actionLabel, onAction, icon: Icon, isOrganized }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 sm:py-20 px-4"
    >
        <motion.div
            className={`mx-auto w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 ${isOrganized
                ? "bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30"
                : "bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30"
                }`}
            whileHover={{ scale: 1.05, rotate: 5 }}
        >
            <Icon className={`w-8 h-8 sm:w-12 sm:h-12 ${isOrganized ? "text-purple-600" : "text-blue-600"}`} />
        </motion.div>

        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">{title}</h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed">
            {description}
        </p>

        {actionLabel && (
            <motion.button
                onClick={onAction}
                className={`inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-white shadow-lg transition-all text-sm sm:text-base ${isOrganized
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/25"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25"
                    }`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
            >
                <span>{actionLabel}</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
        )}
    </motion.div>
);

// Responsive Loading State
const LoadingState = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <motion.div
                        className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <div className="absolute inset-0 border-3 sm:border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
                        <div className="absolute inset-0 border-3 sm:border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 rounded-full"></div>
                    </motion.div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Your Hackathons</h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Please wait while we fetch your data...</p>
                </div>
            </div>
        </div>
    </div>
);

// Main Component - Fully Responsive
export default function MyHackathons() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("applied");
    const [loading, setLoading] = useState(true);
    const [applied, setApplied] = useState([]);
    const [organized, setOrganized] = useState([]);
    const [error, setError] = useState("");

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    // const [statusFilter, setStatusFilter] = useState("all");

    const isOrganizer = user?.role === "organizer" || user?.role === "admin";

    // Fetch functions (unchanged)
    const fetchApplied = useCallback(async () => {
        try {
            const res = await hackathonServices.getMyApplications();
            const applications = res.applications || res.data?.applications || [];
            if (!Array.isArray(applications)) throw new Error("Invalid applications response");

            setApplied(
                applications.map(app => ({
                    id: app.hackathon || app.hackathon_id || app.id,
                    title: app.hackathon_title || "Untitled Hackathon",
                    status: app.status,
                    applicationId: app.id,
                    applicationStatus: app.status,
                    appliedAt: app.applied_at,
                }))
            );
        } catch (e) {
            console.error("Failed to fetch applied hackathons:", e);
            setError("Failed to load applied hackathons");
        }
    }, []);

    const fetchOrganized = useCallback(async () => {
        try {
            const res = await hackathonServices.getHackathons();
            const hackathons = res.hackathons || res.data?.hackathons || [];
            console.log(res)
            console.log(res.data.hackathons)
            if (!Array.isArray(hackathons)) throw new Error("Invalid hackathons response");

            const myOrganized = hackathons.filter(h =>
                h.organizer === user?.id || h.organizer_id === user?.id
            );

            setOrganized(myOrganized);
        } catch (e) {
            console.error("Failed to fetch organized hackathons:", e);
            setError("Failed to load organized hackathons");
        }
    }, [user]);

    useEffect(() => {
        setLoading(true);
        setError("");

        Promise.all([
            fetchApplied(),
            isOrganizer ? fetchOrganized() : Promise.resolve()
        ]).finally(() => setLoading(false));
    }, [fetchApplied, fetchOrganized, isOrganizer]);

    const tabs = [
        { key: "applied", label: "Applied", icon: Trophy, count: applied.length },
        ...(isOrganizer ? [{ key: "organized", label: "Organized", icon: Settings, count: organized.length }] : [])
    ];

    const filteredData = (activeTab === "applied" ? applied : organized).filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        // const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesSearch;
    });

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-red-950 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center backdrop-blur-sm"
                    >
                        <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-200 mb-2">Error Loading Data</h3>
                        <p className="text-sm sm:text-base text-red-700 dark:text-red-300 mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg sm:rounded-xl hover:bg-red-700 transition-colors font-semibold text-sm sm:text-base"
                        >
                            Try Again
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 py-4 sm:py-10 px-4 sm:px-6 lg:px-8 transition-colors">
            <div className="max-w-7xl mx-auto">
                {/* Responsive Header */}
                <motion.div
                    className="mb-8 sm:mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="text-center mb-6 sm:mb-8">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent mb-3 sm:mb-4 pb-1 sm:pb-2 leading-tight">
                            My Hackathons
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
                            Track your hackathon journey and manage your organized events
                        </p>
                    </div>
                </motion.div>

                {/* Responsive Search & Filter */}
                <SearchFilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                // statusFilter={statusFilter}
                // setStatusFilter={setStatusFilter}
                />

                {/* Responsive Tab Navigation */}
                <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

                {/* Responsive Content Grid */}
                <AnimatePresence mode="wait">
                    {filteredData.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <EmptyState
                                title={searchTerm ? "No Results Found" : (activeTab === "applied" ? "No Applications Yet" : "No Organized Hackathons")}
                                description={searchTerm ? `No hackathons match "${searchTerm}"` : (activeTab === "applied" ? "You haven't applied to any hackathons yet." : "You haven't organized any hackathons yet.")}
                                actionLabel={searchTerm ? "Clear Search" : "Browse Hackathons"}
                                onAction={searchTerm ? (() => setSearchTerm("")) : (() => navigate("/hackathons"))}
                                icon={activeTab === "applied" ? Trophy : Settings}
                                isOrganized={activeTab === "organized"}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
                        >
                            {filteredData.map((hackathon, index) => (
                                <motion.div
                                    key={hackathon.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    {activeTab === "applied" ? (
                                        <AppliedHackathonCard
                                            hackathon={hackathon}
                                            onClick={() => navigate(`/hackathons/applications/${hackathon.applicationId}`)}
                                        />
                                    ) : (
                                        <OrganizedHackathonCard
                                            hackathon={hackathon}
                                            onClick={() => navigate(`/hackathons/organized/${hackathon.id}/stats`)}
                                        />
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Responsive Quick Action Menu */}
                <QuickActionMenu />
            </div>
        </div>
    );
}
