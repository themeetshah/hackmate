import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Search, Plus, Calendar, MapPin, Trophy, Users, Clock,
  DollarSign, Globe, Monitor, X, ChevronDown, SlidersHorizontal,
  Code, Database, Palette, Briefcase, Shield, Heart, BookOpen,
  RefreshCw
} from 'lucide-react';
import HackathonCard from './HackathonCard';
import { useAuth } from '../../contexts/AuthContext';
import hackathonServices from '../../api/hackathonServices';
import userServices from '../../api/userServices';
import { useToast } from '../../hooks/useToast';

const HackathonList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userApplications, setUserApplications] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [applyingToHackathon, setApplyingToHackathon] = useState(null);

  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [totalCount, setTotalCount] = useState(0);


  const {
    toasts,
    success: showSuccess,
    error: showError,
    info: showInfo,
    warning: showWarning,
    hideToast
  } = useToast();

  // Real fetch function using updated hackathonServices
  const fetchHackathons = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await hackathonServices.getHackathons();

      if (response.success) {
        setHackathons(response.data.hackathons || []);
      } else {
        throw new Error(response.error || 'Failed to fetch hackathons');
      }
    } catch (err) {
      console.error('Failed to fetch hackathons:', err);
      setError(err.message || 'Failed to load hackathons. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FIX: Add fetchUserApplications function
  const fetchUserApplications = useCallback(async () => {
    if (!user) return;

    try {
      const response = await hackathonServices.getMyApplications();
      if (response.success) {
        setUserApplications(response.data.applications || []);
      }
    } catch (err) {
      console.warn('Failed to fetch user applications:', err);
    }
  }, [user]);

  // ✅ FIX: Fixed filteredHackathons with proper return statements and field names
  const filteredHackathons = useMemo(() => {
    let filtered = hackathons;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(h =>
        h.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter - Check if categories exist and is array
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(h =>
        h.categories && Array.isArray(h.categories) &&
        h.categories.some(cat => selectedCategories.includes(cat))
      );
    }

    // Mode filter
    if (selectedMode !== 'all') {
      filtered = filtered.filter(h => h.mode === selectedMode);
    }

    // Status filter with proper return statement
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(h => {
        console.log('Filtering status:', h.status, 'against:', selectedStatus);
        return h.status === selectedStatus;
      });
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(h => h.difficulty_level === selectedDifficulty);
    }

    // Custom sorting with priority for status
    filtered.sort((a, b) => {
      // Define status priority order
      const statusPriority = {
        'registration_open': 1,  // Upcoming (highest priority)
        'published': 2,          // Also upcoming (same priority as registration_open)
        'ongoing': 3,            // Currently happening
        'registration_closed': 4, // Registration closed but not started
        'completed': 5           // Finished (lowest priority)
      };

      // If not sorting by a specific field, use default status-based sorting
      if (!sortBy || sortBy === 'default') {
        const aPriority = statusPriority[a.status] || 5; // Unknown statuses go to end
        const bPriority = statusPriority[b.status] || 5;

        if (aPriority !== bPriority) {
          return aPriority - bPriority; // Lower number = higher priority
        }

        // If same status priority, sort by start_date (earliest first)
        const aDate = new Date(a.start_date || '9999-12-31');
        const bDate = new Date(b.start_date || '9999-12-31');
        return aDate - bDate;
      }

      // Custom sorting for user-selected fields
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date fields
      if (['start_date', 'end_date', 'registration_start', 'registration_end', 'created_at'].includes(sortBy)) {
        aValue = new Date(aValue || '1970-01-01');
        bValue = new Date(bValue || '1970-01-01');
      }

      // Handle numeric fields
      if (['total_prize_pool', 'confirmed_participants', 'max_participants'].includes(sortBy)) {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      // Handle string fields (case-insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [hackathons, searchTerm, selectedCategories, selectedMode, selectedStatus, selectedDifficulty, sortBy, sortOrder]);


  // Add this after the useMemo to debug
  useEffect(() => {
    console.log('Filter Debug:');
    console.log('Total hackathons:', hackathons.length);
    console.log('Filtered hackathons:', filteredHackathons.length);
    console.log('Search term:', searchTerm);
    console.log('Selected categories:', selectedCategories);
    console.log('Selected mode:', selectedMode);
    console.log('Selected status:', selectedStatus);
    console.log('Selected difficulty:', selectedDifficulty);
    console.log('Sample hackathon statuses:', hackathons.slice(0, 3).map(h => h.status));
  }, [filteredHackathons, searchTerm, selectedCategories, selectedMode, selectedStatus, selectedDifficulty, hackathons]);

  // Fetch categories from backend using updated API
  const fetchCategories = useCallback(async () => {
    try {
      console.log('Fetching categories...');
      const response = await hackathonServices.getCategories();
      if (response && response.success) {
        // Handle both direct array and nested data structure
        const categories = Array.isArray(response.data) ?
          response.data :
          (response.data.categories || response.data || []);

        setAvailableCategories(categories);
        console.log('Categories loaded:', categories);
      }
    } catch (err) {
      console.warn('Failed to fetch categories:', err);
      // Set default categories if API fails
      setAvailableCategories([
        'Web Development',
        'Mobile Development',
        'AI/ML',
        'Blockchain',
        'Game Development',
        'IoT',
        'Cybersecurity',
        'Data Science'
      ]);
    }
  }, []);

  // Initial load
  useEffect(() => {
    console.log('Component mounted - Initial load');
    fetchHackathons();
  }, [fetchHackathons]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ✅ FIX: Fetch user applications
  useEffect(() => {
    fetchUserApplications();
  }, [fetchUserApplications]);

  // Debounced search effect
  useEffect(() => {
    if (searchTerm === '') {
      setCurrentPage(1);
      return;
    }

    const timeoutId = setTimeout(() => {
      console.log('Search triggered with term:', searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedMode, selectedDifficulty, selectedStatus, sortBy, sortOrder]);

  // Filter options
  const modeOptions = [
    { value: 'all', label: 'All Modes' },
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'In-Person' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  const difficultyOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  // ✅ FIX: Updated status options to match backend model choices
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'registration_open', label: 'Open for Registration' },
    { value: 'registration_closed', label: 'Registration Closed' },
    { value: 'ongoing', label: 'Live Now' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // ✅ FIX: Updated sort options with proper field names
  const sortOptions = [
    { value: 'start_date', label: 'Start Date' },
    { value: 'registration_end', label: 'Registration Deadline' },
    { value: 'total_prize_pool', label: 'Prize Pool' },
    { value: 'confirmed_participants', label: 'Participants' },
    { value: 'created_at', label: 'Recently Added' }
  ];

  // Handle organize hackathon - navigate to create page
  const handleOrganizeHackathon = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Optional: Update role in background if needed
      if (user.role !== 'organizer' && user.role !== 'admin') {
        await userServices.updateProfile({ role: 'organizer' }, true)
          .then(() => {
            console.log('User role updated successfully');
            window.location.href = '/hackathons/create';
          })
          .catch(error => {
            console.warn('Role update failed:', error);
          });
      } else {
        // Already has the right role
        navigate('/hackathons/create');
      }

    } catch (error) {
      console.error('Navigation failed:', error);
      showError('Failed to navigate to create page. Please try again.');
    }
  };

  // Apply to hackathon using updated API
  const handleApplyToHackathon = async (hackathon) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (hackathon.organizer === user.id || hackathon.organizer_id === user.id) {
      showWarning('You cannot apply to a hackathon you organize!');
      return;
    }
    navigate(`/hackathons/${hackathon.id}/register`)
  };

  // Navigate to hackathon detail page
  const handleViewHackathon = (hackathonId) => {
    navigate(`/hackathons/${hackathonId}`);
  };

  // Clear all filters and reload all hackathons
  const clearAllFilters = () => {
    console.log('Clearing all filters');
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedMode('all');
    setSelectedDifficulty('all');
    setSelectedStatus('all');
    setSortBy('start_date');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  // Check if user has applied to hackathon
  const hasUserApplied = (hackathonId) => {
    return userApplications.some(app =>
      (app.hackathon === hackathonId || app.hackathon_id === hackathonId)
    );
  };

  // Get user application status for a hackathon
  const getUserApplicationStatus = (hackathonId) => {
    const application = userApplications.find(app =>
      (app.hackathon === hackathonId || app.hackathon_id === hackathonId)
    );
    return application?.status || null;
  };

  // Load more hackathons (pagination)
  const handleLoadMore = async () => {
    if (loading || !hasNext) return;

    console.log('Loading more hackathons, current page:', currentPage);
    setCurrentPage(prev => prev + 1);
  };

  // Refresh hackathons
  const refreshHackathons = () => {
    console.log('Refreshing hackathons...');
    setCurrentPage(1);
    setError(null);
    fetchHackathons();
    fetchUserApplications(); // ✅ Also refresh user applications
  };

  // Rest of your component remains the same...
  if (loading && currentPage === 1 && hackathons.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Loading Hackathons</h3>
            <p className="text-gray-600 dark:text-gray-400">Discovering amazing opportunities...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md mx-auto p-8"
        >
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={refreshHackathons}
              className="flex items-center gap-2 px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={clearAllFilters}
              className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold shadow-lg hover:shadow-xl"
            >
              Reset Filters
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Simple Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Hackathons
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Join coding competitions and build amazing projects
          </p>
        </motion.div>

        {/* Consolidated Search and Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/50 p-6 mb-8 shadow-xl"
        >
          <div className="flex flex-col md:flex-row gap-4">

            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search hackathons..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-500 dark:text-white"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                  }}
                  className="absolute inset-y-0 right-0 flex items-center pr-4"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Organize Hackathon Button */}
            <button
              onClick={handleOrganizeHackathon}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Organize Hackathon
            </button>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-200 dark:border-indigo-800"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 space-y-6"
              >
                {/* Filter Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Category Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCategories[0] || 'all'}
                        onChange={(e) => {
                          if (e.target.value === 'all') {
                            setSelectedCategories([]);
                          } else {
                            setSelectedCategories([e.target.value]);
                          }
                        }}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white appearance-none"
                      >
                        <option value="all">All Categories</option>
                        {availableCategories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Mode Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mode
                    </label>
                    <div className="relative">
                      <select
                        value={selectedMode}
                        onChange={(e) => {
                          setSelectedMode(e.target.value);
                        }}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white appearance-none"
                      >
                        {modeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Difficulty Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty
                    </label>
                    <div className="relative">
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => {
                          setSelectedDifficulty(e.target.value);
                        }}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white appearance-none"
                      >
                        {difficultyOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        value={selectedStatus}
                        onChange={(e) => {
                          setSelectedStatus(e.target.value);
                        }}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white appearance-none"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort By
                    </label>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white appearance-none"
                      >
                        {sortOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Order
                    </label>
                    <div className="relative">
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white appearance-none"
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={clearAllFilters}
                      className="w-full px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors font-medium"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {!loading && filteredHackathons.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No hackathons found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || selectedCategories.length > 0 || selectedMode !== 'all' || selectedDifficulty !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : hackathons.length === 0
                    ? 'No hackathons available in the database'
                    : 'No hackathons match your current filters'
                }
              </p>
              <div className="space-y-4">
                {/* Only show clear filters if filters are active */}
                {(searchTerm || selectedCategories.length > 0 || selectedMode !== 'all' || selectedDifficulty !== 'all' || selectedStatus !== 'all') && (
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-semibold"
                  >
                    Clear Filters
                  </button>
                )}
                <br />
                <button
                  onClick={refreshHackathons}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Page
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredHackathons.length} Hackathons Found
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {filteredHackathons.length !== hackathons.length
                      ? `Filtered from ${hackathons.length} total results`
                      : `Showing ${hackathons.length} results`
                    }
                  </p>
                </div>
                <button
                  onClick={refreshHackathons}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {/* Hackathon Grid - Use filteredHackathons instead of hackathons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredHackathons.map((hackathon, index) => (
                  <motion.div
                    key={hackathon.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <HackathonCard
                      hackathon={hackathon}
                      onApply={handleApplyToHackathon}
                      onViewDetails={handleViewHackathon}
                      userApplied={hasUserApplied(hackathon.id)}
                      applicationStatus={getUserApplicationStatus(hackathon.id)}
                      isApplying={applyingToHackathon === hackathon.id}
                      isOrganizer={user && (hackathon.organizer === user.id || hackathon.organizer_id === user.id)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              {hasNext && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Hackathons'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HackathonList;
